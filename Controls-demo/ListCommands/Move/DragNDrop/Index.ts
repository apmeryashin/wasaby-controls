import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/ListCommands/Move/DragNDrop/Index';
import 'css!Controls-demo/Controls-demo';
import {getListData} from 'Controls-demo/OperationsPanelNew/DemoHelpers/DataCatalog';
import {Memory} from 'Types/source';
import {View as TreeGrid} from 'Controls/treeGrid';
import {IColumn} from 'Controls/grid';
import {ListItems} from 'Controls/dragnDrop';
import 'css!Controls-demo/ListCommands/ListCommands';
import 'wml!Controls-demo/ListCommands/templates/PersonInfo';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _children: {
        treeGrid: TreeGrid
    };
    protected _gridColumns: IColumn[] = [{
        template: 'wml!Controls-demo/ListCommands/templates/PersonInfo'
    }];

    protected _source: Memory = new Memory({
        keyProperty: 'id',
        data: getListData()
    });

    protected _dragEnd(event, entity, target, position) {
        this._children.treeGrid.moveItems({
            selected: entity.getItems(),
            excluded: []
        }, target.getKey(), position).then(() => {
            this._children.treeGrid.reload();
        });
    }

    protected _dragStart(event, items) {
        return new ListItems({
            items
        });
    }
}
