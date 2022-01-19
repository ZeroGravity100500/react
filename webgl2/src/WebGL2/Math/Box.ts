import { Mat4 } from "./Matrix";
import { clampPoint } from "./mmath";
import { Plane } from "./Plane";
import { Sphere } from "./Sphere";
import { Vec3, Vector3 } from "./Vector";

export class Box3 {
    private _min: Vec3;
    private _max: Vec3;

    constructor(min = Vector3.fromValues(+Infinity, +Infinity, +Infinity),
        max = Vector3.fromValues(-Infinity, -Infinity, -Infinity)) {
        this._min = min;
        this._max = max;
    }
    get min(): Vec3 {
        return this._min;
    }
    get max(): Vec3 {
        return this._max;
    }
    set(min: Vec3, max: Vec3) {
        this._min = Vector3.clone(min);
        this._max = Vector3.clone(max);
    }
    clone() {
        return new Box3(Vector3.clone(this._min), Vector3.clone(this._max));
    }
    empty(): Box3 {
        this._min[0] = this._min[1] = this._min[2] = +Infinity;
        this._max[0] = this._max[1] = this._max[2] = -Infinity;
        return this;
    }
    isEmpty(): boolean {
        // this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes
        return (this._max[0] < this._min[0]) ||
            (this._max[1] < this._min[1]) ||
            (this._max[2] < this._min[2]);
    }
    center(): Vec3 {
        return this.isEmpty() ? Vector3.create() : Vector3.mul(Vector3.add(this._min, this._max), 0.5);
    }
    size(): Vec3 {
        return this.isEmpty() ? Vector3.create() : Vector3.sub(this._max, this._min);
    }
    expandByPoint(point: Vec3): Box3 {
        this._min = Vector3.min(point, this._min);
        this._max = Vector3.max(point, this._max);
        return this;
    }
    expandByVector(vector: Vec3): Box3 {
        this._min = Vector3.sub(this._min, vector);
        this._max = Vector3.add(this._max, vector);
        return this;
    }
    expandByScalar(scalar: number): Box3 {
        this._min = Vector3.add(this._min, -scalar);
        this._max = Vector3.add(this._max, scalar);
        return this;
    }
    containsPoint(point: Vec3): boolean {
        return point[0] < this._min[0] || point[0] > this._max[0] ||
            point[1] < this._min[1] || point[1] > this._max[1] ||
            point[2] < this._min[2] || point[2] > this._max[2] ? false : true;
    }
    containsBox(box: Box3): boolean {
        return this._min[0] <= box._min[0] && box._max[0] <= this._max[0] &&
            this._min[1] <= box._min[1] && box._max[1] <= this._max[1] &&
            this._min[2] <= box._min[2] && box._max[2] <= this._max[2];
    }
    setFromPoints(points: Vec3[]): Box3 {
        this.empty();
        for (let i = 0; i < points.length; i++) {
            this.expandByPoint(points[i]);
        }
        return this;
    }
    setFromCenterAndSize(center: Vec3, size: Vec3): Box3 {
        const halfSize = Vector3.mul(Vector3.clone(size), 0.5);
        this._min = Vector3.sub(Vector3.clone(center), halfSize);
        this._max = Vector3.add(Vector3.clone(center), halfSize);
        return this;
    }
    // setFromBufferAttribute(attribute: BufferAttribute) {
    //     let minX = + Infinity;
    //     let minY = + Infinity;
    //     let minZ = + Infinity;
    //     let maxX = - Infinity;
    //     let maxY = - Infinity;
    //     let maxZ = - Infinity;
    //     for (let i = 0, l = attribute.count; i < l; i++) {
    //         const x = attribute.getX(i);
    //         const y = attribute.getY(i);
    //         const z = attribute.getZ(i);
    //         if (x < minX) minX = x;
    //         if (y < minY) minY = y;
    //         if (z < minZ) minZ = z;
    //         if (x > maxX) maxX = x;
    //         if (y > maxY) maxY = y;
    //         if (z > maxZ) maxZ = z;
    //     }
    //     Vector3.set(this.min, minX, minY, minZ);
    //     Vector3.set(this.max, maxX, maxY, maxZ);
    //     return this;
    // }
    intersectsBox(box: Box3): boolean {
        // using 6 splitting planes to rule out intersections.
        return box._max[0] < this._min[0] || box._min[0] > this._max[0] ||
            box._max[1] < this._min[1] || box._min[1] > this._max[1] ||
            box._max[2] < this._min[2] || box._min[2] > this._max[2] ? false : true;
    }
    intersectsSphere(sphere: Sphere): boolean {
        // Find the point on the AABB closest to the sphere center.
        let vector = clampPoint(sphere.center, this._min, this._max);
        // If that point is inside the sphere, the AABB and sphere intersect.
        return Vector3.distanceSquare(vector, sphere.center) <= (sphere.radius * sphere.radius);
    }
    intersectsPlane(plane: Plane): boolean {
        // We compute the minimum and maximum dot product values. If those values
        // are on the same side (back or front) of the plane, then there is no intersection.
        let min, max;
        let normal = plane.normal;
        if (normal[0] > 0) {
            min = normal[0] * this._min[0];
            max = normal[0] * this._max[0];
        } else {
            min = normal[0] * this._max[0];
            max = normal[0] * this._min[0];
        }
        if (normal[1] > 0) {
            min += normal[1] * this._min[1];
            max += normal[1] * this._max[1];
        } else {
            min += normal[1] * this._max[1];
            max += normal[1] * this._min[1];
        }
        if (normal[2] > 0) {
            min += normal[2] * this._min[2];
            max += normal[2] * this._max[2];
        } else {
            min += normal[2] * this._max[2];
            max += normal[2] * this._min[2];
        }
        return (min <= - plane.constant && max >= - plane.constant);
    }
    distanceToPoint(point: Vec3): number {
        const clampedPoint = clampPoint(point, this._min, this._max);
        return Vector3.lenght(Vector3.sub(clampedPoint, point));
    }
    boundingSphere(): Sphere {
        let center = this.center();
        let radius = Vector3.lenght(this.size()) * 0.5;
        return new Sphere(center, radius);
    }
    applyMatrix4(matrix: Mat4): Box3 {
        // transform of empty box is an empty box.
        if (this.isEmpty()) return this;
        let points: Vec3[] = new Array<Vec3>(3);
        // NOTE: I am using a binary pattern to specify all 2^3 combinations below
        points[0] = Vector3.transformMat4(Vector3.fromValues(this._min[0], this._min[1], this._min[2]), matrix); // 000
        points[1] = Vector3.transformMat4(Vector3.fromValues(this._min[0], this._min[1], this._max[2]), matrix); // 001
        points[2] = Vector3.transformMat4(Vector3.fromValues(this._min[0], this._max[1], this._min[2]), matrix); // 010
        points[3] = Vector3.transformMat4(Vector3.fromValues(this._min[0], this._max[1], this._max[2]), matrix); // 011
        points[4] = Vector3.transformMat4(Vector3.fromValues(this._max[0], this._min[1], this._min[2]), matrix); // 100
        points[5] = Vector3.transformMat4(Vector3.fromValues(this._max[0], this._min[1], this._max[2]), matrix); // 101
        points[6] = Vector3.transformMat4(Vector3.fromValues(this._max[0], this._max[1], this._min[2]), matrix); // 110
        points[7] = Vector3.transformMat4(Vector3.fromValues(this._max[0], this._max[1], this._max[2]), matrix); // 111
        this.setFromPoints(points);
        return this;
    }
    translate(offset: Vec3): Box3 {
        this._min = Vector3.add(this._min, offset);
        this._max = Vector3.add(this._max, offset);
        return this;
    }
}