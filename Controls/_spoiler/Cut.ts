import {descriptor} from 'Types/entity';
import {Control, TemplateFunction} from 'UI/Base';
import {IBackgroundStyle, IExpandable} from 'Controls/interface';
import Util from './Util';
import {ICutOptions} from './interface/ICut';
import {detection} from 'Env/Env';
import {IECompatibleLineHeights} from 'Controls/input';
import {RESIZE_OBSERVER_BOX, ResizeObserverUtil} from 'Controls/sizeUtils';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_spoiler/Cut/Cut';
import 'css!Controls/spoiler';

/**
 * Графический контрол, который ограничивает контент заданным числом строк.
 * Если контент превышает указанное число строк, то он обрезается и снизу добавляется многоточие.
 *
 * @class Controls/_spoiler/Cut
 * @extends UI/Base:Control
 * @implements Controls/spoiler:ICut
 * @public
 * @demo Controls-demo/Spoiler/Cut/Index
 *
 * @author Красильников А.С.
 */
class Cut extends Control<ICutOptions> implements IBackgroundStyle, IExpandable {
    protected _lines: number | null = null;
    protected _expanded: boolean = false;
    private _cutHeight: number;

    protected _template: TemplateFunction = template;
    protected _isIE: boolean = detection.isIE11;
    protected _lineHeightForIE: Record<string, number> = IECompatibleLineHeights;

    private _resizeObserver: ResizeObserverUtil;
    private _firstResizePassed: boolean = false;

    readonly '[Controls/_interface/IBackgroundStyle]': boolean = true;
    readonly '[Controls/_toggle/interface/IExpandable]': boolean = true;

    protected _beforeMount(options?: ICutOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._expanded = Util._getExpanded(options, this._expanded);
        this._lines = Cut._calcLines(options.lines, this._expanded);
        return super._beforeMount(options, contexts, receivedState);
    }

    protected _afterMount(options: ICutOptions): void {
        this._cutHeight = this._children.content.getBoundingClientRect().height;
        if (this._hasResizeObserver()) {
            this._resizeObserver = new ResizeObserverUtil(this, this._resizeObserverCallback);
            this._resizeObserver.observe(this._children.content as HTMLElement, { box: RESIZE_OBSERVER_BOX.borderBox });
        }
    }

    protected _hasResizeObserver(): boolean {
        return true;
    }

    private _resizeObserverCallback(entries: [ResizeObserverEntry]): void {
        // ResizeObserver выстрелит в первый раз после инициализации. Если кат изначально был открыт - его скроет.
        // Игнорируем первый вызов.
        if (!this._firstResizePassed) {
            this._firstResizePassed = true;
            return;
        }
        if (this._expanded) {
            const entry = entries[0];
            if (this._cutHeight !== entry.contentRect.height) {
                this._cutHeight = entry.contentRect.height;
                // Сворачиваем кат, если контент поменял высоту
                this._expanded = false;
                this._notify('expandedChanged', [this._expanded]);
            }
        }
    }

    protected _beforeUpdate(options?: ICutOptions): void {
        if (options.hasOwnProperty('expanded') && (this._options.expanded !== options.expanded ||
            this._expanded !== options.expanded)) {
            this._expanded = options.expanded;
        }
        this._lines = Cut._calcLines(options.lines, this._expanded);

        super._beforeUpdate(options);
    }

    protected _beforeUnmount(): void {
        this._resizeObserver?.terminate();
    }

    protected _onExpandedChangedHandler(event: Event, expanded: boolean): void {
        if (!this._options.hasOwnProperty('expanded')) {
            this._expanded = expanded;
        }
        this._notify('expandedChanged', [expanded]);
    }

    private static _calcLines(lines: number | null, expanded: boolean): number | null {
        return expanded ? null : lines;
    }

    static getOptionTypes(): object {
        return {
            lineHeight: descriptor(String),
            backgroundStyle: descriptor(String),
            lines: descriptor(Number, null).required()
        };
    }

    static getDefaultOptions(): object {
        return {
            lineHeight: 'm',
            backgroundStyle: 'default'
        };
    }
}

Object.defineProperty(Cut, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Cut.getDefaultOptions();
   }
});

export default Cut;
