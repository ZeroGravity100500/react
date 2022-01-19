import { IBrush, SolidBrush } from "../Color/Brush";

export enum FontVariant {
    NONE = 'none',
    NORMAL = 'normal',
    SMALL_CAPS = 'small-caps'
}

export enum CanvasTextBaseline {
    ALPHABETIC = "alphabetic",
    BOTTOM = "bottom",
    HANGING = "hanging",
    IDEOGRAPHIC = "ideographic",
    MIDDLE = "middle",
    TOP = "top"
}

export enum SizeUnits {
    PX = 'px',
    PT = 'pt',
    EM = 'em',
    REM = 'rem',
    EX = 'ex'
}

export interface IFontStyle {
    typeface?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    fontVariant?: FontVariant;
    lineHeight?: number;
    baseline?: CanvasTextBaseline;
    size?: number;
    color?: IBrush;
}

export class CanvasTextRun {
    private _style: IFontStyle;
    text: string = '';
    private _sizeUnits: SizeUnits = SizeUnits.PX;

    constructor() {
        this._style = {
            typeface: 'serif',
            size: 18,
            color: SolidBrush.SolidBlack
        };
    }

    getStyleString(): string {
        let str = '';
        str += (this._style.italic && this._style.italic === true) ? 'italic ' : '';
        str += (this._style.fontVariant) ? this._style.fontVariant + ' ' : '';
        str += (this._style.bold && this._style.bold === true) ? '700 ' : ''
        str += this._style.size + this._sizeUnits + ' ';
        str += (this._style.lineHeight && this._style.lineHeight !== 0) ? '/' + this._style.lineHeight + ' ' : '';
        str += this._style.typeface;
        return str;
    }

    setStyle(s: IFontStyle): void {
        this._style.size = s.size ? s.size : 18;
        this._style.typeface = s.typeface ? s.typeface : 'serif';
        this._style.color = s.color ? s.color : SolidBrush.SolidBlack;
        this._style.baseline = s.baseline;
        this._style.bold = s.bold;
        this._style.fontVariant = s.fontVariant;
        this._style.italic = s.italic;
        this._style.lineHeight = s.lineHeight;
        this._style.underline = s.underline;
    }
}

export class CanvasTextParagraph {
    runs: CanvasTextRun[] = [];

    insertRun(r: CanvasTextRun, index: number) {
        this.runs.splice(index, 0, r);
    }

    addRun(r: CanvasTextRun) {
        this.runs.push(r);
    }
}