import { View as List } from 'Controls/baseList';
import * as GridView from 'Controls/_grid/GridView';
import GridViewTable from 'Controls/_grid/GridViewTable';
import { isFullGridSupport } from 'Controls/display';
import { TemplateFunction } from 'UI/Base';
import { IOptions as IGridOptions } from './display/mixins/Grid';
import {Logger} from 'UICommon/Utils';
import {GridControl} from './GridControl';

/**
 * Контрол "Таблица" позволяет отображать данные из различных источников в виде таблицы.
 * Контрол поддерживает широкий набор возможностей, позволяющих разработчику максимально гибко настраивать отображение данных.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_grid.less переменные тем оформления grid}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_list.less переменные тем оформления list}
 *
 * @class Controls/_grid/Grid
 * @extends Controls/list:View
 * @implements Controls/interface:ISource
 * @implements Controls/interface/IPromisedSelectable
 * @implements Controls/interface:INavigation
 * @implements Controls/interface:IFilterChanged
 * @implements Controls/list:IList
 * @implements Controls/interface:IItemPadding
 * @implements Controls/itemActions:IItemActions
 * @implements Controls/grid:IGridControl
 * @implements Controls/interface/IGridItemTemplate
 * @implements Controls/interface:IDraggable
 * @implements Controls/interface/IGroupedGrid
 * @implements Controls/interface/IGridItemTemplate
 * @implements Controls/grid:IPropStorage
 * @implements Controls/grid:IEditableGrid
 * @implements Controls/marker:IMarkerList
 *
 * @public
 * @author Авраменко А.С.
 * @demo Controls-demo/gridNew/Base/Index
 */

/*
 * Table-looking list. Can load data from data source.
 * The detailed description and instructions on how to configure the control you can read <a href='/doc/platform/developmentapl/interface-development/controls/list/'>here</a>.
 * List of examples:
 * <ul>
 *    <li><a href="/materials/Controls-demo/app/Controls-demo%2FList%2FGrid%2FEditableGrid">How to configure editing in your list</a>.</li>
 * </ul>
 *
 * @class Controls/_grid/Grid
 * @extends Controls/list:View
 * @implements Controls/interface:ISource
 * @implements Controls/interface/IPromisedSelectable
 * @implements Controls/interface/IGroupedGrid
 * @implements Controls/interface:INavigation
 * @implements Controls/interface:IFilterChanged
 * @implements Controls/list:IList
 * @implements Controls/itemActions:IItemActions
 * @implements Controls/interface:ISorting
 * @implements Controls/grid:IGridControl
 * @implements Controls/interface/IGridItemTemplate
 * @implements Controls/interface:IDraggable
 * @implements Controls/grid:IPropStorage
 * @implements Controls/grid:IEditableGrid
 * @implements Controls/marker:IMarkerList
 *
 *
 * @public
 * @author Авраменко А.С.
 * @demo Controls-demo/gridNew/Base/Index
 */

export default class Grid<TControl extends GridControl = GridControl> extends List<GridControl> {
    protected _viewName: TemplateFunction = null;
    protected _viewTemplate: TControl = GridControl;

    _beforeMount(options: IGridOptions): Promise<void>|void {
        const superResult = super._beforeMount(options);
        this._viewName = isFullGridSupport() ? GridView : GridViewTable;
        return superResult;
    }

    protected _getModelConstructor(): string {
        return 'Controls/grid:GridCollection';
    }

    setColumnScrollPosition(position: 'start' | 'end'): void {
        Logger.warn(
            'Method is deprecated and will be removed soon! Please use scrollToLeft/scrollToRight. See documentation on WI.'
        );
        if (position === 'start') {
            this.scrollToLeft();
        } else {
            this.scrollToRight();
        }
    }

    scrollToLeft(): void {
        this._children.listControl.scrollToLeft();
    }

    scrollToRight(): void {
        this._children.listControl.scrollToRight();
    }

    scrollToColumn(columnIndex: number): void {
        this._children.listControl.scrollToColumn(columnIndex);
    }
}

Grid.getDefaultOptions = () => ({
    stickyHeader: true,
    stickyResults: true,
    stickyColumnsCount: 1,
    rowSeparatorSize: null,
    columnSeparatorSize: null,
    isFullGridSupport: isFullGridSupport()
});

Object.defineProperty(Grid, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Grid.getDefaultOptions();
   }
});

/**
 * @name Controls/_grid/Grid#itemPadding
 * @cfg {Controls/_list/interface/IList/ItemPadding.typedef}
 * @demo Controls-demo/gridNew/ItemPaddingNull/Index
 */

/**
 * @name Controls/_grid/Grid#multiSelectPosition
 * @cfg
 * @demo Controls-demo/gridNew/Multiselect/CustomPosition/Index
 */
