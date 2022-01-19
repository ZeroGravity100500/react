import React from "react";
import { Vector2D } from "../../Math/Vec2D";
import classes from './css/DialogWindow.module.css';
import { WindowTitle } from "./WindowTitle";

type OnMoveCallback = (pos: Vector2D) => void;

interface IProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    title?: string;
    onClose?: any;
    onMoveCallbeck?: OnMoveCallback;
}

interface IState {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class DialogWindow extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            x: this.props.x || 100,
            y: this.props.y || 50,
            width: this.props.width || 300,
            height: this.props.height || 200,
        }
    }

    onChangePosition(newPos: Vector2D) {
        this.setState({x: newPos.x, y: newPos.y});
        if(this.props.onMoveCallbeck)
            this.props.onMoveCallbeck(newPos);
    }

    close() {
        if(this.props.onClose)
            this.props.onClose();
    }

    getPosition(): Vector2D {
        return { x: this.state.x, y: this.state.y };
    }

    render(): React.ReactNode {
        return(
            <div className={ classes.dialogWindow } style={{ 
                    left: this.state.x,
                    top: this.state.y
                }}>
                <WindowTitle title={this.props.title || 'Dragable window'} onChangePosition={this.onChangePosition.bind(this)} onCloseClick={this.close.bind(this)}/>
                <div className={classes.dialogWindowContent}>
                    { this.props.children }
                </div>
            </div>
        );
    }
}