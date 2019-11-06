import {GridViewModel} from 'Controls/grid';
import * as GridLayoutUtil from 'Controls/_grid/utils/GridLayoutUtil';
import {
    getBottomPaddingRowIndex,
    getFooterIndex,
    getIndexByDisplayIndex, getIndexById, getIndexByItem,
    getResultsIndex, getTopOffset, IBaseTreeGridRowIndexOptions
} from 'Controls/_treeGrid/utils/TreeGridRowIndexUtil';
import TreeViewModel = require('Controls/_treeGrid/Tree/TreeViewModel');

function isLastColumn(
   itemData: object,
   colspan: boolean
): boolean {
   const columnWidth = itemData.multiSelectVisibility === 'hidden' ? 1 : 2;
   return itemData.getLastColumnIndex() >= itemData.columnIndex && (!colspan || itemData.columnIndex < columnWidth);
}

export type TreeGridColspanableElements = GridColspanableElements | 'node' | 'nodeFooter';

var _private = {
    // For browsers with partial grid support need to set explicit rows' style with grid-row and grid-column
    prepareGroupGridStyles: function (self, current) {
        current.rowIndex = self._getRowIndexHelper().getIndexByDisplayIndex(current.index);
        current.gridGroupStyles = GridLayoutUtil.toCssString([
            {
                name: 'grid-row',
                value: current.rowIndex+1
            },
            {
                name: '-ms-grid-row',
                value: current.rowIndex+1
            }
        ]);
    },

    getExpandedItems<T = unknown>(display, expandedItems: Array<T>, nodeProperty: string): Array<T> {
        if (expandedItems.length === 1 && expandedItems[0] === null) {
            const nodes = display.getItems().filter((item) => {
                return item.getContents().get && item.getContents().get(nodeProperty) !== null
            });
            return nodes.map(node => node.getContents().getId());
        } else {
            return <Array<T>>expandedItems;
        }
    }

};

var
    TreeGridViewModel = GridViewModel.extend({
        _onNodeRemovedFn: null,
        constructor: function () {
            TreeGridViewModel.superclass.constructor.apply(this, arguments);
            this._onNodeRemovedFn = this._onNodeRemoved.bind(this);
            this._model.subscribe('onNodeRemoved', this._onNodeRemovedFn);
            this._model.subscribe('expandedItemsChanged', this._onExpandedItemsChanged.bind(this));
            this._model.subscribe('collapsedItemsChanged', this._onCollapsedItemsChanged.bind(this));
        },
        _onCollapsedItemsChanged: function(e, collapsedItems) {
            this._notify('collapsedItemsChanged', collapsedItems);
        },
        _onExpandedItemsChanged: function(e, expandedItems) {
            this._notify('expandedItemsChanged', expandedItems);
        },
        _createModel: function (cfg) {
            return new TreeViewModel(cfg);
        },
        toggleExpanded: function (dispItem, expand) {
            this._model.toggleExpanded(dispItem, expand);
        },
        isExpanded: function (dispItem) {
            return this._model.isExpanded(dispItem);
        },
        isExpandAll: function () {
            return this._model.isExpandAll();
        },
        setExpandedItems: function (expandedItems: Array<unknown>) {
            this._model.setExpandedItems(expandedItems);
        },
        setCollapsedItems: function (collapsedItems: Array<unknown>) {
            this._model.setCollapsedItems(collapsedItems);
        },
        getExpandedItems: function () {
            return this._model.getExpandedItems();
        },
        getRoot: function() {
            return this._model.getRoot();
        },
        setRoot: function (root) {
            this._model.setRoot(root);
        },
        setParentProperty(parentProperty: string): void {
            this._model.setParentProperty.apply(this, arguments);
            this._options.parentProperty = parentProperty;
        },
        setHasChildrenProperty(hasChildrenProperty: string): void {
            this._model.setHasChildrenProperty.apply(this, arguments);
            this._options.hasChildrenProperty = hasChildrenProperty;
        },
        setNodeProperty(nodeProperty: string): void {
            this._model.setNodeProperty.apply(this, arguments);
            this._options.nodeProperty = nodeProperty;
        },
        setNodeFooterTemplate: function (nodeFooterTemplate) {
            this._model.setNodeFooterTemplate(nodeFooterTemplate);
        },
        setExpanderDisplayMode: function (expanderDisplayMode) {
            // Выпилить в 19.200
            this._model.setExpanderDisplayMode(expanderDisplayMode);
        },
        setExpanderVisibility: function (expanderVisibility) {
            this._model.setExpanderVisibility(expanderVisibility);
        },
        resetExpandedItems: function () {
            this._model.resetExpandedItems();
        },
        isDrawResults: function() {
            if (this._options.resultsVisibility === 'visible') {
                return true;
            }
            var items = this.getDisplay();
            if (items) {
                var rootItems = this._model.getHierarchyRelation().getChildren(items.getRoot().getContents(), this.getItems());
                return this.getHasMoreData() || rootItems && rootItems.length > 1;
            }
        },
        getItemDataByItem: function(dispItem) {
            const current = TreeGridViewModel.superclass.getItemDataByItem.apply(this, arguments);
            const superGetCurrentColumn = current.getCurrentColumn;
            const self = this;
            const theme = this._options.theme;

            if (current._treeGridViewModelCached) {
                return current;
            } else {
                current._treeGridViewModelCached = true;
            }

            current.isLastColumn = isLastColumn;

            // For browsers with partial grid support need to calc real rows' index and set explicit rows' style
            // with grid-row and grid-column
            if (self._isPartialGridSupport && !self._shouldUseTableLayout) {
                if (current.isGroup) {
                    _private.prepareGroupGridStyles(this, current);
                }
            }

            current.getCurrentColumn = function () {
                let
                    currentColumn = superGetCurrentColumn();
                currentColumn.nodeType = current.item.get && current.item.get(current.nodeProperty);

                currentColumn.isExpanded = current.isExpanded;
                currentColumn.cellClasses += ' controls-TreeGrid__row-cell' + `_theme-${theme}`;

                if (currentColumn.nodeType) {
                    currentColumn.cellClasses += ' controls-TreeGrid__row-cell__node' + `_theme-${theme}`;
                } else if (currentColumn.nodeType === false) {
                    currentColumn.cellClasses += ' controls-TreeGrid__row-cell__hiddenNode' + `_theme-${theme}`;
                } else {
                    currentColumn.cellClasses += ' controls-TreeGrid__row-cell__item' + `_theme-${theme}`;
                }

                if (self._isPartialGridSupport && !self._shouldUseTableLayout) {
                    currentColumn.gridCellStyles = GridLayoutUtil.getCellStyles({
                        columnStart: currentColumn.columnIndex,
                        rowStart: current.rowIndex
                    });
                }

                return currentColumn;
            };

            current.getLevelIndentClasses = function (expanderSize, levelIndentSize) {
                let
                    sizeEnum = ['null', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl'],
                    resultPaddingSize;

                if (expanderSize && levelIndentSize) {
                    if (sizeEnum.indexOf(expanderSize) >= sizeEnum.indexOf(levelIndentSize)) {
                        resultPaddingSize = expanderSize;
                    } else {
                        resultPaddingSize = levelIndentSize;
                    }
                } else if (!expanderSize && !levelIndentSize) {
                    resultPaddingSize = 'default';
                } else {
                    resultPaddingSize = expanderSize || levelIndentSize;
                }

                return `controls-TreeGrid__row-levelPadding_size_${resultPaddingSize}_theme-${theme}`;
            };

            const setNodeFooterRowStyles = (footer, index) => {
                footer.columns = current.columns;
                footer.isPartialGridSupport = self._isPartialGridSupport;
                footer.shouldUseTableLayout = self._shouldUseTableLayout;
                footer.colspan = self.getColspanFor('nodeFooter');
                footer.getLevelIndentClasses = current.getLevelIndentClasses;
                const colspanCfg = {
                    columnStart: self._options.multiSelectVisibility !== 'hidden' ? 1 : 0,
                    columnSpan: self._columns.length,
                };
                if ((self._isPartialGridSupport && !self._shouldUseTableLayout) || current.columnScroll) {
                    footer.rowIndex = current.rowIndex + index + 1;

                    // TODO: Удалить rowStart после полного перехода на table-layout. Заменить вызов getCellStyles на getColumnStyles.
                    // По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
                    footer.colspanStyles = GridLayoutUtil.getCellStyles({...colspanCfg, rowStart: footer.rowIndex});
                } else if (self._isFullGridSupport) {
                    footer.colspanStyles = GridLayoutUtil.getColumnStyles(colspanCfg);
                }
            };

            if (this._options.task1177672941) {
                if (current.nodeFooter && current.nodeFooter.length > 0) {
                    current.nodeFooter.forEach(setNodeFooterRowStyles);
                }
            } else {
                // For browsers with partial grid support need to calc real rows' index and set explicit rows' style with grid-row and grid-column
                if (current.nodeFooter) {
                    setNodeFooterRowStyles(current.nodeFooter, 0);
                }
            }
            return current;
        },
        _onNodeRemoved: function (event, nodeId) {
            this._notify('onNodeRemoved', nodeId);
        },

        setHasMoreStorage: function (hasMoreStorage) {
            this._model.setHasMoreStorage(hasMoreStorage);
        },
        destroy: function () {
            this._model.unsubscribe('onNodeRemoved', this._onNodeRemovedFn);
            TreeGridViewModel.superclass.destroy.apply(this, arguments);
        },

        getColspanFor(gridElementName: TreeGridColspanableElements): number {
            if (gridElementName === 'node' || gridElementName === 'nodeFooter') {
                return this._columns.length;
            } else {
                return TreeGridViewModel.superclass.getColspanFor.apply(this, arguments);
            }
        },

        _getRowIndexHelper() {

            let
                self = this,
                cfg: IBaseTreeGridRowIndexOptions = {
                    display: this.getDisplay(),
                    hasHeader: !!this.getHeader(),
                    hasBottomPadding: this._options._needBottomPadding,
                    resultsPosition: this.getResultsPosition(),
                    multiHeaderOffset: this.getMultiHeaderOffset(),
                    hierarchyRelation: self._model.getHierarchyRelation(),
                    hasMoreStorage: self._model.getHasMoreStorage() || {},
                    expandedItems: _private.getExpandedItems(self.getDisplay(), self._model.getExpandedItems() || [], self._options.nodeProperty),
                    hasNodeFooterTemplate: !!self._model.getNodeFooterTemplate(),
                    hasColumnScroll: this._options.columnScroll,
                },
                hasEmptyTemplate = !!this._options.emptyTemplate;

            if (this.getEditingItemData()) {
                cfg.editingRowIndex = this.getEditingItemData().index;
            }

            return {
                getIndexByItem: (item) => getIndexByItem({item, ...cfg}),
                getIndexById: (id) => getIndexById({id, ...cfg}),
                getIndexByDisplayIndex: (index) => getIndexByDisplayIndex({index, ...cfg}),
                getResultsIndex: () => getResultsIndex({hasEmptyTemplate, ...cfg}),
                getBottomPaddingRowIndex: () => getBottomPaddingRowIndex(cfg),
                getFooterIndex: () => getFooterIndex({hasEmptyTemplate, ...cfg}),
                getTopOffset: () => getTopOffset(cfg.hasHeader, cfg.resultsPosition, cfg.multiHeaderOffset, cfg.hasColumnScroll),
            };
        }
    });

TreeGridViewModel._private = _private;

export = TreeGridViewModel;
