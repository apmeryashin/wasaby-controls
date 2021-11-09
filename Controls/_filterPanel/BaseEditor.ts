import {Control} from 'UI/Base';
import template = require('wml!Controls/_filterPanel/BaseEditor');
import {IControlOptions, TemplateFunction} from 'UI/Base';
import 'css!Controls/filterPanel';

export default class BaseEditor extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    protected _handleCloseEditorClick(): void {
        const extendedValue = {
            value: this._options.propertyValue,
            viewMode: 'extended'
        };
        this._notify('propertyValueChanged', [extendedValue], {bubbling: true});
    }

    protected _extendedCaptionClick(): void {
        this._notify('extendedCaptionClick');
    }
}
