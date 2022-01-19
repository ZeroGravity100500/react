import React from 'react';
import { GradientDirection, IBrush, LinearGradientBrush, SolidBrush } from '../Color/Brush';
import { IPen, SolidPen } from '../Color/Pen';
import { Vec2D, Vector2D } from '../Math/Vec2D';
import { Path2D, Segment2DType, IShape2D, Segment2D, isShape2DEditable } from '../Geom/Path2D';
import './css/CanvasComponent.css'
import { pointInCircle, pointToAngle } from '../Math/mmath';
import { AffineTransform } from '../Math/AffineTransform';
import { Color } from '../Color/Color';
import { Line2D } from '../Geom/Animation/Line2D';
import { CubicCurve2D, QuadCurve2D } from '../Geom/Animation/Curve2D';
import * as Interpolators from '../Geom/Animation/Interpolators/TimeInterpolator';
import { Animation, IAnimatedValue } from '../Geom/Animation/Animation';
import { ImageLoader } from '../Render/Image/ImageLoader';
import { ImageLib64 } from '../Render/Image/ImageLib';
import { IPointerEvent, PointerController } from './PointerController';
import { PathAnimation2D } from '../Geom/Animation/Path2DAnimation';
import { CanvasRender } from '../Render/CanvasRender';
import { CanvasParticle } from '../Render/Image/CanvasParticle';
import { CircleShape, CT_CustomGeometry2D, PresetShapesList, RoundRectShape } from '../Geom/Shapes2D';
import { sunStr } from '../Geom/sun';
import { Rect2D } from '../Geom/Animation/Rect2D';
import { threadId } from 'worker_threads';

interface CanvasProperties {
    width: number;
    height: number;
    stroke: IPen | undefined;
    fill: IBrush | undefined;
}

enum VirtualLineType {
    VLT_NONE,
    VLT_LINE,
    VLT_ARCTO,
    VLT_CUBIC,
    VLT_QUAD
}

export interface IRenderShape {
    shape: IShape2D;
    stroke: boolean;
    fill: boolean;
    transform?: AffineTransform;
    strokeStyle?: IPen;
    fillStyle?: IBrush;
}

export class CanvasComponent extends React.Component<CanvasProperties> {
    private _cRef = React.createRef<HTMLCanvasElement>();
    private _frameRequestID: any;

    private _width: number
    private _height: number;
    private _context2d: CanvasRenderingContext2D | null;

    private _cursorPoint: Vec2D = new Vec2D();

    private _inDrawingMode: boolean = false;

    private _drawLineType: VirtualLineType = VirtualLineType.VLT_LINE;

    private _cursorPen: IPen = SolidPen.Red1px;
    private _strokePen: IPen | undefined;
    private _fillBrush: IBrush | undefined;
    private _path: Path2D = new Path2D();

    private static LOOK_RADIUS = 10;

    private static LOGO_PATH = 'M 4 8 L 10 1 L 13 0 L 12 3 L 5 9 C 6 10 6 11 7 10 C 7 11 8 12 7 12 A 1.42 1.42 0 0 1 6 13 A 5 5 0 0 0 4 10 Q 3.5 9.9 3.5 10.5 T 2 11.8 T 1.2 11 T 2.5 9.5 T 3 9 A 5 5 90 0 0 0 7 A 1.42 1.42 0 0 1 1 6 C 1 5 2 6 3 6 C 2 7 3 7 4 8 M 10 1 L 10 3 L 12 3 L 10.2 2.8 L 10 1';

    private _renderBuffer: IRenderShape[] = new Array<IRenderShape>();

    private _pointerController: PointerController | null = null;
    private _dragStartPt: Vec2D | null = null;
    private _dragged: boolean = false;
    private _render: CanvasRender | null = null;

    // ================================================== Temp class globals =================================================
    private _scale: number = 1.0;
    private _framesCount: number = 0;
    private _timeTotal: number = 0;

    private _activePath: Path2D | null = null;
    private _activePathTransform: AffineTransform | null = null;
    private _activeCurve: Segment2D | null = null;
    private _pointOver: Vector2D | null = null;
    private clockwise: boolean = true;

    // ================================================== Constructor ========================================================
    constructor(props: CanvasProperties) {
        super(props);
        this._width = props.width;
        this._height = props.height;
        this._context2d = null;

        this._strokePen = props.stroke;
        this._fillBrush = props.fill;
    }

    //=================================================== CUSTOM EVENTS ===============================================
    private static CANVAS_INIT: string = 'init';

    private createEvent(type: string, params: any | undefined = undefined): CustomEvent {
        return new CustomEvent(type, { detail: params });
    }

    private emitEvent(event: CustomEvent) {
        if (this._cRef.current) {
            this._cRef.current.dispatchEvent(event);
        }
    }

    private addEventListener(type: string, listener: any) {
        if (this._cRef.current) {
            listener = listener.bind(this);
            this._cRef.current.addEventListener(type, listener);
        }
    }

    private removeEventListener(type: string, listener: any) {
        if (this._cRef.current) {
            this._cRef.current.removeEventListener(type, listener);
        }
    }

    // ======================================================== Drawings ========================================================================
    drawCursor() {
        if (!this._render && !this._inDrawingMode)
            return;
        if (this._path.numSegments() && this._drawLineType !== VirtualLineType.VLT_NONE) {
            this._render?.setStroke(this._cursorPen);
            let tp = this._render?.pointToWorldSpace(this._cursorPoint) as Vec2D;
            let lp = this._path.getCurrentPoint() || new Vec2D();
            switch (this._drawLineType) {
                case VirtualLineType.VLT_LINE:
                    this._render?.setStroke(SolidPen.Red1px);
                    this._render?.drawLine(lp, tp);
                    break;
                case VirtualLineType.VLT_ARCTO:
                    this._render?.setStroke(SolidPen.Red1px);
                    let center = tp.lerp(lp, 0.5);
                    let radius = center.dist(lp);
                    // let width = tp.sub(lp).length();
                    // let height = tp.lerp(lp, 0.5).length();
                    // let radius2 = (height / 2) + (width * width) / (height * 8);
                    let startAngle = pointToAngle(center, lp);
                    let endAngle = pointToAngle(center, tp);
                    this._render?.strokeArc(center, radius, startAngle, endAngle, !this.clockwise);
                    break;
            }
        }
    }

    private activeSegmentBrush = new SolidBrush(new Color({ r: 33, g: 150, b: 243, a: 1 }));
    private activeSegmentPen = new SolidPen(new Color(this.activeSegmentBrush.cssStyle), 1);

    private activeSegmentControlBrush = new SolidBrush(new Color({ r: 86, g: 86, b: 86, a: 1 }));
    private activeSegmentControlPen = new SolidPen(new Color(this.activeSegmentControlBrush.cssStyle), 0.5);

    drawActiveCurve(type: Segment2DType, buffer: Vector2D[]) {
        // segments has start, end and all control points
        const pointSize = 5;
        switch (type) {
            case Segment2DType.SEG_MOVETO:
                this._render?.setFill(this.activeSegmentBrush);
                this._render?.drawPoint({ x: buffer[0].x, y: buffer[0].y }, pointSize);
                break;
            case Segment2DType.SEG_LINETO:
                this._render?.setStroke(this.activeSegmentPen);
                this._render?.drawLine({ x: buffer[0].x, y: buffer[0].y }, { x: buffer[1].x, y: buffer[1].y });
                this._render?.setFill(this.activeSegmentControlBrush);
                this._render?.drawPoint({ x: buffer[0].x, y: buffer[0].y }, pointSize);
                this._render?.setFill(this.activeSegmentBrush);
                this._render?.drawPoint({ x: buffer[1].x, y: buffer[1].y }, pointSize);
                break;
            case Segment2DType.SEG_QUADTO:
                this._render?.setFill(this.activeSegmentControlBrush);
                this._render?.setStroke(this.activeSegmentControlPen);
                this._render?.drawPoint({ x: buffer[0].x, y: buffer[0].y }, pointSize);
                this._render?.drawLine({ x: buffer[0].x, y: buffer[0].y }, { x: buffer[1].x, y: buffer[1].y })

                this._render?.drawPoint({ x: buffer[1].x, y: buffer[1].y }, pointSize);
                this._render?.drawLine({ x: buffer[1].x, y: buffer[1].y }, { x: buffer[2].x, y: buffer[2].y })

                this._render?.setStroke(this.activeSegmentPen);
                this._render?.strokeQuadCurve(buffer);
                this._render?.drawPoint({ x: buffer[2].x, y: buffer[2].y }, pointSize);
                break;
            case Segment2DType.SEG_CUBICTO:
                this._render?.setFill(this.activeSegmentBrush);
                this._render?.drawPoint({ x: buffer[0].x, y: buffer[0].y }, pointSize);
                this._render?.setStroke(this.activeSegmentPen);
                this._render?.strokeCubicCurve(buffer);
                this._render?.drawPoint({ x: buffer[3].x, y: buffer[3].y }, pointSize);

                this._render?.setFill(this.activeSegmentControlBrush);
                this._render?.setStroke(this.activeSegmentControlPen);
                // draw cp1
                this._render?.drawLine({ x: buffer[0].x, y: buffer[0].y }, { x: buffer[1].x, y: buffer[1].y })
                this._render?.drawPoint({ x: buffer[1].x, y: buffer[1].y }, pointSize);

                //draw cp2
                this._render?.drawLine({ x: buffer[3].x, y: buffer[3].y }, { x: buffer[2].x, y: buffer[2].y })
                this._render?.drawPoint({ x: buffer[2].x, y: buffer[2].y }, pointSize);

                break;
        }
    }

    private animQuad: QuadCurve2D = new QuadCurve2D(500, 50, 0, 550, 500, 550);
    private animLineS: Line2D = new Line2D(500, 50, 0, 550);
    // private animCubic: CubicCurve2D = new CubicCurve2D(500, 50, -303.342, 52.286, 621.342, 350.345, 363.181, 662.484);
    private animCubic: CubicCurve2D = new CubicCurve2D(657.594, 548.533, -63.418, 494.93, 590.804, 38.041, 363.181, 662.484);
    private interpolator = new Interpolators.BounceInterpolator();
    private at: number = 0;
    private imageData: ImageData | undefined;

    private anim1 = new Animation();
   
    private pathAnim = new PathAnimation2D();

    test() {
        this.anim1.setAnimator(this.pathAnim);
        this.anim1.setInterpolator(this.interpolator);
        if (this._path.numSegments() > 1) {
            this.pathAnim.clear();
            let segs = this._path.asSegmentArray(null);
            for (let i = 0; i < segs.length; i++) {
                this.pathAnim.addCurve(segs[i]);
            }
        } else {
            let s = this.animQuad.asSegmentArray(null)[0];
            this.pathAnim.clear();
            this.pathAnim.addCurve({
                type: s.type,
                segmentIndex: s.segmentIndex,
                pathRef: s.pathRef,
                coords: s.coords.reverse()
            });
            s = this.animCubic.asSegmentArray(null)[0];
            this.pathAnim.addCurve(s);
        }

        // let star = new Star5Shape(100, 100);
        // this._render?.addToRenderBuffer({
        //     shape: star,
        //     fill: false,
        //     stroke: true,
        //     transform: AffineTransform.createIdentityTransform()
        // });

        // let formula = PresetShapesList.instance().getPreset('ellipseRibbon');
        // if(formula) {
        //     let list = formula.solveFor(new Rect2D(20, 20, 500, 500));
        //     console.log(list);
        //     list.forEach((path) => {
        //         this._render?.addToRenderBuffer({
        //             shape: path.path2D,
        //             fill: false,
        //             stroke: true,
        //             transform: AffineTransform.createIdentityTransform()
        //         });
        //     });
        // }

        // let reg = /[mMlLcCaAzZ]/gm;
        // let ret = reg.exec(CanvasComponent.LOGO_PATH);
        // while(ret) {
        //     console.log(ret);
        //     ret = reg.exec(CanvasComponent.LOGO_PATH);
        // }
        // var parsedPath = Path2D.subpathArrayFromSvgPath(CanvasComponent.LOGO_PATH);
        // console.log(parsedPath);
        
        // this._render?.addParticle(new CanvasParticle(Math.random() * this._width, Math.random() * 20, 5));
    }

    updateCanvas(delta: number) {
        if (this._render) {
            // if (this.imageData) {
            //     this._render.drawImageData(20, 200, this.imageData);
            // }

            this.drawShape({ shape: this._path, stroke: true, fill: false });

            if (this._inDrawingMode) {
                this.drawCursor();
            } else if (this._activeCurve) {
                this.drawActiveCurve(this._activeCurve.type, this._activeCurve.coords);
            }

            // let time = this.interpolator.getInterpolation(this.at);

            // this._render.drawPath(this.animLineS, true, false);
            // this.drawPoint(this.animLineS.getAnimationValue(time), 5);

            // this._render.drawPath(this.animQuad, true, false);
            // this.drawPoint(this.animLine.getAnimationValue(time), 5);

            this._render.drawPath(this.animCubic, true, false);

            let point: IAnimatedValue = {
                value: undefined
            };
             this.anim1.getTransformation(Date.now(), point);
             if (point.value)
                 this._render.drawPoint(point.value, 5);
            //else {
            //    console.log('wrong');
            //}

            this.at += delta / 3000;
            if (this.at > 1) {
                this.at = 0;
            }

            this._render.setUIDrawing();
            this._render.drawText(5, 10, 'cursor: ' + this._cursorPoint.x + ' ' + this._cursorPoint.y);

            this._render.resetUIDrawing();

            this._framesCount++;
        }
    }

    drawShape(shape: IRenderShape) {
        if (this._render) {
            this._render.setFill(shape.fillStyle, shape.shape.bounds2D());
            this._render.setStroke(shape.strokeStyle);
            this._render.drawPath(shape.shape, shape.stroke, shape.fill, shape.transform);
        }
    }

    onClick(e: React.MouseEvent) {
        e.preventDefault();
        if (this._inDrawingMode) {
            let trPt = this._render?.pointToWorldSpace(this._cursorPoint) as Vec2D;
            if (!this._path.numSegments()) {
                this._path.moveTo(trPt);
            } else {
                if (this._drawLineType === VirtualLineType.VLT_LINE) {
                    this._path.lineTo(trPt);
                } else if (this._drawLineType === VirtualLineType.VLT_ARCTO) {
                    let lp = this._path.getCurrentPoint() || new Vec2D();
                    let cp = trPt;
                    let center = cp.lerp(lp, 0.5);
                    let radius = center.dist(lp);
                    let sAngle = pointToAngle(center, lp);
                    let eAngle = pointToAngle(center, trPt);
                    this._path.arc(center, radius, radius, sAngle, eAngle, !this.clockwise);
                }
            }
        }
    }

    onRightClick(e: React.MouseEvent) {
        e.preventDefault();
        console.log(this._render?.textMetrix('test'));
    }

    onKeyPress(e: any) {
        let ev = e as KeyboardEvent;
        switch (ev.code) {
            case 'KeyN':
                this._renderBuffer = new Array<IRenderShape>();
                break;
            case 'KeyA':
                if (this._inDrawingMode)
                    this.clockwise = !this.clockwise;
                else {
                    this.anim1.initialize();
                    this.anim1.setDuration(5000);
                    this.anim1.setRepeatCount(Animation.INFINITE);
                    this.anim1.setRepeatMode(Animation.REVERSE);
                    this.anim1.setAnimator(this.animCubic);
                    this.anim1.startNow();
                }
                break;
            case 'KeyR':
                let rect = new RoundRectShape(Math.random() * 100, Math.random() * 100, 100, 60);
                let color = Color.random();
                    let gradient = new LinearGradientBrush(this._context2d, GradientDirection.ToRight, [
                        { index: 0, color: color },
                        { index: 0.5, color: new Color("white") },
                        { index: 1, color: color }
                    ]);

                    this._render?.addToRenderBuffer({
                         shape: rect,
                         stroke: false, 
                         fill: true, 
                         transform: AffineTransform.createIdentityTransform(), 
                         brush: gradient
                        });
                break;
            case 'KeyZ':
                this._inDrawingMode = false;
                if (this._path.numCoords()) {
                    this._path.closePath();
                    this._render?.addToRenderBuffer({shape: this._path, stroke: true, fill: false, transform: AffineTransform.createIdentityTransform() });
                    this._path = new Path2D();
                }
                break;
            case 'KeyD':
                this._inDrawingMode = !this._inDrawingMode;
                break;
            case 'KeyC':
                if (this._inDrawingMode) {
                    if (this._drawLineType === VirtualLineType.VLT_LINE)
                        this._drawLineType = VirtualLineType.VLT_ARCTO;
                    else
                        this._drawLineType = VirtualLineType.VLT_LINE;
                } else {
                    let circle = new CircleShape(Math.random() * 100, Math.random() * 100, 50);
                    let color = Color.random();
                    let gradient = new LinearGradientBrush(this._context2d, GradientDirection.ToRight, [
                        { index: 0, color: color },
                        { index: 0.5, color: new Color("white") },
                        { index: 1, color: color }
                    ]);

                    this._render?.addToRenderBuffer({ shape: circle, stroke: false, fill: true, transform: AffineTransform.createIdentityTransform(), brush: gradient });
                }
                break;
            case 'KeyP':
                var parsedPath = Path2D.fromSvgPath(CanvasComponent.LOGO_PATH);
                var tr = AffineTransform.createIdentityTransform();
                tr.translate({ x: 10, y: 10 });
                tr.scale(30, 30);
                this._render?.addToRenderBuffer({ shape: parsedPath, stroke: true, fill: true, pen: SolidPen.Black1px, brush: SolidBrush.SolidGray, transform: tr});
                //this._activePath = parsedPath;
                //this._activePathTransform = tr;
                break;
            case 'KeyT':
                this.test();
                break;
            case 'KeyL':
                let imgLoader = new ImageLoader(ImageLib64.CHAOS_STAR, this.imageLoaded.bind(this));
                break;
            case 'NumpadAdd':
                let scale = Math.pow(1.005, 0.01);
                this._render?.zoomViewPort(this._cursorPoint, scale);
                break;
            case 'NumpadSubtract':
                scale = Math.pow(1.005, -0.01);
                this._render?.zoomViewPort(this._cursorPoint, scale);
                break;
            default:
                console.log(ev.code);
                break;
        }
    }

    imageLoaded(loader: ImageLoader) {
        let pixelData = loader.pixelArray();
        if(pixelData){
            let particles = [];
            for(let y = 0; y < pixelData.height; y+=2) {
                for(let x = 0; x < pixelData.width; x+=2) {
                    if(pixelData.data[y * pixelData.width + x].isDark()) {
                        particles.push(new CanvasParticle(x, y));
                    }
                }
            }
            console.log(particles.length);
            for(let i in particles) {
                this._render?.addParticle(particles[i]);
            }
        }
    }

    componentDidMount() {
        if (this._cRef.current) {
            this.addEventListener(CanvasComponent.CANVAS_INIT, this.onInitCanvas);
        }
        this.emitEvent(this.createEvent(CanvasComponent.CANVAS_INIT));

        // Misc test
        //this.setUpAnim();
    }

    onInitCanvas(e: any) {
        if (this._cRef.current) {
            this._pointerController = new PointerController(this._cRef.current);
            this.addEventListener(PointerController.POINTER_EVENT, this.onControllerInput);

            this._context2d = this._cRef.current.getContext("2d");
            if (this._context2d) {
                this._render = new CanvasRender(this._context2d, this.onFrameUpdate.bind(this), this.updateCanvas.bind(this));
                this._render.startRender();
            }
        }
    }

    onFrameUpdate(delta: number): void {

    }

    onControllerInput(event: CustomEvent) {
        let pe: IPointerEvent = event.detail;
        this._cursorPoint = pe.point as Vec2D;
        this._dragged = true;
        if (this._dragStartPt) {
            this._render?.translateViewPort(this._cursorPoint.x - this._dragStartPt.x, this._cursorPoint.y - this._dragStartPt.y);
        }
        if (this._activeCurve && this._pointOver && pe.left_button_down && !this._inDrawingMode) {
            //To-Do: update segment point coords
            //check if point steel valid
            if(pointInCircle(this._pointOver, this._render?.pointToWorldSpace(this._cursorPoint) || {x: 0, y: 0}, CanvasComponent.LOOK_RADIUS * (this._render?.getScaleFactor() || 1)))
                if (isShape2DEditable(this._activeCurve.pathRef)) {
                    let vIdx = this._activeCurve.coords.indexOf(this._pointOver);
                    let trVec = this._render?.pointToWorldSpace(this._cursorPoint);
                    if (trVec)
                        this._activeCurve.pathRef.setVectorPosition(this._activeCurve.segmentIndex, vIdx, { x: trVec.x, y: trVec.y });
                }
        }

        if (pe.middle_button_down) {
            this._dragStartPt = this._cursorPoint as Vec2D;
            this._dragged = false;
        } else {
            this._dragStartPt = null;
        }
        if (pe.wheel !== 0) {
            const scale = Math.pow(1.005, pe.wheel / 10);
            this._render?.zoomViewPort(this._cursorPoint, scale);
            //this._render?.zoomViewPort(this._cursorPoint, pe.wheel);
        }

        let hit = this.checkRenderQueue(this._render?.pointToWorldSpace(this._cursorPoint) || new Vec2D());
        if (hit) {
            this._activeCurve = hit;
        }
    }

    checkRenderQueue(point: Vector2D): Segment2D | null {
        let array = this._path.asSegmentArray();
        for (let i = 0; i < array.length; i++) {
            let hit = this.checkPoints(point, array[i].coords);
            if (hit) {
                this._pointOver = hit;
                return array[i];
            }
        }

        for (let i = 0; i < this._renderBuffer.length; i++) {
            let segments = this._renderBuffer[i].shape.asSegmentArray(this._renderBuffer[i].transform);
            for (let j = 0; j < segments.length; j++) {
                let hit = this.checkPoints(point, segments[j].coords);
                if (hit) {
                    this._pointOver = hit;
                    return segments[j];
                }
            }
        }
        return null;
    }

    checkPoints(point: Vector2D, coords: Vector2D[]): Vector2D | null {
        for (let i = 0; i < coords.length; i++) {
            if (pointInCircle(coords[i], point, CanvasComponent.LOOK_RADIUS * (this._render?.getScaleFactor() || 1))) {
                return coords[i];
            }
        }
        return null;
    }

    componentWillUnmount() {
        if (this._cRef.current) {
            cancelAnimationFrame(this._frameRequestID);

            this.removeEventListener(PointerController.POINTER_EVENT, this.onControllerInput);
            this._pointerController?.destroy();

            //must be removed already, but shit happens
            this.removeEventListener(CanvasComponent.CANVAS_INIT, this.onInitCanvas);
        }
        this._context2d = null;
    }

    render() {
        return <canvas
            ref={this._cRef}
            width={this._width}
            height={this._height}
            className={'CanvasComponent'}
            tabIndex={1}

            onClick={this.onClick.bind(this)}
            onContextMenu={this.onRightClick.bind(this)}
            onKeyPress={this.onKeyPress.bind(this)}
        />
    }

    public static defaultProps: CanvasProperties = {
        width: 100,
        height: 100,
        stroke: SolidPen.Black1px,
        fill: SolidBrush.SolidBlack
    };
}

