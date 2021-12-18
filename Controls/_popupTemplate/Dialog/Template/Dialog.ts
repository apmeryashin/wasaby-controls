import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popupTemplate/Dialog/Template/Dialog');
import {SyntheticEvent} from 'Vdom/Vdom';
import {Controller as ManagerController} from 'Controls/popup';
import {getRoundClass} from 'Controls/_popupTemplate/Util/PopupConfigUtil';
import {default as IPopupTemplate, IPopupTemplateOptions} from 'Controls/_popupTemplate/interface/IPopupTemplate';
import {Logger} from 'UI/Utils';
import 'css!Controls/popupTemplate';

export interface IDialogTemplateOptions extends IControlOptions, IPopupTemplateOptions {

   draggable?: boolean;
   headerBackgroundStyle?: string;
   headerBorderVisible?: boolean;
   backgroundStyle?: string;
}

interface IDragObject {
    offset: number;
}

/**
 * Базовый шаблон {@link /doc/platform/developmentapl/interface-development/controls/openers/dialog/#template диалогового окна}.
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/openers/dialog/#template руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
 *
 * @extends UI/Base:Control
 *
 * @public
 * @author Красильников А.С.
 * @implements Controls/popupTemplate:IPopupTemplate
 * @implements Controls/popupTemplate:IPopupTemplateBase
 * @demo Controls-demo/PopupTemplate/Dialog/Index
 */

class DialogTemplate extends Control<IDialogTemplateOptions> implements IPopupTemplate {
    '[Controls/_popupTemplate/interface/IPopupTemplate]': boolean = true;
    protected _template: TemplateFunction = template;
    protected _dragState: string;

    protected _beforeMount(options: IDialogTemplateOptions): void {
        this._setDragStateByOptions(options);
        if (options.closeButtonVisibility !== undefined) {
            Logger.error('Controls/popupTemplate:Dialog : Используется устаревшая опция closeButtonVisibility,' +
                                                                                     ' используйте closeButtonVisible');
        }
    }

    protected _beforeUpdate(options: IDialogTemplateOptions): void {
        if (options.draggable !== this._options.draggable) {
            this._setDragStateByOptions(options);
        }
    }

    protected _getRoundedClass(options: IDialogTemplateOptions, type: string): string {
        return getRoundClass({
            options,
            type,
            hasRoundedBorder: !options.maximize
        });
    }

    protected _onDragEnd(): void {
        this._setDragStateByOptions(this._options);
        this._notify('popupDragEnd', [], {bubbling: true});
    }

    protected _onDragMove(event: SyntheticEvent<Event>, dragObject: IDragObject): void {
        this._dragState = 'dragging';
        this._notify('popupDragStart', [dragObject.offset], {bubbling: true});
    }

    protected close(): void {
        this._notify('close', [], {bubbling: true});
    }

    private _setDragStateByOptions(options: IDialogTemplateOptions): void {
        this._dragState = options.draggable ? 'draggable' : 'not-draggable';
    }

    protected _onMouseDown(event: SyntheticEvent<MouseEvent>): void {
        if (this._needStartDrag(event)) {
            this._dragState = 'drag-start';
            this._startDragNDrop(event);
        }
    }

    protected _onMouseUp(): void {
        this._setDragStateByOptions(this._options);
    }

    private _needStartDrag(event: SyntheticEvent<MouseEvent>): boolean {
        const {target} = event;
        const isEventProcessed = event.nativeEvent.processed;
        return this._options.draggable && (target as HTMLElement).tagName !== 'INPUT' && !isEventProcessed;
    }

    private _startDragNDrop(event: SyntheticEvent<Event>): void {
        this._children.dragNDrop.startDragNDrop(null, event);
    }

    protected _getWrapperBackgroundColorClass(): string {
        if (this._options.headerBackgroundStyle === this._options.backgroundStyle) {
            return `controls-background-${this._options.backgroundStyle}`;
        }
        return '';
    }

    static getDefaultOptions(): IDialogTemplateOptions {
        return {
            headingFontColorStyle: 'secondary',
            headerBackgroundStyle: 'default',
            headerBorderVisible: false,
            backgroundStyle: 'default',
            headingFontSize: '3xl',
            closeButtonVisible: true,
            closeButtonViewMode: 'linkButton',
            closeButtonTransparent: true
        };
    }
}

Object.defineProperty(DialogTemplate, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return DialogTemplate.getDefaultOptions();
   }
});

/**
 * @name Controls/_popupTemplate/Dialog/Template/DialogTemplate#draggable
 * @cfg {Boolean} Определяет, может ли окно перемещаться с помощью {@link /doc/platform/developmentapl/interface-development/controls/drag-n-drop/ d'n'd}.
 * @default false
 */

/**
 * @name Controls/_popupTemplate/Dialog/Template/DialogTemplate#headerBorderVisible
 * @cfg {Boolean} Видимость границы шапки панели.
 * @default false
 * @demo Controls-demo/PopupTemplate/Dialog/headerBorderVisible/Index
 */

/**
 * @name Controls/_popupTemplate/Dialog/Template/DialogTemplate#headerBackgroundStyle
 * @cfg {String} Цвет фона шапки диалогового окна.
 * @variant default
 * @variant unaccented
 * @variant secondary
 * @variant primary
 * @variant danger
 * @variant warning
 * @variant info
 * @variant success
 * @default default
 * @demo Controls-demo/PopupTemplate/Dialog/backgroundStyle/Index
 * @see backgroundStyle
 */

/**
 * @name Controls/_popupTemplate/Dialog/Template/DialogTemplate#backgroundStyle
 * @cfg {String} Цвет фона диалогового окна.
 * @variant default
 * @variant unaccented
 * @variant secondary
 * @variant primary
 * @variant danger
 * @variant warning
 * @variant info
 * @variant success
 * @default default
 * @demo Controls-demo/PopupTemplate/Dialog/backgroundStyle/Index
 * @see headerBackgroundStyle
 */

/**
 * @name Controls/_popupTemplate/Dialog/Template/DialogTemplate#maximize
 * @cfg {Boolean} Режим отображения окна во весь экран. Влияет на видимость границы и тени диалогового окна.
 * @see headerBorderVisible
 */

export default DialogTemplate;
