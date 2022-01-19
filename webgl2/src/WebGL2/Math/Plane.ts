import { Mat3, Mat4, Matrix3 } from "./Matrix";
import { Vec3, Vector3 } from "./Vector";

export class Plane {
    private _normal: Vec3;
    private _constant: number;

    constructor(normal = Vector3.fromValues(1, 0, 0), constant = 0) {
        this._normal = Vector3.clone(normal);
        this._constant = constant;
    }

    get normal(): Vec3{
        return this._normal;
    }
    get constant(): number{
        return this._constant;
    }
    set(normal: Vec3, constant: number) {
        this._normal = Vector3.clone(normal);
        this._constant = constant;
    }
    setComponents(x: number, y: number, z: number, w: number): Plane {
        Vector3.set(this._normal, x, y, z);
        this._constant = w;
        return this;
    }
    fromNormalAndCoplanarPoint(normal: Vec3, point: Vec3): Plane {
        this._normal = Vector3.clone(normal);
        this._constant = Vector3.dot(point, this._normal);
        return this;
    }
    fromCoplanarPoints(a: Vec3, b: Vec3, c: Vec3) {
        let cb = Vector3.sub(c, b);
        let ab = Vector3.sub(a, b);
        const normal = Vector3.normalize(Vector3.cross(cb, ab));
        this.fromNormalAndCoplanarPoint(normal, a);
    }
    clone(): Plane {
        return new Plane(this._normal, this._constant);
    }
    normalize() {
        // Note: will lead to a divide by zero if the plane is invalid.
        const inverseNormalLength = 1.0 / Vector3.lenght(this._normal);
        this._normal = Vector3.mul(this._normal, inverseNormalLength);
        this._constant *= inverseNormalLength;

        return this;
    }
    negate() {
        this._constant *= - 1;
        this._normal = Vector3.negate(this._normal);
        return this;
    }
    distanceToPoint(point: Vec3): number {
        return  Vector3.dot(this._normal, point) + this._constant;
    }
	projectPoint(point: Vec3): Vec3 {
        return Vector3.add(Vector3.mul(this._normal, - this.distanceToPoint(point)), point);
	}
    translate(offset: Vec3) {
        this._constant -= Vector3.dot(offset, this._normal);
    }
	coplanarPoint(): Vec3 {
		return Vector3.mul(this._normal, - this._constant);
	}
	applyMatrix4(matrix: Mat4, optionalNormalMatrix?: Mat3): Plane {
		const normalMatrix = optionalNormalMatrix || Matrix3.normalMatrix(matrix);
		const referencePoint = Vector3.transformMat4(this.coplanarPoint(), matrix);
		const normal = Vector3.normalize(Vector3.transformMat3(this._normal, normalMatrix));
		this._constant = -Vector3.dot(referencePoint, normal);

		return this;
	}
}