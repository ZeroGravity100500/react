import React from "react";
import classes from './css/WindowTitle.module.css'

interface IProps {
    onClick?: any
}

const CloseButton = (props: IProps) => {
    return (
        <button className={ classes.windowClose } onClick={ props.onClick }>
            X
        </button>
    );
}

export default CloseButton;