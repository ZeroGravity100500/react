import React, { useState } from 'react';
import { Color } from '../Color/Color';
interface IProps {
    backgroundColor: Color;
    text: string;
}

const View = (props: IProps) => {
    return (
        <div style={{ width:'fit-content', paddingLeft: 5, paddingRight: 5, height: 25, backgroundColor: props.backgroundColor.toRgbString() }}>
            {props.text}
        </div>
    );
}
export default View;