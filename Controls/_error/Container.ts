/// <amd-module name="Controls/_error/Container" />
// @ts-ignore
import * as Control from 'Core/Control';
import * as tmpl from 'wml!Controls/_error/Container';
// @ts-ignore
import Dialog from 'Controls/_error/Dialog';
import Controller from 'Controls/_error/Controller';
import { Handler, HandlerConfig } from 'Controls/_error/Handler';
import { Mode, DisplayOptions, CoreControlConstructor } from 'Controls/_error/Const';
import 'css!Controls/_error/Container';

type Children = {
    controller: Controller
}
let CoreControl: CoreControlConstructor<Children> = Control;

type Config = {
    handlers: Array<Handler>;
    controller: Controller;
}

/**
 * Компонент отвечающий за обработку ошибок
 * @class Controls/_error/Container
 * @example
 * Template:
 * <pre>
 *     <Controls.error:Container
 *         name="errorContainer"
 *     />
 * </pre>
 * <pre>
 *     let errorContainer = this._children.errorContainer;
 *     this.load().catch((error) => {
 *         errorContainer.process(error)
 *     });
 * </pre>
 */
export default class Container extends CoreControl {
    protected _template = tmpl;
    private __error: DisplayOptions;
    process<T extends Error = Error>(config: HandlerConfig<T> | T) {
        let displayOptions = this.getController().process(config);
        return this.__showError(displayOptions);
    }
    hide() {
        if (this.__error) {
            this.__error = null;
            // @ts-ignore
            this._forceUpdate();
        }
        // @ts-ignore
        if (this._children.dialog.isOpened()) {
            // @ts-ignore
            this._children.dialog.close()
        }
    }
    getController(): Controller {
        return this._children.controller;
    }
    protected _beforeMount(options) {
        if (!options.controller) {
            options.controller = Controller;
        }
    }
    private __showError(config: DisplayOptions) {
        // диалоговое с ошибкой
        if (config.mode == Mode.dialog) {
            return this.__showModal(config);
        }
        // отрисовка внутри компонента
        this.__error = config;
        // @ts-ignore
        this._forceUpdate();
    }
    private __showModal({ template, options }: DisplayOptions) {
        // @ts-ignore
        this._children.dialog.open({
            template: Dialog,
            templateOptions: {
                template,
                templateOptions: options
            },
        });
    }
}
