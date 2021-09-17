import {TemplateFunction} from 'UI/Base';
import {TreeItem} from 'Controls/display';
import {Model} from 'Types/entity';
import TreeGridDataRow from './TreeGridDataRow';
import {GridCell, GridCell as Cell, IColumn, TColspanCallbackResult} from 'Controls/grid';
import {MoreButtonVisibility} from 'Controls/_display/Collection';

/**
 * Футер узла в иерархической таблице
 */
export default class TreeGridNodeFooterRow extends TreeGridDataRow<null> {
    readonly '[Controls/treeGrid:TreeGridNodeFooterRow]': boolean;
    readonly Markable: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly EnumerableItem: boolean = false;
    readonly EdgeRowSeparatorItem: boolean = false;
    readonly ItemActionsItem: boolean = false;

    protected _$moreFontColorStyle: string;

    // TODO нужно удалить, когда перепишем колспан для футеров узлов
    //  https://online.sbis.ru/opendoc.html?guid=76c1ba00-bfc9-4eb8-91ba-3977592e6648
    // Храним колспан, чтобы правильно определять индекс столбца.
    // Он задается на темплейте, поэтмоу в моделе мы о нем не знаем
    private _colspan: boolean;

    get node(): TreeItem<Model> {
        return this.getNode();
    }

    getNode(): TreeItem<Model> {
        return this.getParent();
    }

    getColumns(colspan?: boolean): GridCell[] {
        this._colspan = colspan;
        let columns = super.getColumns();
        if (colspan !== false) {
            let start = 0;
            let end = 1;

            // В данный момент поддержан только один сценарий лесенки и футеров узлов: лесенка для первого столбца.
            // Чтобы поддержать все сценарии нужно переписать nodeFooterTemplate::colspan на Tree::colspanCallback
            //  TODO переписать когда перепишем колспан для футеров узлов
            //   https://online.sbis.ru/opendoc.html?guid=76c1ba00-bfc9-4eb8-91ba-3977592e6648
            if (this.isSupportStickyLadder() && columns[0]['[Controls/_display/StickyLadderCell]']) {
                start++;
                end++;
            }

            if (this.isFullGridSupport() && this.hasColumnScroll()) {
                end += this.getStickyColumnsCount();
            }

            if (this.hasMultiSelectColumn()) {
                end++;
            }

            columns = columns.slice(start, end);
        }
        return columns;
    }

    // TODO нужно удалить, когда перепишем колспан для футеров узлов
    //  https://online.sbis.ru/opendoc.html?guid=76c1ba00-bfc9-4eb8-91ba-3977592e6648
    getColumnIndex(column: Cell): number {
        return this.getColumns(this._colspan).indexOf(column);
    }

    // TODO нужно удалить, когда перепишем колспан для футеров узлов
    //  https://online.sbis.ru/opendoc.html?guid=76c1ba00-bfc9-4eb8-91ba-3977592e6648
    getColumnsCount(): number {
        return this.getColumns(this._colspan).length;
    }

    getTemplate(): TemplateFunction | string {
        return this._$owner.getNodeFooterTemplate() || 'Controls/treeGrid:NodeFooterTemplate';
    }

    getNodeFooterTemplateMoreButton(): TemplateFunction {
        return this._$owner.getNodeFooterTemplateMoreButton();
    }

    getItemClasses(): string {
        return 'controls-ListView__itemV controls-Grid__row controls-TreeGrid__nodeFooter';
    }

    getExpanderPaddingClasses(tmplExpanderSize?: string): string {
        let classes = super.getExpanderPaddingClasses(tmplExpanderSize);

        classes = classes.replace(
           'controls-TreeGrid__row-expanderPadding',
           'controls-TreeGrid__node-footer-expanderPadding'
        );

        return classes;
    }

    // Возможна ситуация, когда nodeFooterTemplate задали только для настройки опций,
    // а отображаться он будет при hasMoreStorage
    // То есть в этой случае мы не должны отображать футер, если нет данных еще, т.к. content не задан
    // При создании футера(в стратегии) это не определить
    shouldDisplayVisibleFooter(content: TemplateFunction): boolean {
        // Нужно рисовать футер если есть пользовательский контент или нужно рисовать нашу кнопку "Еще" для подгрузки.
        return !!content || this.needMoreButton();
    }

    shouldDisplayContent(column: Cell<null, TreeGridNodeFooterRow>, colspan?: boolean): boolean {
        const columns = this.getColumns(colspan);
        const firstFooterCell = columns.find((it) => it['[Controls/treeGrid:TreeGridNodeFooterCell]']);
        // Отображаем контент только для первой ячейки, которая является TreeGridNodeFooterCell
        return firstFooterCell === column;
    }

    // TODO удалить после https://online.sbis.ru/opendoc.html?guid=76c1ba00-bfc9-4eb8-91ba-3977592e6648
    isSupportStickyLadder(): boolean {
        const ladderProperties = this.getStickyLadder();
        return ladderProperties && !!Object.keys(ladderProperties).length;
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

    /**
     * Кнопка "Ещё" нужна всегда кроме следующих случаев:
     *  * Нет данных для загрузки
     *  ИЛИ
     *  * выставлен режим скрытия для последнего узла
     *  * текущий узел является последней записью в коллекции
     *  * не задан футер списка
     */
    needMoreButton(): boolean {
        const dataRow = this.getParent();
        const collection = this.getOwner();
        const dataRowIsLastCollectionItem = collection.getRoot().getLastChildItem() === dataRow;
        const hideForLastNode = collection.getMoreButtonVisibility() === MoreButtonVisibility.exceptLastNode;

        const needHide =
            !this.hasMoreStorage() ||
            (hideForLastNode && dataRowIsLastCollectionItem && !collection.getFooter());

        return !needHide;
    }

    protected _getColspan(column: IColumn, columnIndex: number): TColspanCallbackResult {
        // В данный момент nodeFooter не поддерживает colspanCallback,
        // TODO поддержка будет по https://online.sbis.ru/opendoc.html?guid=76c1ba00-bfc9-4eb8-91ba-3977592e6648
        return undefined;
    }
}

Object.assign(TreeGridNodeFooterRow.prototype, {
    '[Controls/treeGrid:TreeGridNodeFooterRow]': true,
    '[Controls/tree:TreeNodeFooterItem]': true,
    _moduleName: 'Controls/treeGrid:TreeGridNodeFooterRow',
    _cellModule: 'Controls/treeGrid:TreeGridNodeFooterCell',
    _instancePrefix: 'tree-grid-node-footer-row-',
    _$supportLadder: false,
    _$moreFontColorStyle: null
});
