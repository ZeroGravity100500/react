import { Vec2D, Vector2D } from "./Vec2D";

export class Bounds2D {
    private _min: Vec2D = new Vec2D(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    private _max: Vec2D = new Vec2D(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

    minX(): number {
        return this._min.x;
    }
    minY(): number {
        return this._min.y;
    }

    maxX(): number {
        return this._max.x;
    }
    maxY(): number {
        return this._max.y;
    }
    width(): number {
        return Math.abs(this._min.x) + Math.abs(this._max.x);
    }
    height(): number {
        return Math.abs(this._min.y) + Math.abs(this._max.y);
    }
    compare(a: Bounds2D): boolean {
        return this._min.compare(a._min) && this._max.compare(a._max);
    }

    center(): Vector2D{
        return new Vec2D((this._max.x + this._min.x) * 0.5, (this._max.y + this._min.y) * 0.5);
    }
    volume(): number {
        if (this._min.x >= this._max.x || this._min.y >= this._max.y) {
            return 0;
        }
        return (this._max.x - this._min.x) * (this._max.y - this._min.y);
    }
    addPoint(point: Vector2D): boolean {
        let expanded = false;
        if (point.x < this._min.x) {
            this._min.x = point.x;
            expanded = true;
        }
        if (point.x > this._max.x) {
            this._max.x = point.x;
            expanded = true;
        }
        if (point.y < this._min.y) {
            this._min.y = point.y;
            expanded = true;
        }
        if (point.y > this._max.y) {
            this._max.y = point.y;
            expanded = true;
        }
        return expanded;
    }
    addPoints(points: Vector2D[]): boolean {
        let expanded = false;
        for (let i = 0; i < points.length; i++) {
            expanded = this.addPoint(points[i]);
        }
        return expanded;
    }
    intersectsBounds(a: Bounds2D): boolean {
        if (a._max.x < this._min.x || a._max.y < this._min.y
            || a._min.x > this._max.x || a._min.y > this._max.y) {
            return false;
        }
        return true;
    }
    containsPoint(p: Vector2D): boolean {
        if (p.x < this._min.x || p.y < this._min.y || p.x > this._max.x || p.y > this._max.y) {
            return false;
        }
        return true;
    }

    radius(): number {
        let total, b00, b10, b01, b11;
        total = 0;
        b00 = Math.abs(this._min.x);
        b10 = Math.abs(this._max.x);
        if (b00 > b10)
            total += b00 * b00;
        else
            total += b10 * b10;
        b01 = Math.abs(this._min.y);
        b11 = Math.abs(this._max.y);
        if (b01 > b11)
            total += b01 * b01;
        else
            total += b11 * b11;
        return Math.sqrt(total);
    }
}