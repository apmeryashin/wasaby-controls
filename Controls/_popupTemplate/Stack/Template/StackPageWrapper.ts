import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Stack/Template/StackPageWrapper/StackPageWrapper';
import {getPopupWidth, IStackSavedConfig} from 'Controls/_popupTemplate/Util/PopupWidthSettings';
import {RIGHT_PANEL_WIDTH} from 'Controls/_popupTemplate/BaseController';
import StackController from 'Controls/_popupTemplate/Stack/StackController';
import {IPropStorage, IPropStorageOptions} from 'Controls/interface';
import {RegisterClass} from 'Controls/event';
import {SyntheticEvent} from 'Vdom/Vdom';

interface IPageTemplate extends IControlOptions, IPropStorageOptions {
    minWidth: number;
    maxWidth: number;
    workspaceWidth: number;
}

interface IReceivedState {
    width?: number;
    maxSavedWidth?: number;
    minSavedWidth?: number;
}

/**
 * Контрол-обертка для базовой раскладки {@link /doc/platform/developmentapl/interface-development/controls/openers/stack/ стекового окна} в отдельной вкладке.
 *
 * @remark
 * @class Controls/_popupTemplate/StackPageWrapper
 * @extends UI/Base:Control
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Popup/StackPageWrapper/Index
 */
export default class StackPageWrapper extends Control<IPageTemplate, IReceivedState> implements IPropStorage {
    readonly '[Controls/_interface/IPropStorage]': boolean = true;
    protected _template: TemplateFunction = template;
    protected _workspaceWidth: number;
    protected _templateWorkSpaceWidth: number;
    protected _minOffset: number;
    protected _maxOffset: number;
    protected _canResize: boolean;
    protected _minWidth: number;
    private _resizeRegister: RegisterClass;
    private _offsetChanged: boolean;
    private _minSavedWidth: number;
    private _maxSavedWidth: number;

    protected _beforeMount(options?: IPageTemplate, context?: object,
                           receivedState?: IReceivedState): void | Promise<IReceivedState> {
        this._setWorkSpaceWidth(receivedState?.width || options.workspaceWidth);
        this._setSavedSizes(receivedState);
        this._updateOffset(options);
        this._updateProperties(options);
        this._resizeRegister = new RegisterClass({register: 'controlResize'});
        if (!receivedState && options.propStorageId) {
            return new Promise((resolve) => {
                getPopupWidth(options.propStorageId).then((data?: number | IStackSavedConfig) => {
                    let resultData = data as IStackSavedConfig;
                    if (data) {
                        // Обратная совместимость со старой историей. Стали сохранять объект с настройками.
                        if (typeof data === 'number') {
                            resultData = {
                                width: data
                            };
                        }
                        this._setWorkSpaceWidth(resultData.width);
                        this._setSavedSizes(resultData);
                    }
                    this._updateProperties(options);
                    resolve(resultData);
                });
            });
        }
    }

    protected _afterRender(): void {
       if (this._offsetChanged) {
           this._resizeRegister.start(new SyntheticEvent({}));
       }
    }

    protected _registerHandler(event: Event, registerType: string,
                               component: Control, callback: Function, config): void {
        this._resizeRegister.register(event, registerType, component, callback, config);
    }

    protected _unregisterHandler(event: Event, registerType: string,
                                 component: Control, config): void {
        this._resizeRegister.unregister(event, registerType, component, config);
    }

    protected _offsetHandler(event: Event, offset: number): void {
        const newWidth = this._workspaceWidth + offset;

        const item = this._generateControllerItem();
        StackController.popupResizingLine(item, offset);
        this._minSavedWidth = item.minSavedWidth;
        this._maxSavedWidth = item.maxSavedWidth;

        this._setWorkSpaceWidth(newWidth);
        // offsetChanged нужно только в 4100, пока в ЭДО полностью не перейдут на работу через нашу обертку.
        this._notify('offsetChanged', [offset]);
        const data = {
            width: this._workspaceWidth
        };
        this._updateOffset();
        this._offsetChanged = true;
        // Так же как в реестрах, сообщаем про смену размеров рабочей области.
        this._notify('workspaceResize', [this._workspaceWidth], {bubbling: true});
    }

    protected _maximizeHandler(): void {
        const item = this._generateControllerItem();
        StackController.elementMaximized(item);
        this._setWorkSpaceWidth(item.popupOptions.width);
        this._updateOffset();
    }

    private _generateControllerItem(): object {
        return {
            minSavedWidth: this._minSavedWidth,
            maxSavedWidth: this._maxSavedWidth,
            popupOptions: {
                minWidth: this._options.minWidth,
                maxWidth: this._options.maxWidth,
                stackWidth: this._workspaceWidth,
                propStorageId: this._options.propStorageId,
                templateOptions: {}
            },
            position: {}
        };
    }

    private _updateProperties(options: IPageTemplate): void {
        this._canResize = StackPageWrapper._canResize(options.propStorageId, this._workspaceWidth,
            options.minWidth, options.maxWidth);
        this._minWidth = options.minWidth;
        // Если размер фиксирован
        if (this._workspaceWidth && !options.minWidth && !options.maxWidth) {
            this._minWidth = options.workspaceWidth;
        }
    }

    private _updateOffset(options: IPageTemplate = this._options): void {
        // protect against wrong options
        this._maxOffset = Math.max(options.maxWidth - this._workspaceWidth, 0);
        this._minOffset = Math.max(this._workspaceWidth - options.minWidth, 0);
    }

    private _setWorkSpaceWidth(width: number): void {
        this._workspaceWidth = width;
        // ширина прикладного шаблона без учета ширины правой панели
        this._templateWorkSpaceWidth = width ? (width - RIGHT_PANEL_WIDTH) : undefined;
    }

    private _setSavedSizes(receivedState: IReceivedState): void {
        this._maxSavedWidth = receivedState.maxSavedWidth;
        this._minSavedWidth = receivedState.minSavedWidth;
    }

    private static _canResize(propStorageId: string, width: number, minWidth: number, maxWidth: number): boolean {
        const canResize = propStorageId && width && minWidth && maxWidth && maxWidth !== minWidth;
        return !!canResize;
    }
}

/**
 * @name Controls/_popupTemplate/StackPageWrapper#minWidth
 * @cfg {Number} Минимальная ширина, до которой может уменьшиться содержимое.
 * @demo Controls-demo/Popup/StackPageWrapper/Index
 */

/**
 * @name Controls/_popupTemplate/StackPageWrapper#maxWidth
 * @cfg {Number} Максимальная ширина, до которой может увеличиться содержимое.
 * @demo Controls-demo/Popup/StackPageWrapper/Index
 */

/**
 * @name Controls/_popupTemplate/StackPageWrapper#workspaceWidth
 * @cfg {Number} Ширина рабочей области при построении. Если пользователь менял размеры с помощью движения границ, то
 * ширина будет взята из истории.
 * @demo Controls-demo/Popup/StackPageWrapper/Index
 */
