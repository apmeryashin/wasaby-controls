import {isFullGridSupport} from 'Controls/display';
import {default as View} from 'Controls/_grid/Grid';
import {default as ItemsView} from 'Controls/_grid/ItemsGrid';
import GridView from 'Controls/_grid/GridView';

import * as GridItemTemplate from 'wml!Controls/_grid/Render/grid/Item';
import * as TableItemTemplate from 'wml!Controls/_grid/Render/table/Item';

import * as TableTemplate from 'wml!Controls/_grid/Render/table/GridView';
// FIXME: при обычном условном присвоении шаблона tmpl = isAny ? tmpl1 : tmpl2, переменной
//  один раз присвоится значение и не будет меняться.
//  В таком случае возникает ошибка при открытии одной страницы из разных браузеров (Chrome и IE), с
//  сервера всегда будет возвращаться один и тот же шаблон,
//  для того браузера, который первый открыл страницу.
//  Данным хахом мы подменяем шаблонную функцию и возвращаем правильную. Тоже самое, что вынести в
//  отдельный шаблон и там условно вызвать паршл,
//  но быстрее по времени.
//  По словам Макса Крылова это ничего не сломает, если на функцию навесить флаги ядра.
//  Найти нормальное решение по https://online.sbis.ru/opendoc.html?guid=41a8dbab-93bb-4bc0-8533-6b12c0ec6d8d
const ItemTemplate = function() {
    return isFullGridSupport() ? GridItemTemplate.apply(this, arguments) : TableItemTemplate.apply(this, arguments);
};
ItemTemplate.stable = true;
ItemTemplate.isWasabyTemplate = true;

import * as ColumnTemplate from 'wml!Controls/_grid/Render/CellContent';
import * as StickyLadderColumnTemplate from 'wml!Controls/_grid/Render/grid/StickyLadderColumn';
import * as GroupTemplate from 'wml!Controls/_grid/Render/GroupCellContentWithRightTemplate';
import * as HeaderContent from 'wml!Controls/_grid/Render/HeaderCellContent';
import * as ResultColumnTemplate from 'wml!Controls/_grid/Render/ResultsCellContent';
import * as ResultsTemplate from 'wml!Controls/_grid/Render/ResultsCellContent';
import * as FooterColumnTemplate from 'wml!Controls/_grid/Render/FooterCellContent';
import * as FooterTemplate from 'wml!Controls/_grid/Render/FooterCellContent';
import * as EmptyTemplate from 'wml!Controls/_grid/Render/EmptyCellContent';
import * as EmptyColumnTemplate from 'wml!Controls/_grid/Render/EmptyCellContent';
import * as ItemActionsCellContent from 'wml!Controls/_grid/Render/ItemActionsCellContent';
import * as ItemEditorTemplate from 'wml!Controls/_grid/Render/ItemEditorTemplate';
import * as IndicatorTemplate from 'wml!Controls/_grid/Render/IndicatorTemplate';
import * as TableIndicatorTemplate from 'wml!Controls/_grid/Render/TableIndicatorTemplate';

import * as MoneyTypeRender from 'wml!Controls/_grid/Render/types/money';
import * as NumberTypeRender from 'wml!Controls/_grid/Render/types/number';
import * as DateTypeRender from 'wml!Controls/_grid/Render/types/date';
import * as StringTypeRender from 'wml!Controls/_grid/Render/types/string';
import * as StringSearchTypeRender from 'wml!Controls/_grid/Render/types/StringSearch';
import * as TypesLadderWrapper from 'wml!Controls/_grid/Render/types/ladderWrapper';

import SortingButton from 'Controls/_grid/SortingButton';
import {register} from 'Types/di';

/**
 * Библиотека контролов, которые реализуют плоский список, отображающийся в виде {@link /doc/platform/developmentapl/interface-development/controls/list/grid/ таблицы}.
 * @library
 * @includes ItemTemplate Controls/_grid/interface/ItemTemplate
 * @includes ResultsTemplate Controls/_grid/interface/ResultsTemplate
 * @includes GroupTemplate Controls/_grid/interface/GroupTemplate
 * @includes HeaderContent Controls/_grid/interface/HeaderContent
 * @includes LadderWrapper Controls/_grid/interface/LadderWrapper
 * @includes ColumnTemplate Controls/_grid/interface/ColumnTemplate
 * @includes ResultColumnTemplate Controls/_grid/interface/ResultColumnTemplate
 * @includes EditingEmptyTemplate Controls/_grid/interface/EditingEmptyTemplate
 * @includes FooterTemplate Controls/_grid/interface/FooterTemplate
 * @includes EmptyTemplate Controls/_grid/interface/EmptyTemplate
 * @includes EmptyColumnTemplate Controls/_grid/interface/EmptyColumnTemplate
 * @includes RowEditor Controls/_grid/interface/RowEditor
 * @includes IPropStorage Controls/_grid/interface/IPropStorage
 * @includes ITagColumn Controls/_grid/interface/ITagColumn
 * @includes SortingButton Controls/_grid/SortingButton
 * @includes ItemEditorTemplate Controls/_grid/interface/IitemEditorTemplate
 * @includes IEditableGrid Controls/_grid/interface/IEditableGrid
 * @includes IGridEditingConfig Controls/_grid/interface/IGridEditingConfig
 * @includes IItemAddOptions Controls/_grid/interface/IItemAddOptions
 * @includes IItemEditOptions Controls/_grid/interface/IItemEditOptions
 * @public
 * @author Крайнов Д.О.
 */

export {
    View,
    ItemsView,
    GridView,
    ItemTemplate,
    ItemEditorTemplate,
    ResultsTemplate,
    ResultColumnTemplate,
    ColumnTemplate,
    TypesLadderWrapper,
    StickyLadderColumnTemplate,
    GroupTemplate,
    HeaderContent,
    FooterTemplate,
    FooterColumnTemplate,
    ItemActionsCellContent,
    EmptyTemplate,
    EmptyColumnTemplate,
    MoneyTypeRender,
    NumberTypeRender,
    DateTypeRender,
    StringTypeRender,
    StringSearchTypeRender,
    TableTemplate,
    SortingButton,
    IndicatorTemplate,
    TableIndicatorTemplate
};

import {
    default as GridCollection,
    IOptions as IGridCollectionOptions
} from 'Controls/_grid/display/Collection';

export {
    GridControl,
    IGridControlOptions
} from 'Controls/_grid/GridControl';

export {
    default as GridMixin,
    TColspanCallbackResult,
    TColspanCallback,
    TResultsColspanCallback,
    IEmptyTemplateColumn,
    IOptions as IGridOptions,
    THeaderVisibility,
    TResultsVisibility
} from 'Controls/_grid/display/mixins/Grid';
export {default as GridRowMixin, IInitializeColumnsOptions} from 'Controls/_grid/display/mixins/Row';
export {IItemTemplateParams} from 'Controls/_grid/display/mixins/Row';

export {
    TColumns,
    IColumn,
    IColspanParams,
    ICellPadding,
    TCellAlign,
    TCellPaddingVariant,
    TCellVerticalAlign,
    TOverflow,
    IColumnSeparatorSizeConfig,
    TColumnSeparatorSize
} from 'Controls/_grid/display/interface/IColumn';

export {
    THeader,
    IHeaderCell
} from 'Controls/_grid/display/interface/IHeaderCell';

export {IFooterColumn} from 'Controls/_grid/display/interface/IFooterColumn';

export {IGridControl} from 'Controls/_grid/display/interface/IGridControl';
export {IGridAbstractColumn} from 'Controls/_grid/display/interface/IGridAbstractColumn';

export * from 'Controls/_grid/interface/IEditableGrid';

import GridRow, {IOptions as IGridRowOptions} from 'Controls/_grid/display/Row';
import {default as GridItemActionsCell} from 'Controls/_grid/display/ItemActionsCell';
import GridCell, {IOptions as IGridCellOptions} from 'Controls/_grid/display/Cell';
import GridHeader, {IOptions as IGridHeaderOptions} from 'Controls/_grid/display/Header';
import GridHeaderRow, {IOptions as IGridHeaderRowOptions} from 'Controls/_grid/display/HeaderRow';
import GridHeaderCell, {IOptions as IGridHeaderCellOptions} from 'Controls/_grid/display/HeaderCell';

import GridStickyLadderCell, {IOptions as IGridStickyLadderCellOptions} from 'Controls/_grid/display/StickyLadderCell';

import GridEmptyRow, {IOptions as IGridEmptyRowOptions} from 'Controls/_grid/display/EmptyRow';
import GridEmptyCell, {IOptions as IGridEmptyCellOptions} from 'Controls/_grid/display/EmptyCell';

import GridTableHeader from 'Controls/_grid/display/TableHeader';
import GridTableHeaderRow from 'Controls/_grid/display/TableHeaderRow';

import GridDataRow, {IOptions as IGridDataRowOptions} from 'Controls/_grid/display/DataRow';
import GridDataCell, {IOptions as IGridDataCellOptions} from 'Controls/_grid/display/DataCell';

import GridResultsRow, {IOptions as IGridResultsRowOptions} from 'Controls/_grid/display/ResultsRow';
import GridResultsCell, {
    GRID_RESULTS_CELL_DEFAULT_TEMPLATE,
    IOptions as IGridResultsCellOptions
} from 'Controls/_grid/display/ResultsCell';

import GridFooterRow, {IOptions as IGridFooterRowOptions} from 'Controls/_grid/display/FooterRow';
import GridFooterCell, {IOptions as IGridFooterCellOptions} from 'Controls/_grid/display/FooterCell';
import GridGroupRow, {IOptions as IGridGroupRowOptions} from 'Controls/_grid/display/GroupRow';
import GridGroupCell, {IOptions as IGridGroupCellOptions} from 'Controls/_grid/display/GroupCell';

import {IDisplaySearchValueOptions, IDisplaySearchValue} from 'Controls/_grid/display/interface/IDisplaySearchValue';
import CheckboxCell from 'Controls/_grid/display/CheckboxCell';

import Indicator from 'Controls/_grid/display/Indicator';

register('Controls/grid:GridCollection', GridCollection, {instantiate: false});
register('Controls/grid:GridRow', GridRow, {instantiate: false});
register('Controls/grid:GridCell', GridCell, {instantiate: false});
register('Controls/grid:GridHeader', GridHeader, {instantiate: false});
register('Controls/grid:GridTableHeader', GridTableHeader, {instantiate: false});
register('Controls/grid:GridHeaderRow', GridHeaderRow, {instantiate: false});
register('Controls/grid:GridTableHeaderRow', GridTableHeaderRow, {instantiate: false});
register('Controls/grid:GridHeaderCell', GridHeaderCell, {instantiate: false});
register('Controls/grid:GridEmptyRow', GridEmptyRow, {instantiate: false});
register('Controls/grid:GridEmptyCell', GridEmptyCell, {instantiate: false});
register('Controls/grid:GridDataRow', GridDataRow, {instantiate: false});
register('Controls/grid:GridDataCell', GridDataCell, {instantiate: false});
register('Controls/grid:GridFooterCell', GridFooterCell, {instantiate: false});
register('Controls/grid:GridResultsCell', GridResultsCell, {instantiate: false});
register('Controls/display:GridGroupCell', GridGroupCell, {instantiate: false});
register('Controls/grid:GridGroupCell', GridGroupCell, {instantiate: false});
register('Controls/grid:GridGroupRow', GridGroupRow, {instantiate: false});
register('Controls/grid:Indicator', Indicator, {instantiate: false});

export {
    GridCollection, IGridCollectionOptions,
    GridRow, IGridRowOptions,
    GridItemActionsCell, GridCell, IGridCellOptions,
    GridHeader, IGridHeaderOptions,
    GridHeaderRow, IGridHeaderRowOptions,
    GridHeaderCell, IGridHeaderCellOptions,
    GridStickyLadderCell, IGridStickyLadderCellOptions,
    GridEmptyRow, IGridEmptyRowOptions,
    GridEmptyCell, IGridEmptyCellOptions,
    GridTableHeader,
    GridTableHeaderRow,
    GridDataRow, IGridDataRowOptions,
    GridDataCell, IGridDataCellOptions,
    GridResultsRow, IGridResultsRowOptions,
    GridResultsCell, GRID_RESULTS_CELL_DEFAULT_TEMPLATE, IGridResultsCellOptions,
    GridFooterRow, IGridFooterRowOptions,
    GridFooterCell, IGridFooterCellOptions,
    GridGroupRow, IGridGroupRowOptions,
    GridGroupCell, IGridGroupCellOptions,
    IDisplaySearchValueOptions, IDisplaySearchValue,
    CheckboxCell
};
