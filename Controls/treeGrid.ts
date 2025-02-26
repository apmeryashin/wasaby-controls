/**
 * @library Controls/treeGrid
 * @includes ITreeGrid Controls/_treeGrid/interface/ITreeGrid
 * @includes IColumn Controls/_treeGrid/interface/IColumn
 * @includes IGroupNodeColumn Controls/_treeGrid/interface/IGroupNodeColumn
 * @includes ItemTemplate Controls/_treeGrid/interface/ItemTemplate
 * @includes NodeFooterTemplate Controls/_treeGrid/interface/NodeFooterTemplate
 * @includes NodeHeaderTemplate Controls/_treeGrid/interface/NodeHeaderTemplate
 * @includes TGroupNodeVisibility Controls/_treeGrid/interface/ITreeGrid/TGroupNodeVisibility.typedef
 * @public
 * @author Крайнов Д.О.
 */

import {default as View} from 'Controls/_treeGrid/TreeGrid';
import {default as ItemsView} from 'Controls/_treeGrid/ItemsTreeGrid';
import TreeGridView from 'Controls/_treeGrid/TreeGridView';

import * as GroupColumnTemplate from 'wml!Controls/_treeGrid/render/GroupCellContent';
import * as GridItemTemplate from 'wml!Controls/_treeGrid/render/grid/Item';
import * as TableItemTemplate from 'wml!Controls/_treeGrid/render/table/Item';
import * as NodeFooterTemplate from 'wml!Controls/_treeGrid/render/NodeFooterTemplate';
import * as NodeHeaderTemplate from 'wml!Controls/_treeGrid/render/NodeHeaderTemplate';

// FIXME: при обычном условном присвоении шаблона tmpl = isAny ? tmpl1 : tmpl2, переменной один раз
//  присвоится значение и не будет меняться. В таком случае возникает ошибка при открытии одной
//  страницы из разных браузеров (Chrome и IE), с сервера всегда будет возвращаться один и тот же шаблон,
//  для того браузера, который первый открыл страницу. Данным хахом мы подменяем шаблонную функцию и
//  возвращаем правильную. Тоже самое, что вынести в отдельный шаблон и там условно вызвать паршл,
//  но быстрее по времени.
//  По словам Макса Крылова это ничего не сломает, если на функцию навесить флаги ядра.
//  Найти нормальное решение по https://online.sbis.ru/opendoc.html?guid=41a8dbab-93bb-4bc0-8533-6b12c0ec6d8d
const ItemTemplate = function() {
    return isFullGridSupport() ? GridItemTemplate.apply(this, arguments) : TableItemTemplate.apply(this, arguments);
};
ItemTemplate.stable = true;
ItemTemplate.isWasabyTemplate = true;

export {
    View,
    ItemsView,
    TreeGridView,
    TreeGridViewTable,
    ItemTemplate,
    NodeFooterTemplate,
    NodeHeaderTemplate,
    GroupColumnTemplate,
    TableItemTemplate
};

import {register} from 'Types/di';
import TreeGridCollection from 'Controls/_treeGrid/display/TreeGridCollection';
import TreeGridDataRow from 'Controls/_treeGrid/display/TreeGridDataRow';
import TreeGridDataCell from 'Controls/_treeGrid/display/TreeGridDataCell';
import TreeGridNodeHeaderRow from 'Controls/_treeGrid/display/TreeGridNodeHeaderRow';
import TreeGridNodeFooterRow from 'Controls/_treeGrid/display/TreeGridNodeFooterRow';
import TreeGridNodeExtraItemCell from 'Controls/_treeGrid/display/TreeGridNodeExtraItemCell';
import TreeGridNodeFooterCell from 'Controls/_treeGrid/display/TreeGridNodeFooterCell';
import TreeGridFooterRow from 'Controls/_treeGrid/display/TreeGridFooterRow';
import TreeGridFooterCell from 'Controls/_treeGrid/display/TreeGridFooterCell';
import {isFullGridSupport} from 'Controls/display';
import TreeGridGroupDataRow from 'Controls/_treeGrid/display/TreeGridGroupDataRow';
import TreeGridGroupDataCell from 'Controls/_treeGrid/display/TreeGridGroupDataCell';
import TreeGridViewTable from './_treeGrid/TreeGridViewTable';
import {IGroupNodeColumn} from 'Controls/_treeGrid/interface/IGroupNodeColumn';
import ITreeGrid, {TGroupNodeVisibility} from 'Controls/_treeGrid/interface/ITreeGrid';
import {IColumn} from 'Controls/_treeGrid/interface/IColumn';
import TreeGridHeaderRow from 'Controls/_treeGrid/display/TreeGridHeaderRow';
import TreeGridHeaderCell from 'Controls/_treeGrid/display/TreeGridHeaderCell';
import TreeGridTableHeaderRow from 'Controls/_treeGrid/display/TreeGridTableHeaderRow';
import TreeGridHeader from 'Controls/_treeGrid/display/TreeGridHeader';
import TreeGridTableHeader from 'Controls/_treeGrid/display/TreeGridTableHeader';

export {
    ITreeGrid,
    IColumn,
    TreeGridFooterCell,
    TreeGridCollection,
    TreeGridDataRow,
    TreeGridDataCell,
    TreeGridNodeFooterRow,
    TreeGridNodeHeaderRow,
    TreeGridNodeExtraItemCell,
    TreeGridGroupDataRow,
    TreeGridGroupDataCell,
    IGroupNodeColumn,
    TGroupNodeVisibility
};

register('Controls/treeGrid:TreeGridCollection', TreeGridCollection, {instantiate: false});
register('Controls/treeGrid:TreeGridDataRow', TreeGridDataRow, {instantiate: false});
register('Controls/treeGrid:TreeGridDataCell', TreeGridDataCell, {instantiate: false});
register('Controls/treeGrid:TreeGridNodeFooterRow', TreeGridNodeFooterRow, {instantiate: false});
register('Controls/treeGrid:TreeGridNodeHeaderRow', TreeGridNodeHeaderRow, {instantiate: false});
register('Controls/treeGrid:TreeGridNodeExtraItemCell', TreeGridNodeExtraItemCell, {instantiate: false});
register('Controls/treeGrid:TreeGridNodeFooterCell', TreeGridNodeFooterCell, {instantiate: false});
register('Controls/treeGrid:TreeGridFooterRow', TreeGridFooterRow, {instantiate: false});
register('Controls/treeGrid:TreeGridFooterCell', TreeGridFooterCell, {instantiate: false});
register('Controls/treeGrid:TreeGridHeaderRow', TreeGridHeaderRow, {instantiate: false});
register('Controls/treeGrid:TreeGridHeaderCell', TreeGridHeaderCell, {instantiate: false});
register('Controls/treeGrid:TreeGridTableHeaderRow', TreeGridTableHeaderRow, {instantiate: false});
register('Controls/treeGrid:TreeGridGroupDataRow', TreeGridGroupDataRow, {instantiate: false});
register('Controls/treeGrid:TreeGridGroupDataCell', TreeGridGroupDataCell, {instantiate: false});
register('Controls/treeGrid:TreeGridHeader', TreeGridHeader, {instantiate: false});
register('Controls/treeGrid:TreeGridTableHeader', TreeGridTableHeader, {instantiate: false});
