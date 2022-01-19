import { lerp, mmath } from "../../Math/mmath";
import { Vector2D } from "../../Math/Vec2D";
import { Segment2D, Segment2DType } from "../Path2D";
import { IAnimator } from "./Animation";
import { CubicCurve2D, QuadCurve2D } from "./Curve2D";

export class PathAnimation2D implements IAnimator {
    segments: Segment2D[] = [];
    lenghts: number[] = [];
    private totalLenght = 0;

    addCurve(curve: Segment2D) {
        if (curve.type === Segment2DType.SEG_MOVETO) {
            return;
        }
        this.segments.push(curve);
        let len = this.calcLenght(curve);
        this.lenghts.push(len);
        this.totalLenght += len;
    }

    private segmentsLen(to: number): number {
        let l = 0;
        for (let i = 0; i < to; i++) {
            l += this.lenghts[i];
        }
        return l;
    }

    getAnimationValue(time: number) {
        let idx = this.indexForTime(time);
        if (idx === undefined) {
            console.log('Errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');
            return { x: 0, y: 0 };
        }

        let lll = this.totalLenght * time;
        let partsLen = this.segmentsLen(idx);
        let chunkLen = this.lenghts[idx];
        let diff = lll - partsLen;
        let aaa = diff / chunkLen;

        let segment = this.segments[idx];
        switch (segment.type) {
            case Segment2DType.SEG_LINETO:
                return this.lerpVector(segment.coords[0], segment.coords[1], aaa);
            case Segment2DType.SEG_QUADTO:
                return QuadCurve2D.getPoint(segment.coords[0], segment.coords[1], segment.coords[2], aaa);
            case Segment2DType.SEG_CUBICTO:
                return CubicCurve2D.getPoint(segment.coords[0], segment.coords[1], segment.coords[2], segment.coords[3], aaa);
            case Segment2DType.SEG_MOVETO:
            case Segment2DType.SEG_CLOSE:
            default:
                console.warn('PathAnimation2D:getAtTime Segment2DType.SEG_MOVETO or Segment2DType.SEG_CLOSE in segments');
                return { x: 0, y: 0 };
       }
    }

    clear() {
        this.segments = [];
        this.lenghts = [];
        this.totalLenght = 0;
    }

    getCubicPointArray(p1: Vector2D, p2: Vector2D, p3: Vector2D, p4: Vector2D): Vector2D[] {
        let points = [];
        for (let i = 0; i <= 1; i += mmath.CURVE_APPROX_T_STEP) {
            points.push(CubicCurve2D.getPoint(p1, p2, p3, p4, i));
        }
        return points;
    }

    getQuadPointArray(p1: Vector2D, p2: Vector2D, p3: Vector2D): Vector2D[] {
        let points = [];
        for (let i = 0; i <= 1; i += mmath.CURVE_APPROX_T_STEP) {
            points.push(QuadCurve2D.getPoint(p1, p2, p3, i));
        }
        return points;
    }

    private calcLenght(curve: Segment2D): number {
        let lt;
        switch (curve.type) {
            case Segment2DType.SEG_LINETO:
                return this.lineLenght(curve.coords[0], curve.coords[1]);
            case Segment2DType.SEG_QUADTO:
                lt = QuadCurve2D.getLenghtsAndTimes(curve.coords[0], curve.coords[1], curve.coords[2], 50);
                return lt.lenghts[lt.count - 1];
            case Segment2DType.SEG_CUBICTO:
                lt = CubicCurve2D.getLenghtsAndTimes(curve.coords[0], curve.coords[1], curve.coords[2], curve.coords[3], 50);
                return lt.lenghts[lt.count - 1];// this.cubicLenght(curve.coords[0], curve.coords[1], curve.coords[2], curve.coords[3]);
            case Segment2DType.SEG_MOVETO:
            case Segment2DType.SEG_CLOSE:
            default:
                console.warn('PathAnimation2D:calcLenght Segment2DType.SEG_MOVETO or Segment2DType.SEG_CLOSE in segments');
                return 0;
        }
    }

    private indexForTime(t: number): number | undefined {
        if (t <= 0)
            return 0;
        if (t >= 1)
            return this.lenghts.length - 1;

        let lenfortime = lerp(0, this.totalLenght, t);
        let tlen = 0;
        let idx = -1;
        while (tlen < lenfortime) {
            idx++;
            tlen += this.lenghts[idx];
        }
        return idx;
    }

    private lerpVector(p1: Vector2D, p2: Vector2D, t: number): Vector2D {
        if (t <= 0) {
            return { x: p1.x, y: p1.y };
        } else if (t >= 1) {
            return { x: p2.x, y: p2.y };
        } else {
            return {
                x: lerp(p1.x, p2.x, t),
                y: lerp(p1.y, p2.y, t)
            }
        };
    }

    private lineLenght(p1: Vector2D, p2: Vector2D): number {
        return Math.sqrt(this.lineLenghtSq(p1, p2));
    }

    private lineLenghtSq(p1: Vector2D, p2: Vector2D): number {
        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;
        return dx * dx + dy * dy;
    }
}