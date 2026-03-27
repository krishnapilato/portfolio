import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import useGameStore from '../store';

// Fixed world-space camera offset — camera never rotates with the player.
// Always looks from south (+Z) toward north (-Z, the desk wall).
// This prevents the camera from flipping in front of the character when W is pressed.
const CAMERA_OFFSET = new THREE.Vector3(0, 5, 10);
const LERP_POS = 0.07;
const LERP_LOOK = 0.1;

export default function CameraRig() {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 5, 12));
  const targetLook = useRef(new THREE.Vector3(0, 1, 2));

  useFrame(() => {
    const playerPos = useGameStore.getState().playerPos;

    const desired = new THREE.Vector3(
      playerPos[0] + CAMERA_OFFSET.x,
      playerPos[1] + CAMERA_OFFSET.y,
      playerPos[2] + CAMERA_OFFSET.z,
    );

    const lookAt = new THREE.Vector3(
      playerPos[0],
      playerPos[1] + 1.2,
      playerPos[2],
    );

    targetPos.current.lerp(desired, LERP_POS);
    targetLook.current.lerp(lookAt, LERP_LOOK);

    camera.position.copy(targetPos.current);
    camera.lookAt(targetLook.current);
  });

  return null;
}
