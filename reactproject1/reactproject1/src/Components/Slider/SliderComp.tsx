import React from 'react'
import classes from './css/Slider.module.css'

interface IProps {
    minValue: number;
    maxValue: number;
    defaultValue?: number;
    style?: {};

    step: number;
    className: string | undefined;
    onChangeHandler: any | undefined;
}

interface IState {
    value: number;
}

export class SliderComp extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            value: this.props.defaultValue || this.props.minValue 
        }

        this.onChange = this.onChange.bind(this);
    }

    private onChange(e: any) {
        if (this.props.onChangeHandler) {
            this.props.onChangeHandler(e.target.value);
        }
        this.setState({ value: e.target.value });
    }

    render() {
        return (
            <input type={'range'}
                className={this.props.className}
                min={this.props.minValue}
                max={this.props.maxValue}
                step={this.props.step}
                defaultValue={this.props.defaultValue || this.props.minValue}
                onChange={this.onChange}
                style={this.props.style}
            >
            </input>
        );
    }

    public static defaultProps: IProps = {
        minValue: 0,
        maxValue: 100,
        step: 1,
        className: classes.sliderClass,
        onChangeHandler: undefined
    }
}