import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popup/Previewer/PreviewerTemplate');
import 'Controls/Container/Async';
import {load} from 'Core/library';
import {constants} from 'Env/Env';
import {process} from 'Controls/error';

/**
 * @class Controls/_popup/Previewer/PreviewerTemplate
 * @private
 */

interface IPreviewerOptions extends IControlOptions {
    template: string|TemplateFunction;
    templateOptions: unknown;
}

class PreviewerTemplate extends Control<IPreviewerOptions> {
    protected _template: TemplateFunction = template;

    protected _beforeMount(options: IPreviewerOptions): void|Promise<void> {
        if (constants.isBrowserPlatform && this._needRequireModule(options.template)) {
            return load(options.template).catch((error) => process({ error }));
        }
    }

    private _needRequireModule(module: string|TemplateFunction): boolean {
        return typeof module === 'string' && !requirejs.defined(module);
    }

    protected _sendResult(event: Event): void {
        this._notify('sendResult', [event], {bubbling: true});
    }

    protected _getTemplateName(): string {
        if (typeof this._options.template === 'string') {
            return this._options.template;
        }
        return '';
    }
}

export default PreviewerTemplate;
