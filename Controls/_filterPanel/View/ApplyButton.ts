import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as rk from 'i18n!Controls';
import * as template from 'wml!Controls/_filterPanel/View/ApplyButton';

interface IApplyButton {
    resultHandler: Function;
    caption: string;
}
export default class ApplyButton extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _applyCaption: string = rk('Применить');
    protected _resultHandlers: object = {};

    protected _beforeUpdate(options: IApplyButton): void {
        if (options.resultHandler) {
            this._resultHandlers[options.caption] = options.resultHandler;
        }
    }

    protected _handleClick(): void {
        for (const editorName in this._resultHandlers) {
            const editorHandler = this._resultHandlers[editorName];
            if (editorHandler) {
                editorHandler();
            }
        }
       this._notify('sendResult', [], {bubbling: true});
    }
}
