import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {INavigationOptionValue, INavigationSourceConfig} from 'Controls/interface';
import {IItemAction, TItemActionShowType} from 'Controls/itemActions';

import {generateData} from 'Controls-demo/list_new/DemoHelpers/DataCatalog';

import * as Template from 'wml!Controls-demo/list_new/FreezeHoveredItem/FreezeHoveredItem';

interface IItem {
    title: string;
    key: number;
    keyProperty: string;
    count: number;
}

const data = generateData({
    keyProperty: 'key',
    count: 300,
    beforeCreateItemCallback: (item: IItem) => {
        item.title = `Запись с ключом ${item.key}.`;
    }
});

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _navigation: INavigationOptionValue<INavigationSourceConfig>;
    protected _itemActions: IItemAction[];

    private _frozen: boolean;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data
        });
        this._itemActions = [
            {
                id: 'freeze',
                icon: 'icon-Snow',
                title: 'Заморозить/разморозить ховер',
                showType: TItemActionShowType.TOOLBAR,
                handler: (item: Model) => {
                    if (this._frozen) {
                        this._children.list.unfreezeHoveredItems();
                        this._frozen = false;
                    } else {
                        this._children.list.freezeHoveredItem(item);
                        this._frozen = true;
                    }
                }
            }
        ];
        this._navigation = {
            source: 'page',
            view: 'infinity',
            sourceConfig: {
                multiNavigation: undefined,
                pageSize: 100,
                page: 0,
                hasMore: false
            },
            viewConfig: {
                pagingMode: 'hidden'
            }
        };
    }

    protected _onWheelHandler(): void {
        this._children.list.unfreezeHoveredItems();
        this._frozen = false;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
