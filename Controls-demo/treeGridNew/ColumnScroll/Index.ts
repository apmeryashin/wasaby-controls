import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/ColumnScroll/ColumnScroll';
import * as FooterTemplate from 'wml!Controls-demo/treeGridNew/ColumnScroll/FooterTemplate';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import {getActionsForContacts as getItemActions} from '../../list_new/DemoHelpers/ItemActionsCatalog';
import {IItemAction} from 'Controls/itemActions';
import {IColumn} from 'Controls/grid';
import {IHeaderCell} from 'Controls/grid';
import {Flat} from 'Controls-demo/treeGridNew/DemoHelpers/Data/Flat';

const COLUMNS = [
    {
        displayProperty: 'key',
        width: '60px'
    },
    {
        displayProperty: 'title',
        width: '200px'
    },
    {
        displayProperty: 'country',
        width: '150px'
    },
    {
        displayProperty: 'rating',
        width: 'auto'
    },
    {
        displayProperty: 'hasChild',
        width: '120px'
    },
    {
        displayProperty: 'country',
        width: 'max-content'
    },
    {
        displayProperty: 'rating',
        width: '120px'
    }
];

const HEADER = [
    {
        title: '#'
    },
    {
        title: 'Бренд'
    },
    {
        title: 'Страна производителя'
    },
    {
        title: 'Рейтинг'
    },
    {
        title: 'Есть товары?'
    },
    {
        title: 'Еще раз страна'
    },
    {
        title: 'Еще раз рейтинг'
    }
];

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _itemActions: IItemAction[] = getItemActions();
    protected _footerTemplate?: TemplateFunction = undefined;
    protected _columns: IColumn[] = COLUMNS;
    protected _header: IHeaderCell[] = HEADER;
    protected _columnsType: 'small' | 'big' = 'big';

    protected _expandedItems: CrudEntityKey[] = [1];

    protected _beforeMount(): void {
        const data = Flat.getData();
        const country = 'Соединенные Штаты Америки';
        // tslint:disable-next-line
        data[2].country = `${country} ${country} ${country}`;

        this._viewSource = new HierarchicalMemory({
            keyProperty: 'key',
            parentProperty: 'parent',
            data
        });
    }

    protected _onToggleColumns(e, type?: 'big' | 'small'): void {
        if (this._columnsType !== type) {
            this._columnsType = type;

            if (type === 'big') {
                this._columns = COLUMNS;
                this._header = HEADER;
            } else {
                this._columns = COLUMNS.slice(0, 4);
                this._header = HEADER.slice(0, 4);
            }
        }
    }

    protected _onToggleFooter(e, type?: 'row'): void {
        if (!type) {
            this._footerTemplate = undefined;
        } else if (type === 'row') {
            this._footerTemplate = FooterTemplate;
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
