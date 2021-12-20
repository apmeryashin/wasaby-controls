import { ItemsView as BaseItemsView } from 'Controls/tile';
import {TreeControl} from 'Controls/tree';
import TreeTileView from 'Controls/_treeTile/TreeTileView';

/**
 * Контрол "Иерархическая плитка без источника данных" позволяет отображать переданный набор данных
 * в виде элементов плитки с иерархией и располагать несколько элементов в одну строку.
 * В качестве данных ожидает {@link Types/collection:RecordSet} переданный в опцию {@link Controls/list:IItemsView#items items}.
 *
 * @class Controls/treeTile:ItemsView
 * @extends Controls/list:ItemsView
 * @implements Controls/list:IItemsView
 * @implements Controls/interface/IItemTemplate
 * @implements Controls/interface/IPromisedSelectable
 * @implements Controls/list:IContentTemplate
 * @implements Controls/interface/IGroupedList
 * @implements Controls/interface:INavigation
 * @implements Controls/interface:IFilterChanged
 * @implements Controls/list:IList
 * @implements Controls/interface:IItemPadding
 * @implements Controls/itemActions:IItemActions
 * @implements Controls/interface:IHierarchy
 * @implements Controls/tree:ITreeControl
 * @implements Controls/interface:IDraggable
 * @implements Controls/tile:ITile
 * @implements Controls/list:IClickableView
 * @implements Controls/marker:IMarkerList
 * @implements Controls/list:IVirtualScroll
 * @mixes Controls/treeTile:ITreeTile
 *
 * @author Уфимцев Д.Ю.
 * @public
 */
export default class ItemsView extends BaseItemsView {
    protected _viewName: Function = TreeTileView;
    protected _viewTemplate: Function = TreeControl;
    protected _viewModelConstructor: string = 'Controls/treeTile:TreeTileCollection';
}
