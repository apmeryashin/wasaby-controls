import {mixin} from 'Types/util';
import {ITreeItemOptions, TreeItem, IGroupNode} from 'Controls/display';
import {
    IGridRowOptions,
    GridCell,
    GridRowMixin,
    IDisplaySearchValue,
    IDisplaySearchValueOptions,
    TColumns,
    GridDataRow
} from 'Controls/grid';
import TreeGridCollection from './TreeGridCollection';
import {IColumn, IInitializeColumnsOptions} from 'Controls/grid';
import {Model} from 'Types/entity';
import TreeCheckboxCell from './TreeCheckboxCell';
import {ITreeGridDataCellOptions} from './TreeGridDataCell';
import { factory } from 'Types/chain';

export interface IOptions<T extends Model> extends IGridRowOptions<T>, ITreeItemOptions<T>, IDisplaySearchValueOptions {
    owner: TreeGridCollection<T>;
}

/**
 * Строка иерархической коллекции, в которой отображаются данные из RecordSet-а
 */
export default class TreeGridDataRow<T extends Model = Model>
    extends mixin<TreeItem<T>, GridRowMixin<T>>(TreeItem, GridRowMixin) implements IDisplaySearchValue, IGroupNode {
    readonly '[Controls/_display/grid/Row]': boolean;
    readonly '[Controls/treeGrid:TreeGridDataRow]': boolean;

    readonly EditableItem: boolean = true;
    readonly DisplayItemActions: boolean = true;
    readonly DisplaySearchValue: boolean = true;
    readonly Markable: boolean = true;
    readonly Fadable: boolean = true;
    readonly SelectableItem: boolean = true;
    readonly EnumerableItem: boolean = true;
    readonly EdgeRowSeparatorItem: boolean = true;
    readonly LadderSupport: boolean = true;
    readonly DraggableItem: boolean = true;
    protected _$searchValue: string;
    protected _$hasStickyGroup: boolean;

    readonly listInstanceName: string =  'controls-TreeGrid';

    readonly listElementName: string = 'row';

    constructor(options: IOptions<T>) {
        super(options);
        GridRowMixin.call(this, options);
    }

    setGridColumnsConfig(columns: TColumns): void {
        this.setColumnsConfig(columns);
    }

    // region Expander

    shouldDisplayExpanderBlock(column: GridCell<T, TreeGridDataRow<T>>): boolean {
        const displayExpanderBlock = super.shouldDisplayExpanderBlock();
        const columnIndex = column.getColumnIndex(false, false);
        const hasMultiSelect = this.hasMultiSelectColumn();
        const isFirstDataColumn = columnIndex === 0 && !hasMultiSelect || columnIndex === 1 && hasMultiSelect;
        return displayExpanderBlock && isFirstDataColumn;
    }

    // endregion Expander

    // TODO duplicate code with GridRow. Нужно придумать как от него избавиться.
    //  Проблема в том, что mixin не умеет объединять одинаковые методы, а логику Grid мы добавляем через mixin
    // region overrides

    protected _getBaseItemClasses(style: string): string {
        return super._getBaseItemClasses(style) + ' js-controls-Grid__data-row';
    }

    _hasCheckBoxCell(): boolean {
        return this.getMultiSelectVisibility() !== 'hidden' && this.getMultiSelectPosition() !== 'custom';
    }

    setMultiSelectVisibility(multiSelectVisibility: string): boolean {
        const hadCheckBoxCell = this._hasCheckBoxCell();
        const isChangedMultiSelectVisibility = super.setMultiSelectVisibility(multiSelectVisibility);
        if (isChangedMultiSelectVisibility) {
            this._reinitializeColumns();
        }
        if (this.isEditing() && this.getEditingConfig()?.mode === 'cell') {
            if (isChangedMultiSelectVisibility) {
                const hasCheckBoxCell = this._hasCheckBoxCell();
                if (hadCheckBoxCell !== hasCheckBoxCell) {
                    this._$editingColumnIndex += hasCheckBoxCell ? 1 : -1;
                }
            }
        }
        return isChangedMultiSelectVisibility;
    }

    setEditing(editing: boolean, editingContents?: T, silent?: boolean, columnIndex?: number): void {
        super.setEditing(editing, editingContents, silent, columnIndex);
        this.setRowTemplate(editing ? this._$owner.getItemEditorTemplate() : undefined);
        this.setRowTemplateOptions(editing ? this._$owner.getItemEditorTemplateOptions() : undefined);
        const colspanCallback = this._$owner.getColspanCallback();
        if (colspanCallback || this.getEditingConfig()?.mode === 'cell') {
            this._reinitializeColumns(true);
        }
    }

    setRowSeparatorSize(rowSeparatorSize: string): boolean {
        const changed = super.setRowSeparatorSize(rowSeparatorSize);
        if (changed && this._$columnItems) {
            this._updateSeparatorSizeInColumns('Row');
        }
        return changed;
    }

    setMarked(marked: boolean, silent?: boolean): void {
        const changed = marked !== this.isMarked();
        super.setMarked(marked, silent);
        if (changed) {
            this._redrawColumns('first');
        }
    }

    setDragTargetNode(isTarget: boolean): void {
        const changed = isTarget !== this.isDragTargetNode();
        super.setDragTargetNode(isTarget);
        if (changed) {
            this.getColumns().forEach((it) => {
                if (it['[Controls/treeGrid:TreeGridDataCell]']) {
                    it.setDragTargetNode(isTarget);
                }
            });
        }
    }

    protected _getColumnFactoryParams(column: IColumn, columnIndex: number): Partial<ITreeGridDataCellOptions<T>> {
        return {
            ...super._getColumnFactoryParams(column, columnIndex),
            searchValue: this._$searchValue,
            isDragTargetNode: this.isDragTargetNode()
        };
    }

    setSearchValue(searchValue: string): void {
        this._$searchValue = searchValue;
        if (this._$columnItems) {
            this._$columnItems.forEach((cell, cellIndex) => {
                if (cell.DisplaySearchValue) {
                    (cell as unknown as GridDataRow).setSearchValue(searchValue);
                }
            });
        }
        this._nextVersion();
    }

    getSearchValue(): string {
        return this._$searchValue;
    }

    setSelected(selected: boolean | null, silent?: boolean): void {
        const changed = this._$selected !== selected;
        super.setSelected(selected, silent);
        if (changed) {
            this._redrawColumns('first');
        }
    }

    setActive(active: boolean, silent?: boolean): void {
        const changed = active !== this.isActive();
        super.setActive(active, silent);
        if (changed) {
            this._redrawColumns('all');
        }
    }

    setHasStickyGroup(hasStickyGroup: boolean): void {
        if (this._$hasStickyGroup !== hasStickyGroup) {
            this._$hasStickyGroup = hasStickyGroup;
            this._nextVersion();
        }
    }

    hasStickyGroup(): boolean {
        return this._$hasStickyGroup;
    }

    // Убираем ExpanderPadding для подуровней TreeGridGroupRow
    shouldDisplayExpanderPadding(tmplExpanderIcon?: string, tmplExpanderSize?: string): boolean {
        const should = super.shouldDisplayExpanderPadding(tmplExpanderIcon, tmplExpanderSize);

        const parentIsGroup = this.getParent().GroupNodeItem;
        if (parentIsGroup) {
            const childNodes = factory(this.getParent().getChildren()).toArray().filter((it) => (it.isNode() !== null));
            const hasChildNode = !!childNodes.length;
            const hasChildNodeWithChilds = childNodes.some((it) => {
                return it.getHasChildrenProperty() ? it.hasChildren() : it.hasChildrenByRecordSet();
            });
            const allowByChilds = this.getOwner().getExpanderVisibility() === 'hasChildren'
                ? hasChildNodeWithChilds
                : hasChildNode;
            return should && allowByChilds;
        } else {
            return should;
        }
    }

    // endregion overrides

    isGroupNode(): boolean {
        return false;
    }

    protected _initializeColumns(options?: IInitializeColumnsOptions): void {
        super._initializeColumns({
            colspanStrategy: 'skipColumns',
            extensionCellsConstructors: {
                multiSelectCell: TreeCheckboxCell
            },
            ...options
        });
    }
}

Object.assign(TreeGridDataRow.prototype, {
    '[Controls/treeGrid:TreeGridDataRow]': true,
    '[Controls/_display/grid/Row]': true,
    '[Controls/_display/TreeItem]': true,
    _cellModule: 'Controls/treeGrid:TreeGridDataCell',
    _moduleName: 'Controls/treeGrid:TreeGridDataRow',
    _$searchValue: '',
    _instancePrefix: 'tree-grid-row-',
    _$hasStickyGroup: false
});
