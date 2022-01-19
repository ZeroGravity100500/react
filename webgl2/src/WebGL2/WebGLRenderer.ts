import { GLState } from "./GL/GLState";

export class WebGLRenderer {
    private _element: HTMLCanvasElement;
    private _gl: WebGL2RenderingContext;
    private _width: number;
    private _height: number;

    private gl_state: GLState | undefined;

    constructor(element?: HTMLCanvasElement | string, width: number = 800, height: number = 600) {
        if (element && typeof element === 'string') {
            this._element = document.getElementById(element) as HTMLCanvasElement;
        } else if (element && element instanceof HTMLCanvasElement) {
            this._element = element;
        } else {
            this._element = document.createElement('canvas');
        }

        this._width = width;
        this._height = height;
        this._element.width = width;
        this._element.height = height;
        this._gl = this._element.getContext('webgl2') as WebGL2RenderingContext;
        if (this._gl === null) {
            throw new Error('WebGL2 not supported cannot continue.');
        }
        this.initGL();
    }

    private initGL() {
        this._gl.viewport(0, 0, this._width, this._height);

        this.gl_state = new GLState(this._gl);
        this.gl_state.clearColor = [0.8, 0.8, 0.8, 1];
        this.gl_state.setClearDepth(true);

        this.gl_state.clear();
    }

    public setViewport(newWidth: number, newHeight:number): void {
        if(this._width !== newWidth || this._height === newHeight) {
            this._width = newWidth;
            this._height = newHeight;
            this._gl.viewport(0, 0, this._width, this._height);
        }
    }
}