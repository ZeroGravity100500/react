export interface TimeInterpolator {
    getInterpolation(input: number): number;
}

export class LinearInterpolator implements TimeInterpolator {
    getInterpolation(input: number): number {
        return input;
    }
}

export class ReverseInterpolator implements TimeInterpolator {
    getInterpolation(input: number): number {
        return 1 - input;
    }
}

export class AccelerateInterpolator implements TimeInterpolator {
    private _factor: number;
    private _doubleFactor: number;

    constructor(factor?: number) {
        this._factor = factor || 1;
        this._doubleFactor = 2 * this._factor;
    }

    getInterpolation(input: number): number {
        if (this._factor === 1) {
            return input * input;
        } else {
            return Math.pow(input, this._doubleFactor);
        }
    }
}

export class AccelerateDecelerateInterpolator implements TimeInterpolator {
    getInterpolation(input: number): number {
        return Math.cos((input + 1) * Math.PI) / 2 + 0.5;
    }
}

export class AnticipateInterpolator implements TimeInterpolator {
    private _tension;

    constructor(tension?: number) {
        this._tension = tension || 2;
    }

    getInterpolation(t: number): number {
        // a(t) = t * t * ((tension + 1) * t - tension)
        return t * t * ((this._tension + 1) * t - this._tension);
    }
}

export class AnticipateOvershootInterpolator implements TimeInterpolator {
    private _tension;

    constructor(tension?: number) {
        this._tension = tension ? tension * 1.5 : 2 * 1.5;
    }

    private a(t: number, s: number): number {
        return t * t * ((s + 1) * t - s);
    }
    private o(t: number, s: number): number {
        return t * t * ((s + 1) * t + s);
    }

    getInterpolation(t: number): number {
        // a(t, s) = t * t * ((s + 1) * t - s)
        // o(t, s) = t * t * ((s + 1) * t + s)
        // f(t) = 0.5 * a(t * 2, tension * extraTension), when t < 0.5
        // f(t) = 0.5 * (o(t * 2 - 2, tension * extraTension) + 2), when t <= 1.0
        if (t < 0.5) return 0.5 * this.a(t * 2, this._tension);
        else return 0.5 * (this.o(t * 2 - 2, this._tension) + 2);
    }
}

export class BounceInterpolator implements TimeInterpolator {
    private bounce(t: number): number {
        return t * t * 8;
    }

    getInterpolation(t: number): number {
        // _b(t) = t * t * 8
        // bs(t) = _b(t) for t < 0.3535
        // bs(t) = _b(t - 0.54719) + 0.7 for t < 0.7408
        // bs(t) = _b(t - 0.8526) + 0.9 for t < 0.9644
        // bs(t) = _b(t - 1.0435) + 0.95 for t <= 1.0
        // b(t) = bs(t * 1.1226)
        t *= 1.1226;
        if (t < 0.3535) return this.bounce(t);
        else if (t < 0.7408) return this.bounce(t - 0.54719) + 0.7;
        else if (t < 0.9644) return this.bounce(t - 0.8526) + 0.9;
        else return this.bounce(t - 1.0435) + 0.95;
    }
}

export class CycleInterpolator implements TimeInterpolator {
    private _cycles;

    constructor(cycles?: number) {
        this._cycles = cycles || 1;
    }

    getInterpolation(input: number): number {
        return Math.sin(2 * this._cycles * Math.PI * input);
    }
}

export class DecelerateInterpolator implements TimeInterpolator {
    private _factor: number;
    private _doubleFactor: number;

    constructor(factor?: number) {
        this._factor = factor || 1;
        this._doubleFactor = 2 * this._factor;
    }

    getInterpolation(input: number): number {
        if (this._factor === 1) {
            return 1 - (1 - input) * (1 - input);
        } else {
            return 1 - Math.pow((1 - input), 2 * this._doubleFactor);
        }
    }
}

export class OvershootInterpolator implements TimeInterpolator {
    private _tension;

    constructor(tension?: number) {
        this._tension = tension || 2;
    }

    getInterpolation(t: number): number {
        // _o(t) = t * t * ((tension + 1) * t + tension)
        // o(t) = _o(t - 1) + 1
        t -= 1;
        return t * t * ((this._tension + 1) * t + this._tension) + 1;
    }
}