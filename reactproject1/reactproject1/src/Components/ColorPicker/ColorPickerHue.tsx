import React from "react"
import { Color } from "../../Color/Color";
import classes from "./css/ColorPicker.module.css"

interface IProps {
    defaultHue?: number;
    onHueChangeCallback?: any | undefined;
}

interface IState {
    hue: number;
    pin: number;
}

export class ColorPickerHue extends React.Component<IProps, IState> {
    private pinBgColor: Color;
    constructor(props: IProps) {
        super(props);
        this.state = {
            hue: this.props.defaultHue ? this.props.defaultHue : 0,
            pin: this.props.defaultHue ? this.props.defaultHue : 0
        }
        this.pinBgColor = new Color({ h: this.state.hue, s: 1, v: 1 })
        this.onChange = this.onChange.bind(this);
    }

    private onChange(e: any) {
        var val = e.target.value * 3.6;
        this.setHue360(val);
        if (this.props.onHueChangeCallback)
            this.props.onHueChangeCallback(val);
    }

    public setHue360(value: number) {
        this.pinBgColor.setColor({ h: value, s: 1, v: 1 });
        var pin = value / 3.6;
        this.setState({ pin: pin });
    }

    public setHue100(value: number) {
        var nValue = value * 3.6;
        this.pinBgColor.setColor({ h: nValue, s: 1, v: 1 });
        this.setState({ pin: value });
    }

    render() {
        return (
            <div
                className={classes.colorPickerHue}
            >
                <input
                    type={'range'}
                    min={0}
                    max={100}
                    step={1}
                    defaultValue={this.props.defaultHue ? this.props.defaultHue : 0}
                    onChange={this.onChange}
                    className={classes.colorPickerInput}
                />
                <div className={classes.colorPickerHuePin}
                    style={{
                        left: this.state.pin + '%',
                        backgroundColor: this.pinBgColor.toRgbString()
                    }}
                />
            </div>
        );
    }
}
