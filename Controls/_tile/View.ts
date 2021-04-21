import {View as List} from 'Controls/list';
import { TemplateFunction } from 'UI/Base';
import TileView = require('./TileView');

/**
 * Контрол "Плитка" позволяет отображать данные из различных источников в виде элементов плитки и располагать несколько элементов в одну строку. Контрол поддерживает широкий набор возможностей, позволяющих разработчику максимально гибко настраивать отображение данных.
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FExplorer%2FDemo демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/tile/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/69b02f939005820476d32a184ca50b72f9533076/Controls-default-theme/variables/_tile.less переменные тем оформления tile}
 * * {@link https://github.com/saby/wasaby-controls/blob/69b02f939005820476d32a184ca50b72f9533076/Controls-default-theme/variables/_list.less переменные тем оформления}
 *
 *
 * @class Controls/_tile/View
 * @extends Controls/list:View
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface/IContentTemplate
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/_list/interface/IList
 * @mixes Controls/_itemActions/interface/IItemActionsOptions
 * @mixes Controls/interface:IHierarchy
 * @implements Controls/_tree/interface/ITreeControl
 * @mixes Controls/_interface/IDraggable
 * @mixes Controls/_tile/interface/ITile
 * @mixes Controls/_list/interface/IClickableView
 * @mixes Controls/_marker/interface/IMarkerList
 *
 * @mixes Controls/_list/interface/IVirtualScrollConfig
 *
 *
 * @author Авраменко А.С.
 * @public
 */

/*
 * List in which items are displayed as tiles. Can load data from data source.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FExplorer%2FDemo">Demo examples</a>.
 * The detailed description and instructions on how to configure the control you can read <a href='/doc/platform/developmentapl/interface-development/controls/list/tile/'>here</a>.
 *
 * @class Controls/_tile/View
 * @extends Controls/list:View
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/_list/interface/IList
 * @mixes Controls/_itemActions/interface/IItemActionsOptions
 * @mixes Controls/_interface/ISorting
 * @mixes Controls/interface:IHierarchy
 * @implements Controls/_tree/interface/ITreeControl
 * @mixes Controls/_interface/IDraggable
 * @mixes Controls/List/interface/ITile
 * @mixes Controls/_list/interface/IClickableView
 * @mixes Controls/_marker/interface/IMarkerList
 *
 * @mixes Controls/_list/interface/IVirtualScrollConfig
 *
 *
 * @author Авраменко А.С.
 * @public
 */

export default class View extends List {
    protected _viewName: TemplateFunction = TileView;
    protected _supportNewModel: boolean = true;

    protected _beforeMount(): void {
        this._viewModelConstructor = this._getModelConstructor();
    }

    protected _getModelConstructor(): string {
        return 'Controls/tile:TileCollection';
    }

    static getDefaultOptions(): object {
        return {
            actionAlignment: 'vertical',
            actionCaptionPosition: 'none'
        };
    }
}

Object.defineProperty(View, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return View.getDefaultOptions();
   }
});
