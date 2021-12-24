import TreeView from 'Controls/_tree/TreeView';
import { MODULE_NAME as CompositeCollectionItemModuleName } from './display/CompositeCollectionItem';

const IS_COMPOSITE_ITEM = `[${ CompositeCollectionItemModuleName }]`;

/**
 * Контрол-view "Развернутое составное дерево" для отображения иерархии в развернутом виде и установке режима отображения элементов на каждом уровне вложенности
 *
 * @public
 * @author Авраменко А.С.
 */
export default class ExpandedCompositeTreeView extends TreeView {

    protected _onItemMouseEnter(event, item) {
        if (item[IS_COMPOSITE_ITEM]) {
            event.stopPropagation();
        } else {
            super._onItemMouseEnter(event, item);
        }
    }

    protected _onItemMouseDown(event, item) {
        if (item[IS_COMPOSITE_ITEM]) {
            event.stopPropagation();
        } else {
            super._onItemMouseDown(event, item);
        }
    }

    protected _onItemMouseUp(event, item) {
        if (item[IS_COMPOSITE_ITEM]) {
            event.stopPropagation();
        } else {
            super._onItemMouseUp(event, item);
        }
    }

    protected _onItemClick(event, item) {
        if (item[IS_COMPOSITE_ITEM]) {
            event.stopPropagation();
        } else {
            super._onItemClick(event, item);
        }
    }

    protected _onItemContextMenu(event, item) {
        if (item[IS_COMPOSITE_ITEM]) {
            event.stopPropagation();
        } else {
            super._onItemClick(event, item);
        }
    }
}
