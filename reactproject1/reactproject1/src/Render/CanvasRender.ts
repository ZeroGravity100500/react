import { IBrush, LinearGradientBrush, SolidBrush } from "../Color/Brush";
import { Color } from "../Color/Color";
import { IPen, SolidPen } from "../Color/Pen";
import { IShape2D, Segment2DType } from "../Geom/Path2D";
import { CanvasTextBaseline, IFontStyle } from "./TextParagraph";
import { AffineTransform } from "../Math/AffineTransform";
import { Bounds2D } from "../Math/Bounds2D";
import { Vec2D, Vector2D } from "../Math/Vec2D";
import { CanvasParticle } from "./Image/CanvasParticle";

export interface IRenderObject {
    shape: IShape2D;
    transform: AffineTransform;
    stroke: boolean; 
    fill: boolean;
    pen?: IPen;
    brush?: IBrush;
}

interface ISavedFont {
    font: string;
    baseline: CanvasTextBaseline;
    align: CanvasTextAlign;
    direction: CanvasDirection;
}

export class CanvasRender {
    private _context2D: CanvasRenderingContext2D;
    private _transform: AffineTransform = AffineTransform.createIdentityTransform();
    private _savedTransforms: AffineTransform[] = [];
    private _matrixDirty = true;
    private _inverseMatrix: AffineTransform | null = null;
    
    private _renderObjectBuffer: IRenderObject[] = [];

    private _strokeWidth: number = 1;

    private _showAxis: boolean = true;
    private _axisPen: IPen = new SolidPen(Color.lightgray, 2);

    private _savedStroke: IPen | undefined = undefined;
    private _savedFont: ISavedFont | undefined = undefined;

    private _onFrameUpdateCallback?: any;
    private _onDrawCallback?: any;

    private _particles: CanvasParticle[] = [];

    constructor(context: CanvasRenderingContext2D, onFrameUpdateCallback?: any, onDrawCallback?: any) {
        this._context2D = context;
        this._onFrameUpdateCallback = onFrameUpdateCallback;
        this._onDrawCallback = onDrawCallback;
    }

    getScaleFactor(){
        return this._strokeWidth;
    }

    saveTransform(): void {
        this._savedTransforms.push(this._transform);
        this._context2D?.save();
    }

    restoreTransform(): void {
        this._transform = this._savedTransforms.pop() || AffineTransform.createIdentityTransform();
        this._context2D?.restore();
    }

    scaleViewPort(sx: number, sy: number): void {
        this._matrixDirty = true;
        this._transform.scale(sx, sy);
        this.updateView();
    }

    rotateViewPort(radians: number): void {
        this._matrixDirty = true;
        this._transform.rotate(radians);
        this.updateView();
    }

    translateViewPort(dx: number, dy: number): void {
        this._matrixDirty = true;
        this._transform.translate({ x: dx, y: dy });
        this.updateView();
    }

    zoomViewPort(origin: Vector2D, scale: number): void {
        let pt = this.pointToWorldSpace(origin);
        this.translateViewPort(pt.x, pt.y);
        this.scaleViewPort(scale, scale);
        this.translateViewPort(-pt.x, -pt.y);
        this._strokeWidth /= scale;
    }

    transformViewPort(a: number, b: number, c: number, d: number, e: number, f: number): void {
        this._matrixDirty = true;
        let m2 = new AffineTransform(a, b, c, d, e, f);
        this._transform.concatenate(m2);
        this.updateView();
    }

    private setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void {
        this._matrixDirty = true;
        this._transform = new AffineTransform(a, b, c, d, e, f);
        this.updateView();
    }

    private updateView() {
        if (this._context2D) {
            const m = this._transform.toDomMatrix();
            this._context2D.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
        }
    }

    pointToWorldSpace(p: Vector2D): Vector2D {
        if (this._matrixDirty || !this._inverseMatrix) {
            this._inverseMatrix = this._transform.createInverse();
        }
        return this._inverseMatrix.transformVector(p);
    }

    pointToScreenSpace(p: Vector2D): Vector2D {
        return this._transform.transformVector(p);
    }

    clear() {
        if (this._context2D) {
            this.saveTransform();
            this._context2D.setTransform(1, 0, 0, 1, 0, 0);
            this._context2D.clearRect(0, 0, this._context2D.canvas.width, this._context2D.canvas.height);
            this.restoreTransform();

            if (this._showAxis) this.drawAxis();
        }
    }

    private saveStroke() {
        if (this._context2D) {
            this._savedStroke = {
                lineCap: this._context2D.lineCap,
                lineDash: {
                    dash: this._context2D.getLineDash(),
                    offset: this._context2D.lineDashOffset
                },
                lineJoin: this._context2D.lineJoin,
                miterLimit: this._context2D.miterLimit,
                style: this._context2D.strokeStyle,
                width: this._context2D.lineWidth
            };
        }
    }

    private restoreStroke() {
        if (this._context2D && this._savedStroke) {
            this._context2D.lineCap = this._savedStroke.lineCap;
            this._context2D.setLineDash(this._savedStroke.lineDash?.dash || []);
            this._context2D.lineDashOffset = this._savedStroke.lineDash?.offset || 0;
            this._context2D.lineJoin = this._savedStroke.lineJoin;
            this._context2D.miterLimit = this._savedStroke.miterLimit;
            this._context2D.strokeStyle = this._savedStroke.style || '';
            this._context2D.lineWidth = this._savedStroke.width;
        }
    }

    private saveFont() {
        if(this._context2D){
            this._savedFont = {
                font: this._context2D.font,
                baseline: this._context2D.textBaseline as CanvasTextBaseline,
                align: this._context2D.textAlign,
                direction: this._context2D.direction
            }
        }
    }

    private restoreFont() {
        if(this._context2D && this._savedFont){
            this._context2D.font = this._savedFont.font;
            this._context2D.textBaseline = this._savedFont.baseline;
            this._context2D.textAlign = this._savedFont.align;
            this._context2D.direction = this._savedFont.direction;
        }
    }

    private drawAxis() {
        if (this._context2D) {
            const canvasRect = this._context2D.canvas.getBoundingClientRect();
            const pts = this.pointToWorldSpace({ x: 0, y: 0 });
            const pte = this.pointToWorldSpace({ x: canvasRect.width, y: canvasRect.height });
            this.saveStroke();
            this.setStroke(this._axisPen);
            this.drawLine({ x: pts.x, y: 0 }, { x: pte.x, y: 0 });
            this.drawLine({ x: 0, y: pts.y }, { x: 0, y: pte.y });
            this._context2D.beginPath();
            this.drawText(0, 0, '0');
            this.restoreStroke();
        //    this._render.drawText(995 /*- textMetrix.width*/, 5, "X Axis");
        //    this._render.drawText(5, 990, "Y Axis");
        }
    }

    drawLine(p1: Vector2D, p2: Vector2D) {
        if (this._context2D) {
            this._context2D.beginPath();
            this._context2D.moveTo(p1.x, p1.y);
            this._context2D.lineTo(p2.x, p2.y);
            this._context2D.stroke();
        }
    }

    strokeRect(pos: Vector2D, width: number, height: number) {
        if (this._context2D) {
            this._context2D.strokeRect(pos.x, pos.y, width, height);
        }
    }

    strokeArc(center: Vector2D, radius: number, startAngle: number, endAngle: number, counterclockwise: boolean = false) {
        if (this._context2D) {
            this._context2D.beginPath();
            this._context2D.arc(center.x, center.y, radius, startAngle, endAngle, counterclockwise);
            this._context2D.stroke();
        }
    }

    drawPoint(point: Vector2D, size: number = 5) {
        if (this._context2D && point) {
            this._context2D.beginPath();
            this._context2D.arc(point.x, point.y, size * this._strokeWidth, 0, 2 * Math.PI);
            this._context2D.fill();
        }
    }

    strokeQuadCurve(points: Vector2D[]) {
        if (this._context2D && points) {
            this._context2D.beginPath();
            this._context2D.moveTo(points[0].x, points[0].y);
            this._context2D.quadraticCurveTo(points[1].x, points[1].y, points[2].x, points[2].y);
            this._context2D.stroke();
        }
    }

    strokeCubicCurve(points: Vector2D[]) {
        if (this._context2D && points) {
            this._context2D.beginPath();
            this._context2D.moveTo(points[0].x, points[0].y);
            this._context2D.bezierCurveTo(points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y);
            this._context2D.stroke();
        }
    }

    drawPath(shape: IShape2D, stroke: boolean, fill: boolean, transform: AffineTransform | undefined = undefined) {
        if (this._context2D) {
            let i = 0;
            let it = shape.pathIterator(transform || null);
            let coords: Vec2D[] = new Array<Vec2D>(3);
            while (!it.isDone()) {
                let type = it.currentSegment(coords);
                switch (type) {
                    case Segment2DType.SEG_MOVETO:
                        if (i) {
                            if (fill) {
                                this._context2D.fill();
                            }
                            if (stroke) {
                                this._context2D.stroke();
                            }
                        }
                        this._context2D.beginPath();
                        this._context2D.moveTo(coords[0].x, coords[0].y);
                        break;
                    case Segment2DType.SEG_LINETO:
                        this._context2D.lineTo(coords[0].x, coords[0].y);
                        break;
                    case Segment2DType.SEG_QUADTO:
                        this._context2D.quadraticCurveTo(coords[0].x, coords[0].y, coords[1].x, coords[1].y);
                        break;
                    case Segment2DType.SEG_CUBICTO:
                        this._context2D.bezierCurveTo(coords[0].x, coords[0].y, coords[1].x, coords[1].y, coords[2].x, coords[2].y);
                        break;
                    case Segment2DType.SEG_CLOSE:
                        this._context2D.closePath();
                        break;
                }
                i++;
                it.next();
            }
            if (fill) {
                this._context2D.fill();
            }
            if (stroke) {
                this._context2D.stroke();
            }
            this._context2D.beginPath();
        }
    }

    addToRenderBuffer(object: IRenderObject): number {
        if (object != null) {
            return this._renderObjectBuffer.push(object);
        }
        return -1;
    }

    removeFromRenderBuffer(index: number): IRenderObject | undefined {
        if (index !== -1) {
            return this._renderObjectBuffer.splice(index, 1)[0];
        }
        return;
    }

    addParticle(p: CanvasParticle): number {
        if(p !== null)
            return this._particles.push(p);
        return -1;
    }

    removeParticle(index: number): CanvasParticle | undefined {
        if (index !== -1) {
            return this._particles.splice(index, 1)[0];
        }
        return;
    }

    private drawRenderObjects() {
        for(let i = 0; i < this._renderObjectBuffer.length; i++) {
            let obj = this._renderObjectBuffer[i];
            if(obj.brush) {
                if(obj.brush instanceof LinearGradientBrush) {
                    this.setFill(obj.brush, obj.shape.bounds2D());
                } else {
                    this.setFill(obj.brush);
                }
            }
            if(obj.pen) {
                this.setStroke(obj.pen);
            }
            this.drawPath(obj.shape, obj.stroke, obj.fill, obj.transform);
        }
    }

    private updateParticles(delta_time: number) {
        for(let i in this._particles) {
            this._particles[i].update(this._context2D, delta_time);
        }
    }

    setStroke(pen: IPen | undefined) {
        if (this._context2D) {
            if (pen) {
                this._context2D.strokeStyle = pen.style || '';
                this._context2D.lineCap = pen.lineCap;
                this._context2D.lineJoin = pen.lineJoin;
                this._context2D.miterLimit = pen.miterLimit;
                this._context2D.lineWidth = pen.width * this._strokeWidth;
            } else {
                this._context2D.strokeStyle = '';
                this._context2D.lineWidth = 0;
            }
        }
    }

    setFill(brush: IBrush | undefined, bounds: Bounds2D | undefined = undefined) {
        if (this._context2D) {
            if (brush) {
                if (brush instanceof LinearGradientBrush && bounds) {
                    this._context2D.fillStyle = brush.getRelativeToBounds(bounds) || '';
                } else if (brush.canvasStyle) {
                    this._context2D.fillStyle = brush.canvasStyle;
                }
            } else {
                this._context2D.fillStyle = '';
            }
        }
    }

    private getFontCssString(style: IFontStyle) {
        let str = '';
        str += (style.italic && style.italic === true) ? 'italic ' : '';
        str += (style.fontVariant) ? style.fontVariant + ' ' : '';
        str += (style.bold && style.bold === true) ? '700 ' : ''
        str += style.size + 'px ';
        str += (style.lineHeight && style.lineHeight !== 0) ? '/' + style.lineHeight + ' ' : '';
        str += style.typeface;
        return str;
    }

    drawText(x: number, y: number, text: string, style?: IFontStyle) {
        if (this._context2D) {
            this.saveFont();
            style = style ? style : {
                size: 18,
                color: SolidBrush.SolidBlack,
                typeface: 'serif',
                baseline: CanvasTextBaseline.TOP
            }
            this._context2D.font = this.getFontCssString(style);
            if (style.baseline)
                this._context2D.textBaseline = style.baseline;

            this._context2D.fillStyle = style.color?.cssStyle || SolidBrush.SolidBlack.cssStyle;
            
            this._context2D.fillText(text, x, y);
            this.restoreFont();
        }
    }

    textMetrix(text: string, style?: IFontStyle): TextMetrics | undefined {
        if (this._context2D) {
            style = style ? style : {
                size: 18,
                color: SolidBrush.SolidBlack,
                typeface: 'serif',
                baseline: CanvasTextBaseline.TOP
            }
            this._context2D.font = this.getFontCssString(style);
            if (style.baseline)
                this._context2D.textBaseline = style.baseline;
            return this._context2D.measureText(text);
        }
        return undefined;
    }

    drawImageData(x: number, y: number, imageData: ImageData) {
        if (this._context2D) {
            let transformedPt = this.pointToWorldSpace({ x: x, y: y });
            this._context2D.putImageData(imageData, transformedPt.x, transformedPt.y);
        }
    }

    drawUIText(x: number, y: number, text: string, size: number = 12, font: string = 'Arial', color: IBrush = SolidBrush.SolidBlack): void {
        if (this._context2D) {
            this.saveTransform();
            this.setTransform(1, 0, 0, 1, 0, 0);

            this._context2D.font = size + 'px ' + font;
            this._context2D.textBaseline = 'top';
            this.setFill(color);
            this._context2D.fillText(text, x, y);
            this.restoreTransform();
        }
    }

    setUIDrawing() {
        this.saveTransform();
        this.setTransform(1, 0, 0, 1, 0, 0);
    }

    resetUIDrawing() {
        this.restoreTransform();
    }

    fill() {
        if (this._context2D) {
            this._context2D.fill();
        }
    }

    stroke() {
        if (this._context2D) {
            this._context2D.stroke();
        }
    }

    public startRender(){
        this._frameRequestID = requestAnimationFrame(this.frame.bind(this));
    }

    public stopRender(){
        if(this._frameRequestID) {
            cancelAnimationFrame(this._frameRequestID);
        }
    }

    private start_time?: number;
    private last_time?: number
    private _frameRequestID?: number;

    private render(delta_time: number) {
        this.clear();

        this.drawRenderObjects();

        if(this._onDrawCallback) {
            this._onDrawCallback(delta_time);
        }

        this.updateParticles(delta_time);

        this.setUIDrawing();
        let fps = 1000 / delta_time;
        this.drawText(5, 25, 'fps: ' + fps.toPrecision(4) + ' delta time: ' + delta_time + 'ms');
        this.resetUIDrawing();
    }

    private frame() {
        let now = Date.now();
        if (!this.start_time) this.start_time = now;
        if (!this.last_time) this.last_time = now;
        let delta_time = now - this.last_time;

        // update callback
        if(this._onFrameUpdateCallback) {
            this._onFrameUpdateCallback(delta_time);
        }

        this.render(delta_time);

        if(this._frameRequestID)
            cancelAnimationFrame(this._frameRequestID);

        this.last_time = now;
        this._frameRequestID = requestAnimationFrame(this.frame.bind(this));
    }
}