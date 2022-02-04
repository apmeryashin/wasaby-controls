import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {_Scrollbar as BaseScrollbar} from 'Controls/scroll';
import * as Template from 'wml!Controls/_horizontalScroll/scrollBar/ScrollBar';

export interface IScrollBarOptions extends IControlOptions {
    scrollBarReadyCallback: (scrollBar: ScrollBar) => void;
    scrollPositionChangedCallback: (position: number) => void;

    scrollableWidth: number;
}

export default class ScrollBar extends Control<IScrollBarOptions> {
    _template: TemplateFunction = Template;
    _position: number = 0;

    _children: {
        scrollBar?: BaseScrollbar;
    };

    setScrollPosition(position: number): void {
        this._position = position;
    }

    protected _beforeMount(options: IScrollBarOptions): void {
        options.scrollBarReadyCallback(this);
    }

    protected _afterRender(options?: IScrollBarOptions): void {
        if (this._options.scrollableWidth !== options.scrollableWidth) {
            this._children.scrollBar?.recalcSizes();
        }
    }

    private _onPositionChanged(_, position: number): void {
        this._options.scrollPositionChangedCallback(position);
    }
}
