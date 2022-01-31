import {ItemsView as BaseItemsView} from 'Controls/baseList';
import TileView from 'Controls/_tile/TileView';

/**
 * Контрол {@link /doc/platform/developmentapl/interface-development/controls/list/tile/ плиточного списка}, который умеет работать без {@link /doc/platform/developmentapl/interface-development/controls/list/source/ источника данных}.
 * В качестве данных ожидает {@link Types/collection:RecordSet} переданный в опцию {@link Controls/list:IItemsView#items items}.
 *
 * @demo Controls-demo/tileNew/ItemsView/Base/Index
 * @implements Controls/list:IItemsView
 *
 * @class Controls/tile:ItemsView
 * @extends Controls/list:ItemsView
 * @implements Controls/list:IItemsView
 * @implements Controls/interface/IItemTemplate
 * @implements Controls/interface/IGroupedList
 * @implements Controls/interface:IMultiSelectable
 * @implements Controls/list:IVirtualScroll
 * @implements Controls/list:IList
 * @implements Controls/interface:IItemPadding
 * @implements Controls/list:IClickableView
 * @implements Controls/marker:IMarkerList
 * @implements Controls/itemActions:IItemActions
 * @implements Controls/tile:ITile
 *
 * @public
 * @author Уфимцев Д.Ю.
 */
export default class ItemsView extends BaseItemsView {
    protected _viewName: Function = TileView;
    protected _viewModelConstructor: string = 'Controls/tile:TileCollection';

    static defaultProps: object = {
        ...BaseItemsView.defaultProps,
        actionAlignment: 'vertical',
        actionCaptionPosition: 'none'
    };
}

/**
 * @cfg {Controls/_tile/interface/ITile/TileItemPadding.typedef}  Конфигурация отступов между элементами плитки.
 * @name Controls/_tile/ItemsView#itemPadding
 * @demo Controls-demo/tileNew/ItemPadding/Index
 * @example
 * <pre class="brush: html; highlight: [4-8]">
 * <!-- WML -->
 * <Controls.tile:View source="{{_viewSource}}" imageProperty="image">
 *    <ws:itemPadding
 *       top="l"
 *       bottom="l"
 *       left="l"
 *       right="l"/>
 * </Controls.tile:View>
 * </pre>
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/tile/paddings/#item-padding руководство разработчика}
 */
