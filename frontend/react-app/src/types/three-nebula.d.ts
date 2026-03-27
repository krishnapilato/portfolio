// Ambient declaration for three-nebula which ships no TypeScript types
declare module 'three-nebula' {
  import type * as THREE from 'three';

  class System {
    addEmitter(emitter: Emitter): this;
    addRenderer(renderer: unknown): this;
    update(delta?: number): Promise<void>;
    destroy(): void;
  }

  class Emitter {
    setRate(rate: Rate): this;
    addInitializers(initializers: unknown[]): this;
    addBehaviours(behaviours: unknown[]): this;
  }

  class Rate {
    constructor(numPan: Span | number, timePan: Span | number);
  }

  class Span {
    constructor(a: number, b?: number);
  }

  class Position {
    constructor(zone: unknown);
  }

  class Mass {
    constructor(a: number, b?: number);
  }

  class Radius {
    constructor(a: number, b?: number);
  }

  class Life {
    constructor(a: number, b?: number);
  }

  class Body {
    constructor(obj: THREE.Object3D);
  }

  class RadialVelocity {
    constructor(radius: number, dir: Vector3D, theta: number);
  }

  class Vector3D {
    constructor(x: number, y: number, z: number);
  }

  class SphereZone {
    constructor(x: number, y: number, z: number, radius: number);
  }

  class Alpha {
    constructor(a: number, b?: number);
  }

  class Scale {
    constructor(a: number, b?: number);
  }

  class Color {
    constructor(colorA: THREE.Color, colorB?: THREE.Color);
  }

  class Force {
    constructor(x: number, y: number, z: number);
  }

  class SpriteRenderer {
    constructor(scene: THREE.Scene, THREE: unknown);
  }

  class MeshRenderer {
    constructor(scene: THREE.Scene, THREE: unknown);
  }

  export {
    Emitter,
    Rate,
    Span,
    Position,
    Mass,
    Radius,
    Life,
    Body,
    RadialVelocity,
    Vector3D,
    SphereZone,
    Alpha,
    Scale,
    Color,
    Force,
    SpriteRenderer,
    MeshRenderer,
  };

  export default System;
}
