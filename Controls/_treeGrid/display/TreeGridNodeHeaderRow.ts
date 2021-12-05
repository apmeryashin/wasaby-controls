import {TemplateFunction} from 'UI/Base';
import {TreeItem} from 'Controls/display';
import {Model} from 'Types/entity';
import TreeGridDataRow from './TreeGridDataRow';
import {IColumn, TColspanCallbackResult, TColumns} from 'Controls/grid';

/**
 * Хедер узла в иерархической таблице
 */
export default class TreeGridNodeHeaderRow extends TreeGridDataRow<null> {
    readonly '[Controls/treeGrid:TreeGridNodeHeaderRow]': boolean;
    readonly Markable: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly EnumerableItem: boolean = false;
    readonly EdgeRowSeparatorItem: boolean = false;
    readonly ItemActionsItem: boolean = false;

    protected _$moreFontColorStyle: string;

    readonly listInstanceName: string =  'controls-TreeGrid__node-header';

    readonly listElementName: string = 'row';

    getTemplate(): TemplateFunction | string {
        return 'Controls/treeGrid:ItemTemplate';
    }

    needMoreButton(): boolean {
        return this.hasMoreStorage('backward');
    }

    get node(): TreeItem<Model> {
        return this.getNode();
    }

    getNode(): TreeItem<Model> {
        return this.getParent();
    }

    setGridColumnsConfig(columns: TColumns): void {
        this._$gridColumnsConfig = columns;
        this._reinitializeColumns(true);
    }

    getItemClasses(): string {
        return 'controls-ListView__itemV controls-Grid__row controls-TreeGrid__nodeHeader';
    }

    getExpanderPaddingClasses(tmplExpanderSize?: string): string {
        let classes = super.getExpanderPaddingClasses(tmplExpanderSize);

        classes = classes.replace(
           'controls-TreeGrid__row-expanderPadding',
           'controls-TreeGrid__node-header-expanderPadding'
        );

        return classes;
    }

    isSticked(): boolean {
        return false;
    }

    getMoreFontColorStyle(): string {
        return this._$moreFontColorStyle;
    }

    setMoreFontColorStyle(moreFontColorStyle: string): void {
        if (this._$moreFontColorStyle !== moreFontColorStyle) {
            this._$moreFontColorStyle = moreFontColorStyle;
            this._nextVersion();
        }
    }

    protected _initializeColumns(): void {
        if (this.hasMoreStorage('backward')) {
            this.setRowTemplate('Controls/treeGrid:NodeHeaderTemplate');
        }

        super._initializeColumns({
            colspanStrategy: 'consistently',
            prepareStickyLadderCellsStrategy: !this._$rowTemplate ? 'add' :
                (this.getStickyLadderCellsCount() ? 'offset' : 'colspan'),
            shouldAddMultiSelectCell: true,
            extensionCellsConstructors: {
                multiSelectCell: this.getColumnsFactory({column: {}})
            }
        });
    }

    protected _getColspan(column: IColumn, columnIndex: number): TColspanCallbackResult {
        return column.endColumn - column.startColumn;
    }
}

Object.assign(TreeGridNodeHeaderRow.prototype, {
    '[Controls/treeGrid:TreeGridNodeHeaderRow]': true,
    '[Controls/tree:TreeNodeHeaderItem]': true,
    _moduleName: 'Controls/treeGrid:TreeGridNodeHeaderRow',
    _cellModule: 'Controls/treeGrid:TreeGridNodeFooterCell',
    _instancePrefix: 'tree-grid-node-header-row-',
    _$supportLadder: false,
    _$moreFontColorStyle: null
});
