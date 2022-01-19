import { Box3 } from "./Box";
import { Mat4, Matrix4 } from "./Matrix";
import { Plane } from "./Plane";
import { Vec3, Vector3 } from "./Vector";

export class Sphere {
    private _center: Vec3;
    private _radius: number;

    constructor(center: Vec3 = Vector3.create(), radius: number = -1) {
        this._center = center;
        this._radius = radius;
    }

    get radius(): number {
        return this._radius;
    }
    set radius(v: number){
        this._radius = v;
    }
    get center(): Vec3 {
        return this._center;
    }
    set center(v:Vec3) {
        Vector3.set(this._center, v);
    }
    fromPoints(points: Vec3[], optionalCenter?: Vec3): Sphere {
        let center = this._center;
        if (optionalCenter !== undefined) {
            Vector3.set(center, optionalCenter[0], optionalCenter[1], optionalCenter[2]);
        } else {
            let box = new Box3();
            box.setFromPoints(points);
            center = box.center();
        }
        let maxRadiusSq = 0;
        for (let i = 0, il = points.length; i < il; i++) {
            maxRadiusSq = Math.max(maxRadiusSq, Vector3.distanceSquare(center, points[i]));
        }
        this._radius = Math.sqrt(maxRadiusSq);
        return this;
    }
    set(v: Vec3, r: number) {
        Vector3.set(this._center, v);
        this._radius = r;
    }
    isEmpty(): boolean {
        return (this._radius < 0);
    }
    empty() {
        Vector3.set(this._center, 0, 0, 0);
        this._radius = - 1;
        return this;
    }
    containsPoint(point: Vec3): boolean {
        return Vector3.distanceSquare(point, this._center) <= (this._radius * this._radius);
    }
    distanceToPoint(point: Vec3): number {
        return Vector3.distance(point, this._center) - this._radius;
    }
    intersectsSphere(sphere: Sphere): boolean {
        const radiusSum = this._radius + sphere.radius;
        return Vector3.distanceSquare(sphere.center, this._center) <= (radiusSum * radiusSum);
    }
    intersectsBox(box: Box3): boolean {
        return box.intersectsSphere(this);
    }
    intersectsPlane(plane: Plane): boolean {
        return Math.abs(plane.distanceToPoint(this._center)) <= this._radius;
    }
    clampPoint(point: Vec3): Vec3 {
        const deltaLengthSq = Vector3.distanceSquare(this._center, point);
        let target = Vector3.clone(point);
        if (deltaLengthSq > (this._radius * this._radius)) {
            target = Vector3.normalize(Vector3.sub(target, this._center));
            target = Vector3.add(Vector3.mul(target, this._radius), this._center);
        }
        return target;
    }
    boundingBox(): Box3 {
        let target = new Box3();
        if (this.isEmpty()) {
            // Empty sphere produces empty bounding box
            target.empty();
            return target;
        }
        target.set(this._center, this._center);
        target.expandByScalar(this._radius);
        return target;
    }
    applyMatrix4(matrix: Mat4): Sphere {
        this._center = Vector3.transformMat4(this._center, matrix);
        this._radius = this._radius * Matrix4.maxScaleOnAxis(matrix);
        return this;
    }

    translate(offset: Vec3) {
        this._center = Vector3.add(this._center, offset);
        return this;
    }

    expandByPoint(point: Vec3) {
        // from https://github.com/juj/MathGeoLib/blob/2940b99b99cfe575dd45103ef20f4019dee15b54/src/Geometry/Sphere.cpp#L649-L671
        let _toPoint = Vector3.sub(point, this._center);
        const lengthSq = Vector3.lenghtSquare(_toPoint);
        if (lengthSq > (this._radius * this._radius)) {
            const length = Math.sqrt(lengthSq);
            const missingRadiusHalf = (length - this._radius) * 0.5;
            // Nudge this sphere towards the target point. Add half the missing distance to radius,
            // and the other half to position. This gives a tighter enclosure, instead of if
            // the whole missing distance were just added to radius.
            this._center = Vector3.add(this._center, Vector3.mul(_toPoint, missingRadiusHalf / length));
            this._radius += missingRadiusHalf;
        }
        return this;
    }
    union(sphere: Sphere): Sphere {
        // from https://github.com/juj/MathGeoLib/blob/2940b99b99cfe575dd45103ef20f4019dee15b54/src/Geometry/Sphere.cpp#L759-L769
        // To enclose another sphere into this sphere, we only need to enclose two points:
        // 1) Enclose the farthest point on the other sphere into this sphere.
        // 2) Enclose the opposite point of the farthest point into this sphere.
        let _toFarthestPoint;
        if (Vector3.equals(this._center, sphere._center) === true) {
            _toFarthestPoint = Vector3.mul(Vector3.fromValues(0, 0, 1), sphere._radius);
        } else {
            _toFarthestPoint = Vector3.mul(Vector3.normalize(Vector3.sub(sphere._center, this._center)), sphere._radius);
        }
        this.expandByPoint(Vector3.add(sphere._center, _toFarthestPoint));
        this.expandByPoint(Vector3.sub(sphere._center, _toFarthestPoint));
        return this;
    }
	equals( sphere: Sphere ): boolean {
		return Vector3.equals(this._center, sphere._center) && (sphere._radius === this._radius);
	}
}