import { computeCenter, computeEndPoint, deg2rad, normalize360Radians, rad2deg } from "../Math/mmath";
import { Vec2D, Vector2D } from "../Math/Vec2D";
import { Rect2D } from "./Animation/Rect2D";
import { Path2D } from "./Path2D";

export class RectShape extends Path2D {
    constructor(x: number, y: number, width: number, height: number) {
        super();

        this.moveTo({ x: x, y: y });
        this.lineTo({ x: x + width, y: y });
        this.lineTo({ x: x + width, y: y + height });
        this.lineTo({ x: x, y: y + height });
        this.closePath();
    }
}

export class CircleShape extends Path2D {
    constructor(centerX: number, centerY: number, radius: number) {
        super();
        let center = new Vec2D(centerX, centerY);
        this.moveTo({ x: centerX + radius, y: centerY });
        this.arc(center, radius, radius, deg2rad(0), deg2rad(360));
        this.closePath();
    }
}

export class RoundRectShape extends Path2D {
    constructor(x: number, y: number, width: number, height: number) {
        super();

        let offset = Math.min(width, height) / 3;

        this.moveTo({ x: x + offset, y: y });
        this.lineTo({ x: x + width - offset, y: y });
        let center = new Vec2D(x + width - offset, y + offset);
        this.arc(center, offset, offset, deg2rad(270), deg2rad(360));//
        this.lineTo({ x: x + width, y: y + height - offset });
        center = new Vec2D(x + width - offset, y + height - offset);
        this.arc(center, offset, offset, deg2rad(0), deg2rad(90));//
        this.lineTo({ x: x + offset, y: y + height });
        center = new Vec2D(x + offset, y + height - offset);
        this.arc(center, offset, offset, deg2rad(90), deg2rad(180));//
        this.lineTo({ x: x, y: y + offset });
        center = new Vec2D(x + offset, y + offset);
        this.arc(center, offset, offset, deg2rad(180), deg2rad(270));//
        this.closePath();
    }

}

class CT_PathCommand {
    getType(): string {
        if (this instanceof CT_Path2DMoveTo)
            return 'moveTo';
        else if (this instanceof CT_Path2DLineTo)
            return 'lineTo';
        else if (this instanceof CT_Path2DQuadBezierTo)
            return 'quadTo';
        else if (this instanceof CT_Path2DCubicBezierTo)
            return 'cubicTo';
        else if (this instanceof CT_Path2DArcTo)
            return 'arcTo';
        else if (this instanceof CT_Path2DClose)
            return 'close';
        return '';
    }
}

class CT_Path2DMoveTo extends CT_PathCommand {
    pt: { [name: string]: string } = {};
}

class CT_Path2DLineTo extends CT_PathCommand {
    ep: { [name: string]: string } = {};
}

class CT_Path2DQuadBezierTo extends CT_PathCommand {
    cp1: { [name: string]: string } = {};
    ep: { [name: string]: string } = {};
}

class CT_Path2DCubicBezierTo extends CT_PathCommand {
    cp1: { [name: string]: string } = {};
    cp2: { [name: string]: string } = {};
    ep: { [name: string]: string } = {};
}

class CT_Path2DArcTo extends CT_PathCommand {
    wR: string = '';
    hR: string = '';
    startAng: string = '';
    swingAng: string = '';
}

class CT_Path2DClose extends CT_PathCommand {
}

class CT_Path2D {
    width: number = 0;
    height: number = 0;
    fill: string = 'norm';
    stroke: boolean = true;
    commands: CT_PathCommand[] = [];
    path2D: Path2D = new Path2D();
}

class CT_AdjustHandle {
    getType(): string {
        if (this instanceof CT_XYAdjustHandle)
            return 'xy';
        else if (this instanceof CT_PolarAdjustHandle)
            return 'polar';

        return '';
    }
}

class CT_XYAdjustHandle extends CT_AdjustHandle {
    pos: { [name: string]: string } = {};
    gdRefX: string = '';
    minX: string = '';
    maxX: string = '';
    gdRefY: string = '';
    minY: string = '';
    maxY: string = '';
}

class CT_PolarAdjustHandle extends CT_AdjustHandle {
    pos: { [name: string]: string } = {};
    gdRefR: string = '';
    minR: string = '';
    maxR: string = '';
    gdRefAng: string = '';
    minAng: string = '';
    maxAng: string = '';
}

class CT_GeomRect {
    left: string = '';
    top: string = '';
    right: string = '';
    bottom: string = '';
}

export class CT_CustomGeometry2D {
    private _name: string = '';

    private adjustValues: { [name: string]: any } = {};
    private guidesValues: { [name: string]: any } = {};
    private _PathList: CT_Path2D[] = [];
    private _adjustHandle: CT_AdjustHandle[] = [];
    private _textRect: CT_GeomRect | undefined;
    private _valuesCache: { [name: string]: number } = {};

    private rectValue(valueName: string, rect: Rect2D): number | undefined {
        let ss = Math.min(rect.w, rect.h);
        let ls = Math.max(rect.w, rect.h);
        switch (valueName.toLowerCase()) {
            case "t": return rect.x;
            case "l": return rect.y;
            case "b": return rect.y + rect.h;
            case "r": return rect.x + rect.w;
            case "w": return rect.w;
            case "h": return rect.h;
            case "vc": return rect.h / 2;
            case "hc": return rect.w / 2;
            case "ss": return ss;
            case "ls": return ls;
            case "cd2": return 10800000.0; // 10800000.0 / 60000.0 = 180
            case "cd3": return 7200000.0; // 120
            case "cd4": return 5400000.0; // 90
            case "cd8": return 2700000.0; // 45
            case "3cd4": return 16200000.0; // 3 * 90 = 270
            case "3cd8": return 8100000.0; // 3 * 45 = 135
            case "5cd8": return 13500000.0; // 5 * 45 = 225
            case "7cd8": return 18900000.0; // 7 * 45 = 315
            case "hd10": return rect.h / 10.0;
            case "hd8": return rect.h / 8.0;
            case "hd6": return rect.h / 6.0;
            case "hd5": return rect.h / 5.0;
            case "hd4": return rect.h / 4.0;
            case "hd3": return rect.h / 3.0;
            case "hd2": return rect.h / 2.0;
            case "ssd32": return ss / 32.0;
            case "ssd16": return ss / 16.0;
            case "ssd8": return ss / 8.0;
            case "ssd6": return ss / 6.0;
            case "ssd4": return ss / 4.0;
            case "ssd2": return ss / 2.0;
            case "wd32": return rect.w / 32.0;
            case "wd12": return rect.w / 12.0;
            case "wd10": return rect.w / 10.0;
            case "wd8": return rect.w / 8.0;
            case "wd6": return rect.w / 6.0;
            case "wd5": return rect.w / 5.0;
            case "wd4": return rect.w / 4.0;
            case "wd3": return rect.w / 3.0;
            case "wd2": return rect.w / 2.0;
        }
        return undefined;
    }

    private readGuideData(el: Element | undefined, dictionary: { [name: string]: any }) {
        if (el && el.hasAttributes()) {
            let name = el.getAttribute('name');
            let formula = el.getAttribute('fmla');
            if (name && formula)
                dictionary[name] = formula;
            else
                throw new Error('readGuideData: name: ' + name + ' formula: ' + formula);
        }
    }

    private readAdjustValuesList(list: Node) {
        for (let i = 0; i < list.childNodes.length; i++) {
            let element = list.childNodes[i] instanceof Element ? list.childNodes[i] as Element : null;
            if (element) {
                this.readGuideData(element, this.adjustValues);
            }
        }
    }

    private readGuideValuesList(list: Node) {
        for (let i = 0; i < list.childNodes.length; i++) {
            let element = list.childNodes[i] instanceof Element ? list.childNodes[i] as Element : null;
            if (element) {
                this.readGuideData(element, this.guidesValues);
            }
        }
    }

    private readXYHandle(e: Element): CT_XYAdjustHandle {
        let handle = new CT_XYAdjustHandle();
        if (e && e.hasAttributes()) {
            this.readPoint(e.children[0] as Element, handle.pos);
            handle.gdRefX = e.getAttribute('gdRefX') || '';
            handle.minX = e.getAttribute('minX') || '';
            handle.maxX = e.getAttribute('maxX') || '';
            handle.gdRefY = e.getAttribute('gdRefY') || '';
            handle.minY = e.getAttribute('minY') || '';
            handle.maxY = e.getAttribute('maxY') || '';
        }
        return handle;
    }

    private readPolarHandle(e: Element): CT_PolarAdjustHandle {
        let handle = new CT_PolarAdjustHandle();
        if (e && e.hasAttributes()) {
            this.readPoint(e.children[0] as Element, handle.pos);
            handle.gdRefAng = e.getAttribute('gdRefAng') || '';
            handle.gdRefR = e.getAttribute('gdRefR') || '';
            handle.maxAng = e.getAttribute('maxAng') || '';
            handle.maxR = e.getAttribute('maxR') || '';
            handle.minAng = e.getAttribute('minAng') || '';
            handle.minR = e.getAttribute('minR') || '';
        }
        return handle;
    }

    private readAdjustHandleList(list: Node) {
        for (let i = 0; i < list.childNodes.length; i++) {
            let element = list.childNodes[i] instanceof Element ? list.childNodes[i] as Element : null;
            if (element) {
                switch (element.nodeName) {
                    case 'ahXY':
                        this._adjustHandle.push(this.readXYHandle(element));
                        break;
                    case 'ahPolar':
                        this._adjustHandle.push(this.readPolarHandle(element));
                        break;
                }
            }
        }
    }

    private connectionSiteList(list: Node) {

    }

    private readTextRect(node: Element): CT_GeomRect {
        let rect = new CT_GeomRect();
        if (node && node.hasAttributes()) {
            rect.left = node.getAttribute('l') || '';
            rect.top = node.getAttribute('t') || '';
            rect.right = node.getAttribute('r') || '';
            rect.bottom = node.getAttribute('b') || '';
        }
        return rect;
    }

    private readPoint(e: Element, pt: { [name: string]: string }) {
        if (e && e.hasAttributes()) {
            let x = e.getAttribute('x');
            let y = e.getAttribute('y');
            if (x && y) {
                pt['x'] = x;
                pt['y'] = y;
            }
        }
    }

    private readStrValue(e: Element, v: string): string {
        if (e && e.hasAttributes()) {
            let value = e.getAttribute(v);
            return value || '';
        }
        return '';
    }

    private readMoveTo(e: Element): CT_Path2DMoveTo {
        let m = new CT_Path2DMoveTo();
        this.readPoint(e.children[0] as Element, m.pt);
        return m;
    }

    private readLineTo(e: Element): CT_Path2DLineTo {
        let l = new CT_Path2DLineTo();
        this.readPoint(e.children[0] as Element, l.ep);
        return l;
    }

    private readArcTo(e: Element): CT_Path2DArcTo {
        let a = new CT_Path2DArcTo();
        a.wR = this.readStrValue(e, 'wR');
        a.hR = this.readStrValue(e, 'hR');
        a.startAng = this.readStrValue(e, 'stAng');
        a.swingAng = this.readStrValue(e, 'swAng');
        return a;
    }

    private readQuadTo(e: Element): CT_Path2DQuadBezierTo {
        let q = new CT_Path2DQuadBezierTo();
        this.readPoint(e.children[0] as Element, q.cp1);
        this.readPoint(e.children[1] as Element, q.ep);
        return q;
    }

    private readCubicTo(e: Element): CT_Path2DCubicBezierTo {
        let c = new CT_Path2DCubicBezierTo();
        this.readPoint(e.children[0], c.cp1);
        this.readPoint(e.children[1], c.cp2);
        this.readPoint(e.children[2], c.ep);
        return c;
    }

    private readPaths(list: Element) {
        let path = new CT_Path2D();
        if (list.hasAttributes()) {
            path.width = parseFloat(list.getAttribute('w') || '0');
            path.height = parseFloat(list.getAttribute('h') || '0');
            let stroke = list.getAttribute('stroke');
            if(stroke)
                path.stroke = stroke === 'true' ? true : false;
            path.fill = list.getAttribute('fill') || 'norm';
        }
        for (let i = 0; i < list.childNodes.length; i++) {
            let element = list.childNodes[i] instanceof Element ? list.childNodes[i] as Element : null;
            switch (element?.nodeName) {
                case 'close':
                    path.commands.push(new CT_Path2DClose());
                    break;
                case 'moveTo':
                    path.commands.push(this.readMoveTo(element));
                    break;
                case 'lnTo':
                    path.commands.push(this.readLineTo(element));
                    break;
                case 'arcTo':
                    path.commands.push(this.readArcTo(element));
                    break;
                case 'quadBezTo':
                    path.commands.push(this.readQuadTo(element));
                    break;
                case 'cubicBezTo':
                    path.commands.push(this.readCubicTo(element));
                    break;
            }
        }
        this._PathList.push(path);
    }

    private readPathsList(list: Node) {
        for (let i = 0; i < list.childNodes.length; i++) {
            let element = list.childNodes[i] instanceof Element ? list.childNodes[i] as Element : null;
            if (element)
                this.readPaths(element);
        }
    }

    private readNode(node: Node) {
        switch (node.nodeName) {
            case 'avLst':
                this.readAdjustValuesList(node);
                break;
            case 'gdLst':
                this.readGuideValuesList(node);
                break;
            case 'ahLst':
                this.readAdjustHandleList(node);
                break;
            case 'cxnLst':
                this.connectionSiteList(node);
                break;
            case 'rect':
                this._textRect = this.readTextRect(node as Element);
                break;
            case 'pathLst':
                this.readPathsList(node);
                break;
        }
    }


    private getFormula(value: string): string {
        if (this.adjustValues[value])
            return this.adjustValues[value];
        else if (this.guidesValues[value])
            return this.guidesValues[value];
        throw new Error('getFormula: ' + value + ' not found in values');
    }

    private f2N(f: string, args: string[], rect: Rect2D): number {
        switch (f) {
            case "*/":
                return CT_CustomGeometry2D.mulDiv(this.solveVariable(args[0], rect), this.solveVariable(args[1], rect), this.solveVariable(args[2], rect));
            case "+-":
                return CT_CustomGeometry2D.addSub(this.solveVariable(args[0], rect), this.solveVariable(args[1], rect), this.solveVariable(args[2], rect));
            case "+/":
                return CT_CustomGeometry2D.addDiv(this.solveVariable(args[0], rect), this.solveVariable(args[1], rect), this.solveVariable(args[2], rect));
            case "?:":
                return CT_CustomGeometry2D.ifElse(this.solveVariable(args[0], rect), this.solveVariable(args[1], rect), this.solveVariable(args[2], rect));
            case "abs":
                return CT_CustomGeometry2D.abs(this.solveVariable(args[0], rect));
            case "at2":
                return CT_CustomGeometry2D.at2(this.solveVariable(args[0], rect), this.solveVariable(args[1], rect));
            case "cat2":
                return CT_CustomGeometry2D.cat2(this.solveVariable(args[0], rect), this.solveVariable(args[1], rect), this.solveVariable(args[2], rect));
            case "cos":
                return CT_CustomGeometry2D.cos(this.solveVariable(args[0], rect), this.solveVariable(args[1], rect));
            case "max":
                return CT_CustomGeometry2D.max(this.solveVariable(args[0], rect), this.solveVariable(args[1], rect));
            case "min":
                return CT_CustomGeometry2D.min(this.solveVariable(args[0], rect), this.solveVariable(args[1], rect));
            case "mod":
                return CT_CustomGeometry2D.mod(this.solveVariable(args[0], rect), this.solveVariable(args[1], rect), this.solveVariable(args[2], rect));
            case "pin":
                return CT_CustomGeometry2D.pin(this.solveVariable(args[0], rect), this.solveVariable(args[1], rect), this.solveVariable(args[2], rect));
            case "sat2":
                return CT_CustomGeometry2D.sat2(this.solveVariable(args[0], rect), this.solveVariable(args[1], rect), this.solveVariable(args[2], rect));
            case "sin":
                return CT_CustomGeometry2D.sin(this.solveVariable(args[0], rect), this.solveVariable(args[1], rect));
            case "sqrt":
                return CT_CustomGeometry2D.sqrt(this.solveVariable(args[0], rect));
            case "tan":
                return CT_CustomGeometry2D.tan(this.solveVariable(args[0], rect), this.solveVariable(args[1], rect));
            case "val":
                return CT_CustomGeometry2D.val(this.solveVariable(args[0], rect));
        }
        throw new Error();
    }

    private solveFormula(fmla: string, rect: Rect2D): number {
        let splited = fmla.split(' ');
        let cmd = splited.splice(0, 1);

        return this.f2N(cmd[0], splited, rect);
    }

    private solveVariable(value: string, rect: Rect2D): number {
        //if value is plain number
        if (this._valuesCache[value])
            return this._valuesCache[value];

        let ret: number | undefined;
        ret = parseFloat(value);

        if (!isNaN(ret))
            return ret;

        ret = this.rectValue(value, rect);
        if (ret !== undefined)
            return ret;

        let fmla = this.getFormula(value);
        ret = this.solveFormula(fmla, rect);
        this._valuesCache[value] = ret;
        return ret;
    }

    public read(element: Element): void;
    public read(data: string): void;
    public read(data: any): void {
        if (typeof data === 'string') {
            let parser = new DOMParser();
            let document = parser.parseFromString(data, 'application/xml');
            this._name = document.getRootNode().nodeName;
            for (let i = 0; i < document.getRootNode().childNodes.length; i++) {
                let child = document.getRootNode().childNodes[i];
                this.readNode(child);
            }
        } else if (data instanceof Element) {
            this._name = data.nodeName;
            for (let i = 0; i < data.children.length; i++) {
                let child = data.children[i];
                this.readNode(child);
            }
        }
    }

    public solveFor(rect: Rect2D): CT_Path2D[] {
        this._valuesCache = {};
        let pathList: CT_Path2D[] = [];
        this._PathList.forEach((path) => {
            let scaleX = 1, scaleY = 1;
            if((path.width !== 0 || path.height !== 0)) {
                scaleX = rect.w / path.width;
                scaleY = rect.h / path.height;
            }
            let lastPoint: Vector2D = { x: 0, y: 0 }, cp1: Vector2D = { x: 0, y: 0 }, cp2: Vector2D = { x: 0, y: 0 };
            let p: Path2D = new Path2D();
            let ctp: CT_Path2D = new CT_Path2D();
            ctp.fill = path.fill;
            ctp.stroke = path.stroke;
            ctp.path2D = p;
            path.commands.forEach((command) => {
                switch (command.getType()) {
                    case 'moveTo':
                        let m = command as CT_Path2DMoveTo;
                        lastPoint.x = this.solveVariable(m.pt['x'], rect) * scaleX;
                        lastPoint.y = this.solveVariable(m.pt['y'], rect) * scaleY;
                        // console.log('M ' + lastPoint.x + ',' + lastPoint.y);
                        p.moveTo(lastPoint);
                        break;
                    case 'lineTo':
                        let l = command as CT_Path2DLineTo;
                        lastPoint.x = this.solveVariable(l.ep['x'], rect) * scaleX;
                        lastPoint.y = this.solveVariable(l.ep['y'], rect) * scaleY;
                        // console.log('L ' + lastPoint.x + ',' + lastPoint.y);
                        p.lineTo(lastPoint);
                        break;
                    case 'quadTo':
                        let q = command as CT_Path2DQuadBezierTo;
                        cp1.x = this.solveVariable(q.cp1['x'], rect) * scaleX;
                        cp1.y = this.solveVariable(q.cp1['y'], rect) * scaleY;
                        lastPoint.x = this.solveVariable(q.ep['x'], rect) * scaleX;
                        lastPoint.y = this.solveVariable(q.ep['y'], rect) * scaleY;
                        p.quadTo(cp1, lastPoint);
                        // console.log('Q ' + cp1.x + ',' + cp1.y + ' ' + lastPoint.x + ',' + lastPoint.y);
                        break;
                    case 'cubicTo':
                        let c = command as CT_Path2DCubicBezierTo;
                        cp1.x = this.solveVariable(c.cp1['x'], rect) * scaleX;
                        cp1.y = this.solveVariable(c.cp1['y'], rect) * scaleY;
                        cp2.x = this.solveVariable(c.cp2['x'], rect) * scaleX;
                        cp2.y = this.solveVariable(c.cp2['y'], rect) * scaleY;
                        lastPoint.x = this.solveVariable(c.ep['x'], rect) * scaleX;
                        lastPoint.y = this.solveVariable(c.ep['y'], rect) * scaleY;
                        p.cubicTo(cp1, cp2, lastPoint);
                        // console.log('C '
                        //     + cp1.x + ',' + cp1.y + ' '
                        //     + cp2.x + ',' + cp2.y + ' '
                        //     + lastPoint.x + ',' + lastPoint.y
                        // );
                        break;
                    case 'arcTo':
                        let a = command as CT_Path2DArcTo;
                        let hR = this.solveVariable(a.hR, rect) * scaleY;
                        let wR = this.solveVariable(a.wR, rect) * scaleX;
                        let stA = deg2rad(this.solveVariable(a.startAng, rect) / 60000);
                        let swA = deg2rad(this.solveVariable(a.swingAng, rect) / 60000);
                        let eA = stA + swA;
                        let center = computeCenter(lastPoint, wR, hR, stA);
                        // if(swA >= Math.PI * 2) {
                        //     eA = stA;
                        // }
                        // if(eA > Math.PI * 2) {
                        //     eA = normalize360Radians(eA);
                        // }
            
                        //  if(stA < 0) {
                        //      stA = normalize360Radians(stA);
                        //  }
                        //  if(eA < 0) {
                        //      eA = normalize360Radians(eA);
                        //  }
                        // if(swA < 0) {
                        //     let t = eA;
                        //     eA = stA;
                        //     stA = t;
                        // }
            
                        lastPoint = computeEndPoint(center, wR, hR, eA);
                        p.arc(center, wR, hR, stA, eA);
                        console.log('A ' + hR + ',' + wR + ',' + rad2deg(stA) + ',' + rad2deg(eA) + ' ' + lastPoint.x + ',' + lastPoint.y);
                        break;
                    case 'close':
                        // let cl = command as CT_Path2DClose;
                        p.closePath();
                        // console.log('Z ');
                        break;
                }
            }, this)
            pathList.push(ctp);
        }, this);
        return pathList;
    }

    public name(): string {
        return this._name;
    }

    // Arguments: 3 (fmla="pin x y z")
    // Usage: "pin x y z" = if (y < x), then x = value of this guide
    // else if (y > z), then z = value of this guide
    // else y = value of this guide
    private static pin(x: number, y: number, z: number): number {
        if (y < x) return x;
        else if (y > z) return z;
        else return y;
    }

    // Arguments: 3 (fmla="*/ x y z")
    // Usage: "*/ x y z" = ((x * y) / z) = value of this guide
    private static mulDiv(x: number, y: number, z: number): number {
        return ((x * y) / z);
    }

    // Arguments: 3 (fmla="+- x y z")
    // Usage: "+- x y z" = ((x + y) - z) = value of this guide
    private static addSub(x: number, y: number, z: number): number {
        return ((x + y) - z);
    }

    // Arguments: 3 (fmla="+/ x y z")
    // Usage: "+/ x y z" = ((x + y) / z) = value of this guide
    private static addDiv(x: number, y: number, z: number): number {
        return ((x + y) / z);
    }

    // Arguments: 3 (fmla="?: x y z")
    // Usage: "?: x y z" = if (x > 0), then y = value of this guide,
    // else z = value of this guide
    private static ifElse(x: number, y: number, z: number): number {
        if (x > 0) return y;
        else return z;
    }

    // Arguments: 1 (fmla="abs x")
    // Usage: "abs x" = if (x < 0), then (-1) * x = value of this guide
    // else x = value of this guide
    private static abs(x: number): number {
        if (x < 0) return -1 * x;
        else return x;
    }

    // Arguments: 2 (fmla="at2 x y")
    // Usage: "at2 x y" = arctan(y / x) = value of this guide
    private static at2(x: number, y: number): number {
        return 10800000 * Math.atan(y / x) / Math.PI;
    }

    // Arguments: 3 (fmla="cat2 x y z")
    // Usage: "cat2 x y z" = (x*(cos(arctan(z / y))) = value of this guide
    private static cat2(x: number, y: number, z: number): number {
        return (x * (Math.cos(Math.atan(z / y))));
    }

    // Arguments: 2 (fmla="cos x y")
    // Usage: "cos x y" = (x * cos( y )) = value of this guide
    private static cos(x: number, y: number): number {
        return (x * Math.cos(Math.PI * y / 10800000.0));
    }

    // Arguments: 2 (fmla="max x y")
    // Usage: "max x y" = if (x > y), then x = value of this guide
    // else y = value of this guide
    private static max(x: number, y: number): number {
        if (x > y) return x;
        else return y;
    }

    // Arguments: 2 (fmla="min x y")
    // Usage: "min x y" = if (x < y), then x = value of this guide
    // else y = value of this guide
    private static min(x: number, y: number): number {
        if (x < y) return x;
        else return y;
    }

    // Arguments: 3 (fmla="mod x y z")
    // Usage: "mod x y z" = sqrt(x^2 + y^2 + z^2) = value of this guide
    private static mod(x: number, y: number, z: number): number {
        return Math.sqrt(x * x + y * y + z * z);
    }


    // Arguments: 3 (fmla="sat2 x y z")
    // Usage: "sat2 x y z" = (x*sin(arctan(z / y))) = value of this guide
    private static sat2(x: number, y: number, z: number): number {
        return (x * Math.sin(Math.atan(z / y)));
    }

    // Arguments: 2 (fmla="sin x y")
    // Usage: "sin x y" = (x * sin( y )) = value of this guide
    private static sin(x: number, y: number): number {
        return (x * Math.sin(Math.PI * y / 10800000));
    }

    // Arguments: 1 (fmla="sqrt x")
    // Usage: "sqrt x" = sqrt(x) = value of this guide
    private static sqrt(x: number): number {
        return Math.sqrt(x);
    }

    // Arguments: 2 (fmla="tan x y")
    // Usage: "tan x y" = (x * tan( y )) = value of this guide
    private static tan(x: number, y: number): number {
        return (x * Math.tan(Math.PI * y / 10800000));
    }

    // Arguments: 1 (fmla="val x")
    // Usage: "val x" = x = value of this guide
    private static val(x: number): number {
        return x;
    }
}

export class PresetShapesList {
    private static _instance: PresetShapesList;
    private _library: { [name: string]: CT_CustomGeometry2D } = {};

    private constructor() {
    }

    public static instance(): PresetShapesList {
        if (!this._instance) {
            this._instance = new PresetShapesList();
        }
        return this._instance;
    }

    public load(data: string): void {
        let parser = new DOMParser();
        let doc = parser.parseFromString(data, 'application/xml');
        if (doc.firstChild) {
            let root = doc.firstChild as Element;
            for (let i = 0; i < root.children.length; i++) {
                let geom = new CT_CustomGeometry2D();
                geom.read(root.children[i] as Element);
                this._library[geom.name()] = geom;
            }
        }
    }

    public getPresetsNames(): string[] {
        let arr: string[] = [];
        for (let key in this._library) {
            arr.push(key);
        }
        return arr;
    }

    public getPreset(name: string): CT_CustomGeometry2D | undefined {
        return this._library[name];
    }
}

function rad2Deg(stA: number) {
    throw new Error("Function not implemented.");
}
