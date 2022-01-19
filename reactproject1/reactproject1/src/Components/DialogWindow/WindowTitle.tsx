import React from "react";
import { pointInRect } from "../../Math/mmath";
import { Vector2D } from "../../Math/Vec2D";
import { IPointerEvent, PointerController } from "../PointerController";
import CloseButton from "./CloseButton";
import classes from './css/WindowTitle.module.css'

type OnChangePosition = (pos: Vector2D) => void;
type OnClose = () => void;

interface IProps {
    title: string;
    onChangePosition?: OnChangePosition;
    onCloseClick?: OnClose; 
}

interface IState {

}

export class WindowTitle extends React.Component<IProps, IState> {
    private _pointerController: PointerController | undefined;
    private _element = React.createRef<HTMLDivElement>();
    private _dragged = false;
    private _dragStart: Vector2D | undefined;
    private _offset: Vector2D | undefined;

    constructor(props: IProps) {
        super(props);
    }

    onCloseClick() {
        if(this.props.onCloseClick)
            this.props.onCloseClick();
    }

    componentDidMount() {
        if(this._element.current) {
            this._pointerController = new PointerController();
            document.addEventListener(PointerController.POINTER_EVENT, this.onControllerInput.bind(this));
        }
    }

    componentWillUnmount() {
        console.log('componentWillUnmount');
        if(this._pointerController) {
            this._pointerController.destroy();
        }
        document.removeEventListener(PointerController.POINTER_EVENT, this.onControllerInput);
    }

    onControllerInput(e: Event) {
        let event: IPointerEvent = (e as CustomEvent).detail;
        let rect = this._element.current?.getBoundingClientRect();

        if(this._dragged && this._dragStart) {
            // console.log('dragStart: ', this._dragStart);
            // console.log('eventPos: ', event.point);
            let newPos;
            if(this._offset)
                newPos = {
                    x: event.point.x + this._offset.x,
                    y: event.point.y + this._offset.y
                }
            else
                newPos = {
                    x: event.point.x,
                    y: event.point.y
                }

            if(this.props.onChangePosition) {
                this.props.onChangePosition(newPos);
            }
        }

        if(event.left_button_down && pointInRect(event.point, rect)) {
            this._dragged = true;
            this._dragStart = { x: event.point.x, y: event.point.y };
            if(rect && !this._offset)
                this._offset = { x: rect.x - event.point.x, y: rect.y - event.point.y };
        } else {
            this._dragged = false;
            this._offset = undefined;
        }
    }

    render(): React.ReactNode {
        return(
            <div ref={this._element} className={ classes.windowTitle }>
                {this.props.title}
                <CloseButton onClick={ this.onCloseClick.bind(this) }/>
            </div>
        );
    }
}