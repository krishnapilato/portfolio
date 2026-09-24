import { Euler, Quaternion } from "three";
import { caseRotationZ, cradleRotationX, effectiveAttitude, type Attitude } from "./attitude";

const euler = new Euler();

/**
 * Case orientation in the world: pitch about X (the cradle), then roll
 * about Z (the case in the cradle). Used by the camera rig for the
 * pilot's-view beats.
 */
export function caseQuaternion(att: Attitude, out: Quaternion, withTrim = true): Quaternion {
  const e = effectiveAttitude(att, withTrim);
  euler.set(cradleRotationX(e.pitch), 0, caseRotationZ(e.roll), "XYZ");
  return out.setFromEuler(euler);
}
