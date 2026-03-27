// three-nebula has minimal TypeScript declarations; runtime-only imports are safe here
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import System, {
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
} from 'three-nebula';
import { SpriteRenderer } from 'three-nebula';

export default function Particles() {
  const { scene } = useThree();
  const systemRef = useRef<System | null>(null);

  useEffect(() => {
    const system = new System();

    // Emitter: slow drifting cyan particles
    const emitter = new Emitter();
    emitter
      .setRate(new Rate(new Span(2, 4), new Span(0.3, 0.6)))
      .addInitializers([
        new Position(new SphereZone(0, 1.5, -4, 10)),
        new Mass(1),
        new Radius(0.04, 0.12),
        new Life(3, 6),
        new Body(
          new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 4, 4),
            new THREE.MeshBasicMaterial({ color: '#00ffff' }),
          ),
        ),
        new RadialVelocity(0.8, new Vector3D(0, 1, 0), 60),
      ])
      .addBehaviours([
        new Alpha(0.8, 0),
        new Scale(1, 0.2),
        new Color(new THREE.Color('#00ffff'), new THREE.Color('#aa00ff')),
        new Force(0, 0.03, 0),
      ]);

    // Emitter: purple accent particles
    const emitter2 = new Emitter();
    emitter2
      .setRate(new Rate(new Span(1, 2), new Span(0.5, 0.9)))
      .addInitializers([
        new Position(new SphereZone(0, 1, 0, 8)),
        new Mass(1),
        new Radius(0.03, 0.08),
        new Life(4, 7),
        new Body(
          new THREE.Mesh(
            new THREE.SphereGeometry(0.04, 4, 4),
            new THREE.MeshBasicMaterial({ color: '#ff00ff' }),
          ),
        ),
        new RadialVelocity(0.5, new Vector3D(0, 1, 0), 45),
      ])
      .addBehaviours([
        new Alpha(0.6, 0),
        new Scale(1, 0.1),
        new Force(0, 0.02, 0),
      ]);

    system.addEmitter(emitter).addEmitter(emitter2);

    const renderer = new SpriteRenderer(scene, THREE);
    system.addRenderer(renderer);

    systemRef.current = system;

    return () => {
      system.destroy();
      systemRef.current = null;
    };
  }, [scene]);

  useFrame((_, delta) => {
    if (systemRef.current) {
      systemRef.current.update(delta);
    }
  });

  return null;
}
