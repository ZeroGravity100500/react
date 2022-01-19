import React, { useState } from "react";

type GradientStopProps = {
    stop: number;
    color: string;
}

type GradientStopState = {
    position: number;
}

class GradientStopPin extends React.Component<GradientStopProps, GradientStopState> {
    private _ref = React.createRef<HTMLDivElement>();
    private _pos: number = 0;
    protected _mouseDown: boolean = false;
    protected _lastMousePos: { x:number, y: number } = { x: 0, y: 0 };
    protected _mouseOffset: { x:number, y: number } = { x: 0, y: 0 };

    constructor(props: GradientStopProps) {
        super(props);
        this._pos = this.props.stop / 100;
        this.state = {
            position: this.props.stop
        }
    }

    private calcPosition(): number {
        if(this._ref.current) {
            let parentRect = this._ref.current.parentElement?.getBoundingClientRect();
            if(parentRect) {
                let nPos = parentRect.width * this._pos;
                if(nPos < 0) {
                    this._pos = 0;
                    return 0;
                }
                return nPos;
            }
        }
        return 0;
    }

    private toLocalPos(x:number, y: number): {x: number, y: number} {
        if(this._ref.current) {
            let rect = this._ref.current.getBoundingClientRect();
            let nx = x - rect.x;
            let ny = y - rect.y;
            return { x: nx, y: ny };
        }
        return { x: x, y: y };
    }

    componentDidMount() {
        this.forceUpdate();       
    }

    protected onMouseDown(ev: MouseEvent | React.MouseEvent) {
        ev.stopPropagation();
        ev.preventDefault();
        this._mouseDown = true;
        this._lastMousePos = this.toLocalPos(ev.clientX, ev.clientY);
        this._mouseOffset = this.toLocalPos(ev.clientX, ev.clientY);
        console.log('mouse down', this._lastMousePos);
    }

    protected onMouseUp(ev: MouseEvent | React.MouseEvent) {
        ev.stopPropagation();
        ev.preventDefault();
        this._mouseDown = false;
        this._lastMousePos = { x: 0, y: 0 }
        this._mouseOffset = { x: 0, y: 0 }
        console.log('mouse up');
    }

    protected onMouseMove(ev: MouseEvent | React.MouseEvent) {
        if(this._mouseDown) {
            ev.stopPropagation();
            ev.preventDefault();
            let currentPos = this.toLocalPos(ev.clientX, ev.clientY);
            let deltaX = currentPos.x - this._lastMousePos.x + this._mouseOffset.x;
            this._pos = this._pos + (deltaX / 100);
            console.log(this._pos);
            this._lastMousePos = currentPos;
            this.forceUpdate();
        }
    }

    render(): React.ReactNode {
        return(
            <div
                ref={this._ref} 
                onMouseDown={this.onMouseDown.bind(this)}
                onMouseUp={this.onMouseUp.bind(this)}
                onMouseMove={this.onMouseMove.bind(this)}
                onMouseLeave={this.onMouseUp.bind(this)}
                style={{
                position: 'absolute',
                width: '20px',
                marginLeft: '-10px',
                height: '50px',
                left: this.calcPosition() + 'px',
                backgroundColor: this.props.color
            }} />
        )
    }
}

const GradientEdit = () => {
    let [gradientString, setgradientString] = useState('linear-gradient(45deg, red, blue)');

    return(
        <div style={{
            backgroundImage: gradientString,
            width: '500px',
            height: '150px',
            display: "flex",
            position: 'absolute',
            left: '50px'
        }}>
            <GradientStopPin stop={0} color="blue"/>
            <GradientStopPin stop={50} color="white"/>
            <GradientStopPin stop={100} color="black"/>
            {gradientString}
        </div>
    )
}

export default GradientEdit;