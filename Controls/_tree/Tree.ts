import { TemplateFunction } from 'UI/Base';
import { Logger } from 'UI/Utils';
import { descriptor } from 'Types/entity';
import { CrudEntityKey } from 'Types/source';
import { Model } from 'Types/entity';

import { View as List } from 'Controls/baseList';
import TreeControl from 'Controls/_tree/TreeControl';
import ITree, { IOptions as ITreeOptions } from 'Controls/_tree/interface/ITree';
import TreeView from 'Controls/_tree/TreeView';

import 'css!Controls/treeGrid';

/**
 * Контрол "Дерево без колонок" позволяет отображать данные из различных источников в виде иерархического списка.
 * Контрол поддерживает широкий набор возможностей, позволяющих разработчику максимально гибко настраивать отображение данных.
 * @remark
 * Дополнительно о контроле:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/tree/ руководство разработчика}
 *
 * @implements Controls/interface:ISource
 * @implements Controls/interface/IPromisedSelectable
 * @implements Controls/interface/IGroupedGrid
 * @implements Controls/interface:INavigation
 * @implements Controls/interface:IFilterChanged
 * @implements Controls/interface:IHierarchy
 * @implements Controls/interface/ITreeGridItemTemplate
 * @implements Controls/interface:IDraggable
 * @mixes Controls/list:IVirtualScrollConfig
 * @mixes Controls/list:IList
 * @mixes Controls/list:IClickableView
 * @mixes Controls/grid:IPropStorage
 * @implements Controls/tree:ITreeControl
 * @mixes Controls/itemActions:IItemActions
 *
 * @public
 * @author Авраменко А.С.
 */
export default class Tree extends List implements ITree {
    protected _viewName: TemplateFunction = TreeView;
    protected _viewTemplate: TemplateFunction = TreeControl;

    _beforeMount(options: ITreeOptions): Promise<void> {

        if (!options.nodeProperty) {
            Logger.error('Не задана опция nodeProperty, обязательная для работы Controls/tree:View', this);
        }

        if (!options.parentProperty) {
            Logger.error('Не задана опция parentProperty, обязательная для работы Controls/tree:View', this);
        }

        return super._beforeMount(options);
    }

    toggleExpanded(key: CrudEntityKey): Promise<void> {
        // @ts-ignore
        return this._children.listControl.toggleExpanded(key);
    }

    goToPrev(): Model {
        return this._children.listControl.goToPrev();
    }

    goToNext(): Model {
        return this._children.listControl.goToNext();
    }

    getNextItem(key: CrudEntityKey): Model {
        return this._children.listControl.getNextItem(key);
    }

    getPrevItem(key: CrudEntityKey): Model {
        return this._children.listControl.getPrevItem(key);
    }

    protected _getModelConstructor(): string {
        return 'Controls/tree:TreeCollection';
    }

    static getOptionTypes(): object {
        return {
            parentProperty: descriptor(String).required()
        };
    }
}
