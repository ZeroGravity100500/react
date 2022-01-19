import { Color } from "../../Color/Color";

export interface IPixelData {
    data: Color[];
    width: number;
    height: number;
}

export class ImageLoader {
    private _image = new Image();
    private _imgData: ImageData | undefined;
    private _onLoadCallback: any;
    private _pixelData: IPixelData | undefined;

    constructor(src?: string, onLoadCallback?: any) {
        this._image.onload = this.onLoad.bind(this);

        if (src) {
            this._image.src = src;
        }
        if (onLoadCallback) {
            this._onLoadCallback = onLoadCallback;
        }
    }

    static load(src: string, onLoadCallback?: any) {
        let loader = new ImageLoader(src, onLoadCallback);
    }

    private onLoad() {
        let canvas = document.createElement('canvas');
        canvas.style.display = 'none';
        canvas.width = this._image.width;
        canvas.height = this._image.height;
        let ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(this._image, 0, 0);
            this._imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            this.toPixelArray();
        }

        if (this._onLoadCallback) {
            this._onLoadCallback(this);
        }
    }

    private toPixelArray() {
        if(this._imgData) {
            this._pixelData = {
                data: [],
                width: this._imgData.width,
                height: this._imgData.height
            };
            for(let i = 0; i < this._imgData.data.length; i+=4) {
                this._pixelData.data.push(new Color({ 
                    r: this._imgData.data[i + 0],
                    g: this._imgData.data[i + 1],
                    b: this._imgData.data[i + 2],
                    a: this._imgData.data[i + 3] / 255
                }));
            }
        }
    }

    pixelArray() : IPixelData | undefined{
        return this._pixelData;
    }

    hasImageData(): boolean {
        return this._imgData !== null;
    }

    imageData() {
        return this._imgData;
    }

    image() {
        return this._image;
    }
}