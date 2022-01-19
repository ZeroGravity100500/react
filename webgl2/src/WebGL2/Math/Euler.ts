import { Mat4, Matrix4 } from "./Matrix";
import { clamp } from "./mmath";
import { Quaternion, Quat } from "./Quaternion";
import { Vec3 } from "./Vector";

export enum EulerOrder {
    XYZ,
    YZX,
    ZXY,
    XZY,
    YXZ,
    ZYX
}
// Euler.DefaultOrder = 'XYZ';
export class Euler {
    static DefaultOrder: EulerOrder = EulerOrder.XYZ;

    private _x: number;
    private _y: number;
    private _z: number;
    private _order: EulerOrder;

    constructor(x = 0, y = 0, z = 0, order = Euler.DefaultOrder) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._order = order;
    }

    get x() {
        return this._x;
    }
    set x(value) {
        this._x = value;
    }

    get y() {
        return this._y;
    }

    set y(value) {
        this._y = value;
    }

    get z() {
        return this._z;
    }

    set z(value) {
        this._z = value;
    }

    get order() {
        return this._order;
    }

    set order(value) {
        this._order = value;
    }
    set(x: number, y: number, z: number, order = this._order): Euler {
        this._x = x;
        this._y = y;
        this._z = z;
        this._order = order;
        return this;
    }
    clone(): Euler {
        return new Euler(this._x, this._y, this._z, this._order);
    }
    copy(euler: Euler): Euler {
        this._x = euler.x;
        this._y = euler.y;
        this._z = euler.z;
        this._order = euler.order;
        return this;
    }

    fromRotationMatrix4(m: Mat4, order = this._order): Euler {
        const m11 = m[0], m12 = m[4], m13 = m[8];
        const m21 = m[1], m22 = m[5], m23 = m[9];
        const m31 = m[2], m32 = m[6], m33 = m[10];
        switch (order) {
            case EulerOrder.XYZ:
                this._y = Math.asin(clamp(m13, -1, 1));
                if (Math.abs(m13) < 0.9999999) {
                    this._x = Math.atan2(-m23, m33);
                    this._z = Math.atan2(-m12, m11);
                } else {
                    this._x = Math.atan2(m32, m22);
                    this._z = 0;
                }
                break;
            case EulerOrder.YXZ:
                this._x = Math.asin(-clamp(m23, -1, 1));
                if (Math.abs(m23) < 0.9999999) {
                    this._y = Math.atan2(m13, m33);
                    this._z = Math.atan2(m21, m22);
                } else {
                    this._y = Math.atan2(-m31, m11);
                    this._z = 0;
                }
                break;
            case EulerOrder.ZXY:
                this._x = Math.asin(clamp(m32, -1, 1));
                if (Math.abs(m32) < 0.9999999) {
                    this._y = Math.atan2(-m31, m33);
                    this._z = Math.atan2(-m12, m22);
                } else {
                    this._y = 0;
                    this._z = Math.atan2(m21, m11);
                }
                break;
            case EulerOrder.ZYX:
                this._y = Math.asin(-clamp(m31, -1, 1));
                if (Math.abs(m31) < 0.9999999) {
                    this._x = Math.atan2(m32, m33);
                    this._z = Math.atan2(m21, m11);
                } else {
                    this._x = 0;
                    this._z = Math.atan2(-m12, m22);
                }
                break;
            case EulerOrder.YZX:
                this._z = Math.asin(clamp(m21, -1, 1));
                if (Math.abs(m21) < 0.9999999) {
                    this._x = Math.atan2(-m23, m22);
                    this._y = Math.atan2(-m31, m11);
                } else {
                    this._x = 0;
                    this._y = Math.atan2(m13, m33);
                }
                break;
            case EulerOrder.XZY:
                this._z = Math.asin(-clamp(m12, -1, 1));
                if (Math.abs(m12) < 0.9999999) {
                    this._x = Math.atan2(m32, m22);
                    this._y = Math.atan2(m13, m11);
                } else {
                    this._x = Math.atan2(-m23, m33);
                    this._y = 0;
                }
                break;
            default:
                console.warn('Euler: .setFromRotationMatrix() encountered an unknown order: ' + order);
        }
        this._order = order;
        return this;
    }
    fromQuaternion(q: Quat, order = this._order): Euler {
        let rotationMatrix = Matrix4.fromQuat(q);
        return this.fromRotationMatrix4(rotationMatrix, order);
    }
    fromVector3(v: Vec3, order = this._order): Euler {
        return this.set(v[0], v[1], v[2], order);
    }
    reorder(newOrder: EulerOrder) {
        let q = Quaternion.fromEuler(this._x, this._y, this._z, newOrder);
        return this.fromQuaternion(q, newOrder);
    }
    equals(euler: Euler): boolean {
        return ( euler._x === this._x ) && ( euler._y === this._y ) && ( euler._z === this._z ) && ( euler._order === this._order );
    }
    toVec3(): Vec3 {
        return [this._x, this._y, this._z];
    }
    
}