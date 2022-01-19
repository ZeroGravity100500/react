interface Dictionary {
    [key: string]: any;
}

interface ColorObject {
    r?: number;
    g?: number;
    b?: number;
    a?: number;
    format?: string;
    h?: number;
    s?: number;
    v?: number;
    l?: number;
    ok?: boolean;
}

export interface RgbColor {
    r: number;
    g: number;
    b: number;
    a?: number;
}

export interface HsvColor {
    h: number;
    s: number;
    v: number;
    a?: number;
}

export interface HslColor {
    h: number;
    s: number;
    l: number;
    a?: number;
}

export class Color {
    protected _color: string = '';
    protected _originalInput: any;
    protected _r: number | undefined;
    protected _g: number | undefined;
    protected _b: number | undefined;
    protected _a: number | undefined;
    protected _roundA: number | undefined;
    protected _format: string | undefined;
    protected _ok: boolean | undefined;

    protected static trimLeft: RegExp = /^\s+/;
    protected static trimRight: RegExp = /\s+$/;

    protected static names: Dictionary = {
        aliceblue: "f0f8ff",
        antiquewhite: "faebd7",
        aqua: "0ff",
        aquamarine: "7fffd4",
        azure: "f0ffff",
        beige: "f5f5dc",
        bisque: "ffe4c4",
        black: "000",
        blanchedalmond: "ffebcd",
        blue: "00f",
        blueviolet: "8a2be2",
        brown: "a52a2a",
        burlywood: "deb887",
        burntsienna: "ea7e5d",
        cadetblue: "5f9ea0",
        chartreuse: "7fff00",
        chocolate: "d2691e",
        coral: "ff7f50",
        cornflowerblue: "6495ed",
        cornsilk: "fff8dc",
        crimson: "dc143c",
        cyan: "0ff",
        darkblue: "00008b",
        darkcyan: "008b8b",
        darkgoldenrod: "b8860b",
        darkgray: "a9a9a9",
        darkgreen: "006400",
        darkgrey: "a9a9a9",
        darkkhaki: "bdb76b",
        darkmagenta: "8b008b",
        darkolivegreen: "556b2f",
        darkorange: "ff8c00",
        darkorchid: "9932cc",
        darkred: "8b0000",
        darksalmon: "e9967a",
        darkseagreen: "8fbc8f",
        darkslateblue: "483d8b",
        darkslategray: "2f4f4f",
        darkslategrey: "2f4f4f",
        darkturquoise: "00ced1",
        darkviolet: "9400d3",
        deeppink: "ff1493",
        deepskyblue: "00bfff",
        dimgray: "696969",
        dimgrey: "696969",
        dodgerblue: "1e90ff",
        firebrick: "b22222",
        floralwhite: "fffaf0",
        forestgreen: "228b22",
        fuchsia: "f0f",
        gainsboro: "dcdcdc",
        ghostwhite: "f8f8ff",
        gold: "ffd700",
        goldenrod: "daa520",
        gray: "808080",
        green: "008000",
        greenyellow: "adff2f",
        grey: "808080",
        honeydew: "f0fff0",
        hotpink: "ff69b4",
        indianred: "cd5c5c",
        indigo: "4b0082",
        ivory: "fffff0",
        khaki: "f0e68c",
        lavender: "e6e6fa",
        lavenderblush: "fff0f5",
        lawngreen: "7cfc00",
        lemonchiffon: "fffacd",
        lightblue: "add8e6",
        lightcoral: "f08080",
        lightcyan: "e0ffff",
        lightgoldenrodyellow: "fafad2",
        lightgray: "d3d3d3",
        lightgreen: "90ee90",
        lightgrey: "d3d3d3",
        lightpink: "ffb6c1",
        lightsalmon: "ffa07a",
        lightseagreen: "20b2aa",
        lightskyblue: "87cefa",
        lightslategray: "789",
        lightslategrey: "789",
        lightsteelblue: "b0c4de",
        lightyellow: "ffffe0",
        lime: "0f0",
        limegreen: "32cd32",
        linen: "faf0e6",
        magenta: "f0f",
        maroon: "800000",
        mediumaquamarine: "66cdaa",
        mediumblue: "0000cd",
        mediumorchid: "ba55d3",
        mediumpurple: "9370db",
        mediumseagreen: "3cb371",
        mediumslateblue: "7b68ee",
        mediumspringgreen: "00fa9a",
        mediumturquoise: "48d1cc",
        mediumvioletred: "c71585",
        midnightblue: "191970",
        mintcream: "f5fffa",
        mistyrose: "ffe4e1",
        moccasin: "ffe4b5",
        navajowhite: "ffdead",
        navy: "000080",
        oldlace: "fdf5e6",
        olive: "808000",
        olivedrab: "6b8e23",
        orange: "ffa500",
        orangered: "ff4500",
        orchid: "da70d6",
        palegoldenrod: "eee8aa",
        palegreen: "98fb98",
        paleturquoise: "afeeee",
        palevioletred: "db7093",
        papayawhip: "ffefd5",
        peachpuff: "ffdab9",
        peru: "cd853f",
        pink: "ffc0cb",
        plum: "dda0dd",
        powderblue: "b0e0e6",
        purple: "800080",
        rebeccapurple: "663399",
        red: "f00",
        rosybrown: "bc8f8f",
        royalblue: "4169e1",
        saddlebrown: "8b4513",
        salmon: "fa8072",
        sandybrown: "f4a460",
        seagreen: "2e8b57",
        seashell: "fff5ee",
        sienna: "a0522d",
        silver: "c0c0c0",
        skyblue: "87ceeb",
        slateblue: "6a5acd",
        slategray: "708090",
        slategrey: "708090",
        snow: "fffafa",
        springgreen: "00ff7f",
        steelblue: "4682b4",
        tan: "d2b48c",
        teal: "008080",
        thistle: "d8bfd8",
        tomato: "ff6347",
        turquoise: "40e0d0",
        violet: "ee82ee",
        wheat: "f5deb3",
        white: "fff",
        whitesmoke: "f5f5f5",
        yellow: "ff0",
        yellowgreen: "9acd32"
    };

    protected static hexNames: Dictionary = Color.flip(Color.names);

    private static flip(o: any): any {
        var flipped: Dictionary = {};
        for (var i in o) {
            if (o.hasOwnProperty(i)) {
                flipped[o[i]] = i;
            }
        }
        return flipped;
    }

    constructor(color: string);
    constructor(color: ColorObject);
    //constructor(color: { r: number, g: number, b: number, a?: number });
    //constructor(color: { h: number, s: number, l: number, a?: number });
    //constructor(color: { h: number, s: number, v: number, a?: number });
    constructor(color?: any) {
        if (color) {
            var rgb = this.inputToRGB(color);
            this._originalInput = color;
            this._r = rgb.r;
            this._g = rgb.g;
            this._b = rgb.b;
            this._a = rgb.a;
            if (this._a)
                this._roundA = Math.round(100 * this._a) / 100;
            this._format = rgb.format;
            if (this._r && this._r < 1) { this._r = Math.round(this._r); }
            if (this._g && this._g < 1) { this._g = Math.round(this._g); }
            if (this._b && this._b < 1) { this._b = Math.round(this._b); }

            this._ok = rgb.ok;
        }
    }

    isValid(): boolean {
        return this._ok === true;
    }

    isDark(): boolean {
        return this.getBrightness() < 128;
    }

    isLight(): boolean {
        return !this.isDark();
    } 

    getStringValue() {
        return this._color;
    }

    getBrightness(): number {
        //http://www.w3.org/TR/AERT#color-contrast
        let rgb = this.toRgb();
        return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    }

    getLuminance(): number {
        //http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
        let rgb = this.toRgb();
        let RsRGB, GsRGB, BsRGB, R, G, B;
        RsRGB = rgb.r/255;
        GsRGB = rgb.g/255;
        BsRGB = rgb.b/255;

        if (RsRGB <= 0.03928) {R = RsRGB / 12.92;} else {R = Math.pow(((RsRGB + 0.055) / 1.055), 2.4);}
        if (GsRGB <= 0.03928) {G = GsRGB / 12.92;} else {G = Math.pow(((GsRGB + 0.055) / 1.055), 2.4);}
        if (BsRGB <= 0.03928) {B = BsRGB / 12.92;} else {B = Math.pow(((BsRGB + 0.055) / 1.055), 2.4);}
        return (0.2126 * R) + (0.7152 * G) + (0.0722 * B);
    }

    setColor(color: string): void;
    setColor(color: ColorObject): void;
    //setColor(color: { h: number, s: number, l: number, a?: number }): void;
    //setColor(color: { h: number, s: number, v: number, a?: number }): void;
    //setColor(color: { h: number, s: number, v: number, a?: number }): void;
    setColor(color: any): void {
        if (color) {
            var rgb = this.inputToRGB(color);
            this._originalInput = color;
            this._r = rgb.r;
            this._g = rgb.g;
            this._b = rgb.b;
            this._a = rgb.a;
            if (this._a)
                this._roundA = Math.round(100 * this._a) / 100;
            this._format = rgb.format;
            if (this._r && this._r < 1) { this._r = Math.round(this._r); }
            if (this._g && this._g < 1) { this._g = Math.round(this._g); }
            if (this._b && this._b < 1) { this._b = Math.round(this._b); }

            this._ok = rgb.ok;
        }
    }

    private parseIntFromHex(val: string): number {
        return parseInt(val, 16);
    }
    private convertHexToDecimal(h: string): number {
        return (this.parseIntFromHex(h) / 255);
    }
    private convertDecimalToHex(d: string): string {
        return Math.round(parseFloat(d) * 255).toString(16);
    }

    private isValidCSSUnit(color: any): boolean{
        var matchers = this.matchers() as Dictionary;
        return !!matchers.CSS_UNIT.exec(color);
    }

    private rgbToRgb(r: number, g: number, b: number): any {
        return {
            r: this.bound01(r, 255) * 255,
            g: this.bound01(g, 255) * 255,
            b: this.bound01(b, 255) * 255
        };
    }

    private hsvToRgb(h: any, s: any, v: any): RgbColor {
       h = this.bound01(h, 360) * 6;
       s = this.bound01(s, 100);
       v = this.bound01(v, 100);

       var i = Math.floor(h),
           f = h - i,
           p = v * (1 - s),
           q = v * (1 - f * s),
           t = v * (1 - (1 - f) * s),
           mod = i % 6,
           r = [v, q, p, p, t, v][mod],
           g = [t, v, v, q, p, p][mod],
           b = [p, p, t, v, v, q][mod];

       return { r: r * 255, g: g * 255, b: b * 255 };
    }

    private hslToRgb(h: any, s: any, l: any): RgbColor {
        var r, g, b;

        h = this.bound01(h, 360);
        s = this.bound01(s, 100);
        l = this.bound01(l, 100);

        function hue2rgb(p: any, q: any, t: any) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

    // `rgbToHex`
    // Converts an RGB color to hex
    // Assumes r, g, and b are contained in the set [0, 255]
    // Returns a 3 or 6 character hex
    private rgbToHex(r: number, g: number, b: number, allow3Char?: boolean): string {
        var hex = [
            this.pad2(Math.round(r).toString(16)),
            this.pad2(Math.round(g).toString(16)),
            this.pad2(Math.round(b).toString(16))
        ];

        // Return a 3 character hex if possible
        if (allow3Char && hex[0].charAt(0) === hex[0].charAt(1) && hex[1].charAt(0) === hex[1].charAt(1) && hex[2].charAt(0) === hex[2].charAt(1)) {
            return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
        }

        return hex.join("");
    }

    // `rgbaToHex`
    // Converts an RGBA color plus alpha transparency to hex
    // Assumes r, g, b are contained in the set [0, 255] and
    // a in [0, 1]. Returns a 4 or 8 character rgba hex
    private rgbaToHex(r: number, g: number, b: number, a: number, allow4Char?: boolean): string {

        var hex = [
            this.pad2(Math.round(r).toString(16)),
            this.pad2(Math.round(g).toString(16)),
            this.pad2(Math.round(b).toString(16)),
            this.pad2(this.convertDecimalToHex('' + a))
        ];

        // Return a 4 character hex if possible
        if (allow4Char && hex[0].charAt(0) === hex[0].charAt(1) && hex[1].charAt(0) === hex[1].charAt(1) && hex[2].charAt(0) === hex[2].charAt(1) && hex[3].charAt(0) === hex[3].charAt(1)) {
            return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0) + hex[3].charAt(0);
        }

        return hex.join("");
    }
    // `rgbToHsv`
    // Converts an RGB color value to HSV
    // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
    // *Returns:* { h, s, v } in [0,1]
    private rgbToHsv(r: number, g: number, b: number): HsvColor {

        r = this.bound01(r, 255);
        g = this.bound01(g, 255);
        b = this.bound01(b, 255);

        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h = 0, s, v = max;

        var d = max - min;
        s = max === 0 ? 0 : d / max;

        if (max === min) {
            h = 0; // achromatic
        }
        else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h, s: s, v: v };
    }
    // `rgbToHsl`
    // Converts an RGB color value to HSL.
    // *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
    // *Returns:* { h, s, l } in [0,1]
    private rgbToHsl(r: number, g: number, b: number): HslColor {

        r = this.bound01(r, 255);
        g = this.bound01(g, 255);
        b = this.bound01(b, 255);

        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h = 0, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        }
        else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return { h: h, s: s, l: l };
    }

    private isOnePointZero(n: any): boolean {
        return typeof n === "string" && n.indexOf('.') !== -1 && parseFloat(n) === 1;
    }
    private pad2(c: string): string {
        return c.length === 1 ? '0' + c : '' + c;
    }
    private isPercentage(n: any): boolean {
        return typeof n === "string" && n.indexOf('%') !== -1;
    }

    // Take input from [0, n] and return it as [0, 1]
    private bound01(n: any, max: number): number {
        if (this.isOnePointZero(n)) { n = "100%"; }

        var processPercent = this.isPercentage(n);
        n = Math.min(max, Math.max(0, parseFloat(n)));

        // Automatically convert percentage into number
        if (processPercent) {
            n = parseInt('' + n * max, 10) / 100;
        }

        // Handle floating point rounding errors
        if ((Math.abs(n - max) < 0.000001)) {
            return 1;
        }

        // Convert into [0, 1] range if it isn't already
        return (n % max) / parseFloat('' + max);
    }

    // Force a number between 0 and 1
    private clamp01(val: number): number {
        return Math.min(1, Math.max(0, val));
    }

    private boundAlpha(a: any): number {
        a = parseFloat(a);

        if (isNaN(a) || a < 0 || a > 1) {
            a = 1;
        }

        return a;
    }

    // Replace a decimal with it's percentage value
    private static convertToPercentage(n: any): string {
        if (n <= 1) {
            n = (n * 100) + "%";
        }

        return n;
    }

    private inputToRGB(color: any): ColorObject {
        var rgb = null;
        var a = 1;
        var s = null;
        var v = null;
        var l = null;
        var ok = false;
        var format = '';

        if (typeof color == "string") {
            color = this.stringInputToObject(color);
        }

        if (typeof color == "object") {
            if (this.isValidCSSUnit(color.r) && this.isValidCSSUnit(color.g) && this.isValidCSSUnit(color.b)) {
                rgb = this.rgbToRgb(color.r, color.g, color.b);
                ok = true;
                format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
            }
            else if (this.isValidCSSUnit(color.h) && this.isValidCSSUnit(color.s) && this.isValidCSSUnit(color.v)) {
                s = Color.convertToPercentage(color.s);
                v = Color.convertToPercentage(color.v);
                rgb = this.hsvToRgb(color.h, s, v);
                ok = true;
                format = "hsv";
            }
            else if (this.isValidCSSUnit(color.h) && this.isValidCSSUnit(color.s) && this.isValidCSSUnit(color.l)) {
                s = Color.convertToPercentage(color.s);
                l = Color.convertToPercentage(color.l);
                rgb = this.hslToRgb(color.h, s, l);
                ok = true;
                format = "hsl";
            }

            if (color.hasOwnProperty("a")) {
                a = color.a;
            }
        }

        a = this.boundAlpha(a);

        return {
            ok: ok,
            format: color.format || format,
            r: Math.min(255, Math.max(rgb.r, 0)),
            g: Math.min(255, Math.max(rgb.g, 0)),
            b: Math.min(255, Math.max(rgb.b, 0)),
            a: a
        };
    }

    private matchers(): object {
        // <http://www.w3.org/TR/css3-values/#integers>
        var CSS_INTEGER = "[-\\+]?\\d+%?";

        // <http://www.w3.org/TR/css3-values/#number-value>
        var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

        // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
        var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

        // Actual matching.
        // Parentheses and commas are optional, but not required.
        // Whitespace can take the place of commas or opening paren
        var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
        var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

        return {
            CSS_UNIT: new RegExp(CSS_UNIT),
            rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
            rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
            hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
            hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
            hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
            hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
            hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
            hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
            hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
            hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
        };
    };

    private stringInputToObject(color: string): ColorObject | null {
        color = color.replace(Color.trimLeft, '').replace(Color.trimRight, '').toLowerCase();
        var named = false;
        if (color in Color.names) {
            color = Color.names[color];
            named = true;
        }
        else if (color === 'transparent') {
            return { r: 0, g: 0, b: 0, a: 0, format: "name" };
        }

        // Try to match string input using regular expressions.
        // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
        // Just return an object and let the conversion functions handle that.
        // This way the result will be the same whether the tinycolor is initialized with string or object.
        var match;
        var matchers = this.matchers() as Dictionary;
        if ((match = matchers['rgb'].exec(color))) {
            return { r: match[1], g: match[2], b: match[3], a: 1, format:'rgb' };
        }
        if ((match = matchers.rgba.exec(color))) {
            return { r: match[1], g: match[2], b: match[3], a: match[4], format:'rgba' };
        }
        if ((match = matchers.hsl.exec(color))) {
            return { h: match[1], s: match[2], l: match[3] };
        }
        if ((match = matchers.hsla.exec(color))) {
            return { h: match[1], s: match[2], l: match[3], a: match[4] };
        }
        if ((match = matchers.hsv.exec(color))) {
            return { h: match[1], s: match[2], v: match[3] };
        }
        if ((match = matchers.hsva.exec(color))) {
            return { h: match[1], s: match[2], v: match[3], a: match[4] };
        }
        if ((match = matchers.hex8.exec(color))) {
            return {
                r: this.parseIntFromHex(match[1]),
                g: this.parseIntFromHex(match[2]),
                b: this.parseIntFromHex(match[3]),
                a: this.convertHexToDecimal(match[4]),
                format: named ? "name" : "hex8"
            };
        }
        if ((match = matchers.hex6.exec(color))) {
            return {
                r: this.parseIntFromHex(match[1]),
                g: this.parseIntFromHex(match[2]),
                b: this.parseIntFromHex(match[3]),
                format: named ? "name" : "hex"
            };
        }
        if ((match = matchers.hex4.exec(color))) {
            return {
                r: this.parseIntFromHex(match[1] + '' + match[1]),
                g: this.parseIntFromHex(match[2] + '' + match[2]),
                b: this.parseIntFromHex(match[3] + '' + match[3]),
                a: this.convertHexToDecimal(match[4] + '' + match[4]),
                format: named ? "name" : "hex8"
            };
        }
        if ((match = matchers.hex3.exec(color))) {
            return {
                r: this.parseIntFromHex(match[1] + '' + match[1]),
                g: this.parseIntFromHex(match[2] + '' + match[2]),
                b: this.parseIntFromHex(match[3] + '' + match[3]),
                format: named ? "name" : "hex"
            };
        }

        return null;
    }

    toName(): string | null {
        if (this._a === 0) {
            return "transparent";
        }

        if (this._a && this._a < 1) {
            return null;
        }
        var r = this._r ? this._r : 0;
        var g = this._g ? this._g : 0;
        var b = this._b ? this._b : 0;

        return Color.hexNames[this.rgbToHex(r, g, b, true)] || null;
    }

    toString(format: string | undefined = undefined): string {
        var formatSet = !!format;
        format = format || this._format;

        var formattedString = null;
        var hasAlpha = (this._a && this._a < 1) && this._a >= 0;
        var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "hex4" || format === "hex8" || format === "name");

        if (needsAlphaFormat) {
            // Special case for "transparent", all other non-alpha formats
            // will return rgba when there is transparency.
            if (format === "name" && this._a === 0) {
                return this.toName() || '';
            }
            return this.toRgbString();
        }
        if (format === "rgb") {
            formattedString = this.toRgbString();
        }
        if (format === "prgb") {
            formattedString = this.toPercentageRgbString();
        }
        if (format === "hex" || format === "hex6") {
            formattedString = this.toHexString();
        }
        if (format === "hex3") {
            formattedString = this.toHexString(true);
        }
        if (format === "hex4") {
            formattedString = this.toHex8String(true);
        }
        if (format === "hex8") {
            formattedString = this.toHex8String();
        }
        if (format === "name") {
            formattedString = this.toName();
        }
        if (format === "hsl") {
            formattedString = this.toHslString();
        }
        if (format === "hsv") {
            formattedString = this.toHsvString();
        }

        return formattedString || this.toHexString();
    }

    toRgb(): RgbColor {
        return { r: Math.round(this._r || 0), g: Math.round(this._g || 0), b: Math.round(this._b || 0), a: this._a };
    }

    toRgbString(): string {
        return (this._a && this._a === 1) ?
            "rgb(" + Math.round(this._r || 0) + ", " + Math.round(this._g || 0) + ", " + Math.round(this._b || 0) + ")" :
            "rgba(" + Math.round(this._r || 0) + ", " + Math.round(this._g || 0) + ", " + Math.round(this._b || 0) + ", " + this._roundA + ")";
    }
    toPercentageRgbString(): string {
    return (this._a === 1) ?
        "rgb(" + Math.round(this.bound01(this._r || 0, 255) * 100) + "%, " + Math.round(this.bound01(this._g || 0, 255) * 100) + "%, " + Math.round(this.bound01(this._b || 0, 255) * 100) + "%)" :
        "rgba(" + Math.round(this.bound01(this._r || 0, 255) * 100) + "%, " + Math.round(this.bound01(this._g || 0, 255) * 100) + "%, " + Math.round(this.bound01(this._b || 0, 255) * 100) + "%, " + this._roundA + ")";
    }
    toHex(allow3Char?: boolean): string {
        return this.rgbToHex(this._r || 0, this._g || 0, this._b || 0, allow3Char);
    }
    toHexString(allow3Char?: boolean): string {
        return '#' + this.toHex(allow3Char);
    }
    toHex8(allow4Char?: boolean): string {
        return this.rgbaToHex(this._r || 0, this._g || 0, this._b || 0, this._a || 0, allow4Char);
    }
    toHex8String(allow4Char?: boolean): string {
        return '#' + this.toHex8(allow4Char);
    }
    toHsv(): HsvColor {
        var hsv = this.rgbToHsv(this._r || 0, this._g || 0, this._b || 0);
        return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this._a };
    }
    toHsvString(): string {
        var hsv = this.rgbToHsv(this._r || 0, this._g || 0, this._b || 0);
        var h = Math.round(hsv.h * 360), s = Math.round(hsv.s * 100), v = Math.round(hsv.v * 100);
        return (this._a === 1) ?
            "hsv(" + h + ", " + s + "%, " + v + "%)" :
            "hsva(" + h + ", " + s + "%, " + v + "%, " + this._roundA + ")";
    }
    toHsl(): HslColor {
        var hsl = this.rgbToHsl(this._r || 0, this._g || 0, this._b || 0);
        return {
            h: (hsl.h || 0) * 360, s: hsl.s, l: hsl.l, a: this._a
        };
    }
    toHslString(): string {
        var hsl = this.rgbToHsl(this._r || 0, this._g || 0, this._b || 0);
        var h = Math.round(hsl.h || 0 * 360), s = Math.round(hsl.s || 0 * 100), l = Math.round(hsl.l || 0 * 100);
        return (this._a === 1) ?
            "hsl(" + h + ", " + s + "%, " + l + "%)" :
            "hsla(" + h + ", " + s + "%, " + l + "%, " + this._roundA + ")";
    }

    //static fromRatio(color: ColorObject): Color {
    //    let newColor: ColorObject = {
    //        r: Color.convertToPercentage(color.r),
    //        g: Color.convertToPercentage(color.g),
    //        b: Color.convertToPercentage(color.b),
    //        a: color.a ? color.a : 1
    //    };
    //    return new Color(newColor);
    //}

    static random(): Color {
        return new Color({
            r: Math.random() * 255,
            g: Math.random() * 255,
            b: Math.random() * 255
        });
    }

    static interpolate(color1: Color, color2: Color, fraction: number): Color {
        let rgb1 = color1.toRgb();
        let rgb2 = color2.toRgb();

        return new Color({
            r: ((rgb2.r - rgb1.r) * fraction + rgb1.r),
            g: ((rgb2.g - rgb1.g) * fraction + rgb1.g),
            b: ((rgb2.b - rgb1.b) * fraction + rgb1.b)
        });
    }



    // ========================================================= Static Colors ==============================================================
    public static aliceblue = new Color("f0f8ff");
    public static antiquewhite = new Color("faebd7");
    public static aqua = new Color("0ff");
    public static aquamarine = new Color("7fffd4");
    public static azure = new Color("f0ffff");
    public static beige = new Color("f5f5dc");
    public static bisque = new Color("ffe4c4");
    public static black = new Color("000");
    public static blanchedalmond = new Color("ffebcd");
    public static blue = new Color("00f");
    public static blueviolet = new Color("8a2be2");
    public static brown = new Color("a52a2a");
    public static burlywood = new Color("deb887");
    public static burntsienna = new Color("ea7e5d");
    public static cadetblue = new Color("5f9ea0");
    public static chartreuse = new Color("7fff00");
    public static chocolate = new Color("d2691e");
    public static coral = new Color("ff7f50");
    public static cornflowerblue = new Color("6495ed");
    public static cornsilk = new Color("fff8dc");
    public static crimson = new Color("dc143c");
    public static cyan = new Color("0ff");
    public static darkblue = new Color("00008b");
    public static darkcyan = new Color("008b8b");
    public static darkgoldenrod = new Color("b8860b");
    public static darkgray = new Color("a9a9a9");
    public static darkgreen = new Color("006400");
    public static darkgrey = new Color("a9a9a9");
    public static darkkhaki = new Color("bdb76b");
    public static darkmagenta = new Color("8b008b");
    public static darkolivegreen = new Color("556b2f");
    public static darkorange = new Color("ff8c00");
    public static darkorchid = new Color("9932cc");
    public static darkred = new Color("8b0000");
    public static darksalmon = new Color("e9967a");
    public static darkseagreen = new Color("8fbc8f");
    public static darkslateblue = new Color("483d8b");
    public static darkslategray = new Color("2f4f4f");
    public static darkslategrey = new Color("2f4f4f");
    public static darkturquoise = new Color("00ced1");
    public static darkviolet = new Color("9400d3");
    public static deeppink = new Color("ff1493");
    public static deepskyblue = new Color("00bfff");
    public static dimgray = new Color("696969");
    public static dimgrey = new Color("696969");
    public static dodgerblue = new Color("1e90ff");
    public static firebrick = new Color("b22222");
    public static floralwhite = new Color("fffaf0");
    public static forestgreen = new Color("228b22");
    public static fuchsia = new Color("f0f");
    public static gainsboro = new Color("dcdcdc");
    public static ghostwhite = new Color("f8f8ff");
    public static gold = new Color("ffd700");
    public static goldenrod = new Color("daa520");
    public static gray = new Color("808080");
    public static green = new Color("008000");
    public static greenyellow = new Color("adff2f");
    public static grey = new Color("808080");
    public static honeydew = new Color("f0fff0");
    public static hotpink = new Color("ff69b4");
    public static indianred = new Color("cd5c5c");
    public static indigo = new Color("4b0082");
    public static ivory = new Color("fffff0");
    public static khaki = new Color("f0e68c");
    public static lavender = new Color("e6e6fa");
    public static lavenderblush = new Color("fff0f5");
    public static lawngreen = new Color("7cfc00");
    public static lemonchiffon = new Color("fffacd");
    public static lightblue = new Color("add8e6");
    public static lightcoral = new Color("f08080");
    public static lightcyan = new Color("e0ffff");
    public static lightgoldenrodyellow = new Color("fafad2");
    public static lightgray = new Color("d3d3d3");
    public static lightgreen = new Color("90ee90");
    public static lightgrey = new Color("d3d3d3");
    public static lightpink = new Color("ffb6c1");
    public static lightsalmon = new Color("ffa07a");
    public static lightseagreen = new Color("20b2aa");
    public static lightskyblue = new Color("87cefa");
    public static lightslategray = new Color("789");
    public static lightslategrey = new Color("789");
    public static lightsteelblue = new Color("b0c4de");
    public static lightyellow = new Color("ffffe0");
    public static lime = new Color("0f0");
    public static limegreen = new Color("32cd32");
    public static linen = new Color("faf0e6");
    public static magenta = new Color("f0f");
    public static maroon = new Color("800000");
    public static mediumaquamarine = new Color("66cdaa");
    public static mediumblue = new Color("0000cd");
    public static mediumorchid = new Color("ba55d3");
    public static mediumpurple = new Color("9370db");
    public static mediumseagreen = new Color("3cb371");
    public static mediumslateblue = new Color("7b68ee");
    public static mediumspringgreen = new Color("00fa9a");
    public static mediumturquoise = new Color("48d1cc");
    public static mediumvioletred = new Color("c71585");
    public static midnightblue = new Color("191970");
    public static mintcream = new Color("f5fffa");
    public static mistyrose = new Color("ffe4e1");
    public static moccasin = new Color("ffe4b5");
    public static navajowhite = new Color("ffdead");
    public static navy = new Color("000080");
    public static oldlace = new Color("fdf5e6");
    public static olive = new Color("808000");
    public static olivedrab = new Color("6b8e23");
    public static orange = new Color("ffa500");
    public static orangered = new Color("ff4500");
    public static orchid = new Color("da70d6");
    public static palegoldenrod = new Color("eee8aa");
    public static palegreen = new Color("98fb98");
    public static paleturquoise = new Color("afeeee");
    public static palevioletred = new Color("db7093");
    public static papayawhip = new Color("ffefd5");
    public static peachpuff = new Color("ffdab9");
    public static peru = new Color("cd853f");
    public static pink = new Color("ffc0cb");
    public static plum = new Color("dda0dd");
    public static powderblue = new Color("b0e0e6");
    public static purple = new Color("800080");
    public static rebeccapurple = new Color("663399");
    public static red = new Color("f00");
    public static rosybrown = new Color("bc8f8f");
    public static royalblue = new Color("4169e1");
    public static saddlebrown = new Color("8b4513");
    public static salmon = new Color("fa8072");
    public static sandybrown = new Color("f4a460");
    public static seagreen = new Color("2e8b57");
    public static seashell = new Color("fff5ee");
    public static sienna = new Color("a0522d");
    public static silver = new Color("c0c0c0");
    public static skyblue = new Color("87ceeb");
    public static slateblue = new Color("6a5acd");
    public static slategray = new Color("708090");
    public static slategrey = new Color("708090");
    public static snow = new Color("fffafa");
    public static springgreen = new Color("00ff7f");
    public static steelblue = new Color("4682b4");
    public static tan = new Color("d2b48c");
    public static teal = new Color("008080");
    public static thistle = new Color("d8bfd8");
    public static tomato = new Color("ff6347");
    public static turquoise = new Color("40e0d0");
    public static violet = new Color("ee82ee");
    public static wheat = new Color("f5deb3");
    public static white = new Color("fff");
    public static whitesmoke = new Color("f5f5f5");
    public static yellow = new Color("ff0");
    public static yellowgreen = new Color("9acd32");

}