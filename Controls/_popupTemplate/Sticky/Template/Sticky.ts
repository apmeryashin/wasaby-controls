import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Sticky/Template/Sticky';
import {Controller as ManagerController} from 'Controls/popup';
import {default as IPopupTemplateBase} from 'Controls/_popupTemplate/interface/IPopupTemplateBase';
import { IPopupTemplateOptions } from 'Controls/_popupTemplate/interface/IPopupTemplate';
import IBackgroundStyle, {IBackgroundStyleOptions} from 'Controls/_interface/IBackgroundStyle';
import 'css!Controls/popupTemplate';

const enum POSITION {
    RIGHT = 'right',
    LEFT = 'left',
    DEFAULT = 'default'
}

const MIN_RIGHT_OFFSET = 30;

interface IStickyTemplateOptions extends IControlOptions, IPopupTemplateOptions, IBackgroundStyleOptions {
    shadowVisible?: boolean;
    stickyPosition?: object;
}

/**
 * Базовый шаблон для {@link /doc/platform/developmentapl/interface-development/controls/openers/sticky/ прилипающих блоков}.
 * Имеет три контентные опции - для шапки, контента и подвала, а так же крестик закрытия, соответствующие стандарту выпадающих списков.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/openers/sticky/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
 *
 * @class Controls/_popupTemplate/Sticky
 * @extends UI/Base:Control
 *
 * @public
 * @author Красильников А.С.
 * @implements Controls/popupTemplate:IPopupTemplateBase
 * @demo Controls-demo/PopupTemplate/Sticky/FooterContentTemplate/Index
 * @demo Controls-demo/PopupTemplate/Sticky/CloseButtonVisibility/Index
 * @demo Controls-demo/PopupTemplate/Sticky/HeaderContentTemplate/Index
 */

class StickyTemplate extends Control<IStickyTemplateOptions> implements IPopupTemplateBase, IBackgroundStyle {
    readonly '[Controls/_popupTemplate/interface/IPopupTemplateBase]': boolean;
    readonly '[Controls/_interface/IBackgroundStyle]': boolean;

    protected _template: TemplateFunction = template;
    protected _headerTheme: string;
    protected _closeBtnPosition: POSITION = POSITION.DEFAULT;

    protected _beforeMount(options: IPopupTemplateOptions): void {
        this._headerTheme = StickyTemplate._getTheme();
    }

    protected _beforeUpdate(options: IPopupTemplateOptions): void {
        this._headerTheme = StickyTemplate._getTheme();
        this._updateCloseBtnPosition(options);
    }

    protected _updateCloseBtnPosition(options: IStickyTemplateOptions): void {
        if (options.stickyPosition && options.closeButtonViewMode === 'external') {
            // если вызывающий элемент находится в левой части экрана, то крестик всегда позиционируем справа
            if (options.stickyPosition.targetPosition.left <  this.getWindowInnerWidth() / 2) {
                this._closeBtnPosition =  POSITION.RIGHT;
            } else {
                const openerLeft = options.stickyPosition.targetPosition.left;
                const popupLeft = options.stickyPosition.position.left;
                // Вычисляем смещения попапа влево, т.к окно выравнивается по центру открывающего элемента
                const popupOffset = (options.stickyPosition.sizes.width -
                    options.stickyPosition.targetPosition.width) / 2;
                const isReverted = (popupLeft + popupOffset) !== openerLeft;
                const isOutside = popupLeft + options.stickyPosition.sizes.width >
                    window?.innerWidth - MIN_RIGHT_OFFSET;
                this._closeBtnPosition = isReverted || isOutside ? POSITION.LEFT : POSITION.RIGHT;
            }
        }
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

    private static _getTheme(): string {
        return ManagerController.getPopupHeaderTheme();
    }

    static getDefaultOptions(): IStickyTemplateOptions {
        return {
            headingFontSize: 'l',
            headingFontColorStyle: 'secondary',
            closeButtonVisibility: true,
            shadowVisible: false,
            backgroundStyle: 'default',
            closeButtonViewMode: 'link'
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
export default StickyTemplate;
