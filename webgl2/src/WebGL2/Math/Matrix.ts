import { Quat, Quaternion } from "./Quaternion";
import { Vec2, Vec3, Vector3 } from "./Vector";

export type Mat3 = [
    number, number, number,
    number, number, number,
    number, number, number
];
export type Mat4 = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number
];

export const EPSILON = 0.000001;

export class Matrix4 {
    private constructor() {}

    public static create(): Mat4 {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    }

    public static clone(m: Mat4): Mat4 {
        return [
            m[0], m[1], m[2], m[3],
            m[4], m[5], m[6], m[7],
            m[8], m[9], m[10], m[11],
            m[12], m[13], m[14], m[15]
        ];
    }

    public static fromValues(
        m00: number, m01: number, m02: number, m03: number,
        m10: number, m11: number, m12: number, m13: number,
        m20: number, m21: number, m22: number, m23: number,
        m30: number, m31: number, m32: number, m33: number): Mat4 {
        return [
            m00, m01, m02, m03,
            m10, m11, m12, m13,
            m20, m21, m22, m23,
            m30, m31, m32, m33
        ];
    }
    public static identity(): Mat4 {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    }
    public static transpose(m: Mat4): Mat4 {
        let out = Matrix4.create();
        out[0] = m[0];
        out[1] = m[4];
        out[2] = m[8];
        out[3] = m[12];
        out[4] = m[1];
        out[5] = m[5];
        out[6] = m[9];
        out[7] = m[13];
        out[8] = m[2];
        out[9] = m[6];
        out[10] = m[10];
        out[11] = m[14];
        out[12] = m[3];
        out[13] = m[7];
        out[14] = m[11];
        out[15] = m[15];
        return out;
    }
    public static invert(m: Mat4): Mat4 {
        let a00 = m[0],
            a01 = m[1],
            a02 = m[2],
            a03 = m[3];
        let a10 = m[4],
            a11 = m[5],
            a12 = m[6],
            a13 = m[7];
        let a20 = m[8],
            a21 = m[9],
            a22 = m[10],
            a23 = m[11];
        let a30 = m[12],
            a31 = m[13],
            a32 = m[14],
            a33 = m[15];

        let b00 = a00 * a11 - a01 * a10;
        let b01 = a00 * a12 - a02 * a10;
        let b02 = a00 * a13 - a03 * a10;
        let b03 = a01 * a12 - a02 * a11;
        let b04 = a01 * a13 - a03 * a11;
        let b05 = a02 * a13 - a03 * a12;
        let b06 = a20 * a31 - a21 * a30;
        let b07 = a20 * a32 - a22 * a30;
        let b08 = a20 * a33 - a23 * a30;
        let b09 = a21 * a32 - a22 * a31;
        let b10 = a21 * a33 - a23 * a31;
        let b11 = a22 * a33 - a23 * a32;

        // Calculate the determinant
        let det =
            b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

        if (!det) {
            return Matrix4.identity();
        }
        det = 1.0 / det;

        let out = Matrix4.create();
        out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
        out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
        out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
        out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
        out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

        return out;
    }
    public static adjugate(m: Mat4): Mat4 {
        let a00 = m[0],
            a01 = m[1],
            a02 = m[2],
            a03 = m[3];
        let a10 = m[4],
            a11 = m[5],
            a12 = m[6],
            a13 = m[7];
        let a20 = m[8],
            a21 = m[9],
            a22 = m[10],
            a23 = m[11];
        let a30 = m[12],
            a31 = m[13],
            a32 = m[14],
            a33 = m[15];

        let b00 = a00 * a11 - a01 * a10;
        let b01 = a00 * a12 - a02 * a10;
        let b02 = a00 * a13 - a03 * a10;
        let b03 = a01 * a12 - a02 * a11;
        let b04 = a01 * a13 - a03 * a11;
        let b05 = a02 * a13 - a03 * a12;
        let b06 = a20 * a31 - a21 * a30;
        let b07 = a20 * a32 - a22 * a30;
        let b08 = a20 * a33 - a23 * a30;
        let b09 = a21 * a32 - a22 * a31;
        let b10 = a21 * a33 - a23 * a31;
        let b11 = a22 * a33 - a23 * a32;
        let out = Matrix4.create();
        out[0] = a11 * b11 - a12 * b10 + a13 * b09;
        out[1] = a02 * b10 - a01 * b11 - a03 * b09;
        out[2] = a31 * b05 - a32 * b04 + a33 * b03;
        out[3] = a22 * b04 - a21 * b05 - a23 * b03;
        out[4] = a12 * b08 - a10 * b11 - a13 * b07;
        out[5] = a00 * b11 - a02 * b08 + a03 * b07;
        out[6] = a32 * b02 - a30 * b05 - a33 * b01;
        out[7] = a20 * b05 - a22 * b02 + a23 * b01;
        out[8] = a10 * b10 - a11 * b08 + a13 * b06;
        out[9] = a01 * b08 - a00 * b10 - a03 * b06;
        out[10] = a30 * b04 - a31 * b02 + a33 * b00;
        out[11] = a21 * b02 - a20 * b04 - a23 * b00;
        out[12] = a11 * b07 - a10 * b09 - a12 * b06;
        out[13] = a00 * b09 - a01 * b07 + a02 * b06;
        out[14] = a31 * b01 - a30 * b03 - a32 * b00;
        out[15] = a20 * b03 - a21 * b01 + a22 * b00;
        return out;
    }
    /**
     * determinant
     */
    public static determinant(m: Mat4): number {
        let a00 = m[0],
            a01 = m[1],
            a02 = m[2],
            a03 = m[3];
        let a10 = m[4],
            a11 = m[5],
            a12 = m[6],
            a13 = m[7];
        let a20 = m[8],
            a21 = m[9],
            a22 = m[10],
            a23 = m[11];
        let a30 = m[12],
            a31 = m[13],
            a32 = m[14],
            a33 = m[15];

        let b0 = a00 * a11 - a01 * a10;
        let b1 = a00 * a12 - a02 * a10;
        let b2 = a01 * a12 - a02 * a11;
        let b3 = a20 * a31 - a21 * a30;
        let b4 = a20 * a32 - a22 * a30;
        let b5 = a21 * a32 - a22 * a31;
        let b6 = a00 * b5 - a01 * b4 + a02 * b3;
        let b7 = a10 * b5 - a11 * b4 + a12 * b3;
        let b8 = a20 * b2 - a21 * b1 + a22 * b0;
        let b9 = a30 * b2 - a31 * b1 + a32 * b0;

        // Calculate the determinant
        return a13 * b6 - a03 * b7 + a33 * b8 - a23 * b9;
    }
    public static multiply(a: Mat4, b: Mat4): Mat4 {
        let a00 = a[0],
            a01 = a[1],
            a02 = a[2],
            a03 = a[3];
        let a10 = a[4],
            a11 = a[5],
            a12 = a[6],
            a13 = a[7];
        let a20 = a[8],
            a21 = a[9],
            a22 = a[10],
            a23 = a[11];
        let a30 = a[12],
            a31 = a[13],
            a32 = a[14],
            a33 = a[15];

        // Cache only the current line of the second matrix
        let b0 = b[0],
            b1 = b[1],
            b2 = b[2],
            b3 = b[3];
        let out = Matrix4.create();
        out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[4];
        b1 = b[5];
        b2 = b[6];
        b3 = b[7];
        out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[8];
        b1 = b[9];
        b2 = b[10];
        b3 = b[11];
        out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[12];
        b1 = b[13];
        b2 = b[14];
        b3 = b[15];
        out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        return out;
    }
    public static translate(m: Mat4, v: Vec3): Mat4 {
        let x = v[0],
            y = v[1],
            z = v[2];
        let a00, a01, a02, a03;
        let a10, a11, a12, a13;
        let a20, a21, a22, a23;
        a00 = m[0];
        a01 = m[1];
        a02 = m[2];
        a03 = m[3];
        a10 = m[4];
        a11 = m[5];
        a12 = m[6];
        a13 = m[7];
        a20 = m[8];
        a21 = m[9];
        a22 = m[10];
        a23 = m[11];
        let out = Matrix4.create();
        out[0] = a00;
        out[1] = a01;
        out[2] = a02;
        out[3] = a03;
        out[4] = a10;
        out[5] = a11;
        out[6] = a12;
        out[7] = a13;
        out[8] = a20;
        out[9] = a21;
        out[10] = a22;
        out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + m[12];
        out[13] = a01 * x + a11 * y + a21 * z + m[13];
        out[14] = a02 * x + a12 * y + a22 * z + m[14];
        out[15] = a03 * x + a13 * y + a23 * z + m[15];
        return out;
    }
    public static rotate(m: Mat4, angle: number, axis: Vec3): Mat4 | null {
        let x = axis[0],
            y = axis[1],
            z = axis[2];
        let len = Math.hypot(x, y, z);
        let s, c, t;
        let a00, a01, a02, a03;
        let a10, a11, a12, a13;
        let a20, a21, a22, a23;
        let b00, b01, b02;
        let b10, b11, b12;
        let b20, b21, b22;

        if (len < EPSILON) {
            return null;
        }

        len = 1 / len;
        x *= len;
        y *= len;
        z *= len;

        s = Math.sin(angle);
        c = Math.cos(angle);
        t = 1 - c;

        a00 = m[0];
        a01 = m[1];
        a02 = m[2];
        a03 = m[3];
        a10 = m[4];
        a11 = m[5];
        a12 = m[6];
        a13 = m[7];
        a20 = m[8];
        a21 = m[9];
        a22 = m[10];
        a23 = m[11];

        // Construct the elements of the rotation matrix
        b00 = x * x * t + c;
        b01 = y * x * t + z * s;
        b02 = z * x * t - y * s;
        b10 = x * y * t - z * s;
        b11 = y * y * t + c;
        b12 = z * y * t + x * s;
        b20 = x * z * t + y * s;
        b21 = y * z * t - x * s;
        b22 = z * z * t + c;

        let out = Matrix4.create();
        // Perform rotation-specific matrix multiplication
        out[0] = a00 * b00 + a10 * b01 + a20 * b02;
        out[1] = a01 * b00 + a11 * b01 + a21 * b02;
        out[2] = a02 * b00 + a12 * b01 + a22 * b02;
        out[3] = a03 * b00 + a13 * b01 + a23 * b02;
        out[4] = a00 * b10 + a10 * b11 + a20 * b12;
        out[5] = a01 * b10 + a11 * b11 + a21 * b12;
        out[6] = a02 * b10 + a12 * b11 + a22 * b12;
        out[7] = a03 * b10 + a13 * b11 + a23 * b12;
        out[8] = a00 * b20 + a10 * b21 + a20 * b22;
        out[9] = a01 * b20 + a11 * b21 + a21 * b22;
        out[10] = a02 * b20 + a12 * b21 + a22 * b22;
        out[11] = a03 * b20 + a13 * b21 + a23 * b22;

        out[12] = m[12];
        out[13] = m[13];
        out[14] = m[14];
        out[15] = m[15];
        return out;
    }
    public static scale(m: Mat4, v: Vec3): Mat4 {
        let x = v[0],
            y = v[1],
            z = v[2];
        let out = Matrix4.create();
        out[0] = m[0] * x;
        out[1] = m[1] * x;
        out[2] = m[2] * x;
        out[3] = m[3] * x;
        out[4] = m[4] * y;
        out[5] = m[5] * y;
        out[6] = m[6] * y;
        out[7] = m[7] * y;
        out[8] = m[8] * z;
        out[9] = m[9] * z;
        out[10] = m[10] * z;
        out[11] = m[11] * z;
        out[12] = m[12];
        out[13] = m[13];
        out[14] = m[14];
        out[15] = m[15];
        return out;
    }
    public static rotateX(a: Mat4, rad: number): Mat4 {
        let s = Math.sin(rad);
        let c = Math.cos(rad);
        let a10 = a[4];
        let a11 = a[5];
        let a12 = a[6];
        let a13 = a[7];
        let a20 = a[8];
        let a21 = a[9];
        let a22 = a[10];
        let a23 = a[11];

        let out = Matrix4.create();
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];

        // Perform axis-specific matrix multiplication
        out[4] = a10 * c + a20 * s;
        out[5] = a11 * c + a21 * s;
        out[6] = a12 * c + a22 * s;
        out[7] = a13 * c + a23 * s;
        out[8] = a20 * c - a10 * s;
        out[9] = a21 * c - a11 * s;
        out[10] = a22 * c - a12 * s;
        out[11] = a23 * c - a13 * s;
        return out;
    }
    public static rotateY(a: Mat4, rad: number): Mat4 {
        let s = Math.sin(rad);
        let c = Math.cos(rad);
        let a00 = a[0];
        let a01 = a[1];
        let a02 = a[2];
        let a03 = a[3];
        let a20 = a[8];
        let a21 = a[9];
        let a22 = a[10];
        let a23 = a[11];

        let out = Matrix4.create();
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];


        // Perform axis-specific matrix multiplication
        out[0] = a00 * c - a20 * s;
        out[1] = a01 * c - a21 * s;
        out[2] = a02 * c - a22 * s;
        out[3] = a03 * c - a23 * s;
        out[8] = a00 * s + a20 * c;
        out[9] = a01 * s + a21 * c;
        out[10] = a02 * s + a22 * c;
        out[11] = a03 * s + a23 * c;
        return out;
    }
    public static rotateZ(a: Mat4, rad: number): Mat4 {
        let s = Math.sin(rad);
        let c = Math.cos(rad);
        let a00 = a[0];
        let a01 = a[1];
        let a02 = a[2];
        let a03 = a[3];
        let a10 = a[4];
        let a11 = a[5];
        let a12 = a[6];
        let a13 = a[7];
        let out = Matrix4.create();
        out[8] = a[8];
        out[9] = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];

        // Perform axis-specific matrix multiplication
        out[0] = a00 * c + a10 * s;
        out[1] = a01 * c + a11 * s;
        out[2] = a02 * c + a12 * s;
        out[3] = a03 * c + a13 * s;
        out[4] = a10 * c - a00 * s;
        out[5] = a11 * c - a01 * s;
        out[6] = a12 * c - a02 * s;
        out[7] = a13 * c - a03 * s;
        return out;
    }
    public static fromTranslation(v: Vec3): Mat4 {
        let out = Matrix4.create();
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = 1;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 1;
        out[11] = 0;
        out[12] = v[0];
        out[13] = v[1];
        out[14] = v[2];
        out[15] = 1;
        return out;
    }
    public static translationVector(m: Mat4): Vec3 {
        return [
            m[12],
            m[13],
            m[14]
        ];
    }
    public static fromRotation(rad: number, axis: Vec3): Mat4 | null {
        let x = axis[0],
            y = axis[1],
            z = axis[2];
        let len = Math.hypot(x, y, z);
        let s, c, t;

        if (len < EPSILON) {
            return null;
        }

        len = 1 / len;
        x *= len;
        y *= len;
        z *= len;

        s = Math.sin(rad);
        c = Math.cos(rad);
        t = 1 - c;
        let out = Matrix4.create();
        // Perform rotation-specific matrix multiplication
        out[0] = x * x * t + c;
        out[1] = y * x * t + z * s;
        out[2] = z * x * t - y * s;
        out[3] = 0;
        out[4] = x * y * t - z * s;
        out[5] = y * y * t + c;
        out[6] = z * y * t + x * s;
        out[7] = 0;
        out[8] = x * z * t + y * s;
        out[9] = y * z * t - x * s;
        out[10] = z * z * t + c;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }
    public static fromXRotation(ang: number): Mat4 {
        let s = Math.sin(ang);
        let c = Math.cos(ang);

        let out = Matrix4.create();
        // Perform axis-specific matrix multiplication
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = c;
        out[6] = s;
        out[7] = 0;
        out[8] = 0;
        out[9] = -s;
        out[10] = c;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;

    }
    public static fromYRotation(ang: number): Mat4 {
        let s = Math.sin(ang);
        let c = Math.cos(ang);

        let out = Matrix4.create();
        // Perform axis-specific matrix multiplication
        out[0] = c;
        out[1] = 0;
        out[2] = -s;
        out[3] = 0;
        out[4] = 0;
        out[5] = 1;
        out[6] = 0;
        out[7] = 0;
        out[8] = s;
        out[9] = 0;
        out[10] = c;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }
    public static fromZRotation(ang: number): Mat4 {
        let s = Math.sin(ang);
        let c = Math.cos(ang);

        let out = Matrix4.create();
        // Perform axis-specific matrix multiplication
        out[0] = c;
        out[1] = s;
        out[2] = 0;
        out[3] = 0;
        out[4] = -s;
        out[5] = c;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 1;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }
    public static fromScaling(v: Vec3): Mat4 {
        let out = Matrix4.create();
        out[0] = v[0];
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = v[1];
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = v[2];
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }
    public static fromRotationTranslation(q: Quat, v: Vec3): Mat4 {
        let x = q[0],
            y = q[1],
            z = q[2],
            w = q[3];
        let x2 = x + x;
        let y2 = y + y;
        let z2 = z + z;

        let xx = x * x2;
        let xy = x * y2;
        let xz = x * z2;
        let yy = y * y2;
        let yz = y * z2;
        let zz = z * z2;
        let wx = w * x2;
        let wy = w * y2;
        let wz = w * z2;

        let out = Matrix4.create();
        out[0] = 1 - (yy + zz);
        out[1] = xy + wz;
        out[2] = xz - wy;
        out[3] = 0;
        out[4] = xy - wz;
        out[5] = 1 - (xx + zz);
        out[6] = yz + wx;
        out[7] = 0;
        out[8] = xz + wy;
        out[9] = yz - wx;
        out[10] = 1 - (xx + yy);
        out[11] = 0;
        out[12] = v[0];
        out[13] = v[1];
        out[14] = v[2];
        out[15] = 1;

        return out;
    }
    public static fromQuat2(a: Quat, b: Quat): Mat4 {
        let translation = Vector3.create();
        let bx = -a[0],
            by = -a[1],
            bz = -a[2],
            bw = a[3],
            ax = b[0],
            ay = b[1],
            az = b[2],
            aw = b[3];

        let magnitude = bx * bx + by * by + bz * bz + bw * bw;
        //Only scale if it makes sense
        if (magnitude > 0) {
            translation[0] = ((ax * bw + aw * bx + ay * bz - az * by) * 2) / magnitude;
            translation[1] = ((ay * bw + aw * by + az * bx - ax * bz) * 2) / magnitude;
            translation[2] = ((az * bw + aw * bz + ax * by - ay * bx) * 2) / magnitude;
        } else {
            translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
            translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
            translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
        }
        return Matrix4.fromRotationTranslation(a, translation);
    }
    public static getTranslation(mat: Mat4): Vec3 {
        let out = Vector3.create();
        out[0] = mat[12];
        out[1] = mat[13];
        out[2] = mat[14];
        return out;
    }
    public static getScaling(mat: Mat4): Vec3 {
        let m11 = mat[0];
        let m12 = mat[1];
        let m13 = mat[2];
        let m21 = mat[4];
        let m22 = mat[5];
        let m23 = mat[6];
        let m31 = mat[8];
        let m32 = mat[9];
        let m33 = mat[10];
        let out = Vector3.create();
        out[0] = Math.hypot(m11, m12, m13);
        out[1] = Math.hypot(m21, m22, m23);
        out[2] = Math.hypot(m31, m32, m33);
        return out;
    }
    public static extractRotationMatrix(m: Mat4): Mat4 {
        let scaling = Matrix4.getScaling(m);

        let is1 = 1 / scaling[0];
        let is2 = 1 / scaling[1];
        let is3 = 1 / scaling[2];

        return [
            m[0] * is1,
            m[1] * is1,
            m[2] * is1,
            0,

            m[4] * is2,
            m[5] * is2,
            m[6] * is2,
            0,

            m[8] * is3,
            m[9] * is3,
            m[10] * is3,
            0,

            0,
            0,
            0,
            1
        ];
    }
    public static getRotation(mat: Mat4): Quat {
        let scaling = Matrix4.getScaling(mat);

        let is1 = 1 / scaling[0];
        let is2 = 1 / scaling[1];
        let is3 = 1 / scaling[2];

        let sm11 = mat[0] * is1;
        let sm12 = mat[1] * is2;
        let sm13 = mat[2] * is3;
        let sm21 = mat[4] * is1;
        let sm22 = mat[5] * is2;
        let sm23 = mat[6] * is3;
        let sm31 = mat[8] * is1;
        let sm32 = mat[9] * is2;
        let sm33 = mat[10] * is3;

        let trace = sm11 + sm22 + sm33;
        let S = 0;
        let out = Quaternion.create();
        if (trace > 0) {
            S = Math.sqrt(trace + 1.0) * 2;
            out[3] = 0.25 * S;
            out[0] = (sm23 - sm32) / S;
            out[1] = (sm31 - sm13) / S;
            out[2] = (sm12 - sm21) / S;
        } else if (sm11 > sm22 && sm11 > sm33) {
            S = Math.sqrt(1.0 + sm11 - sm22 - sm33) * 2;
            out[3] = (sm23 - sm32) / S;
            out[0] = 0.25 * S;
            out[1] = (sm12 + sm21) / S;
            out[2] = (sm31 + sm13) / S;
        } else if (sm22 > sm33) {
            S = Math.sqrt(1.0 + sm22 - sm11 - sm33) * 2;
            out[3] = (sm31 - sm13) / S;
            out[0] = (sm12 + sm21) / S;
            out[1] = 0.25 * S;
            out[2] = (sm23 + sm32) / S;
        } else {
            S = Math.sqrt(1.0 + sm33 - sm11 - sm22) * 2;
            out[3] = (sm12 - sm21) / S;
            out[0] = (sm31 + sm13) / S;
            out[1] = (sm23 + sm32) / S;
            out[2] = 0.25 * S;
        }

        return out;
    }
    public static fromRotationTranslationScale(q: Quat, v: Vec3, s: Vec3): Mat4 {
        // Quaternion math
        let x = q[0],
            y = q[1],
            z = q[2],
            w = q[3];
        let x2 = x + x;
        let y2 = y + y;
        let z2 = z + z;

        let xx = x * x2;
        let xy = x * y2;
        let xz = x * z2;
        let yy = y * y2;
        let yz = y * z2;
        let zz = z * z2;
        let wx = w * x2;
        let wy = w * y2;
        let wz = w * z2;
        let sx = s[0];
        let sy = s[1];
        let sz = s[2];

        let out = Matrix4.create();
        out[0] = (1 - (yy + zz)) * sx;
        out[1] = (xy + wz) * sx;
        out[2] = (xz - wy) * sx;
        out[3] = 0;
        out[4] = (xy - wz) * sy;
        out[5] = (1 - (xx + zz)) * sy;
        out[6] = (yz + wx) * sy;
        out[7] = 0;
        out[8] = (xz + wy) * sz;
        out[9] = (yz - wx) * sz;
        out[10] = (1 - (xx + yy)) * sz;
        out[11] = 0;
        out[12] = v[0];
        out[13] = v[1];
        out[14] = v[2];
        out[15] = 1;

        return out;
    }
    public static fromRotationTranslationScaleOrigin(q: Quat, v: Vec3, s: Vec3, o: Vec3): Mat4 {
        // Quaternion math
        let x = q[0],
            y = q[1],
            z = q[2],
            w = q[3];
        let x2 = x + x;
        let y2 = y + y;
        let z2 = z + z;

        let xx = x * x2;
        let xy = x * y2;
        let xz = x * z2;
        let yy = y * y2;
        let yz = y * z2;
        let zz = z * z2;
        let wx = w * x2;
        let wy = w * y2;
        let wz = w * z2;

        let sx = s[0];
        let sy = s[1];
        let sz = s[2];

        let ox = o[0];
        let oy = o[1];
        let oz = o[2];

        let out0 = (1 - (yy + zz)) * sx;
        let out1 = (xy + wz) * sx;
        let out2 = (xz - wy) * sx;
        let out4 = (xy - wz) * sy;
        let out5 = (1 - (xx + zz)) * sy;
        let out6 = (yz + wx) * sy;
        let out8 = (xz + wy) * sz;
        let out9 = (yz - wx) * sz;
        let out10 = (1 - (xx + yy)) * sz;
        let out = Matrix4.create();
        out[0] = out0;
        out[1] = out1;
        out[2] = out2;
        out[3] = 0;
        out[4] = out4;
        out[5] = out5;
        out[6] = out6;
        out[7] = 0;
        out[8] = out8;
        out[9] = out9;
        out[10] = out10;
        out[11] = 0;
        out[12] = v[0] + ox - (out0 * ox + out4 * oy + out8 * oz);
        out[13] = v[1] + oy - (out1 * ox + out5 * oy + out9 * oz);
        out[14] = v[2] + oz - (out2 * ox + out6 * oy + out10 * oz);
        out[15] = 1;

        return out;
    }
    public static fromQuat(q: Quat): Mat4 {
        let x = q[0],
            y = q[1],
            z = q[2],
            w = q[3];
        let x2 = x + x;
        let y2 = y + y;
        let z2 = z + z;

        let xx = x * x2;
        let yx = y * x2;
        let yy = y * y2;
        let zx = z * x2;
        let zy = z * y2;
        let zz = z * z2;
        let wx = w * x2;
        let wy = w * y2;
        let wz = w * z2;

        let out = Matrix4.create();
        out[0] = 1 - yy - zz;
        out[1] = yx + wz;
        out[2] = zx - wy;
        out[3] = 0;

        out[4] = yx - wz;
        out[5] = 1 - xx - zz;
        out[6] = zy + wx;
        out[7] = 0;

        out[8] = zx + wy;
        out[9] = zy - wx;
        out[10] = 1 - xx - yy;
        out[11] = 0;

        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;

        return out;
    }
    public static frustrum(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4 {
        let rl = 1 / (right - left);
        let tb = 1 / (top - bottom);
        let nf = 1 / (near - far);
        let out = Matrix4.create();
        out[0] = near * 2 * rl;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = near * 2 * tb;
        out[6] = 0;
        out[7] = 0;
        out[8] = (right + left) * rl;
        out[9] = (top + bottom) * tb;
        out[10] = (far + near) * nf;
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[14] = far * near * 2 * nf;
        out[15] = 0;
        return out;
    }

    // makePerspective( left, right, top, bottom, near, far ) {

    // 	if ( far === undefined ) {

    // 		console.warn( 'THREE.Matrix4: .makePerspective() has been redefined and has a new signature. Please check the docs.' );

    // 	}

    // 	const te = this.elements;
    // 	const x = 2 * near / ( right - left );
    // 	const y = 2 * near / ( top - bottom );

    // 	const a = ( right + left ) / ( right - left );
    // 	const b = ( top + bottom ) / ( top - bottom );
    // 	const c = - ( far + near ) / ( far - near );
    // 	const d = - 2 * far * near / ( far - near );

    // 	te[ 0 ] = x;	te[ 4 ] = 0;	te[ 8 ] = a;	te[ 12 ] = 0;
    // 	te[ 1 ] = 0;	te[ 5 ] = y;	te[ 9 ] = b;	te[ 13 ] = 0;
    // 	te[ 2 ] = 0;	te[ 6 ] = 0;	te[ 10 ] = c;	te[ 14 ] = d;
    // 	te[ 3 ] = 0;	te[ 7 ] = 0;	te[ 11 ] = - 1;	te[ 15 ] = 0;

    // 	return this;

    // }

    // makeOrthographic( left, right, top, bottom, near, far ) {

    // 	const te = this.elements;
    // 	const w = 1.0 / ( right - left );
    // 	const h = 1.0 / ( top - bottom );
    // 	const p = 1.0 / ( far - near );

    // 	const x = ( right + left ) * w;
    // 	const y = ( top + bottom ) * h;
    // 	const z = ( far + near ) * p;

    // 	te[ 0 ] = 2 * w;	te[ 4 ] = 0;	te[ 8 ] = 0;	te[ 12 ] = - x;
    // 	te[ 1 ] = 0;	te[ 5 ] = 2 * h;	te[ 9 ] = 0;	te[ 13 ] = - y;
    // 	te[ 2 ] = 0;	te[ 6 ] = 0;	te[ 10 ] = - 2 * p;	te[ 14 ] = - z;
    // 	te[ 3 ] = 0;	te[ 7 ] = 0;	te[ 11 ] = 0;	te[ 15 ] = 1;

    // 	return this;

    // }

    public static perspectiveGL(fovy: number, aspect: number, near: number, far: number | null | undefined): Mat4 {
        const f = 1.0 / Math.tan(fovy / 2);
        let out = Matrix4.create();
        out[0] = f / aspect;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = f;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[15] = 0;
        if (far != null && far !== Infinity) {
            const nf = 1 / (near - far);
            out[10] = (far + near) * nf;
            out[14] = 2 * far * near * nf;
        } else {
            out[10] = -1;
            out[14] = -2 * near;
        }
        return out;
    }
    public static orthoGL(left: number, right: number, top: number, bottom: number, near: number, far: number): Mat4 {
        const lr = 1 / (left - right);
        const bt = 1 / (bottom - top);
        const nf = 1 / (near - far);
        let out = Matrix4.create();
        out[0] = -2 * lr;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = -2 * bt;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 2 * nf;
        out[11] = 0;
        out[12] = (left + right) * lr;
        out[13] = (top + bottom) * bt;
        out[14] = (far + near) * nf;
        out[15] = 1;
        return out;
    }
    public static lookAt(eye: Vec3, center: Vec3, up: Vec3): Mat4 {
        let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
        let eyex = eye[0];
        let eyey = eye[1];
        let eyez = eye[2];
        let upx = up[0];
        let upy = up[1];
        let upz = up[2];
        let centerx = center[0];
        let centery = center[1];
        let centerz = center[2];
        let out = Matrix4.create();
        if (
            Math.abs(eyex - centerx) < EPSILON &&
            Math.abs(eyey - centery) < EPSILON &&
            Math.abs(eyez - centerz) < EPSILON
        ) {
            return Matrix4.identity();
        }

        z0 = eyex - centerx;
        z1 = eyey - centery;
        z2 = eyez - centerz;

        len = 1 / Math.hypot(z0, z1, z2);
        z0 *= len;
        z1 *= len;
        z2 *= len;

        x0 = upy * z2 - upz * z1;
        x1 = upz * z0 - upx * z2;
        x2 = upx * z1 - upy * z0;
        len = Math.hypot(x0, x1, x2);
        if (!len) {
            x0 = 0;
            x1 = 0;
            x2 = 0;
        } else {
            len = 1 / len;
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }

        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;

        len = Math.hypot(y0, y1, y2);
        if (!len) {
            y0 = 0;
            y1 = 0;
            y2 = 0;
        } else {
            len = 1 / len;
            y0 *= len;
            y1 *= len;
            y2 *= len;
        }

        out[0] = x0;
        out[1] = y0;
        out[2] = z0;
        out[3] = 0;
        out[4] = x1;
        out[5] = y1;
        out[6] = z1;
        out[7] = 0;
        out[8] = x2;
        out[9] = y2;
        out[10] = z2;
        out[11] = 0;
        out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
        out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
        out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
        out[15] = 1;

        return out;
    }

    public static lookAt2(eye: Vec3, target: Vec3, up: Vec3): Mat4 {
        const te = Matrix4.create();
        let _z = Vector3.sub(eye, target);
        if (Vector3.lenghtSquare(_z) === 0) {
            // eye and target are in the same position
            _z[2] = 1;
        }
        _z = Vector3.normalize(_z);
        let _x = Vector3.cross(up, _z);
        if (Vector3.lenghtSquare(_x) === 0) {
            // up and z are parallel
            if (Math.abs(up[2]) === 1) {
                _z[0] += 0.0001;
            } else {
                _z[2] += 0.0001;
            }
            _z = Vector3.normalize(_z);
            _x = Vector3.cross(up, _z);
        }
        _x = Vector3.normalize(_x);
        let _y = Vector3.cross(_z, _x);
        te[0] = _x[0]; te[4] = _y[0]; te[8] = _z[0];
        te[1] = _x[1]; te[5] = _y[1]; te[9] = _z[1];
        te[2] = _x[2]; te[6] = _y[2]; te[10] = _z[2];
        return te;
    }



    public static targetTo(eye: Vec3, target: Vec3, up: Vec3): Mat4 {
        let eyex = eye[0],
            eyey = eye[1],
            eyez = eye[2],
            upx = up[0],
            upy = up[1],
            upz = up[2];

        let z0 = eyex - target[0],
            z1 = eyey - target[1],
            z2 = eyez - target[2];

        let len = z0 * z0 + z1 * z1 + z2 * z2;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            z0 *= len;
            z1 *= len;
            z2 *= len;
        }

        let x0 = upy * z2 - upz * z1,
            x1 = upz * z0 - upx * z2,
            x2 = upx * z1 - upy * z0;

        len = x0 * x0 + x1 * x1 + x2 * x2;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }
        let out = Matrix4.create();
        out[0] = x0;
        out[1] = x1;
        out[2] = x2;
        out[3] = 0;
        out[4] = z1 * x2 - z2 * x1;
        out[5] = z2 * x0 - z0 * x2;
        out[6] = z0 * x1 - z1 * x0;
        out[7] = 0;
        out[8] = z0;
        out[9] = z1;
        out[10] = z2;
        out[11] = 0;
        out[12] = eyex;
        out[13] = eyey;
        out[14] = eyez;
        out[15] = 1;
        return out;
    }
    public static maxScaleOnAxis(m: Mat4): number {
        const scaleXSq = m[0] * m[0] + m[1] * m[1] + m[2] * m[2];
        const scaleYSq = m[4] * m[4] + m[5] * m[5] + m[6] * m[6];
        const scaleZSq = m[8] * m[8] + m[9] * m[9] + m[10] * m[10];
        return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
    }
}

export class Matrix3 {
    private constructor() {}
    public static create(): Mat3 {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    }

    public static fromMat4(m: Mat4): Mat3 {
        let out = Matrix3.create();
        out[0] = m[0];
        out[1] = m[1];
        out[2] = m[2];
        out[3] = m[4];
        out[4] = m[5];
        out[5] = m[6];
        out[6] = m[8];
        out[7] = m[9];
        out[8] = m[10];
        return out;
    }

    public static clone(m: Mat3): Mat3 {
        let out = Matrix3.create();
        out[0] = m[0];
        out[1] = m[1];
        out[2] = m[2];
        out[3] = m[3];
        out[4] = m[4];
        out[5] = m[5];
        out[6] = m[6];
        out[7] = m[7];
        out[8] = m[8];
        return out;
    }

    public static fromValues(
        m00: number, m01: number, m02: number,
        m10: number, m11: number, m12: number,
        m20: number, m21: number, m22: number): Mat3 {
        let out = Matrix3.create();
        out[0] = m00;
        out[1] = m01;
        out[2] = m02;
        out[3] = m10;
        out[4] = m11;
        out[5] = m12;
        out[6] = m20;
        out[7] = m21;
        out[8] = m22;
        return out;
    }
    public static identity(m: Mat3): void {
        m[0] = 1;
        m[1] = 0;
        m[2] = 0;
        m[3] = 0;
        m[4] = 1;
        m[5] = 0;
        m[6] = 0;
        m[7] = 0;
        m[8] = 1;
    }
    public static normalMatrix(m: Mat4) {
        return Matrix3.transpose(Matrix3.invert(Matrix3.fromMat4(m)));
    }
    public static transpose(m: Mat3): Mat3 {
        let out = Matrix3.create();
        out[0] = m[0];
        out[1] = m[3];
        out[2] = m[6];
        out[3] = m[1];
        out[4] = m[4];
        out[5] = m[7];
        out[6] = m[2];
        out[7] = m[5];
        out[8] = m[8];
        return out;
    }
    public static invert(m: Mat3): Mat3 {
        let a00 = m[0],
            a01 = m[1],
            a02 = m[2];
        let a10 = m[3],
            a11 = m[4],
            a12 = m[5];
        let a20 = m[6],
            a21 = m[7],
            a22 = m[8];

        let b01 = a22 * a11 - a12 * a21;
        let b11 = -a22 * a10 + a12 * a20;
        let b21 = a21 * a10 - a11 * a20;

        // Calculate the determinant
        let det = a00 * b01 + a01 * b11 + a02 * b21;

        if (!det) {
            return Matrix3.create();
        }
        det = 1.0 / det;
        let out = Matrix3.create();
        out[0] = b01 * det;
        out[1] = (-a22 * a01 + a02 * a21) * det;
        out[2] = (a12 * a01 - a02 * a11) * det;
        out[3] = b11 * det;
        out[4] = (a22 * a00 - a02 * a20) * det;
        out[5] = (-a12 * a00 + a02 * a10) * det;
        out[6] = b21 * det;
        out[7] = (-a21 * a00 + a01 * a20) * det;
        out[8] = (a11 * a00 - a01 * a10) * det;
        return out;
    }
    public static adjugate(m: Mat3): Mat3 {
        let a00 = m[0],
            a01 = m[1],
            a02 = m[2];
        let a10 = m[3],
            a11 = m[4],
            a12 = m[5];
        let a20 = m[6],
            a21 = m[7],
            a22 = m[8];
        let out = Matrix3.create();
        out[0] = a11 * a22 - a12 * a21;
        out[1] = a02 * a21 - a01 * a22;
        out[2] = a01 * a12 - a02 * a11;
        out[3] = a12 * a20 - a10 * a22;
        out[4] = a00 * a22 - a02 * a20;
        out[5] = a02 * a10 - a00 * a12;
        out[6] = a10 * a21 - a11 * a20;
        out[7] = a01 * a20 - a00 * a21;
        out[8] = a00 * a11 - a01 * a10;
        return out;
    }
    /**
     * determinant
     */
    public static determinant(m: Mat3): number {
        let a00 = m[0],
            a01 = m[1],
            a02 = m[2];
        let a10 = m[3],
            a11 = m[4],
            a12 = m[5];
        let a20 = m[6],
            a21 = m[7],
            a22 = m[8];

        return (
            a00 * (a22 * a11 - a12 * a21) +
            a01 * (-a22 * a10 + a12 * a20) +
            a02 * (a21 * a10 - a11 * a20)
        );
    }
    public static multiply(a: Mat3, b: Mat3): Mat3 {
        let a00 = a[0],
            a01 = a[1],
            a02 = a[2];
        let a10 = a[3],
            a11 = a[4],
            a12 = a[5];
        let a20 = a[6],
            a21 = a[7],
            a22 = a[8];

        let b00 = b[0],
            b01 = b[1],
            b02 = b[2];
        let b10 = b[3],
            b11 = b[4],
            b12 = b[5];
        let b20 = b[6],
            b21 = b[7],
            b22 = b[8];
        let out = Matrix3.create();
        out[0] = b00 * a00 + b01 * a10 + b02 * a20;
        out[1] = b00 * a01 + b01 * a11 + b02 * a21;
        out[2] = b00 * a02 + b01 * a12 + b02 * a22;

        out[3] = b10 * a00 + b11 * a10 + b12 * a20;
        out[4] = b10 * a01 + b11 * a11 + b12 * a21;
        out[5] = b10 * a02 + b11 * a12 + b12 * a22;

        out[6] = b20 * a00 + b21 * a10 + b22 * a20;
        out[7] = b20 * a01 + b21 * a11 + b22 * a21;
        out[8] = b20 * a02 + b21 * a12 + b22 * a22;
        return out;
    }
    public static translate(m: Mat3, v: Vec2): Mat3 {
        let a00 = m[0],
            a01 = m[1],
            a02 = m[2],
            a10 = m[3],
            a11 = m[4],
            a12 = m[5],
            a20 = m[6],
            a21 = m[7],
            a22 = m[8],
            x = v[0],
            y = v[1];
        let out = Matrix3.create();
        out[0] = a00;
        out[1] = a01;
        out[2] = a02;

        out[3] = a10;
        out[4] = a11;
        out[5] = a12;

        out[6] = x * a00 + y * a10 + a20;
        out[7] = x * a01 + y * a11 + a21;
        out[8] = x * a02 + y * a12 + a22;
        return out;
    }
    public static rotate(m: Mat3, angle: number): Mat3 {
        let a00 = m[0],
            a01 = m[1],
            a02 = m[2],
            a10 = m[3],
            a11 = m[4],
            a12 = m[5],
            a20 = m[6],
            a21 = m[7],
            a22 = m[8],
            s = Math.sin(angle),
            c = Math.cos(angle);
        let out = Matrix3.create();
        out[0] = c * a00 + s * a10;
        out[1] = c * a01 + s * a11;
        out[2] = c * a02 + s * a12;

        out[3] = c * a10 - s * a00;
        out[4] = c * a11 - s * a01;
        out[5] = c * a12 - s * a02;

        out[6] = a20;
        out[7] = a21;
        out[8] = a22;
        return out;
    }
    public static scale(m: Mat3, v: Vec2): Mat3 {
        let x = v[0],
            y = v[1];
        let out = Matrix3.create();
        out[0] = x * m[0];
        out[1] = x * m[1];
        out[2] = x * m[2];

        out[3] = y * m[3];
        out[4] = y * m[4];
        out[5] = y * m[5];

        out[6] = m[6];
        out[7] = m[7];
        out[8] = m[8];
        return out;
    }
    public static fromTranslation(v: Vec2): Mat3 {
        let out = Matrix3.create();
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 1;
        out[5] = 0;
        out[6] = v[0];
        out[7] = v[1];
        out[8] = 1;
        return out;
    }
    public static fromRotation(rad: number): Mat3 {
        let s = Math.sin(rad),
            c = Math.cos(rad);
        let out = Matrix3.create();
        out[0] = c;
        out[1] = s;
        out[2] = 0;

        out[3] = -s;
        out[4] = c;
        out[5] = 0;

        out[6] = 0;
        out[7] = 0;
        out[8] = 1;
        return out;
    }
    public static fromScaling(v: Vec2): Mat3 {
        let out = Matrix3.create();
        out[0] = v[0];
        out[1] = 0;
        out[2] = 0;

        out[3] = 0;
        out[4] = v[1];
        out[5] = 0;

        out[6] = 0;
        out[7] = 0;
        out[8] = 1;
        return out;
    }
    public static fromQuaternion(q: Quat): Mat3 {
        let x = q[0],
            y = q[1],
            z = q[2],
            w = q[3];
        let x2 = x + x;
        let y2 = y + y;
        let z2 = z + z;

        let xx = x * x2;
        let yx = y * x2;
        let yy = y * y2;
        let zx = z * x2;
        let zy = z * y2;
        let zz = z * z2;
        let wx = w * x2;
        let wy = w * y2;
        let wz = w * z2;
        let out = Matrix3.create();
        out[0] = 1 - yy - zz;
        out[3] = yx - wz;
        out[6] = zx + wy;

        out[1] = yx + wz;
        out[4] = 1 - xx - zz;
        out[7] = zy - wx;

        out[2] = zx - wy;
        out[5] = zy + wx;
        out[8] = 1 - xx - yy;

        return out;
    }
    public static projection(width: number, height: number): Mat3 {
        let out = Matrix3.create();
        out[0] = 2 / width > 0 ? width : 0.0000001;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = -2 / height > 0 ? height : 0.0000001;
        out[5] = 0;
        out[6] = -1;
        out[7] = 1;
        out[8] = 1;
        return out;
    }
}