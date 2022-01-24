import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls/_horizontalScroll/ScrollBar/ScrollBar';

export default class ScrollBar extends Control {
    _template: TemplateFunction = Template;
    _position: number = 0;

    setScrollPosition(position: number): void {
       this._position = position;
    }

    _onPositionChanged(e, pos): void {
        this._options.columnScrollPositionChangedCallback(pos);
    }
}
