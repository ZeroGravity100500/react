import { clampPoint } from "../Math/mmath";

export interface IPoint2D {
    x: number;
    y: number;
}

export interface IPointerEvent {
    //type: string;
    point: IPoint2D;
    left_button_down: boolean;
    right_button_dowm: boolean;
    middle_button_down: boolean;
    wheel: number;
}

export class PointerController {
    public static LEFT_BUTTON = 1;
    public static RIGHT_BUTTON = 2;
    public static MIDDLE_BUTTON = 4;

    public static POINTER_EVENT = 'pointerEvent';
    //public static POINTER_MOVE = 'pointer';
    public static POINTER_LBUTTON_DOWN = 'lbutton';
    public static POINTER_RBUTTON_DOWN = 'rbutton';
    public static POINTER_MBUTTON_DOWN = 'mbutton';

    private _element: HTMLElement | undefined;

    private _point: IPoint2D = { x: 0, y: 0 };
    private _left_button_down: boolean = false;
    private _right_button_dowm: boolean = false;
    private _middle_button_down: boolean = false;
    private _wheel: number = 0;

    private emitEvent() {
        let eventDetail: IPointerEvent = {
            point: this._point,
            left_button_down: this._left_button_down,
            right_button_dowm: this._right_button_dowm,
            middle_button_down: this._middle_button_down,
            wheel: this._wheel
        };

        if(this._element)
            this._element.dispatchEvent(new CustomEvent(PointerController.POINTER_EVENT, { detail: eventDetail }));
        else
            document.dispatchEvent(new CustomEvent(PointerController.POINTER_EVENT, { detail: eventDetail }));
    }

    constructor(element?: HTMLElement) {
        this._element = element;
        if (this._element) {
            this._element.addEventListener('pointermove', this.onPointerMove.bind(this));
            this._element.addEventListener('pointerup', this.onPointerDownUp.bind(this));
            this._element.addEventListener('pointerdown', this.onPointerDownUp.bind(this));
            this._element.addEventListener('wheel', this.onWheel.bind(this));
        } else {
            document.addEventListener('pointermove', this.onPointerMove.bind(this));
            document.addEventListener('pointerup', this.onPointerDownUp.bind(this));
            document.addEventListener('pointerdown', this.onPointerDownUp.bind(this));
            document.addEventListener('wheel', this.onWheel.bind(this));
        }
    }

    destroy() {
        if (this._element) {
            this._element.removeEventListener('pointermove', this.onPointerMove);
            this._element.removeEventListener('pointerup', this.onPointerDownUp);
            this._element.removeEventListener('pointerdown', this.onPointerDownUp);
            this._element.removeEventListener('wheel', this.onWheel.bind(this));
        } else {
            document.removeEventListener('pointermove', this.onPointerMove.bind(this));
            document.removeEventListener('pointerup', this.onPointerDownUp.bind(this));
            document.removeEventListener('pointerdown', this.onPointerDownUp.bind(this));
            document.removeEventListener('wheel', this.onWheel.bind(this));
        }
    }

    private eventToLocalCoords(e: PointerEvent | WheelEvent): IPoint2D {
        let b = this._element?.getBoundingClientRect() || new DOMRect();
        let point;
        if(this._element){
            point = { x: e.clientX - b.left, y: e.clientY - b.top };
            clampPoint(point, { x: 0, y: 0 }, { x: b.right, y: b.bottom });
        } else{
            point = { x: e.clientX, y: e.clientY };
        }
        return point;
    }

    private onPointerMove(e: PointerEvent) {
        this._point = this.eventToLocalCoords(e);
        this._wheel = 0;

        this.emitEvent();
    }

    private onWheel(e: WheelEvent) {
        this._point = this.eventToLocalCoords(e);
        this._left_button_down = (e.buttons & PointerController.LEFT_BUTTON) !== 0;
        this._right_button_dowm = (e.buttons & PointerController.RIGHT_BUTTON) !== 0;
        this._middle_button_down = (e.buttons & PointerController.MIDDLE_BUTTON) !== 0;
        this._wheel = e.deltaY;

        this.emitEvent();
    }

    private onPointerDownUp(e: PointerEvent) {
        this._point = this.eventToLocalCoords(e);
        this._left_button_down = (e.buttons & PointerController.LEFT_BUTTON) !== 0;
        this._right_button_dowm = (e.buttons & PointerController.RIGHT_BUTTON) !== 0;
        this._middle_button_down = (e.buttons & PointerController.MIDDLE_BUTTON) !== 0;
        this._wheel = 0;

        this.emitEvent();
    }
}