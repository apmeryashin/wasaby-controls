import {isFullGridSupport, LoadingTrigger as DefaultLoadingTrigger} from 'Controls/display';
import { TemplateFunction } from 'UI/Base';

export default class LoadingTrigger extends DefaultLoadingTrigger {
    protected _isFullGridSupport: boolean = isFullGridSupport();

    getTemplate(itemTemplateProperty: string, userTemplate: TemplateFunction | string): TemplateFunction | string {
        if (this._isFullGridSupport) {
            return super.getTemplate(itemTemplateProperty, userTemplate);
        } else {
            return 'Controls/grid:TableLoadingTriggerTemplate';
        }
    }
}

Object.assign(LoadingTrigger.prototype, {
    'Controls/grid:LoadingTrigger': true,
    _moduleName: 'Controls/grid:LoadingTrigger'
});
