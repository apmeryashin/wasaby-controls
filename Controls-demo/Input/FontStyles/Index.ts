import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/FontStyles/FontStyles');

class FontStyles extends Control<IControlOptions> {
    protected _linkValue = FontStyles._defaultValue;
    protected _primaryValue = FontStyles._defaultValue;
    protected _secondaryValue = FontStyles._defaultValue;
    protected _successValue = FontStyles._defaultValue;
    protected _warningValue = FontStyles._defaultValue;
    protected _dangerValue = FontStyles._defaultValue;
    protected _unaccentedValue = FontStyles._defaultValue;
    protected _labelValue = FontStyles._defaultValue;
    protected _infoValue = FontStyles._defaultValue;
    protected _defaultValue = FontStyles._defaultValue;
    protected _placeholder = 'Tooltip';

    protected _template: TemplateFunction = controlTemplate;

    private static _defaultValue = 'text';

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default FontStyles;
