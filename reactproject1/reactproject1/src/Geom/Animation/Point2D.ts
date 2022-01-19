import { AffineTransform } from "../../Math/AffineTransform";
import { Bounds2D } from "../../Math/Bounds2D";
import { Vec2D } from "../../Math/Vec2D";
import { IPathIterator, IShape2D, Segment2D, Segment2DType } from "../Path2D";
import { IAnimator } from "./Animation";

export class Point2D extends Vec2D implements IShape2D, IAnimator {
    asSegmentArray(transform: AffineTransform | null | undefined): Segment2D[] {
        return [{
            type: Segment2DType.SEG_MOVETO,
            coords: transform ? [
                transform.transformVector(new Vec2D(this.x, this.y))
            ] : [
                new Vec2D(this.x, this.y)
            ],
            pathRef: this,
            segmentIndex: 0
        }];
    }

    getAnimationValue(time: number) {
        return new Vec2D(this.x, this.y);
    }

    pathIterator(transform: AffineTransform | null | undefined): IPathIterator {
        return new PointIterator(this, transform);
    }

    bounds2D(): Bounds2D {
        let bounds = new Bounds2D();
        bounds.addPoint(this);
        return bounds;
    }

}

class PointIterator implements IPathIterator {
    private _point: Point2D;
    private _transform: AffineTransform | null | undefined;
    private index: number = 0;
    constructor(point: Point2D, transform: AffineTransform | null | undefined) {
        this._point = point;
        this._transform = transform;
    }
    isDone(): boolean {
        return this.index > 0;
    }

    next(): void {
        this.index++;
    }

    currentSegment(coords: Vec2D[]): Segment2DType {
        if (this.index > 0)
            throw new Error('iterator out of bounds');
        coords[0] = this._transform ? this._transform.transformVector(this._point) as Vec2D : new Vec2D(this._point.x, this._point.y);
        return Segment2DType.SEG_MOVETO;
    }
}