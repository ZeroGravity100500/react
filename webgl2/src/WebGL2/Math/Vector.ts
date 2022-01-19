import { EPSILON, Mat3, Mat4 } from "./Matrix";
import { Quat } from "./Quaternion";

export type Vec1 = [number];
export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];

export class Vector2 {
    protected _data: Vec2;

    private constructor(x = 0, y = 0) {
        this._data = Vector2.fromValues(x, y);
    }

    get x(): number {
        return this._data[0];
    }
    set x(value: number) {
        this._data[0] = value;
    }

    get y(): number {
        return this._data[0];
    }
    set y(value: number) {
        this._data[0] = value;
    }

    public static create(): Vec2 {
        return [0, 0];
    }
    public static clone(v: Vec2): Vec2 {
        return [v[0], v[1]];
    }
    public static fromValues(x: number, y: number): Vec2 {
        return [x, y];
    }
    public static set(v: Vec2, x: Vec2): Vec2;
    public static set(v: Vec2, x: number, y: number): Vec2;
    public static set(v: Vec2, x: Vec2 | number, y?: number): Vec2 {
        if (typeof x === 'number') {
            v[0] = x;
            v[1] = y ?? 0;
        } else {
            v[0] = x[0];
            v[1] = x[1];
        }
        return v;
    }
    public static add(v1: Vec2, v2: number): Vec2;
    public static add(v1: Vec2, v2: Vec2): Vec2;
    public static add(v1: Vec2, v2: Vec2 | number): Vec2 {
        if (typeof v2 === 'number')
            return [v1[0] + v2, v1[1] + v2];
        else
            return [v1[0] + v2[0], v1[1] + v2[1]];
    }
    public static sub(v1: Vec2, v2: number): Vec2;
    public static sub(v1: Vec2, v2: Vec2): Vec2;
    public static sub(v1: Vec2, v2: Vec2 | number): Vec2 {
        if (typeof v2 === 'number')
            return [v1[0] - v2, v1[1] - v2];
        else
            return [v1[0] - v2[0], v1[1] - v2[1]];
    }

    public static mul(v1: Vec2, v2: Vec2): Vec2;
    public static mul(v1: Vec2, s: number): Vec2;
    public static mul(v1: Vec2, s: Vec2 | number): Vec2 {
        if (typeof s === 'number')
            return [v1[0] * s, v1[1] * s];
        else
            return [v1[0] * s[0], v1[1] * s[1]];
    }
    public static div(v1: Vec2, v2: Vec2): Vec2;
    public static div(v1: Vec2, d: number): Vec2;
    public static div(v1: Vec2, d: Vec2 | number): Vec2 {
        if (typeof d === 'number')
            return [v1[0] / d, v1[1] / d];
        else
            return [v1[0] / d[0], v1[1] / d[1]];
    }
    public static equals(v1: Vec2 | null, v2: Vec2 | null): boolean {
        return (v1 !== null && v2 !== null) &&
            (Math.abs(v1[0] - v2[0]) <= EPSILON) &&
            (Math.abs(v1[1] - v2[1]) <= EPSILON);
    }
    public static distance(v1: Vec2, v2: Vec2): number {
        let x = v2[0] - v1[0], y = v2[1] - v1[1];
        return Math.hypot(x, y);
    }
    public static distanceSquare(v1: Vec2, v2: Vec2): number {
        let x = v2[0] - v1[0], y = v2[1] - v1[1];
        return x * x + y * y;
    }
    public static lenght(v1: Vec2): number {
        return Math.hypot(v1[0], v1[1]);
    }
    public static lenghtSquare(v1: Vec2): number {
        return v1[0] * v1[0] + v1[1] * v1[1];
    }
    public static negate(v1: Vec2): Vec2 {
        return [-v1[0], -v1[1]];
    }
    public static inverse(v1: Vec2): Vec2 {
        return [1 / v1[0], 1 / v1[1]];
    }
    public static normalize(v: Vec2): Vec2 {
        let x = v[0];
        let y = v[1];
        let len = x * x + y * y;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
        }
        return [x * len, y * len];
    }
    public static dot(v1: Vec2, v2: Vec2): number {
        return v1[0] * v2[0] + v1[1] * v2[1];
    }
    public static cross(v1: Vec2, v2: Vec2): Vec3 {
        let z = v1[0] * v2[1] - v1[1] * v2[0];
        return [0, 0, z];
    }
    public static lerp(v1: Vec2, v2: Vec2, t: number): Vec2 {
        return [v1[0] + t * (v2[0] - v1[0]), v1[1] + t * (v2[1] - v1[1])];
    }
    public static transformMat3(v: Vec2, m: Mat3): Vec2 {
        return [m[0] * v[0] + m[3] * v[1] + m[6], m[1] * v[0] + m[4] * v[1] + m[7]];
    }
    public static transformMat4(v: Vec2, m: Mat4): Vec2 {
        return [m[0] * v[0] + m[4] * v[1] + m[12], m[1] * v[0] + m[5] * v[1] + m[13]];
    }
    public static rotate(v: Vec2, o: Vec2, a: number): Vec2 {
        //Translate point to the origin
        let p0 = v[0] - o[0],
            p1 = v[1] - o[1],
            sinC = Math.sin(a),
            cosC = Math.cos(a);
        //perform rotation and translate to correct position
        return [p0 * cosC - p1 * sinC + o[0], p0 * sinC + p1 * cosC + o[1]];
    }
    public static angle(v1: Vec2, v2: Vec2): number {
        let x1 = v1[0],
            y1 = v1[1],
            x2 = v2[0],
            y2 = v2[1],
            // mag is the product of the magnitudes of a and b
            mag = Math.sqrt((x1 * x1 + y1 * y1) * (x2 * x2 + y2 * y2)),
            // mag &&.. short circuits if mag == 0
            cosine = mag && (x1 * x2 + y1 * y2) / mag;
        // Math.min(Math.max(cosine, -1), 1) clamps the cosine between -1 and 1
        return Math.acos(Math.min(Math.max(cosine, -1), 1));
    }
}

export class Vector3 {

    private constructor() {}

    public static create(): Vec3 {
        return [0, 0, 0];
    }
    public static clone(v: Vec3): Vec3 {
        return [v[0], v[1], v[2]];
    }
    public static fromValues(x: number, y: number, z: number): Vec3 {
        return [x, y, z];
    }
    public static fromVec2(v: Vec2): Vec3 {
        return [v[0], v[1], 0];
    }
    public static set(v: Vec3, x: Vec3): Vec3;
    public static set(v: Vec3, x: number, y: number, z: number): Vec3;
    public static set(v: Vec3, x: Vec3 | number, y?: number, z?: number): Vec3 {
        if (typeof x === 'number') {
            v[0] = x;
            v[1] = y ?? 0;
            v[2] = z ?? 0;
        } else {
            v[0] = x[0];
            v[1] = x[1];
            v[2] = x[2];
        }
        return v;
    }
    // public static fromBufferAttribute(attribute: BufferAttribute, index: number): Vec3 {
    //     return [
    //         attribute.getX(index),
    //         attribute.getY(index),
    //         attribute.getZ(index)
    //     ]
    // }

    public static add(V1: Vec3, v2: number): Vec3;
    public static add(V1: Vec3, v2: Vec3): Vec3;
    public static add(v1: Vec3, v2: Vec3 | number): Vec3 {
        if (typeof v2 === 'number')
            return [v1[0] + v2, v1[1] + v2, v1[2] + v2];
        else
            return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
    }
    public static sub(V1: Vec3, v2: number): Vec3;
    public static sub(V1: Vec3, v2: Vec3): Vec3;
    public static sub(v1: Vec3, v2: Vec3 | number): Vec3 {
        if (typeof v2 === 'number')
            return [v1[0] - v2, v1[1] - v2, v1[2] - v2];
        else
            return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
    }

    public static mul(v1: Vec3, v2: Vec3): Vec3;
    public static mul(v1: Vec3, s: number): Vec3;
    public static mul(v1: Vec3, s: Vec3 | number): Vec3 {
        if (typeof s === 'number')
            return [v1[0] * s, v1[1] * s, v1[2] * s];
        else
            return [v1[0] * s[0], v1[1] * s[1], v1[2] * s[2]];
    }
    public static div(v1: Vec3, v2: Vec3): Vec3;
    public static div(v1: Vec3, d: number): Vec3;
    public static div(v1: Vec3, d: Vec3 | number): Vec3 {
        if (typeof d === 'number')
            return [v1[0] / d, v1[1] / d, v1[2] / d];
        else
            return [v1[0] / d[0], v1[1] / d[1], v1[2] / d[2]];
    }
    public static min(v: Vec3, v2: Vec3): Vec3 {
        return Vector3.fromValues(Math.min(v[0], v2[0]),
            Math.min(v[1], v2[1]),
            Math.min(v[2], v2[2]));
    }
    public static max(v: Vec3, v2: Vec3): Vec3 {
        return Vector3.fromValues(Math.max(v[0], v2[0]),
            Math.max(v[1], v2[1]),
            Math.max(v[2], v2[2]));
    }
    public static distance(v1: Vec3, v2: Vec3): number {
        let x = v2[0] - v1[0], y = v2[1] - v1[1], z = v2[2] - v1[2];
        return Math.hypot(x, y, z);
    }
    public static distanceSquare(v1: Vec3, v2: Vec3): number {
        let x = v2[0] - v1[0], y = v2[1] - v1[1], z = v2[2] - v1[2];
        return x * x + y * y + z * z;
    }
    public static lenght(v1: Vec3): number {
        return Math.hypot(v1[0], v1[1], v1[2]);
    }
    public static lenghtSquare(v1: Vec3): number {
        return v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2];
    }
    public static clamp(v: Vec3, min: Vec3, max: Vec3): Vec3 {
        // assumes min < max, componentwise
        return [
            Math.max(min[0], Math.min(max[0], v[0])),
            Math.max(min[1], Math.min(max[1], v[1])),
            Math.max(min[2], Math.min(max[2], v[2]))
        ];
    }
    public static clampScalar(v: Vec3, minVal: number, maxVal: number): Vec3 {
        return [
            Math.max(minVal, Math.min(maxVal, v[0])),
            Math.max(minVal, Math.min(maxVal, v[1])),
            Math.max(minVal, Math.min(maxVal, v[2]))
        ];
    }
    public static clampLength(v: Vec3, min: number, max: number): Vec3 {
        const length = Vector3.lenght(v);
        return Vector3.mul(Vector3.div(v, length || 1), Math.max(min, Math.min(max, length)));
    }
    public static equals(v1: Vec3 | null, v2: Vec3 | null): boolean {
        return (v1 !== null && v2 !== null) &&
            (Math.abs(v1[0] - v2[0]) <= EPSILON) &&
            (Math.abs(v1[1] - v2[1]) <= EPSILON) &&
            (Math.abs(v1[2] - v2[2]) <= EPSILON);
    }
    public static negate(v1: Vec3): Vec3 {
        return [-v1[0], -v1[1], -v1[2]];
    }
    public static inverse(v1: Vec3): Vec3 {
        return [1 / v1[0], 1 / v1[1], 1 / v1[2]];
    }
    public static normalize(v: Vec3): Vec3 {
        let x = v[0];
        let y = v[1];
        let z = v[2];
        let len = x * x + y * y + z * z;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
        }
        return [x * len, y * len, z * len];
    }
    public static dot(v1: Vec3, v2: Vec3): number {
        return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    }
    public static cross(v1: Vec3, v2: Vec3): Vec3 {
        let ax = v1[0],
            ay = v1[1],
            az = v1[2];
        let bx = v2[0],
            by = v2[1],
            bz = v2[2];

        return [
            ay * bz - az * by,
            az * bx - ax * bz,
            ax * by - ay * bx
        ];
    }
    public static lerp(v1: Vec3, v2: Vec3, t: number): Vec3 {
        return [
            v1[0] + t * (v2[0] - v1[0]),
            v1[1] + t * (v2[1] - v1[1]),
            v1[2] + t * (v2[2] - v1[2])
        ];
    }
    public static slerp(a: Vec3, b: Vec3, t: number): Vec3 {
        let angle = Math.acos(Math.min(Math.max(Vector3.dot(a, b), -1), 1));
        let sinTotal = Math.sin(angle);

        let ratioA = Math.sin((1 - t) * angle) / sinTotal;
        let ratioB = Math.sin(t * angle) / sinTotal;

        return [
            ratioA * a[0] + ratioB * b[0],
            ratioA * a[1] + ratioB * b[1],
            ratioA * a[2] + ratioB * b[2]
        ];
    }
    public static hermite(a: Vec3, b: Vec3, c: Vec3, d: Vec3, t: number): Vec3 {
        let factorTimes2 = t * t;
        let factor1 = factorTimes2 * (2 * t - 3) + 1;
        let factor2 = factorTimes2 * (t - 2) + t;
        let factor3 = factorTimes2 * (t - 1);
        let factor4 = factorTimes2 * (3 - 2 * t);

        return [
            a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4,
            a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4,
            a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4
        ];
    }
    public static bezier(a: Vec3, b: Vec3, c: Vec3, d: Vec3, t: number): Vec3 {
        let inverseFactor = 1 - t;
        let inverseFactorTimesTwo = inverseFactor * inverseFactor;
        let factorTimes2 = t * t;
        let factor1 = inverseFactorTimesTwo * inverseFactor;
        let factor2 = 3 * t * inverseFactorTimesTwo;
        let factor3 = 3 * factorTimes2 * inverseFactor;
        let factor4 = factorTimes2 * t;

        return [
            a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4,
            a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4,
            a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4
        ];
    }
    public static transformMat4(a: Vec3, m: Mat4): Vec3 {
        let x = a[0],
            y = a[1],
            z = a[2];
        let w = m[3] * x + m[7] * y + m[11] * z + m[15];
        w = w || 1.0;
        return [
            (m[0] * x + m[4] * y + m[8] * z + m[12]) / w,
            (m[1] * x + m[5] * y + m[9] * z + m[13]) / w,
            (m[2] * x + m[6] * y + m[10] * z + m[14]) / w
        ];
    }
    public static transformMat3(a: Vec3, m: Mat3): Vec3 {
        let x = a[0],
            y = a[1],
            z = a[2];
        return [
            x * m[0] + y * m[3] + z * m[6],
            x * m[1] + y * m[4] + z * m[7],
            x * m[2] + y * m[5] + z * m[8]
        ];
    }
    public static transformNormalMat3(a: Vec3, m: Mat3): Vec3 {
        let x = a[0],
            y = a[1],
            z = a[2];
        return Vector3.normalize([
            x * m[0] + y * m[3] + z * m[6],
            x * m[1] + y * m[4] + z * m[7],
            x * m[2] + y * m[5] + z * m[8]
        ]);
    }
    public static transformDirection(a: Vec3, m: Mat4): Vec3 {
        const x = a[0], y = a[1], z = a[2];
        let v = Vector3.fromValues(
            m[0] * x + m[4] * y + m[8] * z,
            m[1] * x + m[5] * y + m[9] * z,
            m[2] * x + m[6] * y + m[10] * z
        );
        return Vector3.normalize(v);
    }
    public static transformQuat(a: Vec3, q: Quat): Vec3 {
        // benchmarks: https://jsperf.com/quaternion-transform-vec3-implementations-fixed
        let qx = q[0],
            qy = q[1],
            qz = q[2],
            qw = q[3];
        let x = a[0],
            y = a[1],
            z = a[2];
        // var qvec = [qx, qy, qz];
        // var uv = vec3.cross([], qvec, a);
        let uvx = qy * z - qz * y,
            uvy = qz * x - qx * z,
            uvz = qx * y - qy * x;
        // var uuv = vec3.cross([], qvec, uv);
        let uuvx = qy * uvz - qz * uvy,
            uuvy = qz * uvx - qx * uvz,
            uuvz = qx * uvy - qy * uvx;
        // vec3.scale(uv, uv, 2 * w);
        let w2 = qw * 2;
        uvx *= w2;
        uvy *= w2;
        uvz *= w2;
        // vec3.scale(uuv, uuv, 2);
        uuvx *= 2;
        uuvy *= 2;
        uuvz *= 2;
        // return vec3.add(out, a, vec3.add(out, uv, uuv));
        return [
            x + uvx + uuvx,
            y + uvy + uuvy,
            z + uvz + uuvz
        ];
    }
    public static rotateX(v: Vec3, o: Vec3, a: number): Vec3 {
        let p = [],
            r = [];
        //Translate point to the origin
        p[0] = v[0] - o[0];
        p[1] = v[1] - o[1];
        p[2] = v[2] - o[2];

        let cos = Math.cos(a);
        let sin = Math.sin(a);
        //perform rotation
        r[0] = p[0];
        r[1] = p[1] * cos - p[2] * sin;
        r[2] = p[1] * sin + p[2] * cos;

        //translate to correct position
        return [
            r[0] + o[0],
            r[1] + o[1],
            r[2] + o[2]
        ];
    }
    public static rotateY(v: Vec3, o: Vec3, a: number): Vec3 {
        let p = [],
            r = [];
        //Translate point to the origin
        p[0] = v[0] - o[0];
        p[1] = v[1] - o[1];
        p[2] = v[2] - o[2];

        let cos = Math.cos(a);
        let sin = Math.sin(a);
        //perform rotation
        r[0] = p[2] * sin + p[0] * cos;
        r[1] = p[1];
        r[2] = p[2] * cos - p[0] * sin;

        //translate to correct position
        return [
            r[0] + o[0],
            r[1] + o[1],
            r[2] + o[2]
        ];
    }
    public static rotateZ(v: Vec3, o: Vec3, a: number): Vec3 {
        let p = [],
            r = [];
        //Translate point to the origin
        p[0] = v[0] - o[0];
        p[1] = v[1] - o[1];
        p[2] = v[2] - o[2];

        let cos = Math.cos(a);
        let sin = Math.sin(a);
        //perform rotation
        r[0] = p[0] * cos - p[1] * sin;
        r[1] = p[0] * sin + p[1] * cos;
        r[2] = p[2];

        //translate to correct position
        return [
            r[0] + o[0],
            r[1] + o[1],
            r[2] + o[2]
        ];
    }
    public static angle(v1: Vec3, v2: Vec3): number {
        let ax = v1[0],
            ay = v1[1],
            az = v1[2],
            bx = v2[0],
            by = v2[1],
            bz = v2[2],
            mag = Math.sqrt((ax * ax + ay * ay + az * az) * (bx * bx + by * by + bz * bz)),
            cosine = mag && Vector3.dot(v1, v2) / mag;
        return Math.acos(Math.min(Math.max(cosine, -1), 1));
    }
}

export class Vector4 {
    private constructor() {}
    
    public static create(): Vec4 {
        return [0, 0, 0, 0];
    }
    public static clone(v: Vec4): Vec4 {
        return [v[0], v[1], v[2], v[3]];
    }
    public static fromValues(x: number, y: number, z: number, w: number): Vec4 {
        return [x, y, z, w];
    }
    public static fromVec3(v: Vec3): Vec4 {
        return [v[0], v[1], v[2], 0];
    }
    public static set(v: Vec4, x: Vec4): Vec4;
    public static set(v: Vec4, x: number, y: number, z: number, w: number): Vec4;
    public static set(v: Vec4, x: Vec4 | number, y?: number, z?: number, w?: number): Vec4 {
        if (typeof x === 'number') {
            v[0] = x;
            v[1] = y ?? 0;
            v[2] = z ?? 0;
            v[3] = w ?? 0;
        } else {
            v[0] = x[0];
            v[1] = x[1];
            v[2] = x[2];
            v[3] = x[3];
        }
        return v;
    }
    public static equals(v1: Vec4 | null, v2: Vec4 | null): boolean {
        return (v1 !== null && v2 !== null) &&
            (Math.abs(v1[0] - v2[0]) <= EPSILON) &&
            (Math.abs(v1[1] - v2[1]) <= EPSILON) &&
            (Math.abs(v1[2] - v2[2]) <= EPSILON) &&
            (Math.abs(v1[3] - v2[3]) <= EPSILON);
    }
    public static add(v1: Vec4, v2: number): Vec4;
    public static add(v1: Vec4, v2: Vec4): Vec4;
    public static add(v1: Vec4, v2: Vec4 | number): Vec4 {
        if (typeof v2 === 'number')
            return [v1[0] + v2, v1[1] + v2, v1[2] + v2, v1[3] + v2];
        else
            return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2], v1[3] + v2[3]];
    }
    public static sub(v1: Vec4, v2: Vec4): Vec4;
    public static sub(v1: Vec4, v2: number): Vec4;
    public static sub(v1: Vec4, v2: Vec4 | number): Vec4 {
        if (typeof v2 === 'number')
            return [v1[0] - v2, v1[1] - v2, v1[2] - v2, v1[3] - v2];
        else
            return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2], v1[3] - v2[3]];
    }

    public static mul(v1: Vec4, v2: Vec4): Vec4;
    public static mul(v1: Vec4, s: number): Vec4;
    public static mul(v1: Vec4, s: Vec4 | number): Vec4 {
        if (typeof s === 'number')
            return [v1[0] * s, v1[1] * s, v1[2] * s, v1[3] * s];
        else
            return [v1[0] * s[0], v1[1] * s[1], v1[2] * s[2], v1[3] * s[3]];
    }
    public static div(v1: Vec4, v2: Vec4): Vec4;
    public static div(v1: Vec4, d: number): Vec4;
    public static div(v1: Vec4, d: Vec4 | number): Vec4 {
        if (typeof d === 'number')
            return [v1[0] / d, v1[1] / d, v1[2] / d, v1[3] / d];
        else
            return [v1[0] / d[0], v1[1] / d[1], v1[2] / d[2], v1[3] / d[3]];
    }
    public static distance(v1: Vec4, v2: Vec4): number {
        let x = v2[0] - v1[0], y = v2[1] - v1[1], z = v2[2] - v1[2], w = v2[3] - v1[3];
        return Math.hypot(x, y, z, w);
    }
    public static distanceSquare(v1: Vec4, v2: Vec4): number {
        let x = v2[0] - v1[0], y = v2[1] - v1[1], z = v2[2] - v1[2], w = v2[3] - v1[3];
        return x * x + y * y + z * z + w * w;
    }
    public static lenght(v1: Vec4): number {
        return Math.hypot(v1[0], v1[1], v1[2], v1[3]);
    }
    public static lenghtSquare(v1: Vec4): number {
        return v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2] + v1[3] * v1[3];
    }
    public static negate(v1: Vec4): Vec4 {
        return [-v1[0], -v1[1], -v1[2], -v1[3]];
    }
    public static inverse(v1: Vec4): Vec4 {
        return [1 / v1[0], 1 / v1[1], 1 / v1[2], 1 / v1[3]];
    }
    public static normalize(v: Vec4): Vec4 {
        let x = v[0];
        let y = v[1];
        let z = v[2];
        let w = v[3];

        let len = x * x + y * y + z * z + w * w;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
        }
        return [x * len, y * len, z * len, w * len];
    }
    public static dot(v1: Vec4, v2: Vec4): number {
        return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2] + v1[3] * v2[3];
    }
    public static cross(u: Vec4, v: Vec4, w: Vec4): Vec4 {
        let A = v[0] * w[1] - v[1] * w[0],
            B = v[0] * w[2] - v[2] * w[0],
            C = v[0] * w[3] - v[3] * w[0],
            D = v[1] * w[2] - v[2] * w[1],
            E = v[1] * w[3] - v[3] * w[1],
            F = v[2] * w[3] - v[3] * w[2];
        let G = u[0];
        let H = u[1];
        let I = u[2];
        let J = u[3];

        return [
            H * F - I * E + J * D,
            -(G * F) + I * C - J * B,
            G * E - H * C + J * A,
            -(G * D) + H * B - I * A
        ];
    }
    public static lerp(a: Vec4, b: Vec4, t: number): Vec4 {
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
    public static transformMat4(a: Vec4, m: Mat4): Vec4 {
        let x = a[0],
            y = a[1],
            z = a[2],
            w = a[3];
        return [
            m[0] * x + m[4] * y + m[8] * z + m[12] * w,
            m[1] * x + m[5] * y + m[9] * z + m[13] * w,
            m[2] * x + m[6] * y + m[10] * z + m[14] * w,
            m[3] * x + m[7] * y + m[11] * z + m[15] * w
        ];
    }
    public static transformQuat(a: Vec4, q: Quat): Vec4 {
        let x = a[0],
            y = a[1],
            z = a[2];
        let qx = q[0],
            qy = q[1],
            qz = q[2],
            qw = q[3];

        // calculate quat * vec
        let ix = qw * x + qy * z - qz * y;
        let iy = qw * y + qz * x - qx * z;
        let iz = qw * z + qx * y - qy * x;
        let iw = -qx * x - qy * y - qz * z;

        // calculate result * inverse quat
        return [
            ix * qw + iw * -qx + iy * -qz - iz * -qy,
            iy * qw + iw * -qy + iz * -qx - ix * -qz,
            iz * qw + iw * -qz + ix * -qy - iy * -qx,
            a[3]
        ];
    }

}

export const Y_UP_VECTOR3: Vec3 = Vector3.fromValues(0, 1, 0);
