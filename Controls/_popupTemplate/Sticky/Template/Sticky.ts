import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Sticky/Template/Sticky';
import {Controller as ManagerController} from 'Controls/popup';
import {default as IPopupTemplateBase} from 'Controls/_popupTemplate/interface/IPopupTemplateBase';
import { IPopupTemplateOptions } from 'Controls/_popupTemplate/interface/IPopupTemplate';
import {IBackgroundStyle, IBackgroundStyleOptions} from 'Controls/interface';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IDragObject} from 'Controls/dragnDrop';
import 'css!Controls/popupTemplate';
import {DimensionsMeasurer} from 'Controls/sizeUtils';
import {getRoundClass} from 'Controls/_popupTemplate/Util/PopupConfigUtil';
import {Logger} from 'UI/Utils';

const enum POSITION {
    RIGHT = 'right',
    LEFT = 'left',
    DEFAULT = 'default'
}

interface IStickyTemplateOptions extends IControlOptions, IPopupTemplateOptions, IBackgroundStyleOptions {
    shadowVisible?: boolean;
    stickyPosition?: object;
    borderStyle?: string;
    borderSize?: string;
    roundBorder?: boolean;
}

/**
 * Базовый шаблон для {@link /doc/platform/developmentapl/interface-development/controls/openers/sticky/ прилипающих блоков}.
 * Имеет три контентные опции - для шапки, контента и подвала, а так же крестик закрытия, соответствующие стандарту выпадающих списков.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/openers/sticky/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
 *
 * @class Controls/_popupTemplate/Sticky
 * @extends UI/Base:Control
 *
 * @public
 * @author Красильников А.С.
 * @implements Controls/popupTemplate:IPopupTemplateBase
 * @demo Controls-demo/PopupTemplate/Sticky/FooterContentTemplate/Index
 * @demo Controls-demo/PopupTemplate/Sticky/CloseButtonVisible/Index
 * @demo Controls-demo/PopupTemplate/Sticky/HeaderContentTemplate/Index
 */

class StickyTemplate extends Control<IStickyTemplateOptions> implements IPopupTemplateBase, IBackgroundStyle {
    readonly '[Controls/_popupTemplate/interface/IPopupTemplateBase]': boolean;
    readonly '[Controls/_interface/IBackgroundStyle]': boolean;

    protected _template: TemplateFunction = template;
    protected _closeBtnPosition: POSITION = POSITION.DEFAULT;
    protected _dragging: boolean = false;

    protected _beforeMount(options: IPopupTemplateOptions): void {
        if (options.closeButtonVisibility !== undefined) {
            Logger.error('Controls/popupTemplate:Sticky : Используется устаревшая опция closeButtonVisibility,' +
                                                                                     ' используйте closeButtonVisible');
        }
    }

    protected _beforeUpdate(options: IPopupTemplateOptions): void {
        this._updateCloseBtnPosition(options);
        if (options.stickyPosition && options.stickyPosition.direction &&
            this._options.stickyPosition.direction !== options.stickyPosition.direction) {
            this._verticalDirection = options.stickyPosition.direction.vertical;
        }
    }

    protected _getRoundedClass(options: IStickyTemplateOptions, type: string): string {
        return getRoundClass({
            options,
            type,
            hasRoundedBorder: options.roundBorder
        });
    }

    protected _getCloseButtonWidth(): number {
        if (this._children.hasOwnProperty('closeButton')) {
            return this._children.closeButton._container?.offsetWidth;
        }
        return 0;
    }

    protected _updateCloseBtnPosition(options: IStickyTemplateOptions): void {
        if (options.stickyPosition && options.closeButtonViewMode === 'external') {
            // если вызывающий элемент находится в левой части экрана, то крестик всегда позиционируем справа
            if (options.stickyPosition.targetPosition.left <  this.getWindowInnerWidth() / 2) {
                this._closeBtnPosition =  POSITION.RIGHT;
            } else {
                const isRightPosition = options.stickyPosition.direction?.horizontal === 'left';
                let popupRight;
                if (isRightPosition) {
                    popupRight = options.stickyPosition.position.right;
                } else {
                    const windowWidth = DimensionsMeasurer.getWindowDimensions(this._container).innerWidth;
                    popupRight =
                        windowWidth - (options.stickyPosition.position.left + options.stickyPosition.sizes.width);
                }
                const isFits = popupRight > this._getCloseButtonWidth();
                this._closeBtnPosition = isFits ? POSITION.RIGHT : POSITION.LEFT;
            }
        }
    }

    protected _onDragEnd(): void {
        this._notify('popupDragEnd', [], {bubbling: true});
    }

    protected _onDragMove(event: SyntheticEvent<Event>, dragObject: IDragObject): void {
        this._dragging = true;
        this._notify('popupDragStart', [dragObject.offset], {bubbling: true});
    }

    protected _onMouseDown(event: SyntheticEvent<MouseEvent>): void {
        if (this._needStartDrag(event)) {
            this._startDragNDrop(event);
        }
    }

    protected _click(): void {
        this._dragging = false;
    }

    protected _mouseOut(): void {
        this._dragging = false;
    }

    private _needStartDrag(event: SyntheticEvent<MouseEvent>): boolean {
        const {target} = event;
        const isEventProcessed = event.nativeEvent.processed;
        return this._options.draggable && (target as HTMLElement).tagName !== 'INPUT' && !isEventProcessed;
    }

    private _startDragNDrop(event: SyntheticEvent<Event>): void {
        this._children.dragNDrop.startDragNDrop(null, event);
    }

    private getWindowInnerWidth(): number {
        return window?.innerWidth;
    }

    protected close(): void {
        this._notify('close', [], {bubbling: true});
    }

    protected _proxyEvent(event: Event, eventName: string): void {
        this._notify(eventName, [event]);
    }

    protected _getBackgroundColor(): string {
        return this._options.backgroundStyle === 'default' ? 'controls-StickyTemplate-backgroundColor' :
            'controls-background-' + this._options.backgroundStyle;
    }

    private static _getTheme(): string {
        return ManagerController.getPopupHeaderTheme();
    }

    static getDefaultOptions(): IStickyTemplateOptions {
        return {
            headingFontSize: 'xs',
            headingFontColorStyle: 'label',
            headingTextTransform: 'uppercase',
            headingFontWeight: 'normal',
            closeButtonVisible: true,
            shadowVisible: false,
            backgroundStyle: 'default',
            headerBackgroundStyle: 'default',
            closeButtonViewMode: 'link',
            borderStyle: 'default',
            borderSize: 'default',
            roundBorder: true
        };
    }
}

Object.defineProperty(StickyTemplate, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return StickyTemplate.getDefaultOptions();
   }
});

/**
 * @name Controls/_popupTemplate/Sticky#draggable
 * @cfg {Boolean} Определяет, может ли окно перемещаться с помощью {@link /doc/platform/developmentapl/interface-development/controls/drag-n-drop/ d'n'd}.
 * @default false
 */

/**
 * @name Controls/_popupTemplate/Sticky#shadowVisible
 * @cfg {Boolean} Определяет, будет ли отображаться тень у прилипающего блока
 * @default false
 */

/**
 * @name Controls/_popupTemplate/Sticky#headingFontColorStyle
 * @cfg {String}
 * @demo Controls-demo/PopupTemplate/Sticky/HeaderCaption/Index
 */

/**
 * @name Controls/_popupTemplate/Sticky#headingFontSize
 * @cfg {String}
 * @demo Controls-demo/PopupTemplate/Sticky/HeaderCaption/Index
 */

/**
 * @name Controls/_popupTemplate/Sticky#roundBorder
 * @cfg {Boolean} Определяет будут ли скруглены углы окна.
 * @default true
 */

/**
 * @name Controls/_popupTemplate/Sticky#backgroundStyle
 * @cfg {String} Цвет фона окна.
 * @variant default
 * @variant unaccented
 * @variant secondary
 * @variant primary
 * @variant danger
 * @variant warning
 * @variant info
 * @variant success
 * @default default
 * @demo Controls-demo/PopupTemplate/Sticky/backgroundStyle/Index
 */

/**
 * @name Controls/_popupTemplate/Sticky#headerBackgroundStyle
 * @cfg {String} Цвет фона шапки.
 * @variant default
 * @variant unaccented
 * @variant secondary
 * @variant primary
 * @variant danger
 * @variant warning
 * @variant info
 * @variant success
 * @default default
 * @demo Controls-demo/PopupTemplate/Sticky/backgroundStyle/Index
 */
export default StickyTemplate;
