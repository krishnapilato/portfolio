import {
  CanvasTexture,
  ClampToEdgeWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  NoColorSpace,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from "three";
import type { Tier } from "../lib/store";
import { buildMaps, type MapName, type MapSpec } from "./maps";
import type { WorkerRequest, WorkerResponse } from "./maps.worker";

/** Every generated map of a tier, uploaded and ready for materials. */
export type Maps = Record<MapName, Texture>;

const loaded = new Map<Tier, Maps>();
const pending = new Map<Tier, Promise<Maps>>();

/**
 * The maps of a tier, built once. In a worker when the browser can draw
 * there (OffscreenCanvas), so the words stay scrollable while the metal is
 * brushed; on the main thread otherwise. The promise is stable per tier,
 * so React's `use` can suspend on it.
 */
export function loadMaps(tier: Tier): Promise<Maps> {
  const ready = loaded.get(tier);
  if (ready) return Promise.resolve(ready);
  let promise = pending.get(tier);
  if (!promise) {
    promise = (canUseWorker() ? buildInWorker(tier) : Promise.resolve(buildHere(tier)))
      .catch((error: unknown) => {
        console.warn("[attitude] map worker failed, building on the main thread", error);
        return buildHere(tier);
      })
      .then((maps) => {
        loaded.set(tier, maps);
        pending.delete(tier);
        return maps;
      });
    pending.set(tier, promise);
  }
  return promise;
}

/** The loaded maps of a tier; only valid after loadMaps has resolved. */
export function getMaps(tier: Tier): Maps {
  const maps = loaded.get(tier);
  if (!maps) throw new Error(`maps for tier "${tier}" are not loaded`);
  return maps;
}

function canUseWorker(): boolean {
  return (
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    typeof OffscreenCanvas.prototype.transferToImageBitmap === "function" &&
    typeof OffscreenCanvas.prototype.getContext === "function"
  );
}

function buildInWorker(tier: Tier): Promise<Maps> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./maps.worker.ts", import.meta.url), { type: "module" });
    const done = () => worker.terminate();
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      done();
      if ("error" in event.data) {
        reject(new Error(event.data.error));
        return;
      }
      const maps = {} as Maps;
      for (const name of Object.keys(event.data.maps) as MapName[]) {
        const { bitmap, ...options } = event.data.maps[name];
        maps[name] = toTexture(bitmap, options, false);
      }
      resolve(maps);
    };
    worker.onerror = (event) => {
      done();
      reject(new Error(event.message || "map worker error"));
    };
    const request: WorkerRequest = { tier };
    worker.postMessage(request);
  });
}

function buildHere(tier: Tier): Maps {
  const bundle = buildMaps(tier);
  const maps = {} as Maps;
  for (const name of Object.keys(bundle) as MapName[]) {
    const { image, ...options } = bundle[name];
    maps[name] = toTexture(image as HTMLCanvasElement, options, true);
  }
  return maps;
}

/** Wraps an image as a three.js texture with the right colour space and filtering. */
function toTexture(image: HTMLCanvasElement | ImageBitmap, options: Omit<MapSpec, "image">, flipY: boolean): Texture {
  const texture = new CanvasTexture(image);
  texture.colorSpace = options.color ? SRGBColorSpace : NoColorSpace;
  texture.wrapS = options.clamp ? ClampToEdgeWrapping : RepeatWrapping;
  texture.wrapT = options.clamp ? ClampToEdgeWrapping : RepeatWrapping;
  texture.repeat.set(options.repeat ?? 1, options.repeat ?? 1);
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = options.anisotropy ?? 4;
  texture.flipY = flipY;
  texture.needsUpdate = true;
  return texture;
}
