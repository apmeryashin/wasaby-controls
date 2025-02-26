import { Logger } from 'UI/Utils';
import { IItemsViewOptions, ItemsView } from 'Controls/baseList';
import TreeControl from 'Controls/_tree/TreeControl';
import ITree, { IOptions as ITreeOptions } from 'Controls/_tree/interface/ITree';
import TreeView from 'Controls/_tree/TreeView';

/**
 * Опции для контрола {@link Controls/tree:ItemsView}
 *
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface IItemsTreeOptions extends IItemsViewOptions, ITreeOptions {}

/**
 * Контрол древовидной таблицы, который умеет работать без источника данных.
 * В качестве данных ожидает {@link Types/collection:RecordSet}, переданный в опцию {@link Controls/list:IItemsView#items items}.
 * @class Controls/tree:ItemsView
 * @extends Controls/list:ItemsView
 * @implements Controls/list:IItemsView
 *
 * @public
 * @author Уфимцев Д.Ю.
 */
export default class ItemsTree extends ItemsView<IItemsTreeOptions> implements ITree {
    //region override base template props
    protected _viewName: Function = TreeView;
    protected _viewTemplate: Function = TreeControl;
    protected _viewModelConstructor: string = 'Controls/tree:TreeCollection';
    //endregion

    //region implement ITree
    readonly '[Controls/_tree/interface/ITree]': true;
    //endregion

    //region life circle hooks
    _beforeMount(options: IItemsTreeOptions): void | Promise<void> {
        if (options.groupProperty && options.nodeTypeProperty) {
            Logger.error('Нельзя одновременно задавать группировку через ' +
                'groupProperty и через nodeTypeProperty.', this);
        }

        const superResult = super._beforeMount(options);

        return superResult;
    }
    //endregion

}
