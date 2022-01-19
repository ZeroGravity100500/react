import { Color } from "./Color";

export interface IPen {
    style: string | CanvasGradient | CanvasPattern | undefined;
    lineDash: ILineDash | undefined;
    lineJoin: CanvasLineJoin;
    lineCap: CanvasLineCap;
    miterLimit: number;
    width: number;
}

export interface ILineDash {
    dash: number[];
    offset: number;
}

export class SolidPen implements IPen {
    public static LINE_JOIN_MITER: CanvasLineJoin = 'miter';
    public static LINE_JOIN_BEVEL: CanvasLineJoin = 'bevel';
    public static LINE_JOIN_ROUND: CanvasLineJoin = 'round';

    public static LINE_CAP_BUTT: CanvasLineCap = 'butt';
    public static LINE_CAP_ROUND: CanvasLineCap = 'round';
    public static LINE_CAP_SQUARE: CanvasLineCap = 'square';

    public width: number;
    public style: string;
    public lineJoin: CanvasLineJoin = SolidPen.LINE_JOIN_MITER;
    public lineCap: CanvasLineCap = SolidPen.LINE_CAP_BUTT;
    public miterLimit: number = 10;
    public lineDash: ILineDash | undefined;

    constructor(color: Color, width?: number, lineJoin?: CanvasLineJoin, lineCap?: CanvasLineCap, miterLimit?: number) {
        this.style = color.toString();
        this.width = width || 1;
        this.lineJoin = lineJoin || SolidPen.LINE_JOIN_MITER;
        this.lineCap = lineCap || SolidPen.LINE_CAP_BUTT;
        this.miterLimit = miterLimit || 10;
    }

    static Black1px: SolidPen = new SolidPen(new Color('black'));
    static Red1px: SolidPen = new SolidPen(new Color('red'));
}

