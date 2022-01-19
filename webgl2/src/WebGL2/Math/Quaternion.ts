import { EulerOrder } from "./Euler";
import { EPSILON, Mat3 } from "./Matrix";
import { Vec3 } from "./Vector";

export type Quat = [number, number, number, number];

export class Quaternion {
    public static create(): Quat {
        return [0, 0, 0, 1];
    }
    public static clone(q: Quat): Quat {
        return [q[0], q[1], q[2], q[3]];
    }
    public static identity(): Quat {
        return [0, 0, 0, 1];
    }
    public static set(q: Quat, x: number, y: number, z: number, w: number): Quat;
    public static set(q: Quat, x: Quat): Quat;
    public static set(q: Quat, x: number | Quat, y?: number, z?: number, w?: number): Quat {
        if (typeof x === 'number') {
            q[0] = x;
            q[1] = y ?? 0;
            q[2] = z ?? 0;
            q[3] = w ?? 1;
        } else {
            q[0] = x[0];
            q[1] = x[1];
            q[2] = x[2];
            q[3] = x[3];
        }
        return q;
    }

    public static setAxisAngle(q: Quat, axis: Vec3, a: number): Quat {
        a = a * 0.5;
        let s = Math.sin(a);
        q = [
            s * axis[0],
            s * axis[1],
            s * axis[2],
            Math.cos(a)
        ];
        return q;
    }
    public static fromAxisAngle(axis: Vec3, a: number): Quat {
        a = a * 0.5;
        let s = Math.sin(a);
        return[
            s * axis[0],
            s * axis[1],
            s * axis[2],
            Math.cos(a)
        ];
    }

    /**
     * Gets the rotation axis and angle for a given
     *  quaternion. If a quaternion is created with
     *  setAxisAngle, this method will return the same
     *  values as providied in the original parameter list
     *  OR functionally equivalent values.
     * Example: The quaternion formed by axis [0, 0, 1] and
     *  angle -90 is the same as the quaternion formed by
     *  [0, 0, 1] and 270. This method favors the latter.
     * @param  {ReadonlyQuat} q     Quaternion to be decomposed
     * @param  {Vec3} out_axis  Vector receiving the axis of rotation
     * @return {Number}     Angle, in radians, of the rotation
     */
    public static getAxisAngle(q: Quat, out_axis: Vec3): number {
        let rad = Math.acos(q[3]) * 2.0;
        let s = Math.sin(rad / 2.0);
        if (s > EPSILON) {
            out_axis[0] = q[0] / s;
            out_axis[1] = q[1] / s;
            out_axis[2] = q[2] / s;
        } else {
            // If s is zero, return any axis (no rotation - axis does not matter)
            out_axis[0] = 1;
            out_axis[1] = 0;
            out_axis[2] = 0;
        }
        return rad;
    }
    public static angle(a: Quat, b: Quat): number {
        let dotproduct = Quaternion.dot(a, b);
        return Math.acos(2 * dotproduct * dotproduct - 1);
    }
    public static multiply(a: Quat, b: Quat): Quat {
        let ax = a[0],
            ay = a[1],
            az = a[2],
            aw = a[3];
        let bx = b[0],
            by = b[1],
            bz = b[2],
            bw = b[3];

        return [
            ax * bw + aw * bx + ay * bz - az * by,
            ay * bw + aw * by + az * bx - ax * bz,
            az * bw + aw * bz + ax * by - ay * bx,
            aw * bw - ax * bx - ay * by - az * bz
        ];
    }
    public static rotateX(q: Quat, a: number): Quat {
        a *= 0.5;

        let ax = q[0],
            ay = q[1],
            az = q[2],
            aw = q[3];
        let bx = Math.sin(a),
            bw = Math.cos(a);
        return [
            ax * bw + aw * bx,
            ay * bw + az * bx,
            az * bw - ay * bx,
            aw * bw - ax * bx
        ];
    }
    public static rotateY(q: Quat, a: number): Quat {
        a *= 0.5;

        let ax = q[0],
            ay = q[1],
            az = q[2],
            aw = q[3];
        let by = Math.sin(a),
            bw = Math.cos(a);
        return [
            ax * bw - az * by,
            ay * bw + aw * by,
            az * bw + ax * by,
            aw * bw - ay * by
        ];
    }
    public static rotateZ(q: Quat, a: number): Quat {
        a *= 0.5;

        let ax = q[0],
            ay = q[1],
            az = q[2],
            aw = q[3];
        let bz = Math.sin(a),
            bw = Math.cos(a);
        return [
            ax * bw + ay * bz,
            ay * bw - ax * bz,
            az * bw + aw * bz,
            aw * bw - az * bz
        ];
    }
    public static calculateW(a: Vec3): Quat {
        let x = a[0],
            y = a[1],
            z = a[2];

        return [
            x, y, z,
            Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z))
        ];
    }
    public static exp(a: Quat): Quat {
        let x = a[0],
            y = a[1],
            z = a[2],
            w = a[3];

        let r = Math.sqrt(x * x + y * y + z * z);
        let et = Math.exp(w);
        let s = r > 0 ? (et * Math.sin(r)) / r : 0;

        return [
            x * s,
            y * s,
            z * s,
            et * Math.cos(r)
        ];
    }
    public static ln(a: Quat): Quat {
        let x = a[0],
            y = a[1],
            z = a[2],
            w = a[3];

        let r = Math.sqrt(x * x + y * y + z * z);
        let t = r > 0 ? Math.atan2(r, w) / r : 0;

        return [
            x * t,
            y * t,
            z * t,
            0.5 * Math.log(x * x + y * y + z * z + w * w)
        ];
    }
    public static pow(a: Quat, b: number): Quat {
        let out = Quaternion.ln(a);
        out = Quaternion.scale(out, b);
        out = Quaternion.exp(out);
        return out;
    }
    public static slerp(a: Quat, b: Quat, t: number): Quat {
        let ax = a[0],
            ay = a[1],
            az = a[2],
            aw = a[3];
        let bx = b[0],
            by = b[1],
            bz = b[2],
            bw = b[3];

        let omega, cosom, sinom, scale0, scale1;

        // calc cosine
        cosom = ax * bx + ay * by + az * bz + aw * bw;
        // adjust signs (if necessary)
        if (cosom < 0.0) {
            cosom = -cosom;
            bx = -bx;
            by = -by;
            bz = -bz;
            bw = -bw;
        }
        // calculate coefficients
        if (1.0 - cosom > EPSILON) {
            // standard case (slerp)
            omega = Math.acos(cosom);
            sinom = Math.sin(omega);
            scale0 = Math.sin((1.0 - t) * omega) / sinom;
            scale1 = Math.sin(t * omega) / sinom;
        } else {
            // "from" and "to" quaternions are very close
            //  ... so we can do a linear interpolation
            scale0 = 1.0 - t;
            scale1 = t;
        }
        // calculate final values
        return [
            scale0 * ax + scale1 * bx,
            scale0 * ay + scale1 * by,
            scale0 * az + scale1 * bz,
            scale0 * aw + scale1 * bw
        ];
    }
    public static invert(a: Quat): Quat {
        let a0 = a[0],
            a1 = a[1],
            a2 = a[2],
            a3 = a[3];
        let dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
        let invDot = dot ? 1.0 / dot : 0;

        // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0
        return [
            -a0 * invDot,
            -a1 * invDot,
            -a2 * invDot,
            a3 * invDot
        ];
    }
    /**
     * Calculates the conjugate of a quat
     * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
     */
    public static conjugate(a: Quat): Quat {
        return [
            -a[0],
            -a[1],
            -a[2],
            a[3]
        ];
    }
    public static fromMat3(m: Mat3): Quat {
        // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
        // article "Quaternion Calculus and Fast Animation".
        let fTrace = m[0] + m[4] + m[8];
        let fRoot;
        let out = Quaternion.create();
        if (fTrace > 0.0) {
            // |w| > 1/2, may as well choose w > 1/2
            fRoot = Math.sqrt(fTrace + 1.0); // 2w
            out[3] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot; // 1/(4w)
            out[0] = (m[5] - m[7]) * fRoot;
            out[1] = (m[6] - m[2]) * fRoot;
            out[2] = (m[1] - m[3]) * fRoot;
        } else {
            // |w| <= 1/2
            let i = 0;
            if (m[4] > m[0]) i = 1;
            if (m[8] > m[i * 3 + i]) i = 2;
            let j = (i + 1) % 3;
            let k = (i + 2) % 3;

            fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
            out[i] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot;
            out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
            out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
            out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
        }

        return out;
    }
    public static fromEuler(x: number, y: number, z: number, order: EulerOrder = EulerOrder.ZYX): Quat {
        let halfToRad = Math.PI / 360;
        x *= halfToRad;
        z *= halfToRad;
        y *= halfToRad;

        let sx = Math.sin(x);
        let cx = Math.cos(x);
        let sy = Math.sin(y);
        let cy = Math.cos(y);
        let sz = Math.sin(z);
        let cz = Math.cos(z);
        let out = Quaternion.create();
        switch (order) {
            case EulerOrder.XYZ:
                out[0] = sx * cy * cz + cx * sy * sz;
                out[1] = cx * sy * cz - sx * cy * sz;
                out[2] = cx * cy * sz + sx * sy * cz;
                out[3] = cx * cy * cz - sx * sy * sz;
                break;

            case EulerOrder.XZY:
                out[0] = sx * cy * cz - cx * sy * sz;
                out[1] = cx * sy * cz - sx * cy * sz;
                out[2] = cx * cy * sz + sx * sy * cz;
                out[3] = cx * cy * cz + sx * sy * sz;
                break;

            case EulerOrder.YXZ:
                out[0] = sx * cy * cz + cx * sy * sz;
                out[1] = cx * sy * cz - sx * cy * sz;
                out[2] = cx * cy * sz - sx * sy * cz;
                out[3] = cx * cy * cz + sx * sy * sz;
                break;

            case EulerOrder.YZX:
                out[0] = sx * cy * cz + cx * sy * sz;
                out[1] = cx * sy * cz + sx * cy * sz;
                out[2] = cx * cy * sz - sx * sy * cz;
                out[3] = cx * cy * cz - sx * sy * sz;
                break;

            case EulerOrder.ZXY:
                out[0] = sx * cy * cz - cx * sy * sz;
                out[1] = cx * sy * cz + sx * cy * sz;
                out[2] = cx * cy * sz + sx * sy * cz;
                out[3] = cx * cy * cz - sx * sy * sz;
                break;

            case EulerOrder.ZYX:
                out[0] = sx * cy * cz - cx * sy * sz;
                out[1] = cx * sy * cz + sx * cy * sz;
                out[2] = cx * cy * sz - sx * sy * cz;
                out[3] = cx * cy * cz + sx * sy * sz;
                break;

            default:
                throw new Error('Unknown angle order ' + order);
        }

        return out;
    }

    public static lerp(a: Quat, b: Quat, t: number): Quat {
        let ax = a[0];
        let ay = a[1];
        let az = a[2];
        let aw = a[3];
        return [
            ax + t * (b[0] - ax),
            ay + t * (b[1] - ay),
            az + t * (b[2] - az),
            aw + t * (b[3] - aw)
        ];
    }

    public static dot(v1: Quat, v2: Quat): number {
        return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2] + v1[3] * v2[3];
    }

    public static scale(v1: Quat, s: number): Quat {
        return [v1[0] * s, v1[1] * s, v1[2] * s, v1[3] * s];
    }
}