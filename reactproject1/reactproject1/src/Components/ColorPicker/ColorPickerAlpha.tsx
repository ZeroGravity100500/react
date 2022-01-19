import React from "react"
import { Color } from "../../Color/Color";
import classes from "./css/ColorPicker.module.css"

interface IProps {
    defaultAlpha?: number;
    onAlphaChangeCallback?: any | undefined;
    solidColor: Color;
}

interface IState {
    hue: number;
    pin: number;
}

export class ColorPickerAlpha extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            hue: this.props.defaultAlpha ? this.props.defaultAlpha : 100,
            pin: this.props.defaultAlpha ? this.props.defaultAlpha : 100
        }
        this.onChange = this.onChange.bind(this);
    }

    private onChange(e: any) {
        var val = e.target.value;
        this.setAlpha(val);
        if (this.props.onAlphaChangeCallback)
            this.props.onAlphaChangeCallback(val);
    }

    public setAlpha(value: number) {
        var pin = value;
        this.setState({ pin: pin });
    }

    render() {
        return (
            <div
                className={classes.colorPickerAlpha}
                style={{ color: this.props.solidColor.toRgbString() }}
            >
                <div className={classes.colorPickerAlphaPin}
                    style={{
                        left: this.state.pin + '%',
                        color: this.props.solidColor.toRgbString()
                    }}
                />
                <input
                    type={'range'}
                    min={0}
                    max={100}
                    step={1}
                    defaultValue={this.props.defaultAlpha ? this.props.defaultAlpha : 100}
                    onChange={this.onChange}
                    className={classes.colorPickerInput}
                />
            </div>
        );
    }
}
