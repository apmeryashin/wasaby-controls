import { TemplateFunction } from 'UI/Base';
import {mixin} from 'Types/util';

import {
    ExpandableMixin,
    IExpandableMixinOptions,
    ICollectionItemOptions as IBaseCollectionItemOptions,
    GridLadderUtil
} from 'Controls/display';

import Row from './Row';
import Cell from './Cell';
import Collection from './Collection';
import {IColumn} from 'Controls/grid';
import {TColspanCallbackResult} from 'Controls/_gridNew/display/mixins/Grid';
import {IOptions as IGroupCellOptions} from 'Controls/_gridNew/display/GroupCell';

export interface IOptions<T> extends IBaseCollectionItemOptions<T>, IExpandableMixinOptions {
    owner: Collection<T>;
}

export default class GroupRow<T> extends mixin<
    Row<any>,
    ExpandableMixin
    >(
    Row,
    ExpandableMixin
) {
    readonly '[Controls/_display/IEditableCollectionItem]': boolean = false;
    readonly '[Controls/_display/GroupItem]': true;

    readonly Markable: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly '[Controls/_display/grid/GroupRow]': true;

    protected _$columnItems: Array<Cell<T>>;
    protected _groupTemplate: TemplateFunction|string;

    constructor(options?: IOptions<T>) {
        super({...options, columns: options.owner.getColumnsConfig()});
        ExpandableMixin.call(this);
    }

    get key(): T {
        return this._$contents;
    }

    isHiddenGroup(): boolean {
        return this._$contents === 'CONTROLS_HIDDEN_GROUP';
    }

    getGroupPaddingClasses(theme: string, side: 'left' | 'right'): string {
        if (side === 'left') {
            const spacing = this.getOwner().getLeftPadding().toLowerCase();
            const hasMultiSelect = this.hasMultiSelectColumn();
            return `controls-ListView__groupContent__leftPadding_${hasMultiSelect ? 'withCheckboxes' : spacing}_theme-${theme}`;
        } else {
            const spacing = this.getOwner().getRightPadding().toLowerCase();
            return `controls-ListView__groupContent__rightPadding_${spacing}_theme-${theme}`;
        }
    }

    getTemplate(
        itemTemplateProperty: string,
        userItemTemplate: TemplateFunction|string,
        userGroupTemplate?: TemplateFunction|string
    ): TemplateFunction|string {
        if (userGroupTemplate) {
            this._groupTemplate = userGroupTemplate;
        } else {
            this._groupTemplate = null;
        }
        return 'Controls/gridNew:ItemTemplate';
    }

    isSticked(): boolean {
        return this._$owner.isStickyHeader() && !this.isHiddenGroup();
    }

    getStickyColumn(): GridLadderUtil.IStickyColumn {
        return this._$owner.getStickyColumn();
    }

    getItemClasses(): string {
        return 'controls-ListView__itemV controls-Grid__row controls-ListView__group' +
                (this.isHiddenGroup() ? 'controls-ListView__groupHidden' : 'controls-Grid__row controls-ListView__group');
    }

    getStickyHeaderMode(): string {
        return 'replaceable';
    }

    getStickyHeaderPosition(): string {
        return 'top';
    }

    setExpanded(expanded: boolean, silent?: boolean): void {
        super.setExpanded(expanded, silent);
        this._nextVersion();
    }

    protected _getColspan(column: IColumn, columnIndex: number): TColspanCallbackResult {
        return 'end';
    }

    protected _initializeColumns(): void {
        if (this._$columns) {
            this._$columnItems = this._prepareColumnItems(this._$columns, this._getColumnsFactory());
            this._processStickyLadderCells();
        }
    }

    protected _getColumnFactoryParams(column: IColumn, columnIndex: number): Partial<IGroupCellOptions<T>> {
        return {
            ...super._getColumnFactoryParams(column, columnIndex),
            columnsLength: this._$columns.length,
            contents: this.getContents()
        };
    }
}

Object.assign(GroupRow.prototype, {
    '[Controls/_display/GroupItem]': true,
    '[Controls/_display/grid/GroupRow]': true,
    _moduleName: 'Controls/gridNew:GridGroupRow',
    _cellModule: 'Controls/gridNew:GridGroupCell',
    _instancePrefix: 'grid-group-item-',
    _$columns: null
});
