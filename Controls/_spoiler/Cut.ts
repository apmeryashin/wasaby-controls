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
    private _lines: number | null = null;
    private _expanded: boolean = false;

    protected _template: TemplateFunction = template;
    protected _isIE: boolean = detection.isIE11;
    protected _lineHeightForIE: Record<string, number> = IECompatibleLineHeights;

    private _resizeObserver: ResizeObserverUtil;
    private _firstResizePassed: boolean = false;

    readonly '[Controls/_interface/IBackgroundStyle]': boolean = true;
    readonly '[Controls/_toggle/interface/IExpandable]': boolean = true;

    protected _beforeMount(options?: ICutOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._resizeObserver = new ResizeObserverUtil(this, this._resizeObserverCallback);
        this._expanded = Util._getExpanded(options, this._expanded);
        this._lines = Cut._calcLines(options.lines, this._expanded);
        return super._beforeMount(options, contexts, receivedState);
    }

    protected _afterMount(options: ICutOptions): void {
        this._resizeObserver.observe(this._children.content, { box: RESIZE_OBSERVER_BOX.borderBox });
    }

    private _resizeObserverCallback(): void {
        // ResizeObserver выстрелит в первый раз после инициализации. Если кат изначально был открыт - его скроет.
        // Игнорируем первый вызов.
        if (!this._firstResizePassed) {
            this._firstResizePassed = true;
            return;
        }
        if (this._expanded) {
            // Скрываем кат, если контент поменял размер
            this._expanded = false;
            this._notify('expandedChanged', [this._expanded]);
        }
    }

    protected _beforeUpdate(options?: ICutOptions, contexts?: any): void {
        if (options.hasOwnProperty('expanded') && (this._options.expanded !== options.expanded ||
            this._expanded !== options.expanded)) {
            this._expanded = options.expanded;
        }
        this._lines = Cut._calcLines(options.lines, this._expanded);

        super._beforeUpdate(options, contexts);
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
