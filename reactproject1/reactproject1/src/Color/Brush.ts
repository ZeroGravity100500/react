import { Bounds2D } from "../Math/Bounds2D";
import { Color } from "./Color";

export interface IBrush {
    canvasStyle: string | CanvasGradient | CanvasPattern | undefined;
    cssStyle: string;
}

interface GradientStop {
    color: Color;
    index: number; // range 0...1
}

export enum GradientDirection {
    ToRight,
    ToBottom,
    ToLeft,
    ToTop
}

export class SolidBrush implements IBrush {
    canvasStyle: string;
    cssStyle: string;

    constructor(color: Color) {
        this.canvasStyle = color.toRgbString();
        this.cssStyle = color.toString();
    }

    static SolidBlack: SolidBrush = new SolidBrush(new Color('black'));
    static SolidGray: SolidBrush = new SolidBrush(new Color({ r: 128, g: 128, b: 128 }));
    static SolidRed: SolidBrush = new SolidBrush(new Color('red'));
    static SolidBlue: SolidBrush = new SolidBrush(new Color('blue'));
    static SolidGreen: SolidBrush = new SolidBrush(new Color('green'));
}

export class LinearGradientBrush implements IBrush {
    canvasStyle: CanvasGradient | undefined;
    cssStyle: string = '';

    private _context2d: CanvasRenderingContext2D | null | undefined;
    private _stops: GradientStop[] = [];
    private _direction: GradientDirection = GradientDirection.ToRight;

    getRelativeToBounds(bounds: Bounds2D): CanvasGradient | undefined {
        if (this._context2d) {
            let gradient;
            switch (this._direction) {
                default:
                case GradientDirection.ToRight:
                    gradient = this._context2d.createLinearGradient(bounds.minX(), 0, bounds.maxX(), 0);
                    break;
                case GradientDirection.ToBottom:
                    gradient = this._context2d.createLinearGradient(0, bounds.minY(), 0, bounds.maxY());
                    break;
                case GradientDirection.ToLeft:
                    gradient = this._context2d.createLinearGradient(bounds.maxX(), 0, bounds.minX(), 0);
                    break;
                case GradientDirection.ToTop:
                    gradient = this._context2d.createLinearGradient(0, bounds.maxY(), 0, bounds.minY());
                    break;
            }
            if (gradient) {
                for (var i = 0; i < this._stops.length; i++) {
                    gradient.addColorStop(this._stops[i].index, this._stops[i].color.toString());
                }
            }
            return gradient;
        }
        return;
    }

    constructor(context: CanvasRenderingContext2D | null, direction: GradientDirection, stops: GradientStop[]) {
        this._context2d = context;
        this._stops = stops;
        this._direction = direction;
        this.cssStyle = 'linear-gradient(';
        switch (this._direction) {
            default:
            case GradientDirection.ToRight:
                this.cssStyle += 'to right, ';
                break;
            case GradientDirection.ToBottom:
                this.cssStyle += 'to bottom, ';
                break;
            case GradientDirection.ToLeft:
                this.cssStyle += 'to left, ';
                break;
            case GradientDirection.ToTop:
                this.cssStyle += 'to top, ';
                break;
        }
        this.cssStyle += this.getCssStops(stops) + ');';
    }

    private getCssStops(stops: GradientStop[]): string {
        let str: string = '';
        for (let i = 0; i < stops.length; i++) {
            str += stops[i].color.toString() + ' ' + (stops[i].index * 100) + '%';
            if (i !== stops.length - 1) {
                str += ',';
            }
        }
        return str;
    }
}