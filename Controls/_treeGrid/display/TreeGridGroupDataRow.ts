import TreeGridDataRow, {IOptions as ITreeGridDataRowOptions} from 'Controls/_treeGrid/display/TreeGridDataRow';
import {IColumn, GridCell, IItemTemplateParams, IInitializeColumnsOptions} from 'Controls/grid';
import {Model} from 'Types/entity';
import {IGroupNode} from 'Controls/display';
import {ITreeGridGroupDataCell} from './TreeGridGroupDataCell';

export interface IOptions<T extends Model> extends ITreeGridDataRowOptions<T> {
    isHiddenGroup: boolean;
}

/**
 * Строка с данными, которая отображается в виде группы
 */
export default class TreeGridGroupDataRow<T extends Model = Model> extends TreeGridDataRow<T> implements IGroupNode {
    '[Controls/treeGrid:TreeGridGroupDataRow]': boolean = true;
    readonly Markable: boolean = false;
    readonly Fadable: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly EnumerableItem: boolean = false;
    readonly EdgeRowSeparatorItem: boolean = true;
    readonly DraggableItem: boolean = false;
    readonly LadderSupport: boolean = false;
    readonly ItemActionsItem: boolean = true;
    readonly GroupNodeItem: boolean = true;

    protected _$isHiddenGroup: boolean;

    readonly listElementName: string = 'group';

    constructor(options: IOptions<T>) {
        super(options);
    }

    // region overrides

    getItemClasses(params: IItemTemplateParams): string {
        let classes = super.getItemClasses(params);
        classes += ` controls-ListView__group${this.isHiddenGroup() ? 'Hidden' : ''} controls-TreeGrid__groupNode`;
        return classes;
    }

    setExpanded(expanded: boolean, silent?: boolean): void {
        super.setExpanded(expanded, silent);
        this._reinitializeColumns();
    }

    shouldDisplayExpanderBlock(column: GridCell<T, TreeGridDataRow<T>>): boolean {
        return false;
    }

    isHiddenGroup(): boolean {
        return this._$isHiddenGroup;
    }

    setIsHiddenGroup(isHiddenGroup: boolean): void {
        if (this._$isHiddenGroup !== isHiddenGroup) {
            this._$isHiddenGroup = isHiddenGroup;
            this._nextVersion();
        }
    }

    isSticked(): boolean {
        return this.getOwner().isStickyGroup() && !this.isHiddenGroup();
    }

    // TODO Убрать после https://online.sbis.ru/opendoc.html?guid=b8c7818f-adc8-4e9e-8edc-ec1680f286bb
    isIosZIndexOptimized(): boolean {
        return false;
    }

    protected _getBaseItemClasses(): string {
        let itemClasses = 'controls-ListView__itemV';
        if (!this.isHiddenGroup()) {
            itemClasses += ` controls-Grid__row controls-Grid__row_${this.getStyle()}`;
        }
        return itemClasses;
    }

    protected _getColumnFactoryParams(column: IColumn, columnIndex: number): Partial<ITreeGridGroupDataCell> {
        return {
            ...super._getColumnFactoryParams(column, columnIndex),
            isExpanded: this.isExpanded()
        };
    }

    protected _initializeColumns(options?: IInitializeColumnsOptions): void {
        super._initializeColumns({
            shouldAddMultiSelectCell: true,
            prepareStickyLadderCellsStrategy: 'colspan',
            extensionCellsConstructors: {
                multiSelectCell: this.getColumnsFactory({column: {}})
            }
        });
    }

    getItemActionPositionClasses(itemActionsPosition: string,
                                 itemActionsClass: string,
                                 itemPadding: {top?: string, bottom?: string}): string {
        return itemActionsClass || 'controls-itemActionsV_position_bottomRight';
    }

    getLevel(): number {
        const level = super.getLevel();
        return level - 1;
    }

    isGroupNode(): boolean {
        return true;
    }

    // endregion overrides
}

Object.assign(TreeGridGroupDataRow.prototype, {
    _cellModule: 'Controls/treeGrid:TreeGridGroupDataCell',
    _moduleName: 'Controls/treeGrid:TreeGridGroupDataRow',
    _$searchValue: '',
    _$isHiddenGroup: false,
    _instancePrefix: 'tree-grid-group-row-'
});
