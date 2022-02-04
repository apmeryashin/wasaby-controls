import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';
import {TBorderVisibility, TShadowVisibility} from 'Controls/display';

import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';

import * as Template from 'wml!Controls-demo/list_new/ItemTemplate/BorderVisibility/BorderVisibility';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _shadowVisibility: TShadowVisibility = 'hidden';
    protected _borderVisibility: TBorderVisibility = 'hidden';

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: getData()
        });
    }

    protected _setShadowVisibility(e: SyntheticEvent, value: string): void {
        this._shadowVisibility = value;
    }

    protected _setBorderVisibility(e: SyntheticEvent, value: string): void {
        this._borderVisibility = value;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/list_new/ItemTemplate/hoverBackgroundStyle/hoverBackgroundStyle'];
}
