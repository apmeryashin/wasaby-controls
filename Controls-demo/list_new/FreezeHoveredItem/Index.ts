import {Control, TemplateFunction} from 'UI/Base';
import {CrudEntityKey, Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {DialogOpener} from 'Controls/popup';
import {INavigationOptionValue, INavigationSourceConfig} from 'Controls/_interface/INavigation';

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

    // Менеджер диалоговых окон
    private _dialogOpener: DialogOpener;

    private _frozen: boolean;

    private _freezeTimeout: any;

    constructor(options: any) {
        super(options);
        this._dialogOpener = new DialogOpener();
    }

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data
        });
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

    protected _onItemMouseEnter(eventObject: SyntheticEvent<MouseEvent>,
                                item: Model,
                                mouseEvent: SyntheticEvent<MouseEvent>): void {
        const target: HTMLElement = mouseEvent.target as HTMLElement;
        clearTimeout(this._freezeTimeout);
        if (this._frozen) {
            this._dialogOpener.close();
            this._children.list.unfreezeHoveredItems();
        }
        this._freezeTimeout = setTimeout(() => {
            if (item) {
                this._dialogOpener.open({
                    target,
                    opener: this,
                    templateOptions: {},
                    closeOnOutsideClick: true,
                    template: 'Controls-demo/list_new/FreezeHoveredItem/PopupTemplate/PopupTemplate'
                });
                this._frozen = item;
                this._children.list.freezeHoveredItem(item);
            }
        }, 200);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
