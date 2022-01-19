import React from "react";

type OnInputChanged = (text: string) => void;

interface IProps {
    value?: string;
    onInputChanged?: OnInputChanged;
}

interface IState {
    value: string;
}

export class ColorInputHexField extends React.Component<IProps, IState> {
    private regExp: RegExp = /[0-9a-fA-F]+/g;

    constructor(props: IProps) {
        super(props);
        this.state = {
            value: this.props.value || '#'
        }
    }

    onChange(ev: React.ChangeEvent<HTMLInputElement>) {
        ev.preventDefault();
        let str = ev.target.value;
        str = str.substring(1);

        if(str !== ''){
            if(this.regExp.test(str)) {
                str = '#' + str.substring(0, 6);
                this.setState({ value: str });
            } else {
                let v = this.regExp.exec(str.substring(0, 6));
                if(v) {
                    str = '#' + v[0];
                    this.setState({ value: '#' + v[0] });
                }
            }
        } else {
            this.setState({value: '#'});
        }
      
        if(this.props.onInputChanged)
            this.props.onInputChanged(str);
    }

    render(): React.ReactNode {
        return(
            <input 
                type={'text'}
                value={this.state.value}
                onChange={this.onChange.bind(this)}
            >
            </input>
        );
    }
}