import { Box3 } from "./Box";
import { Mat4 } from "./Matrix";
import { Plane } from "./Plane";
import { Sphere } from "./Sphere";
import { Vec3, Vector3 } from "./Vector";

export class Ray {
    private _origin: Vec3;
    private _direction: Vec3;
    constructor(origin = Vector3.create(), direction = Vector3.fromValues(0, 0, - 1)) {
        this._origin = origin;
        this._direction = direction;
    }

    get origin(): Vec3 {
        return this._origin;
    }
    get direction(): Vec3 {
        return this._direction;
    }
    set(origin: Vec3, direction: Vec3) {
        Vector3.set(this._origin, origin[0], origin[1], origin[2]);
        Vector3.set(this._direction, direction[0], direction[1], direction[2]);
    }
    copy(r: Ray): Ray {
        this.set(r.origin, r.direction);
        return this;
    }
    at(t: number): Vec3 {
        return Vector3.add(Vector3.mul(this.direction, t), this.origin);
    }
    lookAt(p: Vec3): Ray {
        Vector3.set(this.direction, Vector3.normalize(Vector3.sub(p, this.origin)));
        return this;
    }
    recast(t: number): Ray {
        Vector3.set(this.origin, this.at(t));
        return this;
    }
    closestPointToPoint(point: Vec3): Vec3 {
        let dirDist = Vector3.dot(Vector3.sub(point, this._origin), this.direction);
        if (dirDist < 0) {
            return Vector3.clone(this.origin);
        }
        return Vector3.add(Vector3.mul(this.direction, dirDist), this.origin);
    }
    distanceSqToPoint(point: Vec3): number {
        const directionDistance = Vector3.dot(Vector3.sub(point, this.origin), this.direction);
        if (directionDistance < 0) {
            return Vector3.distanceSquare(this.origin, point);
        }

        let v = Vector3.add(Vector3.mul(this.direction, directionDistance), this.origin);
        return Vector3.distanceSquare(v, point);
    }
    distanceToPoint(point: Vec3): number {
        return Math.sqrt(this.distanceSqToPoint(point));
    }
    distanceToSegmentSq(v0: Vec3, v1: Vec3, optionalPointOnRay?: Vec3, optionalPointOnSeg?: Vec3): number {
        const segCenter = Vector3.mul(Vector3.sub(v0, v1), 0.5);
        const segDir = Vector3.normalize(Vector3.sub(v1, v0));
        const diff = Vector3.sub(this.origin, segCenter);
        const segExtent = Vector3.distance(v0, v1) * 0.5;
        const a01 = -Vector3.dot(this.direction, segDir);
        const b0 = Vector3.dot(diff, this.direction);
        const b1 = -Vector3.dot(diff, segDir);
        const c = Vector3.lenghtSquare(diff);
        const det = Math.abs(1 - a01 * a01);
        let s0, s1, sqrDist, extDet;

        if (det > 0) {
            // The ray and segment are not parallel.
            s0 = a01 * b1 - b0;
            s1 = a01 * b0 - b1;
            extDet = segExtent * det;
            if (s0 >= 0) {
                if (s1 >= - extDet) {
                    if (s1 <= extDet) {
                        // region 0
                        // Minimum at interior points of ray and segment.
                        const invDet = 1 / det;
                        s0 *= invDet;
                        s1 *= invDet;
                        sqrDist = s0 * (s0 + a01 * s1 + 2 * b0) + s1 * (a01 * s0 + s1 + 2 * b1) + c;
                    } else {
                        // region 1
                        s1 = segExtent;
                        s0 = Math.max(0, - (a01 * s1 + b0));
                        sqrDist = - s0 * s0 + s1 * (s1 + 2 * b1) + c;
                    }
                } else {
                    // region 5
                    s1 = - segExtent;
                    s0 = Math.max(0, - (a01 * s1 + b0));
                    sqrDist = - s0 * s0 + s1 * (s1 + 2 * b1) + c;
                }
            } else {
                if (s1 <= - extDet) {
                    // region 4
                    s0 = Math.max(0, - (- a01 * segExtent + b0));
                    s1 = (s0 > 0) ? - segExtent : Math.min(Math.max(- segExtent, - b1), segExtent);
                    sqrDist = - s0 * s0 + s1 * (s1 + 2 * b1) + c;
                } else if (s1 <= extDet) {
                    // region 3
                    s0 = 0;
                    s1 = Math.min(Math.max(- segExtent, - b1), segExtent);
                    sqrDist = s1 * (s1 + 2 * b1) + c;
                } else {
                    // region 2
                    s0 = Math.max(0, - (a01 * segExtent + b0));
                    s1 = (s0 > 0) ? segExtent : Math.min(Math.max(- segExtent, - b1), segExtent);
                    sqrDist = - s0 * s0 + s1 * (s1 + 2 * b1) + c;
                }
            }
        } else {
            // Ray and segment are parallel.
            s1 = (a01 > 0) ? - segExtent : segExtent;
            s0 = Math.max(0, - (a01 * s1 + b0));
            sqrDist = - s0 * s0 + s1 * (s1 + 2 * b1) + c;
        }

        if (optionalPointOnRay) {
            Vector3.set(optionalPointOnRay, Vector3.add(this.origin, Vector3.mul(this.direction, s0)));
        }

        if (optionalPointOnSeg) {
            Vector3.set(optionalPointOnSeg, Vector3.add(segCenter, Vector3.mul(segDir, s1)));
        }
        return sqrDist;
    }

    intersectSphere(sphere: Sphere): Vec3 | null {
        let v = Vector3.sub(sphere.center, this.origin);
        const tca = Vector3.dot(v, this.direction);
        const d2 = Vector3.dot(v, v) - tca * tca;
        const radius2 = sphere.radius * sphere.radius;

        if (d2 > radius2) return null;
        const thc = Math.sqrt(radius2 - d2);
        // t0 = first intersect point - entrance on front of sphere
        const t0 = tca - thc;
        // t1 = second intersect point - exit point on back of sphere
        const t1 = tca + thc;
        // test to see if both t0 and t1 are behind the ray - if so, return null
        if (t0 < 0 && t1 < 0) return null;
        // test to see if t0 is behind the ray:
        // if it is, the ray is inside the sphere, so return the second exit point scaled by t1,
        // in order to always return an intersect point that is in front of the ray.
        if (t0 < 0) return this.at(t1);
        // else t0 is in front of the ray, so return the first collision point scaled by t0
        return this.at(t0);
    }
    intersectsSphere(sphere: Sphere): boolean {
        return this.distanceSqToPoint(sphere.center) <= (sphere.radius * sphere.radius);
    }

    distanceToPlane(plane: Plane): number {
        const denominator = Vector3.dot(plane.normal, this.direction);
        if (denominator === 0) {
            // line is coplanar, return origin
            if (plane.distanceToPoint(this.origin) === 0) {
                return 0;
            }
            // Null is preferable to undefined since undefined means.... it is undefined
            return NaN;
        }
        const t = - (Vector3.dot(this.origin, plane.normal) + plane.constant) / denominator;

        // Return if the ray never intersects the plane

        return t >= 0 ? t : NaN;
    }

    intersectPlane(plane: Plane): Vec3 | null {
        const t = this.distanceToPlane(plane);
        if (t === null) {
            return null;
        }
        return this.at(t);
    }

    intersectsPlane(plane: Plane): boolean {
        // check if the ray lies on the plane first
        const distToPoint = plane.distanceToPoint(this.origin);
        if (distToPoint === 0) {
            return true;
        }
        const denominator = Vector3.dot(plane.normal, this.direction);
        if (denominator * distToPoint < 0) {
            return true;
        }
        // ray origin is behind the plane (and is pointing behind it)
        return false;
    }

    intersectBox(box: Box3): Vec3 | null {
        let tmin, tmax, tymin, tymax, tzmin, tzmax;
        const invdirx = 1 / this.direction[0],
            invdiry = 1 / this.direction[1],
            invdirz = 1 / this.direction[2];
        const origin = this.origin;

        if (invdirx >= 0) {
            tmin = (box.min[0] - origin[0]) * invdirx;
            tmax = (box.max[0] - origin[0]) * invdirx;
        } else {
            tmin = (box.max[0] - origin[0]) * invdirx;
            tmax = (box.min[0] - origin[0]) * invdirx;
        }

        if (invdiry >= 0) {
            tymin = (box.min[1] - origin[1]) * invdiry;
            tymax = (box.max[1] - origin[1]) * invdiry;
        } else {
            tymin = (box.max[1] - origin[1]) * invdiry;
            tymax = (box.min[1] - origin[1]) * invdiry;
        }
        if ((tmin > tymax) || (tymin > tmax)) return null;
        // These lines also handle the case where tmin or tmax is NaN
        // (result of 0 * Infinity). x !== x returns true if x is NaN
        if (tymin > tmin || tmin !== tmin) tmin = tymin;
        if (tymax < tmax || tmax !== tmax) tmax = tymax;
        if (invdirz >= 0) {
            tzmin = (box.min[2] - origin[2]) * invdirz;
            tzmax = (box.max[2] - origin[2]) * invdirz;
        } else {
            tzmin = (box.max[2] - origin[2]) * invdirz;
            tzmax = (box.min[2] - origin[2]) * invdirz;
        }
        if ((tmin > tzmax) || (tzmin > tmax)) return null;
        if (tzmin > tmin || tmin !== tmin) tmin = tzmin;
        if (tzmax < tmax || tmax !== tmax) tmax = tzmax;
        //return point closest to the ray (positive side)
        if (tmax < 0) return null;
        return this.at(tmin >= 0 ? tmin : tmax);
    }
    intersectsBox(box: Box3) {
        return this.intersectBox(box) !== null;
    }
    transformMatrix4(matrix: Mat4): Ray {
        Vector3.set(this._origin, Vector3.transformMat4(this.origin, matrix));
        Vector3.set(this._direction, Vector3.transformDirection(this.direction, matrix));
        return this;
    }
    equals(ray: Ray): boolean {
        return Vector3.equals(this.origin, ray.origin) && Vector3.equals(this.direction, ray.direction);
    }
    clone() {
        return new Ray().copy(this);
    }
}