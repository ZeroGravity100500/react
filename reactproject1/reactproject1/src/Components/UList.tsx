import React from 'react';
import './css/ListCss.css';

export class ListElement extends React.Component {
    private text = '';
    constructor(itemText: string) {
        super({});
        this.text = itemText;
    }

    render() {
        return (
            <li className='listItem'>
                {this.text};
            </li>
            );
    }
}

export class UnList extends React.Component {
    private items: ListElement[] = [];

    public addNewItem(text: string) {
        var e = new ListElement(text);
        if (e != null) {
            this.items.push(e);
        }
    }

    render() {
        return (
            <ul className='listClass'>{this.items}
            </ul>
        );
    }
}