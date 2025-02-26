import * as Item from 'wml!Controls/_treeGrid/render/grid/Item';

import {GridView, IGridOptions} from 'Controls/grid';
import { TemplateFunction } from 'UI/Base';
import { SyntheticEvent } from 'UI/Vdom';
import 'css!Controls/grid';
import 'css!Controls/treeGrid';

import TreeGridCollection from './display/TreeGridCollection';
import TreeGridDataRow from './display/TreeGridDataRow';
import TreeGridNodeFooterRow from './display/TreeGridNodeFooterRow';
import TreeGridNodeHeaderRow from './display/TreeGridNodeHeaderRow';
import { ITreeControlOptions } from 'Controls/tree';
import {TGroupNodeVisibility} from './interface/ITreeGrid';

export interface ITreeGridOptions extends ITreeControlOptions, IGridOptions {
    nodeTypeProperty?: string;
    groupNodeVisibility?: TGroupNodeVisibility;
}

/**
 * Представление иерархической таблицы
 */
export default class TreeGridView extends GridView {
    protected _listModel: TreeGridCollection;
    protected _options: ITreeGridOptions;

    _beforeUpdate(newOptions: ITreeGridOptions): void {
        super._beforeUpdate(newOptions);

        if (this._options.nodeTypeProperty !== newOptions.nodeTypeProperty) {
            this._listModel.setNodeTypeProperty(newOptions.nodeTypeProperty);
        }
        if (this._options.groupNodeVisibility !== newOptions.groupNodeVisibility) {
            this._listModel.setGroupNodeVisibility(newOptions.groupNodeVisibility);
        }
    }

    protected _resolveBaseItemTemplate(): TemplateFunction {
        return Item;
    }

    protected _onItemClick(e: SyntheticEvent, item: TreeGridDataRow|TreeGridNodeFooterRow): void {
        if (item instanceof TreeGridNodeFooterRow) {
            e.stopImmediatePropagation();
            if (e.target.closest('.js-controls-BaseControl__NavigationButton')) {
                this._notify('loadMore', [item.getNode(), 'down']);
            }
            return;
        }

        if (item instanceof TreeGridNodeHeaderRow) {
            e.stopImmediatePropagation();
            if (e.target.closest('.js-controls-BaseControl__NavigationButton')) {
                this._notify('loadMore', [item.getNode(), 'up']);
            }
            return;
        }

        super._onItemClick(e, item);
    }

    protected _onItemMouseUp(e: SyntheticEvent, item: TreeGridDataRow|TreeGridNodeFooterRow): void {
        if (item['[Controls/treeGrid:TreeGridNodeFooterRow]'] || item['[Controls/treeGrid:TreeGridNodeHeaderRow]']) {
            e.stopImmediatePropagation();
            return;
        }

        super._onItemMouseUp(e, item);
    }

    protected _onItemMouseDown(e: SyntheticEvent, item: TreeGridDataRow|TreeGridNodeFooterRow): void {
        if (item['[Controls/treeGrid:TreeGridNodeFooterRow]'] || item['[Controls/treeGrid:TreeGridNodeHeaderRow]']) {
            e.stopImmediatePropagation();
            return;
        }

        super._onItemMouseDown(e, item);
    }

}
