import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/list_new/ColumnsView/Group/Index';
import {Memory} from 'Types/source';
import {getGroupedCatalog as getData} from 'Controls-demo/list_new/DemoHelpers/Data/Groups';
import {View} from 'Controls/columns';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'UI/Vdom';

export default class Index extends Control {
    protected _template: TemplateFunction = template;
    protected _children: {
        columnsView: View
    };

    private _lastKey: number = 9;
    protected _viewSource: Memory;
    protected _itemActions: object[];

    protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
        this._viewSource = new Memory({
            data: getData(),
            keyProperty: 'key'
        });

        this._itemActions = [{
            id: 1,
            icon: 'icon-Erase',
            iconStyle: 'danger',
            title: 'delete',
            showType: 2,
            handler: this.deleteHandler.bind(this)
        }];
    }

    private deleteHandler(item: Model): void {
        this._children.columnsView.getItems().remove(item);
    }

    protected _add(e: SyntheticEvent, brand: string): void {
        const items = this._children.columnsView.getItems();

        this._lastKey += 1;
        const newData = new Model({
            keyProperty: 'key',
            rawData: {
                key: this._lastKey,
                title: `${brand} ${this._lastKey}`,
                brand,
                longBrandName: 'apple'
            }
        });

        items.add(newData);
    }
}
