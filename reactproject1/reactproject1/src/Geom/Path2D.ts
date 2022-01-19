import { AffineTransform } from "../Math/AffineTransform";
import { Bounds2D } from "../Math/Bounds2D";
import { deg2rad, normalize360Radians } from "../Math/mmath";
import { Vec2D, Vector2D } from "../Math/Vec2D";
import { ISvgCommand, SVGPathParser } from "./SVGPathParser";

export interface IShape2D {
    pathIterator(transform: AffineTransform | null | undefined): IPathIterator;
    asSegmentArray(transform: AffineTransform | null | undefined): Segment2D[];
    bounds2D(): Bounds2D;
}

export interface IShape2DEditable {
    setVectorPosition(segmentIndex: number, vectorIndex: number, newValue: Vector2D): void;
}

export function isShape2DEditable(object: any): object is IShape2DEditable {
    return 'setVectorPosition' in object;
}

export interface IPathIterator {
    isDone(): boolean;
    next(): void;
    currentSegment(coords: Vec2D[]): Segment2DType;
}

export enum Segment2DType {
    SEG_MOVETO = 0,
    SEG_LINETO = 1,
    SEG_QUADTO = 2,
    SEG_CUBICTO = 3,
    SEG_CLOSE = 4
}

export interface Segment2D {
    type: Segment2DType;
    coords: Vector2D[];
    pathRef: IShape2DEditable | any;
    segmentIndex: number;
    lenghts? : number[];
    times?: number[];
}

abstract class Path2DIterator implements IPathIterator {
    protected _path: Path2D;
    protected static curvecoords: number[] = [1, 1, 2, 3, 0];
    protected _typeIdx: number = 0;
    protected _pointIdx: number = 0;

    constructor(path: Path2D) {
        this._path = path;
    }

    isDone(): boolean {
        return this._typeIdx >= this._path.numSegments();
    }

    next(): void {
        let t = this._path.segment(this._typeIdx++);
        this._pointIdx += Path2DIterator.curvecoords[t];
    }

    abstract currentSegment(coords: Vec2D[]): Segment2DType;
}

export class Path2D implements IShape2D, IShape2DEditable {
    protected _types: Segment2DType[] = [];
    //protected _numTypes: number = 0;
    protected _coords: Vec2D[] = [];
    //protected _numCoords = 0;
    protected bounds: Bounds2D = new Bounds2D();
    //private static TAU = Math.PI * 2;
    protected static curvecoords: number[] = [1, 1, 2, 3, 0];
    protected static STEPSPERQUARTER: number = 2;
    protected _lastMoveTo: Vec2D | undefined;
    protected _segments: Segment2D[] = [];

    stroke: boolean = true;
    fill: boolean = false;

    numSegments(): number {
        return this._types.length;
    }

    segment(index: number): Segment2DType {
        return this._types[index];
    }

    coords(index: number): Vec2D {
        return this._coords[index];
    }

    numCoords(): number {
        return this._coords.length;
    }

    bounds2D(): Bounds2D {
        return this.bounds;
    }

    moveTo(point: Vector2D) {
        let p = new Vec2D(point);
        if (this._types.length > 0 && this._types[this._types.length - 1] === Segment2DType.SEG_MOVETO) {
            this._coords[this._coords.length - 1] = p;
        } else {
            this._types.push(Segment2DType.SEG_MOVETO);
            this._coords.push(p);
        }
        this._lastMoveTo = p;
        this.bounds.addPoint(p);

        if (this._segments.length > 0 && this._segments[this._segments.length - 1].type === Segment2DType.SEG_MOVETO) {
            this._segments[this._segments.length - 1].coords[0] = p;
        } else {
            this._segments.push({ type: Segment2DType.SEG_MOVETO, coords: [p], segmentIndex: this._segments.length, pathRef: this });
        }
    }

    lineTo(point: Vector2D) {
        let p = new Vec2D(point);
        this.checkMove();
        this._types.push(Segment2DType.SEG_LINETO);
        this._coords.push(p);
        this.bounds.addPoint(p);
        let prevSeg = this._segments[this._segments.length - 1];
        let lastPoint = prevSeg.coords[prevSeg.coords.length - 1];
        if (!p.compare(lastPoint)) {
            this._segments.push({ type: Segment2DType.SEG_LINETO, coords: [lastPoint, p], segmentIndex: this._segments.length, pathRef: this });
        }
    }

    quadTo(control: Vector2D, point: Vector2D) {
        let p = new Vec2D(point);
        let cp = new Vec2D(control);
        this.checkMove();
        this._types.push(Segment2DType.SEG_QUADTO);
        this._coords.push(cp);
        this._coords.push(p);

        this.bounds.addPoint(cp);
        this.bounds.addPoint(p);

        let prevSeg = this._segments[this._segments.length - 1];
        let lastPoint = prevSeg.coords[prevSeg.coords.length - 1];
        this._segments.push({ type: Segment2DType.SEG_QUADTO, coords: [lastPoint, cp, p], segmentIndex: this._segments.length, pathRef: this });
    }

    cubicTo(control1: Vector2D, control2: Vector2D, point: Vector2D) {
        let p = new Vec2D(point);
        let cp1 = new Vec2D(control1);
        let cp2 = new Vec2D(control2);
        this.checkMove();
        this._types.push(Segment2DType.SEG_CUBICTO);
        this._coords.push(cp1);
        this._coords.push(cp2);
        this._coords.push(p);

        this.bounds.addPoint(cp1);
        this.bounds.addPoint(cp2);
        this.bounds.addPoint(p);

        let prevSeg = this._segments[this._segments.length - 1];
        let lastPoint = prevSeg.coords[prevSeg.coords.length - 1];
        this._segments.push({ type: Segment2DType.SEG_CUBICTO, coords: [lastPoint, cp1, cp2, p], segmentIndex: this._segments.length, pathRef: this });
    }

    arc(center: Vector2D, rX: number, rY: number, startAngle: number, endAngle: number, counterclockwise: boolean = false) {
        if (counterclockwise) {
            let t = endAngle;
            endAngle = startAngle;
            startAngle = t;
        }
        if (startAngle < 0) {
            startAngle = normalize360Radians(startAngle);
        }
        if (endAngle < 0) {
            endAngle = normalize360Radians(endAngle);
        }
        let buffer = this.buildCircleBezierGeom(startAngle, endAngle);
        if (counterclockwise) {
            buffer.reverse();
        }
        let m = new AffineTransform(1, 0, 0, 1, 0, 0);
        m.translate(center);
        m.scale(rX, rY);
        this.appendBuffer(buffer, m);
    }

    svgArcToCubicCurves(x1: number | null, y1: number | null, x2: number | null, y2: number | null, r1: number | null, r2: number | null, angle: number | null, largeArcFlag: number | null, sweepFlag: number | null, _recursive: any): any[] {
        if (x1 === null || y1 === null || x2 === null || y2 === null ||
            r1 === null || r2 === null || angle === null || largeArcFlag === null || sweepFlag === null)
            return [];
        let degToRad = function (degrees: number): number {
            return (Math.PI * degrees) / 180;
        };

        let rotate = function (x: number, y: number, angleRad: number): Vector2D {
            let X = x * Math.cos(angleRad) - y * Math.sin(angleRad);
            let Y = x * Math.sin(angleRad) + y * Math.cos(angleRad);
            return { x: X, y: Y };
        };

        let angleRad = degToRad(angle);
        let params = [];
        let f1, f2, cx, cy;

        if (_recursive) {
            f1 = _recursive[0];
            f2 = _recursive[1];
            cx = _recursive[2];
            cy = _recursive[3];
        } else {
            let p1 = rotate(x1, y1, -angleRad);
            x1 = p1.x;
            y1 = p1.y;

            let p2 = rotate(x2, y2, -angleRad);
            x2 = p2.x;
            y2 = p2.y;

            let x = (x1 - x2) / 2;
            let y = (y1 - y2) / 2;
            let h = (x * x) / (r1 * r1) + (y * y) / (r2 * r2);

            if (h > 1) {
                h = Math.sqrt(h);
                r1 = h * r1;
                r2 = h * r2;
            }

            let sign;

            if (largeArcFlag === sweepFlag) {
                sign = -1;
            } else {
                sign = 1;
            }

            let r1Pow = r1 * r1;
            let r2Pow = r2 * r2;

            let left = r1Pow * r2Pow - r1Pow * y * y - r2Pow * x * x;
            let right = r1Pow * y * y + r2Pow * x * x;

            let k = sign * Math.sqrt(Math.abs(left / right));

            cx = k * r1 * y / r2 + (x1 + x2) / 2;
            cy = k * -r2 * x / r1 + (y1 + y2) / 2;

            f1 = Math.asin(parseFloat(((y1 - cy) / r2).toFixed(9)));
            f2 = Math.asin(parseFloat(((y2 - cy) / r2).toFixed(9)));

            if (x1 < cx) {
                f1 = Math.PI - f1;
            }
            if (x2 < cx) {
                f2 = Math.PI - f2;
            }

            if (f1 < 0) {
                f1 = Math.PI * 2 + f1;
            }
            if (f2 < 0) {
                f2 = Math.PI * 2 + f2;
            }

            if (sweepFlag && f1 > f2) {
                f1 = f1 - Math.PI * 2;
            }
            if (!sweepFlag && f2 > f1) {
                f2 = f2 - Math.PI * 2;
            }
        }

        let df = f2 - f1;

        if (Math.abs(df) > (Math.PI * 120 / 180)) {
            let f2old = f2;
            let x2old = x2;
            let y2old = y2;

            if (sweepFlag && f2 > f1) {
                f2 = f1 + (Math.PI * 120 / 180) * (1);
            } else {
                f2 = f1 + (Math.PI * 120 / 180) * (-1);
            }

            x2 = cx + r1 * Math.cos(f2);
            y2 = cy + r2 * Math.sin(f2);
            params = this.svgArcToCubicCurves(x2, y2, x2old, y2old, r1, r2, angle, 0, sweepFlag, [f2, f2old, cx, cy]);
        }

        df = f2 - f1;

        let c1 = Math.cos(f1);
        let s1 = Math.sin(f1);
        let c2 = Math.cos(f2);
        let s2 = Math.sin(f2);
        let t = Math.tan(df / 4);
        let hx = 4 / 3 * r1 * t;
        let hy = 4 / 3 * r2 * t;

        let m1 = [x1, y1];
        let m2 = [x1 + hx * s1, y1 - hy * c1];
        let m3 = [x2 || 0 + hx * s2, y2 || 0 - hy * c2];
        let m4 = [x2, y2];

        m2[0] = 2 * m1[0] - m2[0];
        m2[1] = 2 * m1[1] - m2[1];

        if (_recursive) {
            return [m2, m3, m4].concat(params);
        } else {
            params = [m2, m3, m4].concat(params);

            let curves = [];

            for (let i = 0; i < params.length; i += 3) {
                let r1 = rotate(params[i][0] || 0, params[i][1] || 0, angleRad);
                let r2 = rotate(params[i + 1][0] || 0, params[i + 1][1] || 0, angleRad);
                let r3 = rotate(params[i + 2][0] || 0, params[i + 2][1] || 0, angleRad);
                this.cubicTo(r1, r2, r3);
                curves.push([r1.x, r1.y, r2.x, r2.y, r3.x, r3.y]);
            }

            return curves;
        }
    }

    closePath() {
        this.checkMove();
        this._types.push(Segment2DType.SEG_CLOSE);

    //    let prevSeg = this._segments[this._segments.length - 1];
    //    let lastPoint = prevSeg.coords[prevSeg.coords.length - 1];

        this._segments.push({
            type: Segment2DType.SEG_CLOSE,
            coords: [this.getCurrentPoint() || new Vec2D(), this._lastMoveTo || new Vec2D()],
            pathRef: this,
            segmentIndex: this._segments.length
        });
    }

    setVectorPosition(segmentIndex: number, vectorIndex: number, newValue: Vector2D): void {
        let seg = this._segments[segmentIndex];
        if(seg) {
            let vec = seg.coords[vectorIndex] as Vec2D;
            vec?.set(newValue.x, newValue.y);
        }
        //old style
        // let segmentCoordsStartIdx = this.getSegmentStartCoordsIndex(segmentIndex);
        // if(this._types[segmentIndex] === Segment2DType.SEG_MOVETO){
        //     this._coords[segmentCoordsStartIdx + vectorIndex].set(newValue.x, newValue.y);
        // } else if(this._types[segmentIndex] !== Segment2DType.SEG_CLOSE){
        //     this._coords[segmentCoordsStartIdx + vectorIndex - 1].set(newValue.x, newValue.y);
        // }
    }

    getCurrentPoint(): Vec2D | null {
        let idx = this._coords.length;
        if (this._types.length < 1 || idx < 1)
            return null;
        if (this._types[this._types.length - 1] === Segment2DType.SEG_CLOSE) {
            for (let i = this._types.length - 2; i > 0; i--) {
                switch (this._types[i]) {
                    case Segment2DType.SEG_MOVETO:
                        break;
                    case Segment2DType.SEG_LINETO:
                        idx -= 1;
                        break;
                    case Segment2DType.SEG_QUADTO:
                        idx -= 2;
                        break;
                    case Segment2DType.SEG_CUBICTO:
                        idx -= 3;
                        break;
                    case Segment2DType.SEG_CLOSE:
                        break;
                }
            }
        }
        return this._coords[idx - 1];
    }

    asSegmentArray(transform: AffineTransform | null | undefined = undefined): Segment2D[] {
        if (transform) {
            let transformed: Segment2D[] = [];
            for (let i = 0; i < this._segments.length; i++) {
                let s = this._segments[i];
                let coords = [...s.coords];
                transformed.push({ type: s.type, coords: transform.transform(coords, 0, coords.length), segmentIndex: i, pathRef: this });
            }
            return transformed;
        } else
            return [...this._segments];
    }

    pathIterator(transform: AffineTransform | null | undefined): IPathIterator {
        return new PathIterator(this, transform);
    }

    public static fromSvgPath(data: string): Path2D {
        let pathData = SVGPathParser.getPathData(data);
        //pathData reduced contains only "M", "L", "C" and "Z"
        let p = new Path2D();
        pathData.forEach((command: ISvgCommand) => {
            switch (command.type) {
                case 'M':
                    p.moveTo({ x: command.values[0], y: command.values[1] });
                    break;
                case 'L':
                    p.lineTo({ x: command.values[0], y: command.values[1] });
                    break;
                case 'C':
                    p.cubicTo({ x: command.values[0], y: command.values[1] }, { x: command.values[2], y: command.values[3] }, { x: command.values[4], y: command.values[5] });
                    break;
                case 'Z':
                    p.closePath();
                    break;
                default:
                    throw new Error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! unknown command in reduced SVG path');
            }
        });
        return p;
    }

    public static subpathArrayFromSvgPath(data: string) {
        let pathData = SVGPathParser.getSubpathArray(data);
        //pathData reduced contains only "M", "L", "C" and "Z"
        let ar: Path2D[] = [];
        for(let i in pathData) {
            let subpath = pathData[i];
            let p = new Path2D();
            subpath.forEach(cmd => {
                switch (cmd.type) {
                    case 'M':
                        p.moveTo({ x: cmd.values[0], y: cmd.values[1] });
                        break;
                    case 'L':
                        p.lineTo({ x: cmd.values[0], y: cmd.values[1] });
                        break;
                    case 'C':
                        p.cubicTo({ x: cmd.values[0], y: cmd.values[1] }, { x: cmd.values[2], y: cmd.values[3] }, { x: cmd.values[4], y: cmd.values[5] });
                        break;
                    case 'Z':
                        p.closePath();
                        break;
                    default:
                        throw new Error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! unknown command in reduced SVG path');
                }
            });
            ar.push(p);

        }
        return ar;
    }

     //private getArcCenter(p1: Vec2D, p2: Vec2D, fa: number, fs: number, rx: number, ry: number, sin_phi: number, cos_phi: number) {
    //    // Step 1.
    //    //
    //    // Moving an ellipse so origin will be the middlepoint between our two
    //    // points. After that, rotate it to line up ellipse axes with coordinate
    //    // axes.
    //    //
    //    let x1p = cos_phi * (p1.x - p2.x) / 2 + sin_phi * (p1.y - p2.y) / 2;
    //    let y1p = -sin_phi * (p1.x - p2.x) / 2 + cos_phi * (p1.y - p2.y) / 2;

    //    let rx_sq = rx * rx;
    //    let ry_sq = ry * ry;
    //    let x1p_sq = x1p * x1p;
    //    let y1p_sq = y1p * y1p;

    //    // Step 2.
    //    //
    //    // Compute coordinates of the centre of this ellipse (cx', cy')
    //    // in the new coordinate system.
    //    //
    //    let radicant = (rx_sq * ry_sq) - (rx_sq * y1p_sq) - (ry_sq * x1p_sq);

    //    if (radicant < 0) {
    //        // due to rounding errors it might be e.g. -1.3877787807814457e-17
    //        radicant = 0;
    //    }

    //    radicant /= (rx_sq * y1p_sq) + (ry_sq * x1p_sq);
    //    radicant = Math.sqrt(radicant) * (fa === fs ? -1 : 1);

    //    let cxp = radicant * rx / ry * y1p;
    //    let cyp = radicant * -ry / rx * x1p;

    //    // Step 3.
    //    //
    //    // Transform back to get centre coordinates (cx, cy) in the original
    //    // coordinate system.
    //    //
    //    let cx = cos_phi * cxp - sin_phi * cyp + (p1.x + p2.x) / 2;
    //    let cy = sin_phi * cxp + cos_phi * cyp + (p1.y + p2.y) / 2;

    //    // Step 4.
    //    //
    //    // Compute angles (theta1, delta_theta).
    //    //
    //    let v1x = (x1p - cxp) / rx;
    //    let v1y = (y1p - cyp) / ry;
    //    let v2x = (-x1p - cxp) / rx;
    //    let v2y = (-y1p - cyp) / ry;

    //    let theta1 = this.unitVectorAngle(new Vec2D(1, 0), new Vec2D(v1x, v1y));
    //    let delta_theta = this.unitVectorAngle(new Vec2D(v1x, v1y), new Vec2D(v2x, v2y));

    //    if (fs === 0 && delta_theta > 0) {
    //        delta_theta -= Path2D.TAU;
    //    }
    //    if (fs === 1 && delta_theta < 0) {
    //        delta_theta += Path2D.TAU;
    //    }

    //    return [cx, cy, theta1, delta_theta];
    //}

    //arcTo(endPoint: Vec2D, fa: number, fs: number, rx: number, ry: number, phi: number) {
    //    this.checkMove();
    //    let lastPoint = this.getCurrentPoint();
    //    if (!lastPoint)
    //        throw new Error('ArcTo: move to is missing');
    //    let sin_phi = Math.sin(phi * Path2D.TAU / 360);
    //    let cos_phi = Math.cos(phi * Path2D.TAU / 360);

    //    // Make sure radii are valid
    //    //
    //    let x1p = cos_phi * (lastPoint.x - endPoint.x) / 2 + sin_phi * (lastPoint.y - endPoint.y) / 2;
    //    let y1p = -sin_phi * (lastPoint.x - endPoint.x) / 2 + cos_phi * (lastPoint.y - endPoint.y) / 2;

    //    if (x1p === 0 && y1p === 0) {
    //        // we're asked to draw line to itself
    //        return;
    //    }

    //    if (rx === 0 || ry === 0) {
    //        // one of the radii is zero
    //        return;
    //    }

    //    // Compensate out-of-range radii
    //    //
    //    rx = Math.abs(rx);
    //    ry = Math.abs(ry);

    //    let lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
    //    if (lambda > 1) {
    //        rx *= Math.sqrt(lambda);
    //        ry *= Math.sqrt(lambda);
    //    }


    //    // Get center parameters (cx, cy, theta1, delta_theta)
    //    //
    //    let cc = this.getArcCenter(endPoint, lastPoint, fa, fs, rx, ry, sin_phi, cos_phi);

    //    let result: Vec2D[] = [];
    //    let theta1 = cc[2];
    //    let delta_theta = cc[3];
    //    let center = new Vec2D(cc[0], cc[1]);
    //    // Split an arc to multiple segments, so each segment
    //    // will be less than τ/4 (= 90°)
    //    //
    //    let segments = Math.max(Math.ceil(Math.abs(delta_theta) / (Path2D.TAU / 4)), 1);
    //    delta_theta /= segments;

    //    for (let i = 0; i < segments; i++) {
    //        let r = this.approximateUnitArc(theta1, delta_theta);
    //        // We have a bezier approximation of a unit circle,
    //        // now need to transform back to the original ellipse
    //        r.forEach(value => {
    //            result.push(this.transform(value, rx, ry, cos_phi, sin_phi, center));
    //        });
    //        theta1 += delta_theta;
    //    }

    //    this.appendCurve(result);
    //}

    //private appendCurve(buffer: Vec2D[]) {
    //    if (!this.getCurrentPoint()?.compare(buffer[0]))
    //        this.lineTo(buffer[0]);
    //    for (let i = 0; i < buffer.length; i += 4) {
    //        let cp1 = buffer[i + 1];
    //        let cp2 = buffer[i + 2];
    //        let end = buffer[i + 3];
    //        this.cubicTo(cp1, cp2, end);
    //    }
    //}

    //private transform(point: Vec2D, sx: number, sy: number, cos: number, sin: number, translate: Vec2D): Vec2D {
    //    let x = point.x;
    //    let y = point.y;
    //    //scale
    //    x *= sx;
    //    y *= sy;
    //    //rotate
    //    let xp = cos * x - sin * y;
    //    let yp = sin * x + cos * y;
    //    //translate and return
    //    return new Vec2D(xp + translate.x, yp + translate.y);
    //}

    //private unitVectorAngle(p1: Vec2D, p2: Vec2D): number {
    //    let p1n = p1.normalize();
    //    let p2n = p2.normalize();
    //    let sign = (p1n.x * p2n.y - p1n.y * p2n.x < 0) ? -1 : 1;
    //    let dot = p1n.x * p2n.x + p1n.y * p2n.y;
    //    //dot /= Math.sqrt(p1.x * p1.x + p1.y * p1.y) * Math.sqrt(p2.x * p2.x + p2.y * p2.y);
    //    // Add this to work with arbitrary vectors:
    //    // dot /= Math.sqrt(ux * ux + uy * uy) * Math.sqrt(vx * vx + vy * vy);

    //    // rounding errors, e.g. -1.0000000000000002 can screw up this
    //    if (dot > 1.0) { dot = 1.0; }
    //    if (dot < -1.0) { dot = -1.0; }

    //    return sign * Math.acos(dot);
    //}
    // private approximateUnitArc(theta1: number, delta_theta: number): Vec2D[] {
    //     let alpha = 4 / 3 * Math.tan(delta_theta / 4);

    //     let x1 = Math.cos(theta1);
    //     let y1 = Math.sin(theta1);
    //     let x2 = Math.cos(theta1 + delta_theta);
    //     let y2 = Math.sin(theta1 + delta_theta);

    //     return [new Vec2D(x1, y1), new Vec2D(x1 - y1 * alpha, y1 + x1 * alpha), new Vec2D(x2 + y2 * alpha, y2 - x2 * alpha), new Vec2D(x2, y2)];
    // }

    private checkMove() {
        if (this._types.length === 0) {
            throw new Error('missing initial moveTo');
        }
    }
    private impDistanceBezierPointToControl(fAngle: number): number {
        if (0 <= fAngle && fAngle <= Math.PI * 2) {
            return 4.0 / 3.0 * (Math.tan(fAngle / 4.0));
        } else
            return 0;
    }
    private appendBezierSegment(buffer: Vec2D[], cp1: Vec2D, cp2: Vec2D, end: Vec2D) {
        buffer.push(cp1);
        buffer.push(cp2);
        buffer.push(end);
    }
    private buildCircleBezierGeom(startAngle: number, endAngle: number): Vec2D[] {
        if (startAngle < 0) {
            startAngle = 0;
        }

        if (startAngle >= Math.PI * 2) {
            startAngle = 0;
        }

        if (endAngle < 0) {
            endAngle = 0;
        }

        if (endAngle >= Math.PI * 2) {
            endAngle = 0;
        }

        let nSegments = Path2D.STEPSPERQUARTER * 4;
        let anglePerSegment = (Math.PI / 2) / Path2D.STEPSPERQUARTER;
        let startSegment = Math.floor((startAngle / anglePerSegment) % nSegments);
        let endSegment = Math.floor((endAngle / anglePerSegment) % nSegments);
        let fSegmentKappa = this.impDistanceBezierPointToControl(anglePerSegment);
        let sSin = Math.sin(startAngle);
        let sCos = Math.cos(startAngle);
        let eSin = Math.sin(endAngle);
        let eCos = Math.cos(endAngle);

        let vSegStart = new Vec2D(sCos, sSin);
        let buffer: Vec2D[] = [];
        buffer.push(vSegStart);
        if (startSegment === endSegment && startAngle < endAngle) {
            let vSegEnd = new Vec2D(eCos, eSin);
            let fFactor = this.impDistanceBezierPointToControl(endAngle - startAngle);
            this.appendBezierSegment(buffer,
                vSegStart.add(new Vec2D(-vSegStart.y, vSegStart.x).mul(fFactor)),
                vSegEnd.sub(new Vec2D(-vSegEnd.y, vSegEnd.x).mul(fFactor)),
                vSegEnd);
        } else {
            let fSegEndRad = (startSegment + 1) * anglePerSegment;
            let fFactor = this.impDistanceBezierPointToControl(fSegEndRad - startAngle);
            let vSegEnd = new Vec2D(Math.cos(fSegEndRad), Math.sin(fSegEndRad));
            let cp1 = vSegStart.add(new Vec2D(-vSegStart.y, vSegStart.x).mul(fFactor));
            let cp2 = vSegEnd.sub(new Vec2D(-vSegEnd.y, vSegEnd.x).mul(fFactor));
            if (!(cp1.compare(cp2) || cp2.compare(vSegEnd)))
                this.appendBezierSegment(buffer, cp1, cp2, vSegEnd);

            let nSegment = Math.floor((startSegment + 1) % nSegments);
            vSegStart = vSegEnd;
            while (nSegment !== endSegment) {
                // No end in this sector, add full sector.
                fSegEndRad = (nSegment + 1) * anglePerSegment;
                vSegEnd = new Vec2D(Math.cos(fSegEndRad), Math.sin(fSegEndRad));

                cp1 = vSegStart.add(new Vec2D(-vSegStart.y, vSegStart.x).mul(fSegmentKappa));
                cp2 = vSegEnd.sub(new Vec2D(-vSegEnd.y, vSegEnd.x).mul(fSegmentKappa));
                if (!(cp1.compare(cp2) || cp2.compare(vSegEnd)))
                    this.appendBezierSegment(buffer, cp1, cp2, vSegEnd);

                nSegment = Math.floor((nSegment + 1) % nSegments);
                vSegStart = vSegEnd;
            }
            let fSegStartRad = (nSegment * anglePerSegment);
            fFactor = this.impDistanceBezierPointToControl(endAngle - fSegStartRad);
            vSegEnd = new Vec2D(eCos, eSin);
            cp1 = vSegStart.add(new Vec2D(-vSegStart.y, vSegStart.x).mul(fFactor));
            cp2 = vSegEnd.sub(new Vec2D(-vSegEnd.y, vSegEnd.x).mul(fFactor));
            if (!(cp1.compare(cp2) || cp2.compare(vSegEnd)))
                this.appendBezierSegment(buffer, cp1, cp2, vSegEnd);
        }
        return buffer;
    }
    private appendBuffer(inBuffer: Vec2D[], matrix: AffineTransform) {
        this.checkMove();
        if (inBuffer != null) {
            //  if(!inBuffer[0].compare(this.getCurrentPoint()))
            //     this.lineTo(matrix.transformVector(inBuffer[0]));

            for (let i = 1; i < inBuffer.length; i += 3) {
                this.cubicTo(matrix.transformVector(inBuffer[i + 0]), matrix.transformVector(inBuffer[i + 1]), matrix.transformVector(inBuffer[i + 2]));
            }
        }
    }

    // private getSegmentStartCoordsIndex(index: number) : number{
    //     let idx = 0;
    //     for(let i = 0; i < this._types.length; i++) {
    //         if(i === index)
    //             break;
    //         let type = this._types[i];
    //         let sz = Path2D.curvecoords[type];
    //         idx += sz;
    //     }
    //     return idx;
    // }
}

export class PathIterator extends Path2DIterator {
    protected _transform: AffineTransform | null | undefined;

    constructor(path: Path2D, transform: AffineTransform | null | undefined) {
        super(path);
        this._transform = transform;
    }

    currentSegment(coords: Vector2D[]): Segment2DType {
        let t = this._path.segment(this._typeIdx);
        let numCoords = Path2DIterator.curvecoords[t];
        if (numCoords > 0) {
            for (let i = 0; i < numCoords; i++) {
                coords[i] = this._path.coords(this._pointIdx + i);
            }
            if (this._transform) {
                coords = this._transform.transform(coords, 0, numCoords);
            }
        }
        return t;
    }
}
