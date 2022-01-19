import { Vec2D, Vector2D } from "./Vec2D";

enum StateType {
    APPLY_IDENTITY = 0,
    APPLY_TRANSLATE = 1,
    APPLY_SCALE = 2,
    APPLY_SHEAR = 4,
    HI_IDENTITY = APPLY_IDENTITY << 3,
    HI_TRANSLATE = APPLY_TRANSLATE << 3,
    HI_SCALE = APPLY_SCALE << 3,
    HI_SHEAR = APPLY_SHEAR << 3
}

enum TramsformType {
    TYPE_UNKNOWN = -1,
    TYPE_IDENTITY = 0,
    TYPE_TRANSLATION = 1,
    TYPE_UNIFORM_SCALE = 2,
    TYPE_GENERAL_SCALE = 4,
    TYPE_MASK_SCALE = (TYPE_UNIFORM_SCALE |
        TYPE_GENERAL_SCALE),
    TYPE_FLIP = 64,
    TYPE_QUADRANT_ROTATION = 8,
    TYPE_GENERAL_ROTATION = 16,
    TYPE_MASK_ROTATION = (TYPE_QUADRANT_ROTATION |
        TYPE_GENERAL_ROTATION),
    TYPE_GENERAL_TRANSFORM = 32
}

export interface DomMatrix {
    a: number; // m00
    b: number; // m10
    c: number; // m01
    d: number; // m11
    e: number; // m02
    f: number; // m12
}

export class AffineTransform {
    private m00: number = 1;
    private m10: number = 0;
    private m01: number = 0;
    private m11: number = 1;
    private m02: number = 0;
    private m12: number = 0;
    private state: StateType = StateType.APPLY_IDENTITY;
    private type: number = -1;
    
    constructor(m00: any, m10: any, m01: any, m11: any, m02: any, m12: any) {
        this.m00 = m00;
        this.m01 = m01;
        this.m02 = m02;
        this.m10 = m10;
        this.m11 = m11;
        this.m12 = m12;
        this.updateState();
    }

    toDomMatrix(): DomMatrix {
        return {
            a: this.m00,
            b: this.m10,
            c: this.m01,
            d: this.m11,
            e: this.m02,
            f: this.m12
        };
    }

    updateState() {
        if (this.m01 === 0.0 && this.m10 === 0.0) {
            if (this.m00 === 1.0 && this.m11 === 1.0) {
                if (this.m02 === 0.0 && this.m12 === 0.0) {
                    this.state = StateType.APPLY_IDENTITY;
                    this.type = TramsformType.TYPE_IDENTITY;
                } else {
                    this.state = StateType.APPLY_TRANSLATE;
                    this.type = TramsformType.TYPE_TRANSLATION;
                }
            } else {
                if (this.m02 === 0.0 && this.m12 === 0.0) {
                    this.state = StateType.APPLY_SCALE;
                    this.type = TramsformType.TYPE_UNKNOWN;
                } else {
                    this.state = StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE;
                    this.type = TramsformType.TYPE_UNKNOWN;
                }
            }
        } else {
            if (this.m00 === 0.0 && this.m11 === 0.0) {
                if (this.m02 === 0.0 && this.m12 === 0.0) {
                    this.state = StateType.APPLY_SHEAR;
                    this.type = TramsformType.TYPE_UNKNOWN;
                } else {
                    this.state = StateType.APPLY_SHEAR | StateType.APPLY_TRANSLATE;
                    this.type = TramsformType.TYPE_UNKNOWN;
                }
            } else {
                if (this.m02 === 0.0 && this.m12 === 0.0) {
                    this.state = StateType.APPLY_SHEAR | StateType.APPLY_SCALE;
                    this.type = TramsformType.TYPE_UNKNOWN;
                } else {
                    this.state = StateType.APPLY_SHEAR | StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE;
                    this.type = TramsformType.TYPE_UNKNOWN;
                }
            }
        }
    }

    identity() {
        this.m00 = 1;
        this.m10 = 0;
        this.m01 = 0;
        this.m11 = 1;
        this.m02 = 0;
        this.m12 = 0;
        this.updateState();
    }

    translate(t: Vector2D): AffineTransform {
        switch (this.state) {
            case StateType.APPLY_SHEAR | StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE:
                this.m02 = t.x * this.m00 + t.y * this.m01 + this.m02;
                this.m12 = t.x * this.m10 + t.y * this.m11 + this.m12;
                if (this.m02 === 0.0 && this.m12 === 0.0) {
                    this.state = StateType.APPLY_SHEAR | StateType.APPLY_SCALE;
                    if (this.type !== TramsformType.TYPE_UNKNOWN) {
                        this.type -= TramsformType.TYPE_TRANSLATION;
                    }
                }
                return this;
            case StateType.APPLY_SHEAR | StateType.APPLY_SCALE:
                this.m02 = t.x * this.m00 + t.y * this.m01;
                this.m12 = t.x * this.m10 + t.y * this.m11;
                if (this.m02 !== 0.0 || this.m12 !== 0.0) {
                    this.state = StateType.APPLY_SHEAR | StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE;
                    this.type |= TramsformType.TYPE_TRANSLATION;
                }
                return this;
            case StateType.APPLY_SHEAR | StateType.APPLY_TRANSLATE:
                this.m02 = t.y * this.m01 + this.m02;
                this.m12 = t.x * this.m10 + this.m12;
                if (this.m02 === 0.0 && this.m12 === 0.0) {
                    this.state = StateType.APPLY_SHEAR;
                    if (this.type !== TramsformType.TYPE_UNKNOWN) {
                        this.type -= TramsformType.TYPE_TRANSLATION;
                    }
                }
                return this;
            case StateType.APPLY_SHEAR:
                this.m02 = t.y * this.m01;
                this.m12 = t.x * this.m10;
                if (this.m02 !== 0.0 || this.m12 !== 0.0) {
                    this.state = StateType.APPLY_SHEAR | StateType.APPLY_TRANSLATE;
                    this.type |= TramsformType.TYPE_TRANSLATION;
                }
                return this;
            case StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE:
                this.m02 = t.x * this.m00 + this.m02;
                this.m12 = t.y * this.m11 + this.m12;
                if (this.m02 === 0.0 && this.m12 === 0.0) {
                    this.state = StateType.APPLY_SCALE;
                    if (this.type !== TramsformType.TYPE_UNKNOWN) {
                        this.type -= TramsformType.TYPE_TRANSLATION;
                    }
                }
                return this;
            case StateType.APPLY_SCALE:
                this.m02 = t.x * this.m00;
                this.m12 = t.y * this.m11;
                if (this.m02 !== 0.0 || this.m12 !== 0.0) {
                    this.state = StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE;
                    this.type |= TramsformType.TYPE_TRANSLATION;
                }
                return this;
            case StateType.APPLY_TRANSLATE:
                this.m02 = t.x + this.m02;
                this.m12 = t.y + this.m12;
                if (this.m02 === 0.0 && this.m12 === 0.0) {
                    this.state = StateType.APPLY_IDENTITY;
                    this.type = TramsformType.TYPE_IDENTITY;
                }
                return this;
            case StateType.APPLY_IDENTITY:
                this.m02 = t.x;
                this.m12 = t.y;
                if (t.x !== 0.0 || t.y !== 0.0) {
                    this.state = StateType.APPLY_TRANSLATE;
                    this.type = TramsformType.TYPE_TRANSLATION;
                }
                return this;
        }

        return this;
    }

    private static rot90conversion: StateType[] = [
        /* IDENTITY => */        StateType.APPLY_SHEAR,
        /* TRANSLATE (TR) => */  StateType.APPLY_SHEAR | StateType.APPLY_TRANSLATE,
        /* SCALE (SC) => */      StateType.APPLY_SHEAR,
        /* SC | TR => */         StateType.APPLY_SHEAR | StateType.APPLY_TRANSLATE,
        /* SHEAR (SH) => */      StateType.APPLY_SCALE,
        /* SH | TR => */         StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE,
        /* SH | SC => */         StateType.APPLY_SHEAR | StateType.APPLY_SCALE,
        /* SH | SC | TR => */    StateType.APPLY_SHEAR | StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE,
    ];

    private rotate90() {
        let M0 = this.m00;
        this.m00 = this.m01;
        this.m01 = -M0;
        M0 = this.m10;
        this.m10 = this.m11;
        this.m11 = -M0;
        let state = AffineTransform.rot90conversion[this.state];

        if ((state & (StateType.APPLY_SHEAR | StateType.APPLY_SCALE)) === StateType.APPLY_SCALE &&
            this.m00 === 1.0 && this.m11 === 1.0) {
            state -= StateType.APPLY_SCALE;
        }
        this.state = state;
        this.type = TramsformType.TYPE_UNKNOWN;
    }

    private rotate180() {
        this.m00 = -this.m00;
        this.m11 = -this.m11;
        let state = this.state;
        if ((state & (StateType.APPLY_SHEAR)) !== 0) {
            // If there was a shear, then this rotation has no
            // effect on the state.
            this.m01 = -this.m01;
            this.m10 = -this.m10;
        } else {
            // No shear means the SCALE state may toggle when
            // m00 and m11 are negated.
            if (this.m00 === 1.0 && this.m11 === 1.0) {
                this.state = state & ~StateType.APPLY_SCALE;
            } else {
                this.state = state | StateType.APPLY_SCALE;
            }
        }
        this.type = TramsformType.TYPE_UNKNOWN;
    }

    private rotate270() {
        let M0 = this.m00;
        this.m00 = -this.m01;
        this.m01 = M0;
        M0 = this.m10;
        this.m10 = -this.m11;
        this.m11 = M0;
        let state = AffineTransform.rot90conversion[this.state];

        if ((state & (StateType.APPLY_SHEAR | StateType.APPLY_SCALE)) === StateType.APPLY_SCALE &&
            this.m00 === 1.0 && this.m11 === 1.0) {
            state -= StateType.APPLY_SCALE;
        }
        this.state = state;
        this.type = TramsformType.TYPE_UNKNOWN;
    }

    rotate(theta: number): AffineTransform {
        let sin = Math.sin(theta);
        if (sin === 1.0) {
            this.rotate90();
        } else if (sin === -1.0) {
            this.rotate270();
        } else {
            let cos = Math.cos(theta);
            if (cos === -1.0) {
                this.rotate180();
            } else if (cos !== 1.0) {
                let M0, M1;
                M0 = this.m00;
                M1 = this.m01;
                this.m00 = cos * M0 + sin * M1;
                this.m01 = -sin * M0 + cos * M1;
                M0 = this.m10;
                M1 = this.m11;
                this.m10 = cos * M0 + sin * M1;
                this.m11 = -sin * M0 + cos * M1;
                this.updateState();
            }
        }
        return this;
    }

    scale(sx: number, sy: number): AffineTransform {
        let state = this.state;
        switch (state) {
            default:
                throw new Error();
            /* NOTREACHED */
            case StateType.APPLY_SHEAR | StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE:
            case StateType.APPLY_SHEAR | StateType.APPLY_SCALE:
                this.m00 *= sx;
                this.m11 *= sy;
                this.m01 *= sy;
                this.m10 *= sx;
                if (this.m01 === 0 && this.m10 === 0) {
                    state &= StateType.APPLY_TRANSLATE;
                    if (this.m00 === 1.0 && this.m11 === 1.0) {
                        this.type = (state === StateType.APPLY_IDENTITY
                            ? TramsformType.TYPE_IDENTITY
                            : TramsformType.TYPE_TRANSLATION);
                    } else {
                        state |= StateType.APPLY_SCALE;
                        this.type = TramsformType.TYPE_UNKNOWN;
                    }
                    this.state = state;
                }
                return this;
            case (StateType.APPLY_SHEAR | StateType.APPLY_TRANSLATE):
            case (StateType.APPLY_SHEAR):
                this.m01 *= sy;
                this.m10 *= sx;
                if (this.m01 === 0 && this.m10 === 0) {
                    state &= StateType.APPLY_TRANSLATE;
                    if (this.m00 === 1.0 && this.m11 === 1.0) {
                        this.type = (state === StateType.APPLY_IDENTITY
                            ? TramsformType.TYPE_IDENTITY
                            : TramsformType.TYPE_TRANSLATION);
                    } else {
                        state |= StateType.APPLY_SCALE;
                        this.type = TramsformType.TYPE_UNKNOWN;
                    }
                    this.state = state;
                }
                return this;
            case (StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE):
            case (StateType.APPLY_SCALE):
                this.m00 *= sx;
                this.m11 *= sy;
                if (this.m00 === 1.0 && this.m11 === 1.0) {
                    this.state = (state &= StateType.APPLY_TRANSLATE);
                    this.type = (state === StateType.APPLY_IDENTITY
                        ? TramsformType.TYPE_IDENTITY
                        : TramsformType.TYPE_TRANSLATION);
                } else {
                    this.type = TramsformType.TYPE_UNKNOWN;
                }
                return this;
            case (StateType.APPLY_TRANSLATE):
            case (StateType.APPLY_IDENTITY):
                this.m00 = sx;
                this.m11 = sy;
                if (sx !== 1.0 || sy !== 1.0) {
                    this.state = state | StateType.APPLY_SCALE;
                    this.type = TramsformType.TYPE_UNKNOWN;
                }
                return this;
        }
    }

    shear(shx: number, shy: number): AffineTransform {
        let state = this.state;
        switch (state) {
            default:
                throw new Error();
            /* NOTREACHED */
            case (StateType.APPLY_SHEAR | StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE):
            case (StateType.APPLY_SHEAR | StateType.APPLY_SCALE):
                let M0, M1;
                M0 = this.m00;
                M1 = this.m01;
                this.m00 = M0 + M1 * shy;
                this.m01 = M0 * shx + M1;

                M0 = this.m10;
                M1 = this.m11;
                this.m10 = M0 + M1 * shy;
                this.m11 = M0 * shx + M1;
                this.updateState();
                return this;
            case (StateType.APPLY_SHEAR | StateType.APPLY_TRANSLATE):
            case (StateType.APPLY_SHEAR):
                this.m00 = this.m01 * shy;
                this.m11 = this.m10 * shx;
                if (this.m00 !== 0.0 || this.m11 !== 0.0) {
                    this.state = state | StateType.APPLY_SCALE;
                }
                this.type = TramsformType.TYPE_UNKNOWN;
                return this;
            case (StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE):
            case (StateType.APPLY_SCALE):
                this.m01 = this.m00 * shx;
                this.m10 = this.m11 * shy;
                if (this.m01 !== 0.0 || this.m10 !== 0.0) {
                    this.state = state | StateType.APPLY_SHEAR;
                }
                this.type = TramsformType.TYPE_UNKNOWN;
                return this;
            case (StateType.APPLY_TRANSLATE):
            case (StateType.APPLY_IDENTITY):
                this.m01 = shx;
                this.m10 = shy;
                if (this.m01 !== 0.0 || this.m10 !== 0.0) {
                    this.state = state | StateType.APPLY_SCALE | StateType.APPLY_SHEAR;
                    this.type = TramsformType.TYPE_UNKNOWN;
                }
                return this;
        }
    }

    setToIdentity() {
        this.m00 = this.m11 = 1.0;
        this.m10 = this.m01 = this.m02 = this.m12 = 0.0;
        this.state = StateType.APPLY_IDENTITY;
        this.type = TramsformType.TYPE_IDENTITY;
    }

    setToTranslation(tx: number, ty: number) {
        this.m00 = 1.0;
        this.m10 = 0.0;
        this.m01 = 0.0;
        this.m11 = 1.0;
        this.m02 = tx;
        this.m12 = ty;
        if (tx !== 0.0 || ty !== 0.0) {
            this.state = StateType.APPLY_TRANSLATE;
            this.type = TramsformType.TYPE_TRANSLATION;
        } else {
            this.state = StateType.APPLY_IDENTITY;
            this.type = TramsformType.TYPE_IDENTITY;
        }
    }

    setToRotation(theta: number) {
        let sin = Math.sin(theta);
        let cos;
        if (sin === 1.0 || sin === -1.0) {
            cos = 0.0;
            this.state = StateType.APPLY_SHEAR;
            this.type = TramsformType.TYPE_QUADRANT_ROTATION;
        } else {
            cos = Math.cos(theta);
            if (cos === -1.0) {
                sin = 0.0;
                this.state = StateType.APPLY_SCALE;
                this.type = TramsformType.TYPE_QUADRANT_ROTATION;
            } else if (cos === 1.0) {
                sin = 0.0;
                this.state = StateType.APPLY_IDENTITY;
                this.type = TramsformType.TYPE_IDENTITY;
            } else {
                this.state = StateType.APPLY_SHEAR | StateType.APPLY_SCALE;
                this.type = TramsformType.TYPE_GENERAL_ROTATION;
            }
        }
        this.m00 = cos;
        this.m10 = sin;
        this.m01 = -sin;
        this.m11 = cos;
        this.m02 = 0.0;
        this.m12 = 0.0;
    }

    setToQuadrantRotation(numquadrants: number) {
        switch (numquadrants & 3) {
            case 0:
                this.m00 = 1.0;
                this.m10 = 0.0;
                this.m01 = 0.0;
                this.m11 = 1.0;
                this.m02 = 0.0;
                this.m12 = 0.0;
                this.state = StateType.APPLY_IDENTITY;
                this.type = TramsformType.TYPE_IDENTITY;
                break;
            case 1:
                this.m00 = 0.0;
                this.m10 = 1.0;
                this.m01 = -1.0;
                this.m11 = 0.0;
                this.m02 = 0.0;
                this.m12 = 0.0;
                this.state = StateType.APPLY_SHEAR;
                this.type = TramsformType.TYPE_QUADRANT_ROTATION;
                break;
            case 2:
                this.m00 = -1.0;
                this.m10 = 0.0;
                this.m01 = 0.0;
                this.m11 = -1.0;
                this.m02 = 0.0;
                this.m12 = 0.0;
                this.state = StateType.APPLY_SCALE;
                this.type = TramsformType.TYPE_QUADRANT_ROTATION;
                break;
            case 3:
                this.m00 = 0.0;
                this.m10 = -1.0;
                this.m01 = 1.0;
                this.m11 = 0.0;
                this.m02 = 0.0;
                this.m12 = 0.0;
                this.state = StateType.APPLY_SHEAR;
                this.type = TramsformType.TYPE_QUADRANT_ROTATION;
                break;
        }
    }

    setToScale(sx: number, sy: number) {
        this.m00 = sx;
        this.m10 = 0.0;
        this.m01 = 0.0;
        this.m11 = sy;
        this.m02 = 0.0;
        this.m12 = 0.0;
        if (sx !== 1.0 || sy !== 1.0) {
            this.state = StateType.APPLY_SCALE;
            this.type = TramsformType.TYPE_UNKNOWN;
        } else {
            this.state = StateType.APPLY_IDENTITY;
            this.type = TramsformType.TYPE_IDENTITY;
        }
    }

    setToShear(shx: number, shy: number) {
        this.m00 = 1.0;
        this.m01 = shx;
        this.m10 = shy;
        this.m11 = 1.0;
        this.m02 = 0.0;
        this.m12 = 0.0;
        if (shx !== 0.0 || shy !== 0.0) {
            this.state = StateType.APPLY_SHEAR | StateType.APPLY_SCALE;
            this.type = TramsformType.TYPE_UNKNOWN;
        } else {
            this.state = StateType.APPLY_IDENTITY;
            this.type = TramsformType.TYPE_IDENTITY;
        }
    }

    setTransform(Tx: AffineTransform) {
        this.m00 = Tx.m00;
        this.m10 = Tx.m10;
        this.m01 = Tx.m01;
        this.m11 = Tx.m11;
        this.m02 = Tx.m02;
        this.m12 = Tx.m12;
        this.state = Tx.state;
        this.type = Tx.type;
    }

    concatenate(Tx: AffineTransform): AffineTransform {
        let M0, M1;
        let T00, T01, T10, T11;
        let T02, T12;
        const mystate = this.state;
        let txstate = Tx.state;
        txstate = (txstate << 3);
        switch (txstate | mystate) {

            /* ---------- Tx === IDENTITY cases ---------- */
            case StateType.HI_IDENTITY | StateType.APPLY_IDENTITY:
            case StateType.HI_IDENTITY | StateType.APPLY_TRANSLATE:
            case StateType.HI_IDENTITY | StateType.APPLY_SCALE:
            case StateType.HI_IDENTITY | StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE:
            case StateType.HI_IDENTITY | StateType.APPLY_SHEAR:
            case StateType.HI_IDENTITY | StateType.APPLY_SHEAR | StateType.APPLY_TRANSLATE:
            case StateType.HI_IDENTITY | StateType.APPLY_SHEAR | StateType.APPLY_SCALE:
            case StateType.HI_IDENTITY | StateType.APPLY_SHEAR | StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE:
                return this;

            /* ---------- this === IDENTITY cases ---------- */
            case StateType.HI_SHEAR | StateType.HI_SCALE | StateType.HI_TRANSLATE | StateType.APPLY_IDENTITY:
                this.m01 = Tx.m01;
                this.m10 = Tx.m10;
                this.m00 = Tx.m00;
                this.m11 = Tx.m11;
                this.m02 = Tx.m02;
                this.m12 = Tx.m12;
                this.state = txstate;
                this.type = Tx.type;
                return this;
            case StateType.HI_SCALE | StateType.HI_TRANSLATE | StateType.APPLY_IDENTITY:
                this.m00 = Tx.m00;
                this.m11 = Tx.m11;
                this.m02 = Tx.m02;
                this.m12 = Tx.m12;
                this.state = txstate;
                this.type = Tx.type;
                return this;
            case StateType.HI_TRANSLATE | StateType.APPLY_IDENTITY:
                this.m02 = Tx.m02;
                this.m12 = Tx.m12;
                this.state = txstate;
                this.type = Tx.type;
                return this;
            case StateType.HI_SHEAR | StateType.HI_SCALE | StateType.APPLY_IDENTITY:
                this.m01 = Tx.m01;
                this.m10 = Tx.m10;
                this.m00 = Tx.m00;
                this.m11 = Tx.m11;
                this.state = txstate;
                this.type = Tx.type;
                return this;
            case StateType.HI_SCALE | StateType.APPLY_IDENTITY:
                this.m00 = Tx.m00;
                this.m11 = Tx.m11;
                this.state = txstate;
                this.type = Tx.type;
                return this;
            case StateType.HI_SHEAR | StateType.HI_TRANSLATE | StateType.APPLY_IDENTITY:
                this.m02 = Tx.m02;
                this.m12 = Tx.m12;
                this.m01 = Tx.m01;
                this.m10 = Tx.m10;
                this.m00 = this.m11 = 0.0;
                this.state = txstate;
                this.type = Tx.type;
                return this;

            case StateType.HI_SHEAR | StateType.APPLY_IDENTITY:
                this.m01 = Tx.m01;
                this.m10 = Tx.m10;
                this.m00 = this.m11 = 0.0;
                this.state = txstate;
                this.type = Tx.type;
                return this;

            /* ---------- Tx === TRANSLATE cases ---------- */
            case StateType.HI_TRANSLATE | StateType.APPLY_SHEAR | StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE:
            case StateType.HI_TRANSLATE | StateType.APPLY_SHEAR | StateType.APPLY_SCALE:
            case StateType.HI_TRANSLATE | StateType.APPLY_SHEAR | StateType.APPLY_TRANSLATE:
            case StateType.HI_TRANSLATE | StateType.APPLY_SHEAR:
            case StateType.HI_TRANSLATE | StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE:
            case StateType.HI_TRANSLATE | StateType.APPLY_SCALE:
            case StateType.HI_TRANSLATE | StateType.APPLY_TRANSLATE:
                this.translate(new Vec2D(Tx.m02, Tx.m12));
                return this;

            /* ---------- Tx === SCALE cases ---------- */
            case StateType.HI_SCALE | StateType.APPLY_SHEAR | StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE:
            case StateType.HI_SCALE | StateType.APPLY_SHEAR | StateType.APPLY_SCALE:
            case StateType.HI_SCALE | StateType.APPLY_SHEAR | StateType.APPLY_TRANSLATE:
            case StateType.HI_SCALE | StateType.APPLY_SHEAR:
            case StateType.HI_SCALE | StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE:
            case StateType.HI_SCALE | StateType.APPLY_SCALE:
            case StateType.HI_SCALE | StateType.APPLY_TRANSLATE:
                this.scale(Tx.m00, Tx.m11);
                return this;

            /* ---------- Tx === SHEAR cases ---------- */
            case StateType.HI_SHEAR | StateType.APPLY_SHEAR | StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE:
            case StateType.HI_SHEAR | StateType.APPLY_SHEAR | StateType.APPLY_SCALE:
                T01 = Tx.m01; T10 = Tx.m10;
                M0 = this.m00;
                this.m00 = this.m01 * T10;
                this.m01 = M0 * T01;
                M0 = this.m10;
                this.m10 = this.m11 * T10;
                this.m11 = M0 * T01;
                this.type = TramsformType.TYPE_UNKNOWN;
                return this;
            case StateType.HI_SHEAR | StateType.APPLY_SHEAR | StateType.APPLY_TRANSLATE:
            case StateType.HI_SHEAR | StateType.APPLY_SHEAR:
                this.m00 = this.m01 * Tx.m10;
                this.m01 = 0.0;
                this.m11 = this.m10 * Tx.m01;
                this.m10 = 0.0;
                this.state = mystate ^ (StateType.APPLY_SHEAR | StateType.APPLY_SCALE);
                this.type = TramsformType.TYPE_UNKNOWN;
                return this;
            case StateType.HI_SHEAR | StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE:
            case StateType.HI_SHEAR | StateType.APPLY_SCALE:
                this.m01 = this.m00 * Tx.m01;
                this.m00 = 0.0;
                this.m10 = this.m11 * Tx.m10;
                this.m11 = 0.0;
                this.state = mystate ^ (StateType.APPLY_SHEAR | StateType.APPLY_SCALE);
                this.type = TramsformType.TYPE_UNKNOWN;
                return this;
            case StateType.HI_SHEAR | StateType.APPLY_TRANSLATE:
                this.m00 = 0.0;
                this.m01 = Tx.m01;
                this.m10 = Tx.m10;
                this.m11 = 0.0;
                this.state = StateType.APPLY_TRANSLATE | StateType.APPLY_SHEAR;
                this.type = TramsformType.TYPE_UNKNOWN;
                return this;
        }
        // If Tx has more than one attribute, it is not worth optimizing
        // all of those cases...
        T00 = Tx.m00; T01 = Tx.m01; T02 = Tx.m02;
        T10 = Tx.m10; T11 = Tx.m11; T12 = Tx.m12;
        switch (mystate) {
            default:
                throw new Error();
            /* NOTREACHED */
            case StateType.APPLY_SHEAR | StateType.APPLY_SCALE:
                this.state = mystate | txstate;
                M0 = this.m00;
                M1 = this.m01;
                this.m00 = T00 * M0 + T10 * M1;
                this.m01 = T01 * M0 + T11 * M1;
                this.m02 += T02 * M0 + T12 * M1;

                M0 = this.m10;
                M1 = this.m11;
                this.m10 = T00 * M0 + T10 * M1;
                this.m11 = T01 * M0 + T11 * M1;
                this.m12 += T02 * M0 + T12 * M1;
                this.type = TramsformType.TYPE_UNKNOWN;
                return this;
            case StateType.APPLY_SHEAR | StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE:
                M0 = this.m00;
                M1 = this.m01;
                this.m00 = T00 * M0 + T10 * M1;
                this.m01 = T01 * M0 + T11 * M1;
                this.m02 += T02 * M0 + T12 * M1;

                M0 = this.m10;
                M1 = this.m11;
                this.m10 = T00 * M0 + T10 * M1;
                this.m11 = T01 * M0 + T11 * M1;
                this.m12 += T02 * M0 + T12 * M1;
                this.type = TramsformType.TYPE_UNKNOWN;
                return this;

            case StateType.APPLY_SHEAR | StateType.APPLY_TRANSLATE:
            case StateType.APPLY_SHEAR:
                M0 = this.m01;
                this.m00 = T10 * M0;
                this.m01 = T11 * M0;
                this.m02 += T12 * M0;

                M0 = this.m10;
                this.m10 = T00 * M0;
                this.m11 = T01 * M0;
                this.m12 += T02 * M0;
                break;

            case StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE:
            case StateType.APPLY_SCALE:
                M0 = this.m00;
                this.m00 = T00 * M0;
                this.m01 = T01 * M0;
                this.m02 += T02 * M0;

                M0 = this.m11;
                this.m10 = T10 * M0;
                this.m11 = T11 * M0;
                this.m12 += T12 * M0;
                break;

            case StateType.APPLY_TRANSLATE:
                this.m00 = T00;
                this.m01 = T01;
                this.m02 += T02;

                this.m10 = T10;
                this.m11 = T11;
                this.m12 += T12;
                this.state = txstate | StateType.APPLY_TRANSLATE;
                this.type = TramsformType.TYPE_UNKNOWN;
                return this;
        }
        this.updateState();

        return this;
    }

    createInverse(): AffineTransform {
        let det;
        switch (this.state) {
            default:
                throw new Error();
            /* NOTREACHED */
            case StateType.APPLY_SHEAR | StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE:
                det = this.m00 * this.m11 - this.m01 * this.m10;
                if (Math.abs(det) <= Number.MIN_VALUE) {
                    throw new Error("Determinant is " + det);
                }
                return new AffineTransform(this.m11 / det, -this.m10 / det,
                    -this.m01 / det, this.m00 / det,
                    (this.m01 * this.m12 - this.m11 * this.m02) / det,
                    (this.m10 * this.m02 - this.m00 * this.m12) / det);
            case StateType.APPLY_SHEAR | StateType.APPLY_SCALE:
                det = this.m00 * this.m11 - this.m01 * this.m10;
                if (Math.abs(det) <= Number.MIN_VALUE) {
                    throw new Error("Determinant is " + det);
                }
                return new AffineTransform(this.m11 / det, -this.m10 / det,
                    -this.m01 / det, this.m00 / det,
                    0.0, 0.0);
            case StateType.APPLY_SHEAR | StateType.APPLY_TRANSLATE:
                if (this.m01 === 0.0 || this.m10 === 0.0) {
                    throw new Error("Determinant is 0");
                }
                return new AffineTransform(0.0, 1.0 / this.m01,
                    1.0 / this.m10, 0.0,
                    -this.m12 / this.m10, -this.m02 / this.m01);
            case StateType.APPLY_SHEAR:
                if (this.m01 === 0.0 || this.m10 === 0.0) {
                    throw new Error("Determinant is 0");
                }
                return new AffineTransform(0.0, 1.0 / this.m01,
                    1.0 / this.m10, 0.0,
                    0.0, 0.0);
            case StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE:
                if (this.m00 === 0.0 || this.m11 === 0.0) {
                    throw new Error("Determinant is 0");
                }
                return new AffineTransform(1.0 / this.m00, 0.0,
                    0.0, 1.0 / this.m11,
                    -this.m02 / this.m00, -this.m12 / this.m11);
            case StateType.APPLY_SCALE:
                if (this.m00 === 0.0 || this.m11 === 0.0) {
                    throw new Error("Determinant is 0");
                }
                return new AffineTransform(1.0 / this.m00, 0.0,
                    0.0, 1.0 / this.m11,
                    0.0, 0.0);
            case StateType.APPLY_TRANSLATE:
                return new AffineTransform(1.0, 0.0,
                    0.0, 1.0,
                    -this.m02, -this.m12);
            case StateType.APPLY_IDENTITY:
                return new AffineTransform(1, 0, 0, 1, 0, 0);
        }

        /* NOTREACHED */
    }

    invert(): AffineTransform {
        let M00, M01, M02;
        let M10, M11, M12;
        let det;
        switch (this.state) {
            default:
                throw new Error();
            /* NOTREACHED */
            case StateType.APPLY_SHEAR | StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE:
                M00 = this.m00; M01 = this.m01; M02 = this.m02;
                M10 = this.m10; M11 = this.m11; M12 = this.m12;
                det = M00 * M11 - M01 * M10;
                if (Math.abs(det) <= Number.MIN_VALUE) {
                    throw new Error("Determinant is " + det);
                }
                this.m00 = M11 / det;
                this.m10 = -M10 / det;
                this.m01 = -M01 / det;
                this.m11 = M00 / det;
                this.m02 = (M01 * M12 - M11 * M02) / det;
                this.m12 = (M10 * M02 - M00 * M12) / det;
                break;
            case StateType.APPLY_SHEAR | StateType.APPLY_SCALE:
                M00 = this.m00; M01 = this.m01;
                M10 = this.m10; M11 = this.m11;
                det = M00 * M11 - M01 * M10;
                if (Math.abs(det) <= Number.MIN_VALUE) {
                    throw new Error("Determinant is " + det);
                }
                this.m00 = M11 / det;
                this.m10 = -M10 / det;
                this.m01 = -M01 / det;
                this.m11 = M00 / det;
                // m02 = 0.0;
                // m12 = 0.0;
                break;
            case StateType.APPLY_SHEAR | StateType.APPLY_TRANSLATE:
                M01 = this.m01; M02 = this.m02;
                M10 = this.m10; M12 = this.m12;
                if (M01 === 0.0 || M10 === 0.0) {
                    throw new Error("Determinant is 0");
                }
                // m00 = 0.0;
                this.m10 = 1.0 / M01;
                this.m01 = 1.0 / M10;
                // m11 = 0.0;
                this.m02 = -M12 / M10;
                this.m12 = -M02 / M01;
                break;
            case StateType.APPLY_SHEAR:
                M01 = this.m01;
                M10 = this.m10;
                if (M01 === 0.0 || M10 === 0.0) {
                    throw new Error("Determinant is 0");
                }
                // m00 = 0.0;
                this.m10 = 1.0 / M01;
                this.m01 = 1.0 / M10;
                // m11 = 0.0;
                // m02 = 0.0;
                // m12 = 0.0;
                break;
            case StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE:
                M00 = this.m00; M02 = this.m02;
                M11 = this.m11; M12 = this.m12;
                if (M00 === 0.0 || M11 === 0.0) {
                    throw new Error("Determinant is 0");
                }
                this.m00 = 1.0 / M00;
                // m10 = 0.0;
                // m01 = 0.0;
                this.m11 = 1.0 / M11;
                this.m02 = -M02 / M00;
                this.m12 = -M12 / M11;
                break;
            case StateType.APPLY_SCALE:
                M00 = this.m00;
                M11 = this.m11;
                if (M00 === 0.0 || M11 === 0.0) {
                    throw new Error("Determinant is 0");
                }
                this.m00 = 1.0 / M00;
                // m10 = 0.0;
                // m01 = 0.0;
                this.m11 = 1.0 / M11;
                // m02 = 0.0;
                // m12 = 0.0;
                break;
            case StateType.APPLY_TRANSLATE:
                // m00 = 1.0;
                // m10 = 0.0;
                // m01 = 0.0;
                // m11 = 1.0;
                this.m02 = -this.m02;
                this.m12 = -this.m12;
                break;
            case StateType.APPLY_IDENTITY:
                // m00 = 1.0;
                // m10 = 0.0;
                // m01 = 0.0;
                // m11 = 1.0;
                // m02 = 0.0;
                // m12 = 0.0;
                break;
        }
        return this;
    }

    transformVector(ptSrc: Vector2D): Vector2D {
        // Copy source coords into local variables in case src === dst
        let x = ptSrc.x;
        let y = ptSrc.y;
        let dst = new Vec2D(0, 0);
        switch (this.state) {
            default:
                throw new Error();
            /* NOTREACHED */
            case StateType.APPLY_SHEAR | StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE:
                dst.x = x * this.m00 + y * this.m01 + this.m02;
                dst.y = x * this.m10 + y * this.m11 + this.m12;
                return dst;
            case StateType.APPLY_SHEAR | StateType.APPLY_SCALE:
                dst.x = x * this.m00 + y * this.m01;
                dst.y = x * this.m10 + y * this.m11;
                return dst;
            case StateType.APPLY_SHEAR | StateType.APPLY_TRANSLATE:
                dst.x = y * this.m01 + this.m02;
                dst.y = x * this.m10 + this.m12;
                return dst;
            case StateType.APPLY_SHEAR:
                dst.x = y * this.m01;
                dst.y = x * this.m10;
                return dst;
            case StateType.APPLY_SCALE | StateType.APPLY_TRANSLATE:
                dst.x = x * this.m00 + this.m02;
                dst.y = y * this.m11 + this.m12;
                return dst;
            case StateType.APPLY_SCALE:
                dst.x = x * this.m00;
                dst.y = y * this.m11;
                return dst;
            case StateType.APPLY_TRANSLATE:
                dst.x = x + this.m02
                dst.y = y + this.m12;
                return dst;
            case StateType.APPLY_IDENTITY:
                dst.x = x;
                dst.y = y;
                return dst;
        }
        /* NOTREACHED */
    }

    transform(p: Vector2D[], index: number, numCoords: number): Vector2D[] {
        for (let i = index; i < numCoords; i++) {
            p[i] = this.transformVector(p[i]);
        }
        return p;
    }

    isIdentity(): boolean {
        return (this.state === StateType.APPLY_IDENTITY || this.type === TramsformType.TYPE_IDENTITY);
    }

    static createIdentityTransform(): AffineTransform {
        return new AffineTransform(1, 0, 0, 1, 0, 0);
    }
}