import { Control, TemplateFunction } from 'UI/Base';
import _template = require('wml!Controls/_dataSource/_error/Container');
import { constants } from 'Env/Env';
import { Mode, Popup, ViewConfig } from 'Controls/error';
import { isEqual } from 'Types/object';
import { default as IContainer, IContainerConfig } from './IContainer';
/**
 * Нужно загружать стили для показа диалога сразу.
 * При возникновении ошибки они могут не загрузиться (нет связи или сервис недоступен).
 */
import 'css!Controls/popupConfirmation';

interface IInlistTemplateOptions {
    listOptions: object;
}

/**
 * @interface Controls/dataSource/error/Container/Config
 * @extends Controls/_dataSource/_error/ViewConfig
 */
type Config<OptionsType = object> = ViewConfig<OptionsType> & ({
    /**
     * @cfg {String} [templateName?]
     * @name Controls/dataSource/error/Container/Config#templateName
     */
    templateName: string;
} | {
    /**
     * @cfg {any} [template?]
     * @name Controls/dataSource/error/Container/Config#template
     */
    template: TemplateFunction;
}) & {
    /**
     * @cfg {Boolean} [isShowed?]
     * @name Controls/dataSource/error/Container/Config#isShown
     */
    isShown?: boolean;
};

/**
 * Компонент для отображения сообщения об ошибки на основе данных, полученных от контроллера {@link Controls/_dataSource/_error/Controller}.
 * Может отображать сообщение об ошибке разными способами:
 * - в диалоговом окне;
 * - вместо своего содержимого;
 * - в заглушке, которая растягивается во всю страницу поверх всего остального.
 * @class Controls/_dataSource/_error/Container
 * @extends UI/Base:Control
 * @public
 * @author Северьянов А.А.
 *
 */
export default class Container extends Control<IContainerConfig> implements IContainer {
    private _isUnmounted: boolean = false;
    private __viewConfig: Config; // tslint:disable-line:variable-name
    private _popupHelper: Popup = new Popup();
    protected _template: TemplateFunction = _template;

    /**
     * Идентификатор текущего открытого диалога. Одновременно отображается только один диалог.
     */
    private _popupId: string;

    /**
     * Скрыть сообщение об ошибке.
     * @function
     * @public
     */
    hide(): void {
        if (this._isUnmounted) {
            return;
        }

        const mode = this.__viewConfig.mode;
        this.__setConfig(null);
        if (mode === Mode.dialog) {
            return;
        }
        this._forceUpdate();
    }

    /**
     * Показать сообщение об ошибке.
     * @param {Controls/_dataSource/_error/ViewConfig} viewConfig
     * @function
     * @public
     */
    show(viewConfig: ViewConfig): void {
        if (this._isUnmounted) {
            return;
        }

        if (this.canOpenDialog(viewConfig)) {
            this._openDialog(viewConfig);
            return;
        }

        this.__setConfig(viewConfig);
        this._forceUpdate();
    }

    protected _beforeMount(options: IContainerConfig): void {
        this.__updateConfig(options);
    }

    protected _beforeUpdate(options: IContainerConfig): void {
        const isDialogMode = options.viewConfig?.mode === Mode.dialog;

        if (
            !isDialogMode && isEqual(this._options.viewConfig, options.viewConfig) ||
            isDialogMode && this._popupId
        ) {
            return;
        }

        this.__updateConfig(options);

        if (this.canOpenDialog(this.__viewConfig)) {
            this._openDialog(this.__viewConfig);
        }

        // обновляем опции списка, чтобы он корректно обновлялся
        if (this.__viewConfig?.mode === Mode.inlist) {
            this._updateInlistOptions(options);
        }
    }

    protected _afterMount(): void {
        if (this.canOpenDialog(this.__viewConfig)) {
            this._openDialog(this.__viewConfig);
        }
    }

    protected _beforeUnmount(): void {
        this._closeDialog();
        this._isUnmounted = true;
    }

    /**
     * Закрыть ранее открытый диалог.
     */
    private _closeDialog(): void {
        this._popupHelper.closeDialog(this._popupId);
        this._popupId = null;
    }

    /**
     * Обработчик закрытия диалога.
     */
    private _onDialogClosed(): void {
        if (this._isUnmounted) {
            return;
        }

        this._notify('dialogClosed', []);
        this._popupId = null;
    }

    private canOpenDialog(viewConfig: ViewConfig): boolean {
        return !this._popupId && viewConfig?.mode === Mode.dialog && constants.isBrowserPlatform;
    }

    /**
     * Открыть диалог.
     * Если есть незакрытый диалог, открытый этим контролом, то сначала он будет закрыт.
     * @param viewConfig Конфигурация с шаблоном диалога и опциями для этого шаблона.
     */
    private _openDialog(viewConfig: ViewConfig): Promise<void> {
        return this._popupHelper.openDialog(viewConfig, {
            id: this._popupId,
            opener: this,
            modal: this._options.isModalDialog !== false,
            eventHandlers: {
                onClose: () => this._onDialogClosed()
            }
        }).then((popupId) => {
            if (popupId) {
                this._popupId = popupId;
            }
        });
    }

    private __updateConfig(options: IContainerConfig): void {
        this.__setConfig(options.viewConfig);

        if (this.__viewConfig) {
            this.__viewConfig.isShown = this.__viewConfig.isShown || this.__viewConfig.mode !== Mode.dialog;
        }
    }

    private __setConfig(viewConfig?: ViewConfig): void {
        if (!viewConfig) {
            this.__viewConfig = null;
            return;
        }
        let templateName: string;
        if (typeof viewConfig.template === 'string') {
            templateName = viewConfig.template;
        }
        this.__viewConfig = {
            ...viewConfig,
            templateName
        };
    }

    private _updateInlistOptions(options: IContainerConfig): void {
        this.__viewConfig.options = {
            ...this.__viewConfig.options
        };
        (this.__viewConfig as Config<IInlistTemplateOptions>).options.listOptions = options;
    }
}
