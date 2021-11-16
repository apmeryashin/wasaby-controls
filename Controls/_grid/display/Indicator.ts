import { Indicator as DefaultIndicator, isFullGridSupport } from 'Controls/display';
import {TemplateFunction} from 'UI/Base';

export default class Indicator extends DefaultIndicator {
    protected _isFullGridSupport: boolean = isFullGridSupport();

    getTemplate(itemTemplateProperty: string, userTemplate: TemplateFunction | string): TemplateFunction | string {
        return this._isFullGridSupport ? 'Controls/grid:IndicatorTemplate' : 'Controls/grid:TableIndicatorTemplate';
    }

    getGridClasses(): string {
        let classes = 'controls-Grid__loadingIndicator';
        if (this._$state === 'portioned-search') {
            classes += ` ${this._getPortionedSearchClasses()}`;
        }
        return classes;
    }
}

Object.assign(Indicator.prototype, {
    'Controls/grid:Indicator': true,
    _moduleName: 'Controls/grid:Indicator'
});
