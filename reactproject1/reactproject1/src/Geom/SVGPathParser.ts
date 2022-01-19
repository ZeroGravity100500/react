import { Vector2D } from "../Math/Vec2D";

interface Dictionary {
    [key: string]: any;
}

export interface ISvgCommand {
    type: string;
    values: number[];
}

type numberOrNullArray = [(number | null), ...(number | null)[]];

export class SVGPathParser {
    private _string: string;
    private _currentIndex: number;
    private _endIndex: number;
    private _prevCommand = null;

    private commandsMap: Dictionary = {
        "Z": "Z", "M": "M", "L": "L", "C": "C", "Q": "Q", "A": "A", "H": "H", "V": "V", "S": "S", "T": "T",
        "z": "Z", "m": "m", "l": "l", "c": "c", "q": "q", "a": "a", "h": "h", "v": "v", "s": "s", "t": "t"
    }

    constructor(str: string) {
        this._string = str;
        this._currentIndex = 0;
        this._endIndex = str.length;
        this.skipOptionalSpaces();
    }

    parseSegment(): ISvgCommand | null {
        let char = this._string[this._currentIndex];
        let command = this.commandsMap[char] ? this.commandsMap[char] : null;

        if (command === null) {
            if (this._prevCommand === null)
                return null;
            // check for remaining coordinates in current command
            if (
                (char === '+' || char === '-' || char === '.' || (char >= '0' && char <= '9')) && this._prevCommand !== 'Z'
            ) {
                if (this._prevCommand === 'M') {
                    command = 'L';
                } else if (this._prevCommand === 'm') {
                    command = 'l'
                } else {
                    command = this._prevCommand;
                }
            } else {
                command = null;
            }
            if (command === null)
                return null;
        } else {
            this._currentIndex++;
        }
        this._prevCommand = command;
        let values: numberOrNullArray | null = null;
        let cmd = command.toUpperCase();
        if (cmd === 'H' || cmd === 'V') {
            values = [this.parseNumber()];
        } else if (cmd === 'M' || cmd === 'L' || cmd === 'T') {
            values = [this.parseNumber(), this.parseNumber()];
        } else if (cmd === 'S' || cmd === 'Q') {
            values = [this.parseNumber(), this.parseNumber(), this.parseNumber(), this.parseNumber()];
        } else if (cmd === 'C') {
            values = [
                this.parseNumber(),
                this.parseNumber(),
                this.parseNumber(),
                this.parseNumber(),
                this.parseNumber(),
                this.parseNumber()
            ];
        } else if (cmd === 'A') {
            values = [
                this.parseNumber(),
                this.parseNumber(),
                this.parseNumber(),
                this.parseArcFlag(),
                this.parseArcFlag(),
                this.parseNumber(),
                this.parseNumber()
            ];
        } else if (cmd === 'Z') {
            this.skipOptionalSpaces();
            values = [1];

        }
        if (values === null || values.indexOf(null) !== -1) {
            return null;
        } else {
            return { type: command, values: values as number[] }
        }

    }

    peekSegmentType() {
        let char = this._string[this._currentIndex];
        return this.commandsMap[char] ? this.commandsMap[char] : null;
    }

    initialCommandIsMoveTo() {
        // If the path is empty it is still valid, so return true.
        if (!this.hasMoreData()) {
            return true;
        }

        let command = this.peekSegmentType();
        // Path must start with moveTo.
        return command === "M" || command === "m";
    }

    hasMoreData() {
        return this._currentIndex < this._endIndex;
    }

    private parseArcFlag(): number | null {
        if (this._currentIndex >= this._endIndex) {
            return null;
        }

        let flag = null;
        let flagChar = this._string[this._currentIndex];

        this._currentIndex += 1;

        if (flagChar === "0") {
            flag = 0;
        }
        else if (flagChar === "1") {
            flag = 1;
        }
        else {
            return null;
        }

        this.skipOptionalSpacesOrDelimiter();
        return flag;
    }

    private parseNumber() : number | null {
        let exp = 0;
        let integer = 0;
        let frac = 1;
        let decimal = 0;
        let sign = 1;
        let expsign = 1;
        let startIndex = this._currentIndex;

        this.skipOptionalSpaces();
        if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === '+') {
            this._currentIndex++;
        } else if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === '-') {
            this._currentIndex++;
            sign = -1;
        }

        if (this._currentIndex === this._endIndex || (
            (this._string[this._currentIndex] < '0' || this._string[this._currentIndex] > '9') &&
            this._string[this._currentIndex] !== '.'
            )
        ) {
            return null;
        }

        // Read the integer part, build right-to-left
        let startIntPartIndex = this._currentIndex;

        while (
            this._currentIndex < this._endIndex &&
            this._string[this._currentIndex] >= '0' &&
            this._string[this._currentIndex] <= '9'
            ) {
            this._currentIndex += 1;
        }

        if (this._currentIndex !== startIntPartIndex) {
            let scanIntPartIndex = this._currentIndex - 1;
            let multiplier = 1;
            while (scanIntPartIndex >= startIntPartIndex) {
                integer += multiplier * (this._string[scanIntPartIndex].charCodeAt(0) - '0'.charCodeAt(0));
                scanIntPartIndex -= 1;
                multiplier *= 10;
            }
        }

        // Read the decimals
        if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === '.') {
            this._currentIndex++;
            if (this._currentIndex >= this._endIndex || this._string[this._currentIndex] < '0' || this._string[this._currentIndex] > '9') {
                return null;
            }
            while (
                this._currentIndex < this._endIndex &&
                this._string[this._currentIndex] >= '0' &&
                this._string[this._currentIndex] <= '9'
            ) {
                frac *= 10;
                decimal += (this._string.charCodeAt(this._currentIndex) - '0'.charCodeAt(0)) / frac;
                this._currentIndex++;
            }
        }
        if (
            this._currentIndex !== startIndex &&
            this._currentIndex + 1 < this._endIndex &&
            (this._string[this._currentIndex] === "e" || this._string[this._currentIndex] === "E") &&
            (this._string[this._currentIndex + 1] !== "x" && this._string[this._currentIndex + 1] !== "m")
        ) {
            this._currentIndex += 1;

            // Read the sign of the exponent.
            if (this._string[this._currentIndex] === "+") {
                this._currentIndex += 1;
            }
            else if (this._string[this._currentIndex] === "-") {
                this._currentIndex += 1;
                expsign = -1;
            }

            // There must be an exponent.
            if (
                this._currentIndex >= this._endIndex ||
                this._string[this._currentIndex] < "0" ||
                this._string[this._currentIndex] > "9"
            ) {
                return null;
            }

            while (
                this._currentIndex < this._endIndex &&
                this._string[this._currentIndex] >= "0" &&
                this._string[this._currentIndex] <= "9"
            ) {
                exp *= 10;
                exp += (this._string[this._currentIndex].charCodeAt(0) - "0".charCodeAt(0));
                this._currentIndex += 1;
            }
        }

        let number = integer + decimal;
        number *= sign;

        if (exp) {
            number *= Math.pow(10, expsign * exp);
        }

        if (startIndex === this._currentIndex) {
            return null;
        }

        this.skipOptionalSpacesOrDelimiter();

        return number;
    }

    private isCurrentSpace(): boolean {
        let char = this._string[this._currentIndex];
        return char <= " " && (char === " " || char === "\n" || char === "\t" || char === "\r" || char === "\f");
    }

    private skipOptionalSpaces(): boolean {
        while (this._currentIndex < this._endIndex && this.isCurrentSpace()) {
            this._currentIndex += 1;
        }

        return this._currentIndex < this._endIndex;
    }

    private skipOptionalSpacesOrDelimiter() {
        if (
            this._currentIndex < this._endIndex &&
            !this.isCurrentSpace() &&
            this._string[this._currentIndex] !== ','
        ) {
            return false;
        }

        if (this.skipOptionalSpaces()) {
            if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === ',') {
                this._currentIndex += 1;
                this.skipOptionalSpaces();
            }
        }
        return this._currentIndex < this._endIndex;
    }

    private static svgArcToCubicCurves(x1: number, y1: number, x2: number, y2: number, r1: number, r2: number, angle: number, largeArcFlag: number, sweepFlag: number, _recursive: any = undefined): any[] {
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
                let r1 = rotate(params[i][0], params[i][1], angleRad);
                let r2 = rotate(params[i + 1][0], params[i + 1][1], angleRad);
                let r3 = rotate(params[i + 2][0], params[i + 2][1], angleRad);
                curves.push([r1.x, r1.y, r2.x, r2.y, r3.x, r3.y]);
            }

            return curves;
        }
    }

    private static reducePathData(pathData: ISvgCommand[]) {
        let reducedPathData: ISvgCommand[] = [];
        let lastType: string | null = null;

        let lastControlX: number = 0;
        let lastControlY: number = 0;

        let currentX: number = 0;
        let currentY: number = 0;

        let subpathX: number = 0;
        let subpathY: number = 0;

        pathData.forEach((seg: ISvgCommand) => {
            if (seg.type === "M") {
                let x: number = seg.values[0];
                let y: number = seg.values[1];

                reducedPathData.push({ type: "M", values: [x, y] });

                subpathX = x;
                subpathY = y;

                currentX = x;
                currentY = y;
            }

            else if (seg.type === "C") {
                let x1: number = seg.values[0];
                let y1: number = seg.values[1];
                let x2: number = seg.values[2];
                let y2: number = seg.values[3];
                let x = seg.values[4];
                let y = seg.values[5];

                reducedPathData.push({ type: "C", values: [x1, y1, x2, y2, x, y] });

                lastControlX = x2;
                lastControlY = y2;

                currentX = x;
                currentY = y;
            }

            else if (seg.type === "L") {
                let x = seg.values[0];
                let y = seg.values[1];

                reducedPathData.push({ type: "L", values: [x, y] });

                currentX = x;
                currentY = y;
            }

            else if (seg.type === "H") {
                let x = seg.values[0];

                reducedPathData.push({ type: "L", values: [x, currentY] });

                currentX = x;
            }

            else if (seg.type === "V") {
                let y = seg.values[0];

                reducedPathData.push({ type: "L", values: [currentX, y] });

                currentY = y;
            }

            else if (seg.type === "S") {
                let x2 = seg.values[0];
                let y2 = seg.values[1];
                let x = seg.values[2];
                let y = seg.values[3];

                let cx1: number, cy1: number;

                if (lastType === "C" || lastType === "S") {
                    cx1 = (currentX) + ((currentX) - (lastControlX));
                    cy1 = (currentY) + ((currentY) - (lastControlY));
                }
                else {
                    cx1 = currentX;
                    cy1 = currentY;
                }

                reducedPathData.push({ type: "C", values: [cx1, cy1, x2, y2, x, y] });

                lastControlX = x2;
                lastControlY = y2;

                currentX = x;
                currentY = y;
            }

            else if (seg.type === "T") {
                let x = seg.values[0];
                let y = seg.values[1];
                let x1;
                let y1;
                if (lastType === "Q" || lastType === "T") {
                    x1 = currentX + (currentX - lastControlX);
                    y1 = currentY + (currentY - lastControlY);
                }
                else {
                    x1 = currentX;
                    y1 = currentY;
                }

                let cx1 = currentX + 2 * (x1 - currentX) / 3;
                let cy1 = currentY + 2 * (y1 - currentY) / 3;
                let cx2: number = x + 2 * (x1 - x) / 3;
                let cy2: number = y + 2 * (y1 - y) / 3;

                reducedPathData.push({ type: "C", values: [cx1, cy1, cx2, cy2, x, y] });

                lastControlX = x1;
                lastControlY = y1;

                currentX = x;
                currentY = y;
            }

            else if (seg.type === "Q") {
                let x1 = seg.values[0];
                let y1 = seg.values[1];
                let x = seg.values[2];
                let y = seg.values[3];

                let cx1 = currentX + 2 * (x1 - currentX) / 3;
                let cy1 = currentY + 2 * (y1 - currentY) / 3;
                let cx2 = x + 2 * (x1 - x) / 3;
                let cy2 = y + 2 * (y1 - y) / 3;

                reducedPathData.push({ type: "C", values: [cx1, cy1, cx2, cy2, x, y] });

                lastControlX = x1;
                lastControlY = y1;

                currentX = x;
                currentY = y;
            }

            else if (seg.type === "A") {
                let r1: number = Math.abs(seg.values[0]);
                let r2: number = Math.abs(seg.values[1]);
                let angle: number = seg.values[2];
                let largeArcFlag: number = seg.values[3];
                let sweepFlag: number = seg.values[4];
                let x = seg.values[5];
                let y = seg.values[6];

                if (r1 === 0 || r2 === 0) {
                    reducedPathData.push({ type: "C", values: [currentX, currentY, x, y, x, y] });

                    currentX = x;
                    currentY = y;
                }
                else {
                    if (currentX !== x || currentY !== y) {
                        let curves = SVGPathParser.svgArcToCubicCurves(currentX, currentY, x, y, r1, r2, angle, largeArcFlag, sweepFlag);

                        curves.forEach(function (curve) {
                            reducedPathData.push({ type: "C", values: curve });
                        });

                        currentX = x;
                        currentY = y;
                    }
                }
            }

            else if (seg.type === "Z") {
                reducedPathData.push(seg);

                currentX = subpathX;
                currentY = subpathY;
            }

            lastType = seg.type;
        });

        return reducedPathData;
    }

    private static absolutizePathData(pathData: ISvgCommand[]) {
        let absolutizedPathData: ISvgCommand[] = [];

        let currentX: number = 0;
        let currentY: number = 0;

        let subpathX: number = 0;
        let subpathY: number = 0;

        pathData.forEach(function (seg) {
            let type = seg.type;

            if (type === "M") {
                let x: number = seg.values[0];
                let y: number = seg.values[1];

                absolutizedPathData.push({ type: "M", values: [x, y] });

                subpathX = x;
                subpathY = y;

                currentX = x;
                currentY = y;
            }

            else if (type === "m") {
                let x = currentX + (seg.values[0]);
                let y = currentY + (seg.values[1]);

                absolutizedPathData.push({ type: "M", values: [x, y] });

                subpathX = x;
                subpathY = y;

                currentX = x;
                currentY = y;
            }

            else if (type === "L") {
                let x = seg.values[0];
                let y = seg.values[1];

                absolutizedPathData.push({ type: "L", values: [x, y] });

                currentX = x;
                currentY = y;
            }

            else if (type === "l") {
                let x = currentX + (seg.values[0]);
                let y = currentY + (seg.values[1]);

                absolutizedPathData.push({ type: "L", values: [x, y] });

                currentX = x;
                currentY = y;
            }

            else if (type === "C") {
                let x1: number = seg.values[0];
                let y1: number = seg.values[1];
                let x2: number = seg.values[2];
                let y2: number = seg.values[3];
                let x = seg.values[4];
                let y = seg.values[5];

                absolutizedPathData.push({ type: "C", values: [x1, y1, x2, y2, x, y] });

                currentX = x;
                currentY = y;
            }

            else if (type === "c") {
                let x1 = currentX + (seg.values[0]);
                let y1 = currentY + (seg.values[1]);
                let x2 = currentX + (seg.values[2]);
                let y2 = currentY + (seg.values[3]);
                let x = currentX + (seg.values[4]);
                let y = currentY + (seg.values[5]);

                absolutizedPathData.push({ type: "C", values: [x1, y1, x2, y2, x, y] });

                currentX = x;
                currentY = y;
            }

            else if (type === "Q") {
                let x1 = seg.values[0];
                let y1 = seg.values[1];
                let x = seg.values[2];
                let y = seg.values[3];

                absolutizedPathData.push({ type: "Q", values: [x1, y1, x, y] });

                currentX = x;
                currentY = y;
            }

            else if (type === "q") {
                let x1 = currentX + (seg.values[0]);
                let y1 = currentY + (seg.values[1]);
                let x = currentX + (seg.values[2]);
                let y = currentY + (seg.values[3]);

                absolutizedPathData.push({ type: "Q", values: [x1, y1, x, y] });

                currentX = x;
                currentY = y;
            }

            else if (type === "A") {
                let x = seg.values[5];
                let y = seg.values[6];

                absolutizedPathData.push({
                    type: "A",
                    values: [seg.values[0], seg.values[1], seg.values[2], seg.values[3], seg.values[4], x, y]
                });

                currentX = x;
                currentY = y;
            }

            else if (type === "a") {
                let x = currentX + (seg.values[5]);
                let y = currentY + (seg.values[6]);

                absolutizedPathData.push({
                    type: "A",
                    values: [seg.values[0], seg.values[1], seg.values[2], seg.values[3], seg.values[4], x, y]
                });

                currentX = x;
                currentY = y;
            }

            else if (type === "H") {
                let x = seg.values[0];
                absolutizedPathData.push({ type: "H", values: [x] });
                currentX = x;
            }

            else if (type === "h") {
                let x = currentX + (seg.values[0]);
                absolutizedPathData.push({ type: "H", values: [x] });
                currentX = x;
            }

            else if (type === "V") {
                let y = seg.values[0];
                absolutizedPathData.push({ type: "V", values: [y] });
                currentY = y;
            }

            else if (type === "v") {
                let y = currentY + (seg.values[0]);
                absolutizedPathData.push({ type: "V", values: [y] });
                currentY = y;
            }

            else if (type === "S") {
                let x2 = seg.values[0];
                let y2 = seg.values[1];
                let x = seg.values[2];
                let y = seg.values[3];

                absolutizedPathData.push({ type: "S", values: [x2, y2, x, y] });

                currentX = x;
                currentY = y;
            }

            else if (type === "s") {
                let x2 = currentX + (seg.values[0]);
                let y2 = currentY + (seg.values[1]);
                let x = currentX + (seg.values[2]);
                let y = currentY + (seg.values[3]);

                absolutizedPathData.push({ type: "S", values: [x2, y2, x, y] });

                currentX = x;
                currentY = y;
            }

            else if (type === "T") {
                let x = seg.values[0];
                let y = seg.values[1];

                absolutizedPathData.push({ type: "T", values: [x, y] });

                currentX = x;
                currentY = y;
            }

            else if (type === "t") {
                let x = currentX + (seg.values[0]);
                let y = currentY + (seg.values[1]);

                absolutizedPathData.push({ type: "T", values: [x, y] });

                currentX = x;
                currentY = y;
            }

            else if (type === "Z" || type === "z") {
                absolutizedPathData.push({ type: "Z", values: [currentX, currentY] });

                currentX = subpathX;
                currentY = subpathY;
            }
        });

        return absolutizedPathData;
    };

    private static parsePathDataString(data: string | null) {
        if (!data || data.length === 0) return [];

        let source = new SVGPathParser(data);
        let pathData = [];

        if (source.initialCommandIsMoveTo()) {
            while (source.hasMoreData()) {
                let pathSeg = source.parseSegment();

                if (pathSeg === null) {
                    break;
                } else {
                    pathData.push(pathSeg);
                }
            }
        }

        return pathData;
    }

    private static parseSubpathDataString(data: string | null) {
        if (!data || data.length === 0) return [];

        let source = new SVGPathParser(data);
        let subpaths = [];
        let pathData: ISvgCommand[] | undefined = undefined;

        if (source.initialCommandIsMoveTo()) {
            while (source.hasMoreData()) {
                let pathSeg = source.parseSegment();

                if (pathSeg === null) {
                    break;
                } else {
                    if(pathSeg.type === 'M' || pathSeg.type === 'm') {
                        if(pathData !== undefined) {
                            subpaths.push(pathData);
                        }
                        pathData = [];
                    }
                    if(pathData)
                        pathData.push(pathSeg);
                }
            }
            if(pathData && pathData.length)
                subpaths.push(pathData);
        }

        return subpaths;
    }

    public static getSubpathArray(data: string) {
        let pathData = SVGPathParser.parseSubpathDataString(data);
        for(let i in pathData) {
            pathData[i] = SVGPathParser.absolutizePathData(pathData[i]);
            pathData[i] = SVGPathParser.reducePathData(pathData[i]);
        }
        return pathData;
    }

    public static getPathData(data: string) {
        let pathData = SVGPathParser.parsePathDataString(data);
        pathData = SVGPathParser.absolutizePathData(pathData);
        pathData = SVGPathParser.reducePathData(pathData);
        return pathData;
    }
}