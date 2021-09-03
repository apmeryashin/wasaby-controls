import { Indicator as DefaultIndicator, isFullGridSupport } from 'Controls/display';
import {TemplateFunction} from 'UI/Base';

export default class Indicator extends DefaultIndicator {
    protected _isFullGridSupport: boolean = isFullGridSupport();

    getTemplate(itemTemplateProperty: string, userTemplate: TemplateFunction | string): TemplateFunction | string {
        if (this._isFullGridSupport) {
            return super.getTemplate(itemTemplateProperty, userTemplate);
        } else {
            return 'Controls/grid:TableIndicatorTemplate';
        }
    }
}

Object.assign(Indicator.prototype, {
    'Controls/grid:Indicator': true,
    _moduleName: 'Controls/grid:Indicator'
});
