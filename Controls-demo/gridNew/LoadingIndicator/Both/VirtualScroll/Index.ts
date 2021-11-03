import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/LoadingIndicator/Both/VirtualScroll/VirtualScroll';
import {Memory} from 'Types/source';
import {generateData, slowDownSource} from 'Controls-demo/list_new/DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: [] = [{ displayProperty: 'title' }];
    private _dataArray: unknown = generateData({count: 200, entityTemplate: {title: 'lorem'}});

    protected _beforeMount(): void {
        this.initSource();
    }

    protected initSource(newItems: boolean = false): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: newItems ? generateData({
                    count: 200,
                    entityTemplate: {title: 'lorem'},
                    beforeCreateItemCallback: (item) => {
                        item.new = true;
                    }
            }) : this._dataArray
        });
        slowDownSource(this._viewSource, 2000);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
