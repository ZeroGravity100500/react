import { AffineTransform } from "../../Math/AffineTransform";
import { Bounds2D } from "../../Math/Bounds2D";
import { mmath } from "../../Math/mmath";
import { Vec2D, Vector2D } from "../../Math/Vec2D";
import { IPathIterator, IShape2D, Segment2D, Segment2DType } from "../Path2D";
import { IAnimator } from "./Animation";

export class QuadCurve2D implements IAnimator, IShape2D {
    private startPoint: Vec2D;
    private controlPoint: Vec2D;
    private endPoint: Vec2D;
    private bounds: Bounds2D = new Bounds2D();
    private totalLenght: number = 0;
    private _lenghts: number[] = [];
    private _times: number[] = [];

    constructor(sx: number, sy: number, cpx: number, cpy: number, ex: number, ey: number) {
        this.startPoint = new Vec2D(sx, sy);
        this.controlPoint = new Vec2D(cpx, cpy);
        this.endPoint = new Vec2D(ex, ey);
        this.bounds.addPoints([this.startPoint, this.controlPoint, this.endPoint]);
        let lt = QuadCurve2D.getLenghtsAndTimes(this.startPoint, this.controlPoint, this.endPoint, 50);
        this.totalLenght = lt.lenghts[lt.count - 1];
        this._lenghts = lt.lenghts;
        this._times = lt.times;
    }

    asSegmentArray(transform: AffineTransform | null | undefined): Segment2D[] {
        return [{
            type: Segment2DType.SEG_QUADTO,
            coords: transform ? [
                transform.transformVector(new Vec2D(this.startPoint.x, this.startPoint.y)),
                transform.transformVector(new Vec2D(this.controlPoint.x, this.controlPoint.y)),
                transform.transformVector(new Vec2D(this.endPoint.x, this.endPoint.y))
            ] : [
                new Vec2D(this.startPoint.x, this.startPoint.y),
                new Vec2D(this.controlPoint.x, this.controlPoint.y),
                new Vec2D(this.endPoint.x, this.endPoint.y)
            ],
            segmentIndex: 0,
            pathRef: this,
            lenghts: this._lenghts,
            times: this._times
        }];
    }

    getX1(): number {
        return this.startPoint.x;
    }
    getY1(): number {
        return this.startPoint.y;
    }
    getX2(): number {
        return this.controlPoint.x;
    }
    getY2(): number {
        return this.controlPoint.y;
    }
    getX3(): number {
        return this.endPoint.x;
    }
    getY3(): number {
        return this.endPoint.y;
    }
    getLenght(): number {
        return this.totalLenght;
    }

    setCurve(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void {
        this.startPoint.x = x1;
        this.startPoint.y = y1;
        this.controlPoint.x = x2;
        this.controlPoint.y = y2;
        this.endPoint.x = x3;
        this.endPoint.y = y3
        let lt = QuadCurve2D.getLenghtsAndTimes(this.startPoint, this.controlPoint, this.endPoint, 50);
        this.totalLenght = lt.lenghts[lt.count - 1];
        this._lenghts = lt.lenghts;
        this._times = lt.times;
    }

    public static getLenghtsAndTimes(p1: Vector2D, p2:Vector2D, p3: Vector2D, steps: number) : LenghtsAndTimes {
        let lenghts: number[] = [];
        let times: number[] = [];
        let pPrev = p1;
        let l = 0;
        let step = 1 / steps;
        for(let i = 0; i <= 1; i += step) {
            let pNext = QuadCurve2D.getPoint(p1, p2, p3, i);
            l += Math.abs(Vec2D.lenght(Vec2D.subtract(pNext, pPrev)));
            lenghts.push(l);
            times.push(i);
            pPrev = pNext;
        }
        return { lenghts: lenghts, times: times, count: lenghts.length };
    }

    public static getPoint(p1: Vector2D, p2: Vector2D, p3: Vector2D, t: number): Vector2D {
        if (t <= 0) {
            return { x: p1.x, y: p1.y };
        } else if (t >= 1) {
            return { x: p3.x, y: p3.y };
        } else {
            let t1 = (1 - t);
            let q1 = t1 * t1;
            let q2 = 2 * t * t1;
            let q3 = t * t;
            return {
                x: q1 * p1.x + q2 * p2.x + q3 * p3.x,
                y: q1 * p1.y + q2 * p2.y + q3 * p3.y
            };
        }
    }

    public static subdivide(src: QuadCurve2D, left: QuadCurve2D, right: QuadCurve2D): void {
        let x1 = src.getX1();
        let y1 = src.getY1();
        let ctrlx = src.getX2();
        let ctrly = src.getY2();
        let x2 = src.getX3();
        let y2 = src.getY3();
        let ctrlx1 = (x1 + ctrlx) / 2.0;
        let ctrly1 = (y1 + ctrly) / 2.0;
        let ctrlx2 = (x2 + ctrlx) / 2.0;
        let ctrly2 = (y2 + ctrly) / 2.0;
        ctrlx = (ctrlx1 + ctrlx2) / 2.0;
        ctrly = (ctrly1 + ctrly2) / 2.0;
        if (left != null) {
            left.setCurve(x1, y1, ctrlx1, ctrly1, ctrlx, ctrly);
        }
        if (right != null) {
            right.setCurve(ctrlx, ctrly, ctrlx2, ctrly2, x2, y2);
        }
    }

    /**
     * Solves the quadratic whose coefficients are in the <code>eqn</code>
     * array and places the non-complex roots back into the same array,
     * returning the number of roots.  The quadratic solved is represented
     * by the equation:
     * <pre>
     *     eqn = {C, B, A};
     *     ax^2 + bx + c = 0
     * </pre>
     * A return value of <code>-1</code> is used to distinguish a constant
     * equation, which might be always 0 or never 0, from an equation that
     * has no zeroes.
     * @param eqn the array that contains the quadratic coefficients
     * @return the number of roots, or <code>-1</code> if the equation is
     *          a constant
    */
    public static solveQuadratic(eqn: number[]): number {
        return QuadCurve2D.solveQuadraticC(eqn, eqn);
    }

    /*
     * Solves the quadratic whose coefficients are in the <code>eqn</code>
     * array and places the non-complex roots into the <code>res</code>
     * array, returning the number of roots.
     * The quadratic solved is represented by the equation:
     * <pre>
     *     eqn = {C, B, A};
     *     ax^2 + bx + c = 0
     * </pre>
     * A return value of <code>-1</code> is used to distinguish a constant
     * equation, which might be always 0 or never 0, from an equation that
     * has no zeroes.
     * @param eqn the specified array of coefficients to use to solve
     *        the quadratic equation
     * @param res the array that contains the non-complex roots
     *        resulting from the solution of the quadratic equation
     * @return the number of roots, or <code>-1</code> if the equation is
     *  a constant.
    */
    public static solveQuadraticC(eqn: number[], res: number[]): number {
        let a = eqn[2];
        let b = eqn[1];
        let c = eqn[0];
        let roots = 0;
        if (a === 0.0) {
            // The quadratic parabola has degenerated to a line.
            if (b === 0.0) {
                // The line has degenerated to a constant.
                return -1;
            }
            res[roots++] = -c / b;
        } else {
            // From Numerical Recipes, 5.6, Quadratic and Cubic Equations
            let d = b * b - 4.0 * a * c;
            if (d < 0.0) {
                // If d < 0.0, then there are no roots
                return 0;
            }
            d = Math.sqrt(d);
            // For accuracy, calculate one root using:
            //     (-b +/- d) / 2a
            // and the other using:
            //     2c / (-b +/- d)
            // Choose the sign of the +/- so that b+d gets larger in magnitude
            if (b < 0.0) {
                d = -d;
            }
            let q = (b + d) / -2.0;
            // We already tested a for being 0 above
            res[roots++] = q / a;
            if (q !== 0.0) {
                res[roots++] = c / q;
            }
        }
        return roots;
    }

    public contains(x: number, y: number): boolean {
        let x1 = this.getX1(); let y1 = this.getY1();
        let xc = this.getX2(); let yc = this.getY2();
        let x2 = this.getX3(); let y2 = this.getY3();

        let kx = x1 - 2 * xc + x2;
        let ky = y1 - 2 * yc + y2;
        let dx = x - x1;
        let dy = y - y1;
        let dxl = x2 - x1;
        let dyl = y2 - y1;

        let t0 = (dx * ky - dy * kx) / (dxl * ky - dyl * kx);
        if (t0 < 0 || t0 > 1 || t0 !== t0) {
            return false;
        }

        let xb = kx * t0 * t0 + 2 * (xc - x1) * t0 + x1;
        let yb = ky * t0 * t0 + 2 * (yc - y1) * t0 + y1;
        let xl = dxl * t0 + x1;
        let yl = dyl * t0 + y1;

        return (x >= xb && x < xl) ||
            (x >= xl && x < xb) ||
            (y >= yb && y < yl) ||
            (y >= yl && y < yb);
    }

    private static fillEqn(eqn: number[], val: number,
        c1: number, cp: number, c2: number) {
        eqn[0] = c1 - val;
        eqn[1] = cp + cp - c1 - c1;
        eqn[2] = c1 - cp - cp + c2;
        return;
    }

    private static evalQuadratic(vals: number[], num: number,
        include0: boolean,
        include1: boolean,
        inflect: number[] | null,
        c1: number, ctrl: number, c2: number): number {
        let j = 0;
        for (let i = 0; i < num; i++) {
            let t = vals[i];
            if ((include0 ? t >= 0 : t > 0) &&
                (include1 ? t <= 1 : t < 1) &&
                (inflect === null ||
                    inflect[1] + 2 * inflect[2] * t !== 0)) {
                let u = 1 - t;
                vals[j++] = c1 * u * u + 2 * ctrl * t * u + c2 * t * t;
            }
        }
        return j;
    }

    private static BELOW = -2;
    private static LOWEDGE = -1;
    private static INSIDE = 0;
    private static HIGHEDGE = 1;
    private static ABOVE = 2;

    private static getTag(coord: number, low: number, high: number): number {
        if (coord <= low) {
            return (coord < low ? QuadCurve2D.BELOW : QuadCurve2D.LOWEDGE);
        }
        if (coord >= high) {
            return (coord > high ? QuadCurve2D.ABOVE : QuadCurve2D.HIGHEDGE);
        }
        return QuadCurve2D.INSIDE;
    }

    private static inwards(pttag: number, opt1tag: number, opt2tag: number): boolean {
        if (pttag === QuadCurve2D.BELOW || pttag === QuadCurve2D.ABOVE) {
            return false;
        } else if (pttag === QuadCurve2D.LOWEDGE) {
            return (opt1tag >= QuadCurve2D.INSIDE || opt2tag >= QuadCurve2D.INSIDE);
        } else if (pttag === QuadCurve2D.HIGHEDGE) {
            return (opt1tag <= QuadCurve2D.INSIDE || opt2tag <= QuadCurve2D.INSIDE);
        } else if (pttag === QuadCurve2D.INSIDE) {
            return true;
        }
        return false;
    }

    public intersects(x: number, y: number, w: number, h: number): boolean {
        // Trivially reject non-existant rectangles
        if (w <= 0 || h <= 0) {
            return false;
        }

        // Trivially accept if either endpoint is inside the rectangle
        // (not on its border since it may end there and not go inside)
        // Record where they lie with respect to the rectangle.
        //     -1 => left, 0 => inside, 1 => right
        let x1 = this.getX1();
        let y1 = this.getY1();
        let x1tag = QuadCurve2D.getTag(x1, x, x + w);
        let y1tag = QuadCurve2D.getTag(y1, y, y + h);
        if (x1tag === QuadCurve2D.INSIDE && y1tag === QuadCurve2D.INSIDE) {
            return true;
        }
        let x2 = this.getX3();
        let y2 = this.getY3();
        let x2tag = QuadCurve2D.getTag(x2, x, x + w);
        let y2tag = QuadCurve2D.getTag(y2, y, y + h);
        if (x2tag === QuadCurve2D.INSIDE && y2tag === QuadCurve2D.INSIDE) {
            return true;
        }
        let ctrlx = this.getX2();
        let ctrly = this.getY2();
        let ctrlxtag = QuadCurve2D.getTag(ctrlx, x, x + w);
        let ctrlytag = QuadCurve2D.getTag(ctrly, y, y + h);

        // Trivially reject if all points are entirely to one side of
        // the rectangle.
        if (x1tag < QuadCurve2D.INSIDE && x2tag < QuadCurve2D.INSIDE && ctrlxtag < QuadCurve2D.INSIDE) {
            return false;       // All points left
        }
        if (y1tag < QuadCurve2D.INSIDE && y2tag < QuadCurve2D.INSIDE && ctrlytag < QuadCurve2D.INSIDE) {
            return false;       // All points above
        }
        if (x1tag > QuadCurve2D.INSIDE && x2tag > QuadCurve2D.INSIDE && ctrlxtag > QuadCurve2D.INSIDE) {
            return false;       // All points right
        }
        if (y1tag > QuadCurve2D.INSIDE && y2tag > QuadCurve2D.INSIDE && ctrlytag > QuadCurve2D.INSIDE) {
            return false;       // All points below
        }

        // Test for endpoints on the edge where either the segment
        // or the curve is headed "inwards" from them
        // Note: These tests are a superset of the fast endpoint tests
        //       above and thus repeat those tests, but take more time
        //       and cover more cases
        if (QuadCurve2D.inwards(x1tag, x2tag, ctrlxtag) &&
            QuadCurve2D.inwards(y1tag, y2tag, ctrlytag)) {
            // First endpoint on border with either edge moving inside
            return true;
        }
        if (QuadCurve2D.inwards(x2tag, x1tag, ctrlxtag) &&
            QuadCurve2D.inwards(y2tag, y1tag, ctrlytag)) {
            // Second endpoint on border with either edge moving inside
            return true;
        }

        // Trivially accept if endpoints span directly across the rectangle
        let xoverlap = (x1tag * x2tag <= 0);
        let yoverlap = (y1tag * y2tag <= 0);
        if (x1tag === QuadCurve2D.INSIDE && x2tag === QuadCurve2D.INSIDE && yoverlap) {
            return true;
        }
        if (y1tag === QuadCurve2D.INSIDE && y2tag === QuadCurve2D.INSIDE && xoverlap) {
            return true;
        }

        // We now know that both endpoints are outside the rectangle
        // but the 3 points are not all on one side of the rectangle.
        // Therefore the curve cannot be contained inside the rectangle,
        // but the rectangle might be contained inside the curve, or
        // the curve might intersect the boundary of the rectangle.

        let eqn = new Array<number>(3);
        let res = new Array<number>(3);
        if (!yoverlap) {
            // Both Y coordinates for the closing segment are above or
            // below the rectangle which means that we can only intersect
            // if the curve crosses the top (or bottom) of the rectangle
            // in more than one place and if those crossing locations
            // span the horizontal range of the rectangle.
            QuadCurve2D.fillEqn(eqn, (y1tag < QuadCurve2D.INSIDE ? y : y + h), y1, ctrly, y2);
            return (QuadCurve2D.solveQuadraticC(eqn, res) === 2 &&
                QuadCurve2D.evalQuadratic(res, 2, true, true, null,
                    x1, ctrlx, x2) === 2 &&
                QuadCurve2D.getTag(res[0], x, x + w) * QuadCurve2D.getTag(res[1], x, x + w) <= 0);
        }

        // Y ranges overlap.  Now we examine the X ranges
        if (!xoverlap) {
            // Both X coordinates for the closing segment are left of
            // or right of the rectangle which means that we can only
            // intersect if the curve crosses the left (or right) edge
            // of the rectangle in more than one place and if those
            // crossing locations span the vertical range of the rectangle.
            QuadCurve2D.fillEqn(eqn, (x1tag < QuadCurve2D.INSIDE ? x : x + w), x1, ctrlx, x2);
            return (QuadCurve2D.solveQuadraticC(eqn, res) === 2 &&
                QuadCurve2D.evalQuadratic(res, 2, true, true, null,
                    y1, ctrly, y2) === 2 &&
                QuadCurve2D.getTag(res[0], y, y + h) * QuadCurve2D.getTag(res[1], y, y + h) <= 0);
        }

        // The X and Y ranges of the endpoints overlap the X and Y
        // ranges of the rectangle, now find out how the endpoint
        // line segment intersects the Y range of the rectangle
        let dx = x2 - x1;
        let dy = y2 - y1;
        let k = y2 * x1 - x2 * y1;
        let c1tag, c2tag;
        if (y1tag === QuadCurve2D.INSIDE) {
            c1tag = x1tag;
        } else {
            c1tag = QuadCurve2D.getTag((k + dx * (y1tag < QuadCurve2D.INSIDE ? y : y + h)) / dy, x, x + w);
        }
        if (y2tag === QuadCurve2D.INSIDE) {
            c2tag = x2tag;
        } else {
            c2tag = QuadCurve2D.getTag((k + dx * (y2tag < QuadCurve2D.INSIDE ? y : y + h)) / dy, x, x + w);
        }
        // If the part of the line segment that intersects the Y range
        // of the rectangle crosses it horizontally - trivially accept
        if (c1tag * c2tag <= 0) {
            return true;
        }

        // Now we know that both the X and Y ranges intersect and that
        // the endpoint line segment does not directly cross the rectangle.
        //
        // We can almost treat this case like one of the cases above
        // where both endpoints are to one side, except that we will
        // only get one intersection of the curve with the vertical
        // side of the rectangle.  This is because the endpoint segment
        // accounts for the other intersection.
        //
        // (Remember there is overlap in both the X and Y ranges which
        //  means that the segment must cross at least one vertical edge
        //  of the rectangle - in particular, the "near vertical side" -
        //  leaving only one intersection for the curve.)
        //
        // Now we calculate the y tags of the two intersections on the
        // "near vertical side" of the rectangle.  We will have one with
        // the endpoint segment, and one with the curve.  If those two
        // vertical intersections overlap the Y range of the rectangle,
        // we have an intersection.  Otherwise, we don't.

        // c1tag = vertical intersection class of the endpoint segment
        //
        // Choose the y tag of the endpoint that was not on the same
        // side of the rectangle as the subsegment calculated above.
        // Note that we can "steal" the existing Y tag of that endpoint
        // since it will be provably the same as the vertical intersection.
        c1tag = ((c1tag * x1tag <= 0) ? y1tag : y2tag);

        // c2tag = vertical intersection class of the curve
        //
        // We have to calculate this one the straightforward way.
        // Note that the c2tag can still tell us which vertical edge
        // to test against.
        QuadCurve2D.fillEqn(eqn, (c2tag < QuadCurve2D.INSIDE ? x : x + w), x1, ctrlx, x2);
        let num = QuadCurve2D.solveQuadraticC(eqn, res);

        // Note: We should be able to assert(num === 2); since the
        // X range "crosses" (not touches) the vertical boundary,
        // but we pass num to evalQuadratic for completeness.
        QuadCurve2D.evalQuadratic(res, num, true, true, null, y1, ctrly, y2);

        // Note: We can assert(num evals === 1); since one of the
        // 2 crossings will be out of the [0,1] range.
        c2tag = QuadCurve2D.getTag(res[0], y, y + h);

        // Finally, we have an intersection if the two crossings
        // overlap the Y range of the rectangle.
        return (c1tag * c2tag <= 0);
    }

    // ================================================ IShape2D =================================================================

    pathIterator(transform: AffineTransform | null | undefined): IPathIterator {
        return new QuadIterator(this, transform);
    }

    bounds2D(): Bounds2D {
        return this.bounds;
    }

    // ============================================== IAnimation =================================================================

    getAnimationValue(t: number): Vec2D {
        let q1 = this.startPoint.lerp(this.controlPoint, t);
        let q2 = this.controlPoint.lerp(this.endPoint, t);
        return q1.lerp(q2, t);
    }
}

class QuadIterator implements IPathIterator {
    private _quad: QuadCurve2D;
    private _tr: AffineTransform | null | undefined;
    private index: number = 0;

    constructor(quad: QuadCurve2D, transform: AffineTransform | null | undefined) {
        this._quad = quad;
        this._tr = transform;
    }

    isDone(): boolean {
        return this.index > 1;
    }
    next(): void {
        this.index++;
    }
    currentSegment(coords: Vec2D[]): Segment2DType {
        if (this.isDone())
            throw new Error('iterator out of bounds');
        let t = Segment2DType.SEG_MOVETO;
        if (this.index === 0) {
            coords[0] = new Vec2D(this._quad.getX1(), this._quad.getY1());
            t = Segment2DType.SEG_MOVETO;
        } else {
            coords[0] = new Vec2D(this._quad.getX2(), this._quad.getY2());
            coords[1] = new Vec2D(this._quad.getX3(), this._quad.getY3());
            t = Segment2DType.SEG_QUADTO;
        }
        if (this._tr) {
            if (this.index === 0)
                coords[0] = this._tr.transformVector(coords[0]) as Vec2D;
            else {
                coords[0] = this._tr.transformVector(coords[0]) as Vec2D;
                coords[1] = this._tr.transformVector(coords[1]) as Vec2D;
            }
        }
        return t;
    }

}

interface LenghtsAndTimes {
    lenghts: number[];
    times: number[];
    count: number;
}

export class CubicCurve2D implements IAnimator, IShape2D {
    private startPoint: Vec2D;
    private controlPoint1: Vec2D;
    private controlPoint2: Vec2D;
    private endPoint: Vec2D;
    private bounds: Bounds2D = new Bounds2D();
    private totalLenght: number = 0;
    private _lenghts: number[] = [];
    private _times: number[] = [];

    constructor(sx: number, sy: number, cpx1: number, cpy1: number, cpx2: number, cpy2: number, ex: number, ey: number) {
        this.startPoint = new Vec2D(sx, sy);
        this.controlPoint1 = new Vec2D(cpx1, cpy1);
        this.controlPoint2 = new Vec2D(cpx2, cpy2);
        this.endPoint = new Vec2D(ex, ey);
        this.bounds.addPoints([this.startPoint, this.controlPoint1, this.controlPoint2, this.endPoint]);
        let lt = CubicCurve2D.getLenghtsAndTimes(this.startPoint, this.controlPoint1, this.controlPoint2, this.endPoint, 50);
        this._lenghts = lt.lenghts;
        this._times = lt.times;
        this.totalLenght = lt.lenghts[lt.lenghts.length - 1];
    }

    asSegmentArray(transform: AffineTransform | null | undefined): Segment2D[] {
        return [{
            type: Segment2DType.SEG_CUBICTO, coords: transform ? [
                transform.transformVector(new Vec2D(this.startPoint.x, this.startPoint.y)),
                transform.transformVector(new Vec2D(this.controlPoint1.x, this.controlPoint1.y)),
                transform.transformVector(new Vec2D(this.controlPoint2.x, this.controlPoint2.y)),
                transform.transformVector(new Vec2D(this.endPoint.x, this.endPoint.y))
            ] : [
                new Vec2D(this.startPoint.x, this.startPoint.y),
                new Vec2D(this.controlPoint1.x, this.controlPoint1.y),
                new Vec2D(this.controlPoint2.x, this.controlPoint2.y),
                new Vec2D(this.endPoint.x, this.endPoint.y)
            ],
            segmentIndex: 0,
            pathRef: this,
            lenghts: this._lenghts,
            times: this._times
        }];
    }

    getX1(): number {
        return this.startPoint.x;
    }
    getY1(): number {
        return this.startPoint.y;
    }
    getX2(): number {
        return this.controlPoint1.x;
    }
    getY2(): number {
        return this.controlPoint1.y;
    }
    getX3(): number {
        return this.controlPoint2.x;
    }
    getY3(): number {
        return this.controlPoint2.y;
    }
    getX4(): number {
        return this.endPoint.x;
    }
    getY4(): number {
        return this.endPoint.y;
    }
    getLenght(): number {
        return this.totalLenght;
    }

    getStartPoint(): Vector2D {
        return this.startPoint;
    }

    getControlPoint1() : Vector2D {
        return this.controlPoint1;
    }
    
    getControlPoint2() : Vector2D {
        return this.controlPoint2;
    }

    getEndPoint() : Vector2D {
        return this.endPoint;
    }

    public static getPoint(p1: Vector2D, p2:Vector2D, p3: Vector2D, p4: Vector2D, t: number): Vector2D {
        if (t <= 0) {
            return { x: p1.x, y: p1.y };
        } else if (t >= 1) {
            return { x: p4.x, y: p4.y };
        } else {
            let t1 = (1 - t);
            let q1 = t1 * t1 * t1;
            let q2 = 3 * t * (t1 * t1);
            let q3 = 3 * (t * t) * t1;
            let q4 = t * t * t;
            return {
                x: q1 * p1.x + q2 * p2.x + q3 * p3.x + q4 * p4.x,
                y: q1 * p1.y + q2 * p2.y + q3 * p3.y + q4 * p4.y
            };
        }
    }

    public static getLenghtsAndTimes(p1: Vector2D, p2:Vector2D, p3: Vector2D, p4: Vector2D, steps: number) : LenghtsAndTimes {
        let lenghts: number[] = [];
        let times: number[] = [];
        let pPrev = p1;
        let l = 0;
        let step = 1 / steps;
        for(let i = 0; i <= 1; i += step) {
            let pNext = CubicCurve2D.getPoint(p1, p2, p3, p4, i);
            l += Math.abs(Vec2D.lenght(Vec2D.subtract(pNext, pPrev)));
            lenghts.push(l);
            times.push(i);
            pPrev = pNext;
        }
        return { lenghts: lenghts, times: times, count: lenghts.length };
    }
 
    protected getSpeed(time: number): number {
        return 0;
    }
 
    public getCurrentFirstDerivative(time: number) : Vector2D {
        let bvals: number[] = new Array(4);
        this.basisFirstDerivative(time, bvals);
        let d = this._times[3] - this._times[0];

        let sum = Vec2D.multiply(this.startPoint, bvals[0]);
        sum = Vec2D.add(sum, Vec2D.multiply(this.controlPoint1, bvals[1]));
        sum = Vec2D.add(sum, Vec2D.multiply(this.controlPoint2, bvals[2]));
        sum = Vec2D.add(sum, Vec2D.multiply(this.endPoint, bvals[3]));
        return Vec2D.divide(sum, d);
    }

    public getCurrentSecondDerivative(time: number): Vector2D {
        let bvals: number[] = new Array(4);
        this.basisSecondDerivative(time, bvals);
        let d = this._times[3] - this._times[0];
        let sum = Vec2D.multiply(this.startPoint, bvals[0]);
        sum = Vec2D.add(sum, Vec2D.multiply(this.controlPoint1, bvals[1]));
        sum = Vec2D.add(sum, Vec2D.multiply(this.controlPoint2, bvals[2]));
        sum = Vec2D.add(sum, Vec2D.multiply(this.endPoint, bvals[3]));
        return Vec2D.divide(sum, (d * d));
    }

    protected basis(t: number, bvals: number[]): void {
        let s1 = (t - this._times[0]) / (this._times[3] - this._times[0]);
        let s2 = s1 * s1;
        let s3 = s2 * s1;
        bvals[0] = -s3 + 3.0 * s2 - 3.0 * s1 + 1.0;
        bvals[1] = 3.0 * s3 - 6.0 * s2 + 3.0 * s1;
        bvals[2] = -3.0 * s3 + 3.0 * s2;
        bvals[3] = s3;
    }

    protected basisFirstDerivative(t: number, bvals: number[]): void {
        let s1 = (t - this._times[0]) / (this._times[3] - this._times[0]);
        let s2 = s1 * s1;
        bvals[0] = -3.0 * s2 + 6.0 * s1 - 3.0;
        bvals[1] = 9.0 * s2 - 12.0 * s1 + 3.0;
        bvals[2] = -9.0 * s2 + 6.0 * s1;
        bvals[3] = 3.0 * s2;
    }

    protected basisSecondDerivative(t: number, bvals: number[]): void {
        let s1 = (t - this._times[0]) / (this._times[3] - this._times[0]);
        bvals[0] = -6.0 * s1 + 6.0;
        bvals[1] = 18.0 * s1 - 12.0;
        bvals[2] = -18.0 * s1 + 6.0;
        bvals[3] = 6.0 * s1;
    }

    // protected rombergIntegral(t0: number, t1: number, order: number): number {
    //     let i, j, k, m, n, sum, delta;
    //     let temp = new Array(2);
    //     temp[0] = new Array(order);
    //     temp[1] = new Array(order);

    //     delta = t1 - t0;
    //     temp[0][0] = 0.5 * delta * (getSpeed(t0) + getSpeed(t1));

    //     for(i = 2, m = 1; i <= order; i++, m *= 2, delta *= 0.5f) {

    //         // approximate using the trapezoid rule
    //         sum = 0.0f;
    //         for(j = 1; j <= m; j++) {
    //             sum += getSpeed(t0 + delta * (j - 0.5f));
    //         }

    //         // Richardson extrapolation
    //         temp[1, 0] = 0.5f * (temp[0, 0] + delta * sum);
    //         for(k = 1, n = 4; k < i; k++, n *= 4) {
    //             temp[1, k] = (n * temp[1, k - 1] - temp[0, k - 1]) / (n - 1);
    //         }

    //         for(j = 0; j < i; j++) {
    //             temp[0, j] = temp[1, j];
    //         }
    //     }
    //     return temp[0, order - 1];

    // }

    public firstDerivative(t: number): Vector2D {
        let tt = t * t;
        let q0 = -3 * tt + 6 * t -3;
        let q1 = 9 * tt - 12 * t + 3;
        let q2 = -9 * tt + 6 * t;
        let q3 = 3*t;
        let p0d = Vec2D.multiply(this.startPoint, q0);
        let p1d = Vec2D.multiply(this.controlPoint1, q1);
        let p2d = Vec2D.multiply(this.controlPoint2, q2);
        let p3d = Vec2D.multiply(this.endPoint, q3);
        let vel = Vec2D.add(p0d, p1d);
        vel = Vec2D.add(vel, p2d);
        vel = Vec2D.add(vel, p3d);
        return vel;
    }

    public secontDerivative(t: number): Vector2D {
        let q0 = -6 * t + 6;
        let q1 = 18 * t - 12;
        let q2 = -18 * t + 6;
        let q3 = 6 * t;
        let p0d = Vec2D.multiply(this.startPoint, q0);
        let p1d = Vec2D.multiply(this.controlPoint1, q1);
        let p2d = Vec2D.multiply(this.controlPoint2, q2);
        let p3d = Vec2D.multiply(this.endPoint, q3);
        let acc = Vec2D.add(p0d, p1d);
        acc = Vec2D.add(acc, p2d);
        acc = Vec2D.add(acc, p3d);
        return acc;
    }

    private getTXArray(): number[] {
        let ax = -3 * this.startPoint.x + 9 * this.controlPoint1.x - 9 * this.controlPoint2.x - 3* this.endPoint.x;
        let bx = 6 * this.startPoint.x + 12 * this.controlPoint1.x - 6 * this.controlPoint2.x;
        let cx = -3 * this.startPoint.x + 3 * this.controlPoint1.x;
        let t1x = (-bx + Math.sqrt(bx * bx - 4 * ax * cx)) / (2 * ax);
        let t2x = (-bx - Math.sqrt(bx * bx - 4 * ax * cx)) / (2 * ax);
        let ar: number[] = [];
        if(t1x >= 0 && t1x <= 1) {
            ar.push(t1x);
        }
        if(t2x >= 0 && t2x <= 1) {
            ar.push(t2x);
        }
        return ar;
    }

    private getTYArray(): number[] {
        let ay = -3 * this.startPoint.y + 9 * this.controlPoint1.y - 9 * this.controlPoint2.y - 3* this.endPoint.y;
        let by = 6 * this.startPoint.y + 12 * this.controlPoint1.y - 6 * this.controlPoint2.y;
        let cy = -3 * this.startPoint.y + 3 * this.controlPoint1.y;
        let t1y = (-by + Math.sqrt(by * by - 4 * ay * cy)) / (2 * ay);
        let t2y = (-by - Math.sqrt(by * by - 4 * ay * cy)) / (2 * ay);
        let ar: number[] = [];
        if(t1y >= 0 && t1y <= 1) {
            ar.push(t1y);
        }
        if(t2y >= 0 && t2y <= 1) {
            ar.push(t2y);
        }
        return ar;
    }

    public getTightBounds2D(): Bounds2D {
        let bounds = new Bounds2D();
        let txa = this.getTXArray();
        txa.push(this.startPoint.x);
        txa.push(this.endPoint.x);
        let tya = this.getTYArray();
        tya.push(this.startPoint.y);
        tya.push(this.endPoint.y);
        let minx = CubicCurve2D.minInArray(txa), maxx = CubicCurve2D.maxInArray(txa);
        let miny = CubicCurve2D.minInArray(tya), maxy = CubicCurve2D.maxInArray(tya);
        bounds.addPoint({x: minx, y: miny});
        bounds.addPoint({x: maxx, y: maxy});
        return bounds;
    }

    static minInArray(arr:number[]): number{
        let min = arr[0];
        for(let i = 0; i < arr.length; i++) {
            if(arr[i] < min) min = arr[i];
        }
        return min;
    }

    static maxInArray(arr:number[]): number{
        let max = arr[0];
        for(let i = 0; i < arr.length; i++) {
            if(arr[i] > max) max = arr[i];
        }
        return max;
    }

    // ================================================ IShape2D =================================================================

    pathIterator(transform: AffineTransform | null | undefined): IPathIterator {
        return new CubicIterator(this, transform);
    }

    bounds2D(): Bounds2D {
        return this.bounds;
    }

    // ============================================== IAnimation =================================================================
    getAnimationValue(t: number): Vec2D {
        let q1 = this.startPoint.lerp(this.controlPoint1, t);
        let q2 = this.controlPoint1.lerp(this.controlPoint2, t);
        let q3 = this.controlPoint2.lerp(this.endPoint, t);

        let qq1 = q1.lerp(q2, t);
        let qq2 = q2.lerp(q3, t);

        return qq1.lerp(qq2, t);
    }
}

class CubicIterator implements IPathIterator {
    private _cubic: CubicCurve2D;
    private _tr: AffineTransform | null | undefined;
    private index: number = 0;
    constructor(cubic: CubicCurve2D, transform: AffineTransform | null | undefined) {
        this._cubic = cubic;
        this._tr = transform;
    }
    isDone(): boolean {
        return this.index > 1;
    }
    next(): void {
        this.index++;
    }
    currentSegment(coords: Vec2D[]): Segment2DType {
        if (this.isDone())
            throw new Error('iterator out of bounds');
        let t = Segment2DType.SEG_MOVETO;
        if (this.index === 0) {
            coords[0] = new Vec2D(this._cubic.getX1(), this._cubic.getY1());
            t = Segment2DType.SEG_MOVETO;
        } else {
            coords[0] = new Vec2D(this._cubic.getX2(), this._cubic.getY2());
            coords[1] = new Vec2D(this._cubic.getX3(), this._cubic.getY3());
            coords[2] = new Vec2D(this._cubic.getX4(), this._cubic.getY4());
            t = Segment2DType.SEG_CUBICTO;
        }
        if (this._tr) {
            if (this.index === 0)
                coords[0] = this._tr.transformVector(coords[0]) as Vec2D;
            else {
                coords[0] = this._tr.transformVector(coords[0]) as Vec2D;
                coords[1] = this._tr.transformVector(coords[1]) as Vec2D;
                coords[2] = this._tr.transformVector(coords[2]) as Vec2D;
            }
        }
        return t;
    }
}