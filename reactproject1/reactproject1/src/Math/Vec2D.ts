export interface Vector2D {
    x: number;
    y: number;
}

export class Vec2D implements Vector2D {
    x: number;
    y: number;

    constructor();
    constructor(v: Vec2D);
    constructor(v: Vector2D);
    constructor(x: number, y?: number);
    constructor(x?: number | object, y?: number) {
        if (typeof x === 'number' && typeof y === 'number') {
            this.x = x;
            this.y = y;
        } else if (x !== null && typeof x === 'object') {
            let v = x as Vector2D;
            this.x = v.x;
            this.y = v.y;
        } else {
            this.x = 0;
            this.y = 0;
        }
    }

    add(v: Vec2D): Vec2D {
        return new Vec2D(this.x + v.x, this.y + v.y);
    }


    sub(v: Vec2D): Vec2D {
        return new Vec2D(this.x - v.x, this.y - v.y);
    }

    inv(): Vec2D{
        return new Vec2D(-this.x, -this.y);
    }

    public static add(a: Vector2D, b: Vector2D): Vector2D {
        return {x: a.x + b.x, y: a.y + b.y};
    }
    public static subtract(a: Vector2D, b: Vector2D): Vector2D {
        return {x: a.x - b.x, y: a.y - b.y};
    }
    public static multiply(v: Vector2D, m: number): Vector2D;
    public static multiply(v: Vector2D, m: Vector2D): Vector2D;
    public static multiply(v: Vector2D, m: any): Vector2D {
        if(typeof m === 'number') {
            return { x: v.x * m, y: v.y * m };
        } else {
            return { x: v.x * m.x, y: v.y * m.y };
        } 
    }
    public static divide(v: Vector2D, d: number): Vector2D {
        let invd = 1 / d;
        return Vec2D.multiply(v, invd);
    }
    public static distance(v1: Vector2D, v2: Vector2D): number{
        return this.lenght(this.subtract(v2, v1));
    }
    public static lenghtSq(v: Vector2D): number {
        return v.x * v.x + v.y * v.y;
    }
    public static lenght(v: Vector2D): number {
        return Math.sqrt(Vec2D.lenghtSq(v));
    }
    public static normalize(v: Vector2D): Vector2D {
        let sqrLength = this.lenghtSq(v);
        let invLen = 1 / Math.sqrt(sqrLength);
        return { x: v.x * invLen, y: v.y * invLen };
    }
    public static compare(v1: Vector2D, v2: Vector2D, epslon: number = Number.EPSILON): boolean {
        return (v1 !== null && v2 !== null) && (Math.abs(v2.x - v1.x) < epslon && Math.abs(v2.y - v1.y) < epslon);
    }
    public static lerp(v1: Vector2D, v2: Vector2D, t: number): Vector2D {
        if (t <= 0) {
            return { x: v1.x, y: v1.y };
        } else if (t >= 1) {
            return { x: v2.x, y: v2.y };
        } else return this.add(v1, this.multiply(this.subtract(v2, v1), t));
    }

    public static dotPropduct(v1: Vector2D, v2: Vector2D): number {
        return v1.x * v2.x + v1.y * v2.y;
    }

    mul(v: Vec2D): Vec2D;
    mul(a: number): Vec2D;
    mul(v: any): Vec2D {
        if (typeof v === 'number') {
            return new Vec2D(this.x * v, this.y * v);
        } else {
            return new Vec2D(this.x * v.x, this.y * v.y);
        }
    }

    div(d: number): Vec2D {
        let invd = 1.0 / d;
        return new Vec2D(this.x * invd, this.y * invd);
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    lengthSqr(): number {
        return this.x * this.x + this.y * this.y;
    }

    normalize(): Vec2D{
        let sqrLength = this.lengthSqr();
        let invLength = 1.0 / Math.sqrt(sqrLength);
        return new Vec2D(this.x * invLength, this.y * invLength);
    }

    distSqr(v: Vec2D): number {
        return v.sub(this).lengthSqr();
    }

    dist(v: Vec2D): number {
        return v.sub(this).length();
    }

    preprendicular(): Vec2D{
        return new Vec2D(-this.y, this.x);
    }

    cross(v: Vec2D): number{
        return this.x * v.y - this.y * v.x;
    }

    lerp(v: Vec2D, t: number): Vec2D {
        if (t <= 0) {
            return new Vec2D(this.x, this.y);
        } else if (t >= 1) {
            return new Vec2D(v.x, v.y);
        } else return this.add(((v.sub(this) as Vec2D).mul(t) as Vec2D));
    }
    
    angle(v: Vec2D): number {
        return this.dot(v) / (this.length() * v.length()); 
    }

    dot(v: Vec2D): number {
        return (this.x * v.x + this.y * v.y);
    }

    compare(v: Vector2D | null): boolean {
        return (v !== null) && (Math.abs(this.x - v.x) < Number.EPSILON && Math.abs(this.y - v.y) < Number.EPSILON);
    }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}