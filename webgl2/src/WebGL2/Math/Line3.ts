import { Mat4 } from "./Matrix";
import { clamp } from "./mmath";
import { Vec3, Vector3 } from "./Vector";

export class Line3 {
    private _startP: Vec3;
    private _endP: Vec3;
    constructor(start: Vec3 = Vector3.create(), end: Vec3 = Vector3.create()) {
        this._startP = Vector3.clone(start);
        this._endP = Vector3.clone(end);
    }
    get start(): Vec3 {
        return this._startP;
    }
    get end(): Vec3 {
        return this._endP;
    }
    set(start: Vec3, end: Vec3) {
        Vector3.set(this._startP, start[0], start[1], start[2]);
        Vector3.set(this._endP, end[0], end[1], end[2]);
    }
    copy(line: Line3): Line3 {
        Vector3.set(this._startP, line._startP[0], line._startP[1], line._startP[2]);
        Vector3.set(this._endP, line._endP[0], line._endP[1], line._endP[2]);
        return this;
    }
    center(): Vec3 {
        return Vector3.mul(Vector3.add(this._startP, this._endP), 0.5);
    }
    delta(): Vec3 {
        return Vector3.sub(this._endP, this._startP);
    }
    distanceSq(): number {
        return Vector3.distanceSquare(this._startP, this._endP);
    }
    distance(): number {
        return Vector3.distance(this._startP, this._endP);
    }
    at(t: number): Vec3 {
        return Vector3.lerp(this._startP, this._endP, t);
    }
    closestPointToPointParameter(point: Vec3, clampToLine: boolean): number {
        let sp = Vector3.sub(point, this._startP);
        let ep = Vector3.sub(this._endP, this._startP);
        let se2 = Vector3.dot(ep, ep);
        let esp = Vector3.dot(ep, sp);
        let t = esp / se2;
        if(clampToLine)
            return clamp(t, 0, 1);
        
        return t;
    }
    closestPointToPoint(point: Vec3, clampToLine: boolean): Vec3 {
        let t = this.closestPointToPointParameter(point, clampToLine);
        return this.at(t);
    }
    transformMat4(matrix: Mat4): Line3 {
        this._startP = Vector3.transformMat4(this._startP, matrix);
        this._endP = Vector3.transformMat4(this._endP, matrix);
        return this;       
    }
    equals(l: Line3) {
        return Vector3.equals(this._startP, l._startP) && Vector3.equals(this._endP, l._endP);
    }
}