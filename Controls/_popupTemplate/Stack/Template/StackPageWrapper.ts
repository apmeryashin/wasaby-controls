import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Stack/Template/StackPageWrapper/StackPageWrapper';
import {getPopupWidth, savePopupWidth} from 'Controls/_popupTemplate/Util/PopupWidthSettings';
import {IPropStorage, IPropStorageOptions} from 'Controls/interface';

interface IPageTemplate extends IControlOptions, IPropStorageOptions {
    minWidth: number;
    maxWidth: number;
    workspaceWidth: number;
}

interface IReceivedState {
    width?: number;
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
    protected _minOffset: number;
    protected _maxOffset: number;

    protected _beforeMount(options?: IPageTemplate, context?: object,
                           receivedState?: IReceivedState): void | Promise<IReceivedState> {
        this._workspaceWidth = receivedState?.width || options.workspaceWidth;
        this._updateOffset(options);
        if (!receivedState && options.propStorageId) {
            return new Promise((resolve) => {
                getPopupWidth(options.propStorageId).then((width?: number) => {
                    if (width) {
                        this._workspaceWidth = width;
                    }
                    resolve({width});
                });
            });
        }
    }

    protected _canResize(propStorageId: string, width: number, minWidth: number, maxWidth: number): boolean {
        const canResize = propStorageId && width && minWidth && maxWidth && maxWidth !== minWidth;
        return !!canResize;
    }

    protected _offsetHandler(event: Event, offset: number): void {
        this._workspaceWidth += offset;
        savePopupWidth(this._options.propStorageId, this._workspaceWidth);
        this._updateOffset();
    }

    private _updateOffset(options: IPageTemplate = this._options): void {
        // protect against wrong options
        this._maxOffset = Math.max(options.maxWidth - this._workspaceWidth, 0);
        this._minOffset = Math.max(this._workspaceWidth - options.minWidth, 0);
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
