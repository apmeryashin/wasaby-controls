import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls/_horizontalScroll/scrollBar/ScrollBar';

export interface IScrollBarOptions extends IControlOptions {
    scrollBarReadyCallback: (scrollBar: ScrollBar) => void;
    scrollPositionChangedCallback: (position: number) => void;
}

export default class ScrollBar extends Control<IScrollBarOptions> {
    _template: TemplateFunction = Template;
    _position: number = 0;

    setScrollPosition(position: number): void {
        this._position = position;
    }

    protected _beforeMount(options: IScrollBarOptions): void {
        options.scrollBarReadyCallback(this);
    }

    private _onPositionChanged(_, position: number): void {
        this._options.scrollPositionChangedCallback(position);
    }
}
