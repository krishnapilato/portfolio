import type { Tier } from "../lib/store";
import { flipVertical } from "./canvas";
import { buildMaps, type MapName, type MapSpec } from "./maps";

/**
 * Builds every map off the main thread. Each surface is flipped and handed
 * over as an ImageBitmap (transferred, not copied) because WebGL ignores
 * the flip-on-upload flag for bitmaps: the flip happens here instead.
 */
export type WorkerRequest = { tier: Tier };
export type WorkerMap = Omit<MapSpec, "image"> & { bitmap: ImageBitmap };
export type WorkerResponse = { maps: Record<MapName, WorkerMap> } | { error: string };

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse, transfer?: Transferable[]): void;
};

scope.onmessage = (event) => {
  try {
    const bundle = buildMaps(event.data.tier);
    const maps = {} as Record<MapName, WorkerMap>;
    const transfer: Transferable[] = [];
    for (const name of Object.keys(bundle) as MapName[]) {
      const { image, ...options } = bundle[name];
      const flipped = flipVertical(image) as OffscreenCanvas;
      const bitmap = flipped.transferToImageBitmap();
      maps[name] = { ...options, bitmap };
      transfer.push(bitmap);
    }
    scope.postMessage({ maps }, transfer);
  } catch (error) {
    scope.postMessage({ error: error instanceof Error ? error.message : String(error) });
  }
};
