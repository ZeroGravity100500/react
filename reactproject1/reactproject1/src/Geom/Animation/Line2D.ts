import { AffineTransform } from "../../Math/AffineTransform";
import { Bounds2D } from "../../Math/Bounds2D";
import { Vec2D } from "../../Math/Vec2D";
import { IPathIterator, IShape2D, Segment2D, Segment2DType } from "../Path2D";
import { IAnimator } from "./Animation";
import { Rect2D } from "./Rect2D";

export class Line2D implements IShape2D, IAnimator {
	private startPoint: Vec2D;
	private endPoint: Vec2D;
	private bounds: Bounds2D = new Bounds2D();
	private lenght: number;

	constructor(sx: number, sy: number, ex: number, ey: number) {
		this.startPoint = new Vec2D(sx, sy);
		this.endPoint = new Vec2D(ex, ey);
		this.lenght = this.startPoint.dist(this.endPoint);
		this.bounds.addPoint(this.startPoint);
		this.bounds.addPoint(this.endPoint);
    }

    asSegmentArray(transform: AffineTransform | null | undefined): Segment2D[] {
        return [{
            type: Segment2DType.SEG_LINETO,
            coords: transform ? [
                transform.transformVector(new Vec2D(this.startPoint.x, this.startPoint.y)),
                transform.transformVector(new Vec2D(this.endPoint.x, this.endPoint.y))
            ] : [
                    new Vec2D(this.startPoint.x, this.startPoint.y),
                    new Vec2D(this.endPoint.x, this.endPoint.y)
            ],
            segmentIndex: 0,
            pathRef: this
        }];
    }

    public getLenght() {
		return this.lenght;
	}

    public getX1(): number {
        return this.startPoint.x;
    }
    public getY1(): number {
        return this.startPoint.y;
    }
    public getX2(): number {
        return this.endPoint.x;
    }
    public getY2(): number {
        return this.endPoint.y;
    }

	public static relativeCCW(x1: number, y1: number,
		x2: number, y2: number,
		px: number, py: number): number {
		x2 -= x1;
		y2 -= y1;
		px -= x1;
		py -= y1;
		let ccw = px * y2 - py * x2;
		if (ccw === 0) {
            // The point is colinear, classify based on which side of
            // the segment the point falls on.  We can calculate a
            // relative value using the projection of px,py onto the
            // segment - a negative value indicates the point projects
            // outside of the segment in the direction of the particular
            // endpoint used as the origin for the projection.
			ccw = px * x2 + py * y2;
			if (ccw > 0) {
				// Reverse the projection to be relative to the original x2,y2
                // x2 and y2 are simply negated.
                // px and py need to have (x2 - x1) or (y2 - y1) subtracted
                //    from them (based on the original values)
                // Since we really want to get a positive answer when the
                //    point is "beyond (x2,y2)", then we want to calculate
                //    the inverse anyway - thus we leave x2 & y2 negated.
				px -= x2;
				py -= y2;
				ccw = px * x2 + py * y2;
				if (ccw < 0) {
					ccw = 0;
				}
			}
		}
		return (ccw < 0) ? -1 : ((ccw > 0) ? 1 : 0);
	}

	public relativeCCW(px: number, py: number): number {
		return Line2D.relativeCCW(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y, px, py);
	}

	public static linesIntersect(x1: number, y1: number, x2: number, y2: number,
		x3: number, y3: number, x4: number, y4: number): boolean{
		return (
			(Line2D.relativeCCW(x1, y1, x2, y2, x3, y3) * Line2D.relativeCCW(x1, y1, x2, y2, x4, y4) <= 0)
			&& (Line2D.relativeCCW(x3, y3, x4, y4, x1, y1) * Line2D.relativeCCW(x3, y3, x4, y4, x2, y2) <= 0));
	}

	public linesIntersect(x1: number, y1: number, x2: number, y2: number): boolean {
		return Line2D.linesIntersect(x1, y1, x2, y2,
			this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);
	}

	public static ptSegDistSq(x1: number, y1: number, x2: number, y2: number, px: number, py: number): number {
        // Adjust vectors relative to x1,y1
        // x2,y2 becomes relative vector from x1,y1 to end of segment
        x2 -= x1;
        y2 -= y1;
        // px,py becomes relative vector from x1,y1 to test point
        px -= x1;
        py -= y1;
            let dotprod = px * x2 + py * y2;
            let projlenSq;
        if (dotprod <= 0) {
            // px,py is on the side of x1,y1 away from x2,y2
            // distance to segment is length of px,py vector
            // "length of its (clipped) projection" is now 0.0
            projlenSq = 0;
        } else {
            // switch to backwards vectors relative to x2,y2
            // x2,y2 are already the negative of x1,y1=>x2,y2
            // to get px,py to be the negative of px,py=>x2,y2
            // the dot product of two negated vectors is the same
            // as the dot product of the two normal vectors
            px = x2 - px;
            py = y2 - py;
            dotprod = px * x2 + py * y2;
            if (dotprod <= 0) {
                // px,py is on the side of x2,y2 away from x1,y1
                // distance to segment is length of (backwards) px,py vector
                // "length of its (clipped) projection" is now 0.0
                projlenSq = 0;
            } else {
                // px,py is between x1,y1 and x2,y2
                // dotprod is the length of the px,py vector
                // projected on the x2,y2=>x1,y1 vector times the
                // length of the x2,y2=>x1,y1 vector
                projlenSq = dotprod * dotprod / (x2 * x2 + y2 * y2);
            }
        }
            // Distance to line is now the length of the relative point
            // vector minus the length of its projection onto the line
            // (which is zero if the projection falls outside the range
            //  of the line segment).
            let lenSq = px * px + py * py - projlenSq;
        if (lenSq < 0) {
            lenSq = 0;
        }
        return lenSq;
    }

    public static ptSegDist(x1: number, y1: number, x2: number, y2: number, px: number, py: number): number {
        return Math.sqrt(Line2D.ptSegDistSq(x1, y1, x2, y2, px, py));
    }

    public ptSegDistSq(px: number, py: number) {
        return Line2D.ptSegDistSq(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y, px, py);
    }

    public ptSegDist(px: number, py: number) {
        return Line2D.ptSegDist(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y, px, py);
    }

    public static ptLineDistSq(x1: number, y1: number, x2: number, y2: number, px: number, py: number): number {
        // Adjust vectors relative to x1,y1
        // x2,y2 becomes relative vector from x1,y1 to end of segment
        x2 -= x1;
        y2 -= y1;
        // px,py becomes relative vector from x1,y1 to test point
        px -= x1;
        py -= y1;
            let dotprod = px * x2 + py * y2;
            // dotprod is the length of the px,py vector
            // projected on the x1,y1=>x2,y2 vector times the
            // length of the x1,y1=>x2,y2 vector
            let projlenSq = dotprod * dotprod / (x2 * x2 + y2 * y2);
            // Distance to line is now the length of the relative point
            // vector minus the length of its projection onto the line
            let lenSq = px * px + py * py - projlenSq;
        if (lenSq < 0) {
            lenSq = 0;
        }
        return lenSq;
    }

    public static ptLineDist(x1: number, y1: number, x2: number, y2: number, px: number, py: number): number {
        return Math.sqrt(Line2D.ptLineDistSq(x1, y1, x2, y2, px, py));
    }

    public ptLineDistSq(px: number, py: number) {
        return Line2D.ptLineDistSq(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y, px, py);
    }

    public ptLineDist(px: number, py: number) {
        return Line2D.ptLineDist(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y, px, py);
    }

    public contains(x: number, y: number): boolean {
        return false;
    }

    public intersects(r: Rect2D): boolean {
        return r.intersectsLine(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);
    }

    public containsRect(r: Rect2D): boolean {
        return false;
    }

    // ================================================ IShape2D =================================================================

    public bounds2D(): Bounds2D {
        return this.bounds;
    }

    pathIterator(transform: AffineTransform | null | undefined): IPathIterator {
        return new LineIterator(this, transform);
    }

    // ============================================== IAnimation =================================================================
    public getAnimationValue(time: number): Vec2D {
        return this.startPoint.lerp(this.endPoint, time);
    }
}

export class LineIterator implements IPathIterator {
    private _line: Line2D;
    private _transform: AffineTransform | null | undefined;
    private index: number = 0;

    constructor(line: Line2D, transform: AffineTransform | null | undefined) {
        this._line = line;
        this._transform = transform;
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
            coords[0] = new Vec2D(this._line.getX1(), this._line.getY1());
            t = Segment2DType.SEG_MOVETO;
        } else {
            coords[0] = new Vec2D(this._line.getX2(), this._line.getY2());
            t = Segment2DType.SEG_LINETO;
        }
        if (this._transform) {
            coords[0] = this._transform.transformVector(coords[0]) as Vec2D;
        }
        return t;
    }
}