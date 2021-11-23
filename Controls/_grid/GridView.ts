import {ListView} from 'Controls/baseList';
import {TemplateFunction} from 'UI/Base';
import {Logger} from 'UI/Utils';
import {GridLadderUtil, GridLayoutUtil} from 'Controls/display';
import * as GridTemplate from 'wml!Controls/_grid/Render/grid/GridView';
import * as GridItem from 'wml!Controls/_grid/Render/grid/Item';
import * as GroupTemplate from 'wml!Controls/_grid/Render/GroupCellContentWithRightTemplate';
import {SyntheticEvent} from 'Vdom/Vdom';
import {validateGridParts} from './utils/ConfigValidation';

import {ColumnScrollViewMixin} from './ViewMixins/ColumnScrollViewMixin';

import {_Options} from 'UI/Vdom';
import {getDimensions} from 'Controls/sizeUtils';
import {Guid} from 'Types/entity';
import 'css!Controls/grid';
import 'css!Controls/CommonClasses';
import Collection from './display/Collection';
import Row from './display/Row';
import {IOptions as IGridOptions} from './display/mixins/Grid';

/**
 * Представление таблицы
 */
const GridView = ListView.extend([ColumnScrollViewMixin], {
    _template: GridTemplate,
    _hoveredCellIndex: null,
    _hoveredCellItem: null,
    _groupTemplate: GroupTemplate,
    _ladderTopOffsetStyles: '',
    _ladderOffsetSelector: '',

    _beforeMount(options: IGridOptions): void {
        const result = GridView.superclass._beforeMount.apply(this, arguments);
        this._columnScrollOnViewBeforeMount(options);
        this._ladderOffsetSelector = `controls-GridView__ladderOffset-${this._createGuid()}`;
        validateGridParts(options);
        return result;
    },

    _componentDidMount(): void {
        GridView.superclass._componentDidMount.apply(this, arguments);
        this._columnScrollOnViewDidMount();
        this._ladderTopOffsetStyles = this._getLadderTopOffsetStyles();
        this._listModel.setColspanGroup(!this._options.columnScroll || !this.isColumnScrollVisible());
    },

    _applyChangedOptionsToModel(listModel: Collection, options: IGridOptions, changes: string[]): void {
        let needOptionsValidation = false;

        if (changes.includes('columns')) {
            // Если колонки изменились, например, их кол-во, а данные остались те же, то
            // то без перерисовки мы не можем корректно отобразить данные в новых колонках.
            // правка конфликтует с https://online.sbis.ru/opendoc.html?guid=a8429971-3a3c-44d0-8cca-098887c9c717
            listModel.setColumns(options.columns);
            needOptionsValidation = true;
        }

        if (changes.includes('footer')) {
            listModel.setFooter(options);
            needOptionsValidation = true;
        }

        if (changes.includes('header')) {
            listModel.setHeader(options.header);
            needOptionsValidation = true;
        }

        if (changes.includes('headerVisibility')) {
            listModel.setHeaderVisibility(options.headerVisibility);
        }

        if (changes.includes('columnScroll')) {
            listModel.setColumnScroll(options.columnScroll);
        }

        if (changes.includes('resultsPosition')) {
            listModel.setResultsPosition(options.resultsPosition);
        }

        if (changes.includes('resultsVisibility')) {
            listModel.setResultsVisibility(options.resultsVisibility);
        }

        if (changes.includes('ladderProperties')) {
            listModel.setLadderProperties(options.ladderProperties);
        }

        if (changes.includes('emptyTemplateColumns')) {
            listModel.setEmptyTemplateColumns(options.emptyTemplateColumns);
            needOptionsValidation = true;
        }

        if (needOptionsValidation) {
            validateGridParts(options);
        }

        if (changes.includes('itemEditorTemplateOptions')) {
            listModel.setItemEditorTemplateOptions(options.itemEditorTemplateOptions);
        }
    },

    /**
     * Перекрываем метод базового класса, который вызывается из _beforeUpdate.
     * Т.к. у нас своя модель и свои проверки.
     */
    _applyNewOptionsAfterReload(oldOptions: IGridOptions, newOptions: IGridOptions): void {
        const changes = [];

        const changedOptions = _Options.getChangedOptions(newOptions, this._options);

        if (changedOptions) {
            if (changedOptions.hasOwnProperty('footer') || changedOptions.hasOwnProperty('footerTemplate')) {
                changes.push('footer');
            }
            if (changedOptions.hasOwnProperty('header')) {
                changes.push('header');
            }
            if (changedOptions.hasOwnProperty('headerVisibility')) {
                changes.push('headerVisibility');
            }
            if (changedOptions.hasOwnProperty('columns')) {
                changes.push('columns');
            }
            if (changedOptions.hasOwnProperty('columnScroll')) {
                changes.push('columnScroll');
            }
            if (changedOptions.hasOwnProperty('dragScrolling')) {
                changes.push('dragScrolling');
            }
            if (changedOptions.hasOwnProperty('resultsPosition')) {
                changes.push('resultsPosition');
            }
            if (changedOptions.hasOwnProperty('resultsVisibility')) {
                changes.push('resultsVisibility');
            }
            if (changedOptions.hasOwnProperty('items')) {
                changes.push('items');
            }
            if (changedOptions.hasOwnProperty('ladderProperties')) {
                changes.push('ladderProperties');
            }
            if (changedOptions.hasOwnProperty('emptyTemplateColumns')) {
                changes.push('emptyTemplateColumns');
            }
            if (changedOptions.hasOwnProperty('itemEditorTemplateOptions')) {
                changes.push('itemEditorTemplateOptions');
            }
        }

        if (changes.length) {
            // Набор колонок необходимо менять после перезагрузки. Иначе возникает ошибка, когда список
            // перерисовывается с новым набором колонок, но со старыми данными. Пример ошибки:
            // https://online.sbis.ru/opendoc.html?guid=91de986a-8cb4-4232-b364-5de985a8ed11
            this._freezeColumnScroll();
            this._doAfterReload(() => {
                this._doOnComponentDidUpdate(() => {
                    this._unFreezeColumnScroll();
                });
                this._applyChangedOptionsToModel(this._listModel, newOptions, changes);
            });
        }
    },

    _beforeUpdate(newOptions: IGridOptions): void {
        GridView.superclass._beforeUpdate.apply(this, arguments);
        this._columnScrollOnViewBeforeUpdate(newOptions);

        if (newOptions.sorting !== this._options.sorting) {
            this._listModel.setSorting(newOptions.sorting);
        }

        if (this._options.columnSeparatorSize !== newOptions.columnSeparatorSize) {
            this._listModel.setColumnSeparatorSize(newOptions.columnSeparatorSize);
        }

        if (this._options.rowSeparatorSize !== newOptions.rowSeparatorSize) {
            this._listModel.setRowSeparatorSize(newOptions.rowSeparatorSize);
        }

        this._ladderTopOffsetStyles = this._getLadderTopOffsetStyles();

        this._listModel.setColspanGroup(!newOptions.columnScroll || !this.isColumnScrollVisible());
    },

    _componentDidUpdate(oldOptions: IGridOptions): void {
        GridView.superclass._componentDidUpdate.apply(this, arguments);
        this._columnScrollOnViewDidUpdate(oldOptions);
    },

    _beforeUnmount(): void {
        GridView.superclass._beforeUnmount.apply(this, arguments);
        this._columnScrollOnViewBeforeUnmount();
    },

    getListModel(): Collection {
        return this._listModel;
    },

    _resolveItemTemplate(options: IGridOptions): TemplateFunction {
        return options.itemTemplate || this._resolveBaseItemTemplate();
    },

    _resolveBaseItemTemplate(): TemplateFunction {
        return GridItem;
    },

    _getGridTemplateColumnsWidth(options: IGridOptions): string[] {
        // todo Вынести расчёт на viewModel:
        //  https://online.sbis.ru/opendoc.html?guid=09307163-7edb-4423-999d-525271e05586
        // тогда метод можно покрыть нормально юнитом и проблемы с актуализацией колонок на самом grid-элементе не будет
        const columns = this._listModel ? this._listModel.getGridColumnsConfig() : options.columns;
        const hasMultiSelect = options.multiSelectVisibility !== 'hidden' &&
                               options.multiSelectPosition !== 'custom';

        if (!options.columns) {
            Logger.warn('You must set "columns" option to make grid work correctly!', this);
            return '';
        }
        const initialWidths = columns.map(((column) => column.width || GridLayoutUtil.getDefaultColumnWidth()));
        let columnsWidths: string[] = [];
        columnsWidths = initialWidths;

        if (options.isFullGridSupport) {
            const ladderStickyColumn = GridLadderUtil.getStickyColumn({
                columns
            });

            // Во время днд отключаем лесенку, а контент отображаем принудительно с помощью visibility: visible
            if (ladderStickyColumn && !this._listModel.isDragging()) {
                if (ladderStickyColumn.property.length === 2) {
                    columnsWidths.splice(1, 0, '0px');
                }
                columnsWidths = ['0px'].concat(columnsWidths);
            }
        }
        if (hasMultiSelect) {
            if (options.editingConfig?.mode === 'cell') {
                if (columnsWidths[0].endsWith('px') || columnsWidths[0].endsWith('%')) {
                    columnsWidths[0] = `calc(${columnsWidths[0]} + 20px)`;
                }
            } else {
                columnsWidths = ['max-content'].concat(columnsWidths);
            }
        }

        // Дополнительная колонка для отображения застиканных операций над записью при горизонтальном скролле.
        if (this._hasItemActionsCell(options)) {
            columnsWidths.push('0px');
        }
        return columnsWidths;
    },

    _getGridTemplateColumns(options: IGridOptions): string {
        return GridLayoutUtil.getTemplateColumnsStyle(
            this._getGridTemplateColumnsWidth(options)
        );
    },

    _hasItemActionsCell(options): boolean {
        return Boolean(
            options.isFullGridSupport && (
                options.stickyItemActions || (
                    options.columnScroll &&
                    options.itemActionsPosition !== 'custom'
                )
            )
        );
    },

    _createGuid(): string {
        return Guid.create();
    },

    _getLadderTopOffsetStyles(): string {
        if (!this._options.ladderProperties) {
            return '';
        }

        if (!this._container) {
            return '';
        }

        // Если таблица скрыта, то вычисления размеров бессмысленны. Оставляем как есть.
        if (this._container.closest('.ws-hidden')) {
            return this._ladderTopOffsetStyles;
        }
        let headerHeight = 0;
        let resultsHeight = 0;
        const header = this._container.getElementsByClassName('controls-Grid__header')[0] as HTMLElement;
        const results = this._container.getElementsByClassName('controls-Grid__results')[0] as HTMLElement;
        const hasTopResults = results && this._listModel.getResultsPosition() !== 'bottom';
        if (header) {
            headerHeight = getDimensions(header).height;
        }
        if (hasTopResults) {
            resultsHeight = getDimensions(results).height;
        }

        const topOffset = headerHeight + resultsHeight;
        const offsetFromOptions = this._options.ladderOffset || '0px';
        const postfixLadderClass = `${header ? '_withHeader' : ''}${hasTopResults ? '_withResults' : ''}`;
        const ladderClass = `controls-Grid__row-cell__ladder-spacing${postfixLadderClass}`;
        const mainLadderClass = 'controls-Grid__row-cell__ladder-main_spacing';
        return `.${this._ladderOffsetSelector} .${ladderClass} {` +
            `top: calc(var(--item_line-height_l_grid) + ${offsetFromOptions} + ${topOffset}px) !important;}` +
            `.${this._ladderOffsetSelector} .${ladderClass}_withGroup {` +
            `top: calc(var(--item_line-height_l_grid) + var(--grouping_height_list) + ${offsetFromOptions} ` +
            `+ ${topOffset}px) !important;}` +
            `.${this._ladderOffsetSelector} .${mainLadderClass}_withGroup {` +
            `top: calc(var(--grouping_height_list) + ${offsetFromOptions} + ${topOffset}px) !important;}`;

    },

    _getGridViewWrapperClasses(options: IGridOptions): string {
        return `controls_list_theme-${options.theme} ${this._getColumnScrollWrapperClasses(options)}`;
    },

    _getGridViewClasses(options: IGridOptions, columnScrollPartName?: 'fixed' | 'scrollable'): string {
        let classes = `controls-Grid controls-Grid_${options.style}`;
        if (GridLadderUtil.isSupportLadder(options.ladderProperties)) {
            classes += ` controls-Grid_support-ladder ${this._ladderOffsetSelector}`;
        }

        if (options._needBottomPadding) {
            classes += ' controls-GridView__paddingBottom__itemActionsV_outside';
        }

        // Во время днд отключаем лесенку, а контент отображаем принудительно с помощью visibility: visible
        if (this._listModel.isDragging()) {
            classes += ' controls-Grid_dragging_process';
        }

        classes += ` ${this._getColumnScrollContentClasses(options, columnScrollPartName)}`;
        return classes;
    },

    _getGridViewStyles(options: IGridOptions): string {
        return this._getGridTemplateColumns(options);
    },

    reset(params: { keepScroll?: boolean } = {}): void {
        GridView.superclass.reset.apply(this, arguments);
        if (!params.keepScroll) {
            this._resetColumnScroll(this._options.columnScrollStartPosition);
        }
    },

    /**
     * Обработка изменения размеров View "изнутри", т.е. внутри таблицы
     * произошли изменения, которые потенциально приведут к изменению размеров таблицы/колонок.
     *
     * Изменения размеров "снаружи" сама таблица не слушает, только миксин горизонтального скролла.
     * Обработка происходит в методе ColumnScrollViewMixin._onColumnScrollViewResized
     */
    onViewResized(): void {
        GridView.superclass.onViewResized.apply(this, arguments);
        this._onColumnScrollViewResized();
    },

    _isEmpty(): boolean {
        return this._options.needShowEmptyTemplate;
    },

    _onItemClick(e: SyntheticEvent, item: Row): boolean {
        // Флаг preventItemEvent выставлен, если нужно предотвратить возникновение
        // событий itemClick, itemMouseDown по нативному клику, но по какой-то причине
        // невозможно остановить всплытие события через stopPropagation
        // TODO: Убрать, preventItemEvent когда это больше не понадобится
        // https://online.sbis.ru/doc/cefa8cd9-6a81-47cf-b642-068f9b3898b7
        if (!e.preventItemEvent) {
            const contents = item.getContents();
            if (item['[Controls/_display/GroupItem]']) {
                this._notify('groupClick', [contents, e, item]);
                return;
            }
            if (e.target.closest('.js-controls-ListView__checkbox')) {
                this._notify('checkBoxClick', [item, e]);
                e.stopPropagation();
                return;
            }
            this._notify('itemClick', [contents, e, this._getCellIndexByEventTarget(e)]);
        }
    },

    /**
     * Необходимо проскролить таблицу горизонтально к полю ввода, которое будет активировано.
     * В противном случае, браузер проскролит всю таблицу (обертку).
     * Событие срабатывает при вводе фокуса в таблицу, до активации поля ввода и
     * только на уже редактируемой строке.
     * Логика подскрола к полю ввода при начале редактирования строки реализована в GridView.beforeRowActivated
     */
    _onFocusIn(e: SyntheticEvent): void {
        const target = e.target as HTMLElement;

        if (
            this.isColumnScrollVisible() &&
            this._listModel.isEditing() &&
            (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
        ) {
            this._columnScrollScrollIntoView(target);
        }
    },

    _onHeaderRowClick(event: SyntheticEvent): void {
        const target = event.target as HTMLElement;
        const headerRow = this._listModel.getHeader();

        // Если шапка зафиксирована, то нужно прокинуть событие arrowClick при клике по шеврону,
        // иначе оно не дойдет до прикладников
        if (headerRow.isSticked() && target.closest('.js-BreadCrumbsPath__backButtonArrow')) {
            event.stopImmediatePropagation();
            this._notify('arrowClick', []);
            return;
        }
    },

    _onEditingItemClick(e: SyntheticEvent, item: Row, nativeEvent: Event): void {
        e.stopImmediatePropagation();

        if (!e.preventItemEvent && nativeEvent.target.closest('.js-controls-ListView__checkbox')) {
            this._notify('checkBoxClick', [item, nativeEvent]);
            return;
        }

        if (this._listModel.getEditingConfig()?.mode === 'cell') {
            const columnIndex = this._getCellIndexByEventTarget(nativeEvent);
            const multiSelectOffset = false;
            if (item.getEditingColumnIndex() !== (columnIndex + multiSelectOffset)) {
                this._notify('itemClick', [item.getContents(), nativeEvent, columnIndex]);
            }
        }
    },

    _onItemMouseMove(event: SyntheticEvent, item: Row) {
        GridView.superclass._onItemMouseMove.apply(this, arguments);
        this._setHoveredCell(item.getContents(), event.nativeEvent);
    },

    _onItemMouseLeave() {
        GridView.superclass._onItemMouseLeave.apply(this, arguments);
        this._setHoveredCell(null, null);
    },

    _onEditArrowClick(event: SyntheticEvent, row: Row): void {
        this._notify('editArrowClick', [row.getContents()]);
        event.stopPropagation();
    },

    _getCellIndexByEventTarget(event: SyntheticEvent): number {
        if (!event) {
            return null;
        }
        const target = this._getCorrectElement(event.target);

        const gridRow = target.closest('.controls-Grid__row');
        if (!gridRow) {
            return null;
        }
        const gridCells = gridRow.querySelectorAll('.controls-Grid__row-cell');
        const currentCell = this._getCellByEventTarget(target);
        const multiSelectOffset = +(
            this._options.multiSelectVisibility !== 'hidden' &&
            this._options.multiSelectPosition !== 'custom' &&
            this._options.editingConfig?.mode !== 'cell'
        );
        return Array.prototype.slice.call(gridCells).indexOf(currentCell) - multiSelectOffset;
    },

    _getCorrectElement(element: HTMLElement): HTMLElement {
        // В FF целью события может быть элемент #text, у которого нет метода closest, в этом случае рассматриваем как
        // цель его родителя.
        if (element && !element.closest && element.parentElement) {
            return element.parentElement;
        }
        return element;
    },

    _getCellByEventTarget(target: HTMLElement): HTMLElement {
        return target.closest('.controls-Grid__row-cell') as HTMLElement;
    },

    _setHoveredCell(item: Row, nativeEvent: Event): void {
        const hoveredCellIndex = this._getCellIndexByEventTarget(nativeEvent);
        if (item !== this._hoveredCellItem || hoveredCellIndex !== this._hoveredCellIndex) {
            this._hoveredCellItem = item;
            this._hoveredCellIndex = hoveredCellIndex;
            let container = null;
            let hoveredCellContainer = null;
            if (nativeEvent) {
                const target = this._getCorrectElement(nativeEvent.target);
                container = target.closest('.controls-ListView__itemV');
                hoveredCellContainer = this._getCellByEventTarget(target);
            }
            this._notify('hoveredCellChanged', [item, container, hoveredCellIndex, hoveredCellContainer]);
        }
    },

    _getStickyLadderCellsCount(options: IGridOptions): number {
        return GridLadderUtil.stickyLadderCellsCount(
            options.columns,
            options.stickyColumn,
            this._listModel.isDragging()
        );
    },

    /**
     * Необходимо проскролить таблицу горизонтально к полю ввода, которое будет активировано.
     * В противном случае, браузер проскролит всю таблицу (обертку).
     * Событие срабатывает при входе в режим редактирования, до активации поля ввода.
     * Логика подскрола к полю ввода в уже редактируемой строке реализована в GridView._onFocusIn
     */
    beforeRowActivated(target: HTMLElement): void {
        this._columnScrollScrollIntoView(target);
    }
});

/**
 * Имя сущности для идентификации списка.
 */
Object.defineProperty(GridView.prototype, 'listInstanceName', {
    value: 'controls-Grid',
    writable: false,
    sorting: null
});

export default GridView;
