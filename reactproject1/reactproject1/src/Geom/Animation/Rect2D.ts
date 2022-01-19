import { Vec2D } from "../../Math/Vec2D";

export class Rect2D {
    x: number;
    y: number;
    w: number;
    h: number;

    /**
     * The bitmask that indicates that a point lies to the left of
     * this <code>Rect2D</code>.
    */
    public static OUT_LEFT = 1;

    /**
     * The bitmask that indicates that a point lies above
     * this <code>Rect2D</code>.
    */
    public static OUT_TOP = 2;

    /**
     * The bitmask that indicates that a point lies to the right of
     * this <code>Rect2D</code>.
    */
    public static OUT_RIGHT = 4;

    /**
     * The bitmask that indicates that a point lies below
     * this <code>Rect2D</code>.
    */
    public static OUT_BOTTOM = 8;


    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    contains(point: Vec2D): boolean {
        return point.x >= this.x &&
            point.y >= this.y &&
            point.x < this.x + this.w &&
            point.y < this.y + this.h;
    }

    minX(): number {
        return this.x;
    }

    maxX(): number {
        return this.x + this.w;
    }

    minY(): number {
        return this.y;
    }

    maxY(): number {
        return this.y + this.h;
    }

    setRect(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    add(p: Vec2D) {
        let x1 = Math.min(this.minX(), p.x);
        let x2 = Math.max(this.maxX(), p.x);
        let y1 = Math.min(this.minY(), p.y);
        let y2 = Math.max(this.maxY(), p.y);
        this.setRect(x1, y1, x2 - x1, y2 - y1);
    }

    public outcode(x: number, y: number): number {
        let _out = 0;
        if (this.w <= 0) {
            _out |= Rect2D.OUT_LEFT | Rect2D.OUT_RIGHT;
        } else if (x < this.x) {
            _out |= Rect2D.OUT_LEFT;
        } else if (x > this.x + this.w) {
            _out |= Rect2D.OUT_RIGHT;
        }
        if (this.h <= 0) {
            _out |= Rect2D.OUT_TOP | Rect2D.OUT_BOTTOM;
        } else if (y < this.y) {
            _out |= Rect2D.OUT_TOP;
        } else if (y > this.y + this.h) {
            _out |= Rect2D.OUT_BOTTOM;
        }
        return _out;
    }

    public intersectsLine(x1: number, y1: number, x2: number, y2: number): boolean {
            let out1, out2;
        if ((out2 = this.outcode(x2, y2)) === 0) {
            return true;
        }
        while ((out1 = this.outcode(x1, y1)) !== 0) {
            if ((out1 & out2) !== 0) {
                return false;
            }
            if ((out1 & (Rect2D.OUT_LEFT | Rect2D.OUT_RIGHT)) !== 0) {
                let x = this.x;
                if ((out1 & Rect2D.OUT_RIGHT) !== 0) {
                    x += this.w;
                }
                y1 = y1 + (x - x1) * (y2 - y1) / (x2 - x1);
                x1 = x;
            } else {
                    let y = this.y;
                if ((out1 & Rect2D.OUT_BOTTOM) !== 0) {
                    y += this.h;
                }
                x1 = x1 + (y - y1) * (x2 - x1) / (y2 - y1);
                y1 = y;
            }
        }
        return true;
    }

    public toString(): string{
        return '{ x: ' + this.x + ' y: ' + this.y + ' width: ' + this.w + ' height: ' + this.h;
    }
}