import { Vec4, Vector4 } from "../Math/Vector";

export class GLState {
    private _gl: WebGL2RenderingContext;

    private _clearMask: number = 0;

    private _clearColor: Vec4 = Vector4.fromValues(1, 1, 1, 1);
    private _clearDepth: number = 1;
    private _depthFunc: number = 0;

    private _clearStencil: number = 0;

    public get clearColor(): Vec4 {
        return this._clearColor;
    }

    public set clearColor(value: Vec4) {
        Vector4.set(this._clearColor, value);
        this._gl.clearColor(this._clearColor[0], this._clearColor[1], this._clearColor[2], this._clearColor[3])
    }

    constructor(gl: WebGL2RenderingContext) {
        this._gl = gl;
        this._clearMask = this._gl.COLOR_BUFFER_BIT;
    }

    setClearDepth(value: boolean, depth: number = 1) {
        if(value === true) this._clearMask |= this._gl.DEPTH_BUFFER_BIT;
        else this._clearMask &= ~(this._gl.DEPTH_BUFFER_BIT);
        this._clearDepth = depth;
    }

    setClearStencil(value: boolean) {
        if(value === true) this._clearMask |= this._gl.STENCIL_BUFFER_BIT;
        else this._clearMask &= ~(this._gl.STENCIL_BUFFER_BIT);
    }

    clear() {
        this._gl.clear(this._clearMask);
    }

    setDepthMask(mask: boolean) {
        this._gl.depthMask(mask);
    }

    setDepthFunc(id: number = this._gl.LEQUAL) {
        this._depthFunc = id;
        this._gl.depthFunc(this._depthFunc);
    }

    setDepthTest(depthTest: boolean) {
        if (depthTest) {
            this.enable(this._gl.DEPTH_TEST);
        } else {
            this.disable(this._gl.DEPTH_TEST);
        }
    }


    enable(id: number) {

    }
    disable(id: number) {

    }
}