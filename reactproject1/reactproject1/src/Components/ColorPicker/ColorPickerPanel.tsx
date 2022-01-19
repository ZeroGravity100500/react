import React from 'react'
import { Color, HsvColor } from '../../Color/Color';
import { clampPoint } from '../../Math/mmath';
import { Vec2D } from '../../Math/Vec2D';
import { ColorPickerAlpha } from './ColorPickerAlpha';
import { ColorPickerHue } from './ColorPickerHue';
import { ColorInputHexField } from './ColorPickerHexInput';
import classes from "./css/ColorPicker.module.css"

interface IProps {
    color?: string;
    width: number;
    height: number;
    colorChangedCallback: any;
}

interface IState {
    selectedColor: Color;
    backgroundColor: Color;
    cursorPoint: Vec2D;

    alpha: number;
    hue: number;
    saturation: number;
    value: number;
}

class ColorPickerPanel extends React.Component<IProps, IState> {
    private _cursor: Vec2D = new Vec2D();
    private _mouseDown: boolean = false;
    private _target = React.createRef<HTMLDivElement>();

    private onMouseDown(e: any) {
        e.preventDefault();
        var rect = e.currentTarget.getBoundingClientRect();
        this._mouseDown = true;
        this._cursor.x = e.clientX - rect.left;
        this._cursor.y = e.clientY - rect.top;
        clampPoint(this._cursor, new Vec2D(), new Vec2D(rect.width, rect.height));
        this.calculateSturationValue();
        this.setState({ cursorPoint: this._cursor });
    }

    private onMouseUp(e: any) {
        e.preventDefault();
        this._mouseDown = false;
    }

    private onContextMenu(e: any) {
        e.preventDefault();
    }

    private onMouseMove(e: any) {
        var rect = e.currentTarget.getBoundingClientRect();
        if (this._mouseDown) {
            this._cursor.x = e.clientX - rect.left;
            this._cursor.y = e.clientY - rect.top;
            if (clampPoint(this._cursor, new Vec2D(), new Vec2D(rect.width, rect.height))) {
                this._mouseDown = false;
            }
            this.calculateSturationValue();
            this.setState({ cursorPoint: this._cursor });
        }
    }

    constructor(props: IProps) {
        super(props);
        this.state = {
            backgroundColor: new Color(this.props.color || 'red'),
            selectedColor: new Color(this.props.color || 'red'),
            cursorPoint: this._cursor,
            hue: 0,
            saturation: 0,
            value: 0,
            alpha: 1
        };

        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
    }

    calculateSturationValue() {
        var color = this.state.backgroundColor.toHsv();
        color.s = (this._cursor.x / this.props.width) * 100;
        color.v = (1 - this._cursor.y / this.props.height) * 100;
        this.setState({ saturation: color.s, value: color.v });

        this.state.selectedColor.setColor(color);
        this.setState({selectedColor: new Color(color) });
        // this.props.colorChangedCallback(new Color(color));
        // this.updateSelectedColor(color);
    }

    hueChanged = (hue: number) => {
        var color = this.state.backgroundColor.toHsv();
        color.h = hue;

        // this.setState({ hue: color.h });
        this.setState({ backgroundColor: new Color(color) });
        
        this.updateSelectedColor(color);
    }

    alphaChanged = (alpha: number) => {
        var color = this.state.selectedColor.toHsv();
        color.a = alpha / 100;
        // this.setState({ selectedColor: new Color(color) });
        this.updateSelectedColor(color);
    }

    private updateSelectedColor(color: HsvColor) {
        color.s = (this._cursor.x / this.props.width) * 100;
        color.v = (1 - this._cursor.y / this.props.height) * 100;
        this.setState({ selectedColor: new Color(color) });
        this.props.colorChangedCallback(new Color(color));
    }

    hexChanged(value: string) {
        try{
            let color = new Color(value);
            if(color.isValid()) {
                // let bg = this.state.backgroundColor.toHsv();
                // let nc = color.toHsv();
                // bg.h = nc.h;
                // this.setState({ backgroundColor: new Color(bg) });
                this.updateSelectedColor(color.toHsv());
            }
        } catch {
            return;
        }
    }

    render() {
        return <div className={classes.colorPickerPanel}>
            <div className={classes.colorPickerPanelInner}>
                <div className={classes.colorPickerPanelBoard}>
                    <div ref={this._target} className={classes.colorPickerPanelBoardHsv}
                        style={{ background: this.state.backgroundColor.toRgbString(), width: this.props.width, height: this.props.height }}
                        onMouseMove={this.onMouseMove}
                        onMouseDown={this.onMouseDown}
                        onMouseUp={this.onMouseUp}
                        onContextMenu={this.onContextMenu}>

                        <div className={classes.colorPickerPanelBoardValue}>
                        </div>
                        <div className={classes.colorPickerPanelBoardSaturation}>
                        </div>
                        <div className={classes.colorPickerPanelPin} style={{ background: 'black', left: this.state.cursorPoint.x - 5, top: this.state.cursorPoint.y - 5 }}>
                        </div>
                    </div>
                </div>
                <div style={{ 
                    width: 100,
                    height: 20,
                    backgroundColor: this.state.selectedColor.toRgbString()
                    }}>

                </div>
                <ColorPickerHue onHueChangeCallback={this.hueChanged} />
                <ColorPickerAlpha solidColor={this.state.selectedColor} onAlphaChangeCallback={this.alphaChanged} />
                <ColorInputHexField onInputChanged={this.hexChanged}/>
            </div>
        </div>
    }

    public static defaultProps: IProps = {
        colorChangedCallback: null,
        width: 200,
        height: 150
    };
}

export default ColorPickerPanel;