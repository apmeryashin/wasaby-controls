import { View as TileView } from 'Controls/tile';
import { TreeControl } from 'Controls/tree';
import {TemplateFunction} from 'UI/Base';
import TreeTileView from './TreeTileView';

/**
 * Контрол "Иерархическая плитка" позволяет отображать данные из различных источников
 * в виде элементов плитки с иерархией и располагать несколько элементов в одну строку.
 * Контрол поддерживает широкий набор возможностей, позволяющих разработчику
 * максимально гибко настраивать отображение данных.
 *
 * @extends Controls/list:View
 * @implements Controls/interface:ISource
 * @implements Controls/interface/IItemTemplate
 * @implements Controls/interface/IPromisedSelectable
 * @implements Controls/list:IContentTemplate
 * @implements Controls/interface/IGroupedList
 * @implements Controls/interface:INavigation
 * @implements Controls/interface:IFilterChanged
 * @implements Controls/list:IList
 * @implements Controls/itemActions:IItemActions
 * @implements Controls/interface:IHierarchy
 * @implements Controls/tree:ITreeControl
 * @implements Controls/interface:IDraggable
 * @implements Controls/tile:ITile
 * @implements Controls/list:IClickableView
 * @implements Controls/marker:IMarkerList
 * @implements Controls/list:IVirtualScrollConfig
 * @mixes Controls/treeTile:ITreeTile 
 *
 * @author Панихин К.А.
 * @public
 * @demo Controls-demo/treeTileNew/Default/Index
 */

export default class View extends TileView {
    protected _viewName: TemplateFunction = TreeTileView;
    protected _viewTemplate: TemplateFunction = TreeControl;

    protected _getModelConstructor(): string {
        return 'Controls/treeTile:TreeTileCollection';
    }
}
