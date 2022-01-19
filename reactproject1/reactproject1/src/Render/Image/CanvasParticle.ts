import { IBrush, SolidBrush } from "../../Color/Brush";
import { Vec2D } from "../../Math/Vec2D";

export class CanvasParticle {
    private _pos: Vec2D = new Vec2D();
    private _initialPos: Vec2D;
    private _brush: IBrush;
    private _size: number;
    private _velocityX: number; 
    private _velocityY: number;
    private _weight: number;
    private _life: number;

    constructor(x: number, y: number, size?: number, weight?: number, brush? :IBrush) {
        this._pos = new Vec2D(x, y);
        this._initialPos = new Vec2D(x, y);
        this._size = size || 2;
        this._brush = brush || SolidBrush.SolidBlack;
        this._velocityX = 0; //Math.random() * 2 - 1;
        this._velocityY = Math.random() + 0.1;
        this._weight = weight || Math.random();
        this._life = 10000;
    }

    private reset() {
        this._pos = new Vec2D(this._initialPos);
        this._life = 10000;
    }

    update(cnt: CanvasRenderingContext2D, delta: number) {
        //update position
        this._pos.x += this._velocityX;
        this._pos.y += (this._velocityY * this._weight);

        this._life -= delta;
        if(this._life <= 0) {
            this.reset();
        }

        if (cnt)
            this.draw(cnt);
    }

    private draw(cnt: CanvasRenderingContext2D) {
        if (cnt) {
            if (this._brush.canvasStyle)
                cnt.fillStyle = this._brush.canvasStyle;
            cnt.fillRect(this._pos.x, this._pos.y, this._size, this._size);
        }
    }
}