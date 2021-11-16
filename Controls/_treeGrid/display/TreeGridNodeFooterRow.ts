import {TemplateFunction} from 'UI/Base';
import {TreeItem, MoreButtonVisibility} from 'Controls/display';
import {Model} from 'Types/entity';
import TreeGridDataRow, {IOptions} from './TreeGridDataRow';
import {IColumn, TColspanCallbackResult, TColumns} from 'Controls/grid';

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

    readonly listInstanceName: string =  'controls-TreeGrid__node-footer';

    readonly listElementName: string = 'row';

    getTemplate(): TemplateFunction | string {
        return 'Controls/treeGrid:ItemTemplate';
    }

    get node(): TreeItem<Model> {
        return this.getNode();
    }

    getNode(): TreeItem<Model> {
        return this.getParent();
    }

    // FIXME: Необходимость переопределения этого метода - следствие неправильного наследования.
    //  Подвал наследуется от строки данных дерева, хотя должен просто от абстрактной строки дерева.
    //  У строки данных наиболее специфичная логика колонок строки и колонок всего дерева(в данных это одно и то же).
    //  Для абстрактной строки в дереве это не так.
    //  Привело к ошибке, что при установке колонок всей таблицы, они устанавливались в подвал.
    setGridColumnsConfig(columns: TColumns): void {
        this._$gridColumnsConfig = columns;
        this._reinitializeColumns(true);
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
        // Нужно рисовать футер если:
        //  * есть данные для загрузки и нужно показывать нашу кнопку "Ещё"
        //  * нет данных для загрузки и есть пользовательский контент
        return this.hasMoreStorage() ? this.needMoreButton() : !!content;
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

    protected _initializeColumns(): void {
        if (this.needMoreButton() && !this.getRowTemplate() && !this.getOwner().hasNodeFooterColumns()) {
            this.setRowTemplate('Controls/treeGrid:NodeFooterTemplate');
        }

        super._initializeColumns({
            colspanStrategy: 'consistently',
            prepareStickyLadderCellsStrategy: !this._$rowTemplate ? 'add' : (this.getStickyLadderCellsCount() ? 'offset' : 'colspan'),
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

Object.assign(TreeGridNodeFooterRow.prototype, {
    '[Controls/treeGrid:TreeGridNodeFooterRow]': true,
    '[Controls/tree:TreeNodeFooterItem]': true,
    _moduleName: 'Controls/treeGrid:TreeGridNodeFooterRow',
    _cellModule: 'Controls/treeGrid:TreeGridNodeFooterCell',
    _instancePrefix: 'tree-grid-node-footer-row-',
    _$supportLadder: false,
    _$moreFontColorStyle: null
});
