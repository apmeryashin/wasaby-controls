import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Stack/Template/StackPageWrapper/StackPageWrapper';
import {getPopupWidth, IStackSavedConfig} from 'Controls/_popupTemplate/Util/PopupWidthSettings';
import {getRightPanelWidth} from 'Controls/_popupTemplate/BaseController';
import {default as StackController, IStackItem} from 'Controls/_popupTemplate/Stack/StackController';
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

let themeConstants = {};

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
    protected _maximized: boolean = false;
    protected _sizesClass: string = '';
    private _resizeRegister: RegisterClass;
    private _offsetChanged: boolean;
    private _minSavedWidth: number;
    private _maxSavedWidth: number;
    private _rightPanelWidth: number;

    protected _beforeMount(options?: IPageTemplate, context?: object,
                           receivedState?: IReceivedState): void | Promise<IReceivedState> {
        this._calcSizesClass(options);
        this._rightPanelWidth = getRightPanelWidth();
        const width = this._validateWidth(options, receivedState?.width || options.workspaceWidth);
        this._resizeRegister = new RegisterClass({register: 'controlResize'});
        this._setSavedSizes(receivedState);
        if (!this._sizesClass) {
            this._setWorkSpaceWidth(width);
            this._updateOffset(options.minWidth, options.maxWidth);
            this._updateProperties(options.propStorageId, options.minWidth, options.maxWidth, options.workspaceWidth);
        }
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
                        if (!this._sizesClass) {
                            this._setWorkSpaceWidth(resultData.width);
                            this._setSavedSizes(resultData);
                        }
                    }
                    if (!this._sizesClass) {
                        this._updateProperties(
                            options.propStorageId,
                            options.minWidth,
                            options.maxWidth,
                            options.workspaceWidth
                        );
                    }
                    this._maximized = this._getMaximizeState();
                    resolve(resultData);
                });
            });
        } else {
            this._maximized = this._getMaximizeState();
        }
    }

    protected _componentDidMount(options: IPageTemplate): void {
        if (this._sizesClass) {
            this._sizesClass = '';
            StackController.initializationConstants()
                .then((result) => {
                    themeConstants = result as object;
                    const width = this._isLiteralWidth(options.workspaceWidth) ?
                                                  this._getNumberWidth(options.workspaceWidth) : options.workspaceWidth;
                    const minWidth = this._isLiteralWidth(options.minWidth) ?
                                                  this._getNumberWidth(options.minWidth) : options.minWidth;
                    const maxWidth = this._isLiteralWidth(options.maxWidth) ?
                                                  this._getNumberWidth(options.maxWidth) : options.maxWidth;
                    if (!this._workspaceWidth) {
                        this._setWorkSpaceWidth(maxWidth);
                    }
                    this._updateOffset(minWidth, maxWidth);
                    this._updateProperties(options.propStorageId, minWidth, maxWidth, width);
                    }
                );
        }
    }

    protected _afterRender(): void {
       if (this._offsetChanged) {
           this._notify('controlResize', [], { bubbling: true });
           // Так же как в реестрах, сообщаем про смену разxмеров рабочей области.
           this._notify('workspaceResize', [this._workspaceWidth], { bubbling: true });
           this._resizeRegister.start(new SyntheticEvent({}));
       }
    }

    protected _isLiteralWidth(value: string|number): boolean {
        return StackController.BASE_WIDTH_SIZES.includes(value);
    }

    protected _getNumberWidth(value: string): number {
        return themeConstants[value];
    }

    protected _calcSizesClass(options: IPageTemplate): void {
        if (this._isLiteralWidth(options.workspaceWidth)) {
            this._sizesClass += `controls-PageTemplate_content_width_${options.workspaceWidth}`;
        }
        if (this._isLiteralWidth(options.minWidth)) {
            this._sizesClass += ` controls-PageTemplate_content_minWidth_${options.minWidth}`;
        }
        if (this._isLiteralWidth(options.maxWidth)) {
            this._sizesClass += ` controls-PageTemplate_content_maxWidth_${options.maxWidth}`;
        }
    }

    protected _registerHandler(event: Event, registerType: string,
                               component: Control, callback: Function, config: object): void {
        this._resizeRegister.register(event, registerType, component, callback, config);
    }

    protected _unregisterHandler(event: Event, registerType: string,
                                 component: Control, config: object): void {
        this._resizeRegister.unregister(event, registerType, component, config);
    }

    protected _offsetHandler(event: Event, offset: number): void {
        const newWidth = this._workspaceWidth + offset;

        const item = this._generateControllerItem();
        StackController.popupResizingLine(item, offset);
        this._minSavedWidth = item.minSavedWidth;
        this._maxSavedWidth = item.maxSavedWidth;

        this._setWorkSpaceWidth(newWidth, false);
        // offsetChanged нужно только в 4100, пока в ЭДО полностью не перейдут на работу через нашу обертку.
        this._notify('offsetChanged', [offset]);

        this._updateOffset();
        this._offsetChanged = true;
    }

    protected _maximizeHandler(): void {
        const item = this._generateControllerItem();
        StackController.elementMaximized(item, false);
        this._setWorkSpaceWidth(item.popupOptions.width);
        this._updateOffset();
    }

    private _getMaximizeState(): boolean {
        return StackController.getMaximizedState(
            this._templateWorkSpaceWidth,
            this._minSavedWidth || this._options.minWidth,
            this._maxSavedWidth || this._options.maxWidth
        );
    }

    private _generateControllerItem(): Partial<IStackItem> {
        return {
            minSavedWidth: this._minSavedWidth,
            maxSavedWidth: this._maxSavedWidth,
            popupOptions: {
                minWidth: this._isLiteralWidth(this._options.minWidth) ?
                                                        themeConstants[this._options.minWidth] : this._options.minWidth,
                maxWidth: this._isLiteralWidth(this._options.maxWidth) ?
                                                        themeConstants[this._options.maxWidth] : this._options.maxWidth,
                stackWidth: this._templateWorkSpaceWidth,
                propStorageId: this._options.propStorageId,
                templateOptions: {}
            },
            position: {}
        };
    }

    private _updateProperties(propStorageId: string, minWidth: number, maxWidth: number, workspaceWidth: number): void {
        this._canResize = StackPageWrapper._canResize(propStorageId, this._workspaceWidth,
            minWidth, maxWidth);
        this._minWidth = minWidth;
        // Если размер фиксирован
        if (this._workspaceWidth && !minWidth && !maxWidth) {
            this._minWidth = workspaceWidth;
        }
    }

    private _updateOffset(minWidth: number = this._options.minWidth,
                          maxWidth: number = this._options.maxWidth
    ): void {
        if (this._isLiteralWidth(minWidth)) {
            minWidth = this._getNumberWidth(minWidth);
        }
        if (this._isLiteralWidth(maxWidth)) {
            maxWidth = this._getNumberWidth(maxWidth);
        }
        // protect against wrong options
        this._maxOffset = Math.max(maxWidth - this._workspaceWidth - this._rightPanelWidth, 0);
        this._minOffset = Math.max(this._workspaceWidth - minWidth - this._rightPanelWidth, 0);
    }

    private _validateWidth(options: IPageTemplate, width: number): number {
        if (width < options.minWidth) {
            width = options.minWidth;
        }
        if (width > options.maxWidth) {
            width = options.maxWidth;
        }
        return width;
    }

    private _setWorkSpaceWidth(width: number, withRightPanel: boolean = true): void {
        // Ширина складывается из установленной ширины + ширины правой панели
        if (!withRightPanel) {
            width -= this._rightPanelWidth;
        }

        this._workspaceWidth = width ? (width + this._rightPanelWidth) : undefined;
        this._templateWorkSpaceWidth = width;
    }

    private _setSavedSizes(receivedState: IReceivedState = {}): void {
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
