/* tslint:disable:no-magic-numbers */
import {data} from './Data';
import {Model} from 'Types/entity';
import {Control, TemplateFunction} from 'UI/Base';
import {IGroupNodeColumn} from 'Controls/treeGrid';
import {IHeaderCell, TColspanCallbackResult} from 'Controls/grid';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import * as template from 'wml!Controls-demo/StickyEnvironment/DataPinProvider/Index';
import * as nodeTemplate from 'wml!Controls-demo/StickyEnvironment/DataPinProvider/NodeTemplate';
import * as headerCell from 'wml!Controls-demo/StickyEnvironment/DataPinProvider/HeaderCellTemplate';

export default class extends Control {
    protected _template: TemplateFunction = template;

    protected _viewSource: HierarchicalMemory;
    protected _header: IHeaderCell[] = [
        {
            startRow: 1,
            endRow: 3,
            startColumn: 1,
            endColumn: 2,
            template: headerCell,
            templateOptions: {
                field: 'name',
                defaultCaption: 'Name'
            }
        },
        {
            caption: 'Price',
            startRow: 1,
            endRow: 3,
            startColumn: 2,
            endColumn: 3
        },
        {
            caption: 'Count',
            startRow: 1,
            endRow: 3,
            startColumn: 3,
            endColumn: 4
        },
        {
            caption: 'Total',
            startRow: 1,
            endRow: 2,
            startColumn: 4,
            endColumn: 5
        },
        {
            startRow: 2,
            endRow: 3,
            startColumn: 4,
            endColumn: 5,
            template: headerCell,
            templateOptions: {
                field: 'total',
                defaultCaption: ''
            }
        }
    ];
    protected _columns: IGroupNodeColumn[] = [
        {
            width: '200px',
            displayProperty: 'name',
            template: nodeTemplate,
            templateOptions: {
                // 40px высота шапки
                topMargin: '-40px'
            }
        },
        {
            width: '100px',
            align: 'right',
            displayType: 'number',
            displayProperty: 'price'
        },
        {
            width: '100px',
            align: 'right',
            displayType: 'number',
            displayProperty: 'count'
        },
        {
            width: '100px',
            align: 'right',
            displayType: 'number',
            displayProperty: 'total'
        }
    ];
    protected _expandedItems: CrudEntityKey[] = [null];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            data,
            keyProperty: 'id',
            parentProperty: 'parent',
            filter: (): boolean => true
        });
    }

    protected _colspanCallback(
        item: Model,
        column: IGroupNodeColumn,
        columnIndex: number
    ): TColspanCallbackResult {
        return item.get('nodeType') === 'group' && columnIndex === 0 ? 3 : 1;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
