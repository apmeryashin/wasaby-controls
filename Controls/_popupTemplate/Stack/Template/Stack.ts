import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Stack/Template/Stack/Stack';
import * as rk from 'i18n!Controls';
import {Controller as ManagerController} from 'Controls/popup';
import {default as IPopupTemplate, IPopupTemplateOptions} from 'Controls/_popupTemplate/interface/IPopupTemplate';
import {Logger} from 'UI/Utils';
import 'css!Controls/popupTemplate';

export interface IRightPanelOptions {
    helpButtonItems: object[];
}

export interface IStackTemplateOptions extends IControlOptions, IPopupTemplateOptions {
    headerBackgroundStyle?: string;
    backgroundStyle?: string;
    maximizeButtonVisibility?: boolean;
    workspaceWidth?: number;
    headerBorderVisible?: boolean;
    rightBorderVisible?: boolean;
    maximized?: boolean;
    stackMaxWidth?: number;
    stackMinWidth?: number;
    stackMinimizedWidth?: number;
    stackWidth?: number;
    rightPanelOptions?: IRightPanelOptions;
    toolbarContentTemplate?: Function | string;
}

const MINIMIZED_STEP_FOR_MAXIMIZED_BUTTON = 100;

/**
 * Базовый шаблон {@link /doc/platform/developmentapl/interface-development/controls/openers/stack/ стекового окна}.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/openers/stack/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
 *
 * @class Controls/_popupTemplate/Stack
 * @extends UI/Base:Control
 *
 * @public
 * @author Красильников А.С.
 * @implements Controls/popupTemplate:IPopupTemplate
 * @implements Controls/popupTemplate:IPopupTemplateBase
 * @demo Controls-demo/PopupTemplate/Stack/HeaderBorderVisible/Index
 */

class StackTemplate extends Control<IStackTemplateOptions> implements IPopupTemplate {
    '[Controls/_popupTemplate/interface/IPopupTemplate]': boolean = true;
    protected _template: TemplateFunction = template;
    protected _headerTheme: string;
    protected _maximizeButtonTitle: string;
    protected _maximizeButtonVisibility: boolean = false;
    protected _hasRightPanel: boolean;
    private _maximizeButtonClickCallback: () => void;

    protected _beforeMount(options: IStackTemplateOptions): void {
        this._maximizeButtonTitle = `${rk('Свернуть')}/${rk('Развернуть', 'окно')}`;
        this._hasRightPanel = ManagerController.hasRightPanel() || !!options.toolbarContentTemplate;
        this._updateMaximizeButton(options);
        this._prepareTheme();
        this._maximizeButtonClickCallback = this.changeMaximizedState.bind(this);
        if (options.closeButtonVisibility !== undefined) {
            Logger.error('Controls/popupTemplate:Stack : Используется устаревшая опция closeButtonVisibility,' +
                                                                                    ' используйте closeButtonVisible');
        }
    }

    protected _beforeUpdate(options: IStackTemplateOptions): void {
        this._updateMaximizeButton(options);
        this._prepareTheme();
    }

    protected _afterUpdate(oldOptions: IStackTemplateOptions): void {
        if (this._options.maximized !== oldOptions.maximized) {
            this._notify('controlResize', [], {bubbling: true});
        }
    }

    protected close(): void {
        this._notify('close', [], {bubbling: true});
    }

    private _updateMaximizeButton(options: IStackTemplateOptions): void {
        if (options.stackMaxWidth - options.stackMinWidth < MINIMIZED_STEP_FOR_MAXIMIZED_BUTTON) {
            this._maximizeButtonVisibility = false;
        } else {
            this._maximizeButtonVisibility = options.maximizeButtonVisibility;
        }
    }

    toggleMaximizeState(maximized?: boolean): void {
        /**
         * @event maximized
         * Occurs when you click the expand / collapse button of the panels.
         */
        this._notify('maximized', [maximized], {bubbling: true});
    }

    protected changeMaximizedState(): void {
        this.toggleMaximizeState();
    }

    private _prepareTheme(): void {
        this._headerTheme = ManagerController.getPopupHeaderTheme();
    }

    static getDefaultOptions(): IStackTemplateOptions {
        return {
            headingFontSize: '3xl',
            backgroundStyle: 'default',
            headingFontColorStyle: 'secondary',
            closeButtonVisible: true,
            closeButtonViewMode: 'toolButton',
            closeButtonTransparent: true,
            headerBorderVisible: true,
            rightBorderVisible: true
        };
    }
}

Object.defineProperty(StackTemplate, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return StackTemplate.getDefaultOptions();
   }
});

/**
 * @typedef {Object} Controls/_popupTemplate/Stack/RightPanelOptions
 * @property {Array.<Hint/interface:IHelpButtonItem>} helpButtonItems Список пунктов меню помощи.
 * @remark
 * Элементы по умолчанию:
 * - "База знаний";
 * - "Диагностика места";
 * - "Поддержка СБИС".
 */

/**
 * @name Controls/_popupTemplate/Stack#headerBackgroundStyle
 * @cfg {String} Определяет цвет фона шапки стекового окна.
 * @variant default
 * @variant unaccented
 * @variant secondary
 * @variant primary
 * @variant danger
 * @variant warning
 * @variant success
 * @variant info
 * @default unaccented
 * @demo Controls-demo/PopupTemplate/Stack/backgroundStyle/Index
 */

/**
 * @name Controls/_popupTemplate/Stack#backgroundStyle
 * @cfg {String} Определяет цвет фона стекового окна.
 * @variant default
 * @variant unaccented
 * @variant secondary
 * @variant primary
 * @variant danger
 * @variant warning
 * @variant success
 * @variant info
 * @default default
 * @demo Controls-demo/PopupTemplate/Stack/backgroundStyle/Index
 */

/**
 * @name Controls/_popupTemplate/Stack#bodyContentTemplate
 * @cfg {function|String} Основной контент шаблона, располагается под headerContentTemplate.
 */

/**
 * @name Controls/_popupTemplate/Stack#toolbarContentTemplate
 * @cfg {function|String} Шаблон контента под крестиком закрытия для размещения тулбара, расположенного в правой панели.
 */

/**
 * @name Controls/_popupTemplate/Stack#leftContentTemplate
 * @cfg {function|String} Шаблон контента слева границы стекового окна.
 */

/**
 * @name Controls/_popupTemplate/Stack#maximizeButtonVisibility
 * @cfg {Boolean} Определяет, будет ли отображаться кнопка изменения размера.
 * @default false
 */

/**
 * @name Controls/_popupTemplate/Stack#headerBorderVisible
 * @cfg {Boolean} Определяет, будет ли отображаться граница шапки панели.
 * @default true
 * @remark
 * Позволяет скрыть отображение нижней границы {@link Controls/popupTemplate:IPopupTemplateBase#headerContentTemplate headerContentTemplate}. Используется для построения двухуровневых шапок.
 * Необходимо поместить свой контейнер с шапкой в {@link Controls/popupTemplate:IPopupTemplateBase#bodyContentTemplate bodyContentTemplate} и навесить:
 *
 * 1. класс, добавляющий фон для шапки:
 * <pre class="brush: css">
 * controls-StackTemplate__top-area_default
 * </pre>
 * 2. класс, добавляющий нижнюю границу для шапки:
 * <pre class="brush: css">
 * controls-StackTemplate__top-area-border
 * </pre>
 * @demo Controls-demo/PopupTemplate/Stack/HeaderBorderVisible/Index
 */

/**
 * @name Controls/_popupTemplate/Stack#rightBorderVisible
 * @cfg {Boolean} Определяет, будет ли отображаться полоса разделяющая правую панель и контент.
 * @default true
 * @remark
 * Позволяет скрыть отображение правой границы.
 */

/**
 * @name Controls/_popupTemplate/Stack#workspaceWidth
 * @cfg {Number} Текущая ширина шаблона стековой панели
 * @remark
 * Опция только для чтения, значение устанавливается контролом Controls/popup исходя из заданной конфигурации окна
 */

/**
 * @name Controls/_popupTemplate/Stack#rightPanelOptions
 * @cfg {Controls/_popupTemplate/Stack/RightPanelOptions.typedef} Опции правой панели стековой панели.
 */

/**
 * @name Controls/_popupTemplate/Stack#toggleMaximizeState
 * @function
 * @description Переключает состояние разворота панели.
 * @param {Boolean} maximize Определяет новое состояние разворота панели. Если аргумент не передан, то новое состояние задается противоположным текущему.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <ws:template name="StackTemplate">
 *  <Controls.popupTemplate:Stack name="my_stack">
 *      <ws:bodyContentTemplate>
 *          <Controls.input:Text value="_value" />
 *          <Controls.buttons:Button caption="maximized" on:click="_maximized()"/>
 *      </ws:bodyContentTemplate>
 *  </Controls.popupTemplate:Stack>
 * </ws:template>
 *
 * <Controls.popup:Stack name="stack" template="StackTemplate"/>
 *
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * class MyControl extends Control<IControlOptions>{
 *    ...
 *
 *    _beforeMount() {
 *      var popupOptions = {
 *          autofocus: true
 *      }
 *      this._children.stack.open(popupOptions)
 *    }
 *
 *    _maximized() {
 *       this._children.my_stack.toggleMaximizeState()
 *    }
 *
 *    ...
 * }
 * </pre>
 */

export default StackTemplate;
