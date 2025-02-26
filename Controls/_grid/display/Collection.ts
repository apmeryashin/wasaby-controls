import {mixin} from 'Types/util';

import {
    Collection as BaseCollection,
    ItemsFactory,
    IItemActionsTemplateConfig,
    GridLadderUtil, IHasMoreData,
    IEditingConfig
} from 'Controls/display';

import GroupRow from './GroupRow';
import GridMixin, {IOptions as IGridMixinOptions} from './mixins/Grid';
import Row, {IOptions as IRowOptions} from './Row';
import {TemplateFunction} from 'UI/Base';
import {Model} from 'Types/entity';
import {IObservable} from 'Types/collection';
import {IDirection} from 'Controls/_baseList/Controllers/ScrollController/ScrollController';

export type IOptions<S extends Model = Model, T extends Row<S> = Row<S>> = IGridMixinOptions;

/**
 * @public
 * @implements Controls/grid:GridMixin
 * @author Авраменко А.С.
 */
export default class Collection<S extends Model = Model, T extends Row<S> = Row<S>> extends mixin<
    BaseCollection<S>, GridMixin<S, T>
>(BaseCollection, GridMixin) {
    protected _$hasStickyGroup: boolean = false;

    constructor(options: IOptions<S, T>) {
        super(options);
        GridMixin.call(this, options);
    }

    // region override

    setEmptyTemplate(emptyTemplate: TemplateFunction): boolean {
        const superResult = super.setEmptyTemplate(emptyTemplate);
        if (superResult) {
            if (this._$emptyTemplate) {
                if (this._$emptyGridRow) {
                    this._$emptyGridRow.setRowTemplate(this._$emptyTemplate);
                } else {
                    this._initializeEmptyRow();
                }
            } else {
                this._$emptyGridRow = undefined;
            }
        }
        return superResult;
    }

    setEmptyTemplateOptions(options: object): boolean {
        if (super.setEmptyTemplateOptions(options)) {
            if (this.getEmptyGridRow()) {
                this.getEmptyGridRow().setRowTemplateOptions(options);
            }
            return true;
        }
        return false;
    }

    setMultiSelectVisibility(visibility: string): void {
        super.setMultiSelectVisibility(visibility);

        [
            this.getColgroup(), this.getHeader(), this.getResults(), this.getFooter(), this.getEmptyGridRow()
        ].forEach((gridUnit) => {
            gridUnit?.setMultiSelectVisibility(visibility);
        });
    }

    setActionsTemplateConfig(config: IItemActionsTemplateConfig) {
        super.setActionsTemplateConfig(config);
        if (this.getFooter()) {
            this.getFooter().setActionsTemplateConfig(config);
        }
    }

    setHasMoreData(hasMoreData: IHasMoreData): void {
        super.setHasMoreData(hasMoreData);
        if (this.getFooter()) {
            this.getFooter().setHasMoreData(hasMoreData);
        }
    }

    protected _reBuild(reset?: boolean): void {
        if (GridLadderUtil.isSupportLadder(this._$ladderProperties) && !!this._$ladder) {
            this._prepareLadder(this._$ladderProperties, this._$columns);
        }
        super._reBuild(reset);
        this.getColgroup()?.reBuild();
    }

    setIndexes(start: number, stop: number, shiftDirection: IDirection): void {
        super.setIndexes(start, stop, shiftDirection);
        if (GridLadderUtil.isSupportLadder(this._$ladderProperties)) {
            this._prepareLadder(this._$ladderProperties, this._$columns);
            this._updateItemsLadder();
        }
        this._updateItemsProperty('setColumnsConfig', this._$columns);
    }

    protected _handleAfterCollectionChange(changedItems: T[] = [], changeAction?: string): void {
        super._handleAfterCollectionChange(changedItems, changeAction);
        if (GridLadderUtil.isSupportLadder(this._$ladderProperties)) {
            this._prepareLadder(this._$ladderProperties, this._$columns);
            this._updateItemsLadder();
        }

        // Сбрасываем модель заголовка если его видимость зависит от наличия данных и текущее действие
        // это смена записей.
        const headerIsVisible = this._headerIsVisible(this._$header, this._$headerVisibility);
        if (changeAction === IObservable.ACTION_RESET && !headerIsVisible) {
            this._$headerModel = null;
        }

        this._updateHasStickyGroup();
        this._$results = null;
    }

    protected _removeItems(start: number, count?: number): T[] {
        const result = super._removeItems(start, count);

        if (this._$headerModel && !this._headerIsVisible(this._$header, this._$headerVisibility)) {
            this._$headerModel = null;
        }

        return result;
    }

    protected _getItemsFactory(): ItemsFactory<T> {
        const superFactory = super._getItemsFactory();
        return function CollectionItemsFactory(options?: IRowOptions<S>): T {
            options.columnsConfig = this.getColumnsEnumerator().getColumns();
            options.gridColumnsConfig = this._$columns;
            options.colspanCallback = this._$colspanCallback;
            options.columnSeparatorSize = this._$columnSeparatorSize;
            options.rowSeparatorSize = this._$rowSeparatorSize;
            options.colspanGroup = this._$colspanGroup;
            options.hasStickyGroup = this._$hasStickyGroup;
            options.itemActionsPosition = this._$itemActionsPosition;
            return superFactory.call(this, options);
        };
    }

    protected _getGroupItemConstructor(): new() => GroupRow<T> {
        return GroupRow;
    }

    getAdditionalGroupConstructorParams() {
        return {
            ...super.getAdditionalGroupConstructorParams(),
            colspanGroup: this._$colspanGroup,
            gridColumnsConfig: this._$columns,
            columnsConfig: this._$columns
        };
    }

    setGroupProperty(groupProperty: string): boolean {
        const groupPropertyChanged = super.setGroupProperty(groupProperty);
        if (groupPropertyChanged) {
            this._updateHasStickyGroup();
        }
        return groupPropertyChanged;
    }

    protected setMetaResults(metaResults: Model) {
        super.setMetaResults(metaResults);
        this._$results?.setMetaResults(metaResults);
    }

    setEditing(editing: boolean): void {
        super.setEditing(editing);

        if (this._$headerModel && !this._headerIsVisible(this._$header, this._$headerVisibility)) {
            this._$headerModel = null;
        }
        this._nextVersion();
    }

    setEditingConfig(config: IEditingConfig): void {
        super.setEditingConfig(config);
        this._updateItemsProperty('setEditingConfig', config, 'setEditingConfig');
    }

    // endregion

    protected _updateHasStickyGroup(): void {
        const hasStickyGroup = this._hasStickyGroup();
        if (this._$hasStickyGroup !== hasStickyGroup) {
            this._$hasStickyGroup = hasStickyGroup;
            this._updateItemsProperty(
                'setHasStickyGroup', this._$hasStickyGroup, 'LadderSupport'
            );
        }
    }

    protected _hasStickyGroup(): boolean {
        return !!(this.at(0)
            && this.at(0)['[Controls/_display/GroupItem]']
            && !(this.at(0) as unknown as GroupRow<S>).isHiddenGroup()
            && this._$stickyHeader);
    }
}

Object.assign(Collection.prototype, {
    '[Controls/_display/grid/Collection]': true,
    _moduleName: 'Controls/grid:GridCollection',
    _itemModule: 'Controls/grid:GridDataRow'
});

/**
 * @typedef {Object} IEmptyTemplateColumn
 * @description
 * Объект конфигурации колонки представления {@link /doc/platform/developmentapl/interface-development/controls/list/grid/empty-grid/ пустой таблицы}.
 * @param {TemplateFunction} template Элемент, для которого рассчитывается объединение
 * @param {Number} startColumn Начальный индекс колонки.
 * @param {Number} endColumn Конечный индекс колонки.
 */

/**
 * @typedef {Function} TResultsColspanCallback
 * @description
 * Функция обратного вызова для расчёта объединения колонок строки (колспана).
 * @param {Controls/grid:IColumn} column Колонка грида
 * @param {Number} columnIndex Индекс колонки грида
 * @returns {Number|String} Количество объединяемых колонок, учитывая текущую. Для объединения всех колонок, начиная с текущей, из функции нужно вернуть специальное значение 'end'.
 */

/**
 * @typedef {Function} TColspanCallback
 * @description
 * Функция обратного вызова для расчёта объединения колонок строки (колспана).
 * @param {Types/entity:Model} item Элемент, для которого рассчитывается объединение
 * @param {Controls/grid:IColumn} column Колонка грида
 * @param {Number} columnIndex Индекс колонки грида
 * @param {Boolean} isEditing Актуальное состояние редактирования элемента
 * @returns {Number|String} Количество объединяемых колонок, учитывая текущую. Для объединения всех колонок, начиная с текущей, из функции нужно вернуть специальное значение 'end'.
 */

/**
 * @description
 * Тип результата, возвращаемого из функции colspanCallback (функции обратного вызова для расчёта объединения колонок строки).
 */

/**
 * @typedef {Function} TEditArrowVisibilityCallback
 * @description
 * Функция обратного вызова для определения видимости кнопки редактирования
 * @param item Model
 */
