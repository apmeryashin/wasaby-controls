import { Control, TemplateFunction } from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/FadedKeys/Template';
import * as explorerImages from 'Controls-demo/Explorer/ExplorerImagesLayout';
import {CrudEntityKey, Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {IItemAction} from 'Controls/_itemActions/interface/IItemAction';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'UI/Vdom';
import {Collection} from 'Controls/display';
import * as Dnd from 'Controls/dragnDrop';

const DATA = [
    {
        key: 1,
        'parent@': null,
        title: 'Файл 1. Проверяем работу механизма fadedKeys.',
        image: explorerImages[4],
        author: 'Алексей'
    }, {
        key: 2,
        'parent@': null,
        title: 'Файл 2. Проверяем работу механизма fadedKeys.',
        image: explorerImages[4],
        author: 'Борис'
    }, {
        key: 3,
        'parent@': null,
        title: 'Файл 3. Проверяем работу механизма fadedKeys.',
        image: explorerImages[4],
        author: 'Вадим'
    }
];

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _viewNameSource: Memory;
    protected _viewName: string = 'Controls/list:View';
    protected _fadedKeys: CrudEntityKey[] = [2];
    protected _itemActions: IItemAction[];
    protected _columns: IColumn[] = [
        {
            displayProperty: 'key',
            width: '50px'
        },
        {
            displayProperty: 'title',
            width: '1fr'
        },
        {
            displayProperty: 'author',
            width: '1fr'
        }
    ];

    protected _beforeMount(): void {
        this._viewNameSource = new Memory({
            keyProperty: 'key',
            data: [
                { key: 'Controls/list:View' },
                { key: 'Controls/grid:View' },
                { key: 'Controls/tile:View' },
                { key: 'Controls/columns:View' }
            ]
        });
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: DATA
        });
        this._itemActions = [{
            id: 'cut',
            title: 'Вырезать',
            icon: 'icon-Scissors',
            handler: (item: Model) => {
                const key = item.getKey();
                const index = this._fadedKeys.findIndex((itemKey) => key === itemKey);
                const newFadedKeys = [...this._fadedKeys];
                if (index !== -1) {
                    newFadedKeys.splice(index, 1);
                } else {
                    newFadedKeys.push(key);
                }
                this._fadedKeys = newFadedKeys;
            }
        }];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
