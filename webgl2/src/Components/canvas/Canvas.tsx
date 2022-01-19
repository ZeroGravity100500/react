import React from "react";
import { WebGLRenderer } from "../../WebGL2/WebGLRenderer";

type propsMap = {[key: string]: any};
type statsMap = {[key: string]: any};

export class CanvasComponent extends React.Component<propsMap, statsMap> {
    private _element = React.createRef<HTMLCanvasElement>();
    private _glRender: WebGLRenderer | undefined;

    constructor(props: propsMap) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        if(this._element.current) {
            this._glRender = new WebGLRenderer(this._element.current);
            if(this._glRender === undefined) throw new Error();
            this._element.current.addEventListener('resize', this.resizeHandler.bind(this));
        }
    }
     
    componentWillUnmount() {
        if(this._element.current) {
            this._element.current.removeEventListener('resize', this.resizeHandler);
        }
    }

    private resizeHandler() {
        let rect = this._element.current?.getBoundingClientRect();
        if(rect && this._glRender) {
            this._glRender.setViewport(rect.width, rect.height);
        }
    }

    render(): React.ReactNode {
        return (
            <canvas ref={this._element}></canvas>
        )
    }
}