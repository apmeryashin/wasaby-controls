import CollectionItem, {
    IOptions as ICollectionItemOptions,
    ISerializableState as ICollectionItemSerializableState
} from './CollectionItem';
import ExpandableMixin, {IOptions as IExpandableMixinOptions} from './ExpandableMixin';
import Tree from './Tree';
import {mixin, object} from 'Types/util';
import TreeChildren from './TreeChildren';
import { TemplateFunction } from 'UI/Base';
import { Model } from 'Types/entity';
import IGroupNode from './interface/IGroupNode';
import {TExpanderIconSize, TExpanderIconStyle} from './interface/ITree';

export interface IOptions<T extends Model> extends ICollectionItemOptions<T>, IExpandableMixinOptions {
    owner?: Tree<T>;
    node?: boolean;
    childrenProperty?: string;
    hasChildrenProperty?: string;
    hasChildren?: boolean;
    loaded?: boolean;
    parent?: TreeItem<T>;
}

export interface IHasMore {
    forward: boolean;
    backward: boolean;
}

interface ISerializableState<T> extends ICollectionItemSerializableState<T> {
    $options: IOptions<T>;
}

/**
 * Элемент древовидной коллеции
 * @extends Controls/_display/CollectionItem
 * @mixes Controls/display:ExpandableMixin
 * @public
 * @author Авраменко А.С.
 */
export default class TreeItem<T extends Model = Model> extends mixin<
    CollectionItem<any>,
    ExpandableMixin
    >(
    CollectionItem,
    ExpandableMixin
) implements IGroupNode {
    readonly GroupNodeItem: boolean = false;

    protected _$owner: Tree<T>;

    /**
     * Родительский узел
     */
    protected _$parent: TreeItem<T>;

    /**
     * Является узлом
     * @remark true - узел, false - 'скрытый' узел, null - лист
     */
    protected _$node: boolean|null;

    /**
     * Есть ли дети у узла исходя из рекордсета.
     */
    protected _$hasChildrenByRecordSet: boolean;

    /**
     * Название свойства, содержащего дочерние элементы узла. Используется для анализа на наличие дочерних элементов.
     */
    protected _$childrenProperty: string;

    protected _$hasChildrenProperty: string;

    /**
     * Признак, означающий что нужно отрисовать отступ под экспандер
     * @private
     */
    private _$displayExpanderPadding: boolean;

    /**
     * Размер иконки разворота узла
     */
    protected _$expanderIconSize: TExpanderIconSize;

    /**
     * Стиль цвета иконки разворота узла
     */
    protected _$expanderIconStyle: TExpanderIconStyle;

    /**
     * Признак, означающий что в узле можно еще подгрузить данные
     * @protected
     */
    protected _$hasMore: IHasMore;
    // TODO должен быть указан парвильный тип, но сейчас футеры есть только в триГриде
    //  и если указать типом TreeGridNodeFooterRow, то будет неправильная зависимость

    private _nodeFooter: TreeItem;

    private _nodeHeader: TreeItem;
    /**
     * Признак, что узел является целью при перетаскивании
     * @private
     */
    private _isDragTargetNode: boolean = false;

    constructor(options: IOptions<T>) {
        super(options);
        ExpandableMixin.call(this);

        // node может быть равен null, поэтому его не задали, только когда undefined
        if (this._$node === undefined) {
            this._$node = null;
        }
    }

    // region Public methods

    getOwner(): Tree<T> {
        return super.getOwner() as Tree<T>;
    }

    setOwner(owner: Tree<T>): void {
        super.setOwner(owner);
    }

    /**
     * Возвращает родительский узел
     */
    getParent(): TreeItem<T> {
        return this._$parent as TreeItem<T>;
    }

    /**
     * Устанавливает родительский узел
     * @param parent Новый родительский узел
     */
    setParent(parent: TreeItem<T>): void {
        if (this._$parent !== parent) {
            this._$parent = parent;
            this._nextVersion();
        }
    }

    /**
     * Возвращает корневой элемент дерева
     */
    getRoot(): TreeItem<T> {
        const parent = this.getParent();
        if (parent === this) {
            return;
        }
        return parent ? parent.getRoot() : this;
    }

    /**
     * Является ли корнем дерева
     */
    isRoot(): boolean {
        return !this.getParent();
    }

    /**
     * Возвращает уровень вложенности относительно корня
     */
    getLevel(): number {
        // If this is not a root then increase parent's level
        const parent = this._$parent;
        if (parent) {
            let parentLevel = 0;
            if (parent instanceof TreeItem) {
                parentLevel = parent.getLevel();
            } else if (parent['[Controls/_display/BreadcrumbsItem]']) {
                parentLevel = parent.getLevel();
            }
            return parentLevel + 1;
        }

        // If this is a root then get its level from owner
        const owner = this.getOwner();
        return owner ? owner.getRootLevel() : 0;
    }

    /**
     * Возвращает признак, является ли элемент узлом
     * TODO нужен параметр или метод, который будет возвращать для узлов и скрытых узлов true, а для листьев false. Сейчас листья это null
     */
    isNode(): boolean|null {
        return this._$node;
    }

    /**
     * Устанавливает признак, является ли элемент узлом
     * @param node Является ли элемент узлом
     */
    setNode(node: boolean|null): void {
        if (this._$node !== node) {
            this._$node = node;
            this._nextVersion();
        }
    }

    /**
     * Возвращает признак, является ли элемент узлом-группой
     */
    isGroupNode(): boolean {
        return false;
    }

    /**
     * Устанавливаем признак, что узел является целью при перетаскивании
     * @param isTarget Является ли узел целью при перетаскивании
     */
    setDragTargetNode(isTarget: boolean): void {
        if (this._isDragTargetNode !== isTarget) {
            this._isDragTargetNode = isTarget;
            this._nextVersion();
        }
    }

    /**
     * Возвращает признак, что узел является целью при перетаскивании
     */
    isDragTargetNode(): boolean {
        return this._isDragTargetNode;
    }

    /**
     * Возвращает признак наличия детей у узла
     */
    hasChildren(): boolean {
        // hasChildren могут менять динамически, поэтому нужно брать его всегда из рекорда,
        // т.к. это дешевле, чем отслеживать изменение и изменять состояние итема

        let hasChildren = object.getPropertyValue<boolean>(this.getContents(), this.getHasChildrenProperty());

        // Если hasChildren не задали, то для свернутого узла по дефолту есть дети
        // Для развернутого узла смотрим по кол-во детей
        if (hasChildren === undefined) {
            hasChildren = this.isExpanded()
                ? !!this.getChildren().getCount()
                : this._$node !== null;
        }

        return hasChildren;
    }

    getHasChildrenProperty(): string {
        return this._$hasChildrenProperty;
    }

    setHasChildrenProperty(hasChildrenProperty: string): void {
        if (this._$hasChildrenProperty !== hasChildrenProperty) {
            this._$hasChildrenProperty = hasChildrenProperty;
            this._nextVersion();
        }
    }

    hasChildrenByRecordSet(): boolean {
        return this._$hasChildrenByRecordSet;
    }

    /**
     * Устанавливает признак наличия детей у узла, посчитанный по рекордсету
     */
    setHasChildrenByRecordSet(value: boolean): boolean {
        const changed = this._$hasChildrenByRecordSet !== value;
        if (changed) {
            this._$hasChildrenByRecordSet = value;
            this._nextVersion();
        }
        return changed;
    }

    /**
     * Возвращает название свойства, содержащего дочерние элементы узла
     */
    getChildrenProperty(): string {
        return this._$childrenProperty;
    }

    /**
     * Возвращает коллекцию потомков элемента коллекции
     * @param [withFilter=true] Учитывать {@link Controls/display:Collection#setFilter фильтр}
     */
    getChildren(withFilter: boolean = true): TreeChildren<T> {
        return this.getOwner().getChildren(this, withFilter);
    }

    /**
     * Возвращает последний дочерний элемент для текущего
     */
    getLastChildItem(): TreeItem<T> {
        const children = this.getChildren();
        return children.at(children.getCount() - 1);
    }

    getHasMoreStorage(): IHasMore {
        return this._$hasMore;
    }

    hasMoreStorage(direction: string): boolean {
        return this._$hasMore[direction];
    }

    setHasMoreStorage(hasMore: IHasMore): void {
        const hasChanges = this._$hasMore.forward !== hasMore.forward || this._$hasMore.backward !== hasMore.backward;
        if (hasChanges) {
            if (this._$hasMore.forward !== hasMore.forward) {
                const nodeFooter = this.getNodeFooter();
                if (nodeFooter) {
                    nodeFooter.setHasMoreStorage(hasMore);
                }
            }

            if (this._$hasMore.backward !== hasMore.backward) {
                const nodeHeader = this.getNodeHeader();
                if (nodeHeader) {
                    nodeHeader.setHasMoreStorage(hasMore);
                }
            }

            this._$hasMore = hasMore;
            this._nextVersion();
        }
    }

    setNodeFooter(nodeFooter: TreeItem): void {
        this._nodeFooter = nodeFooter;
    }

    getNodeFooter(): TreeItem {
        return this._nodeFooter;
    }

    setNodeHeader(nodeHeader: TreeItem): void {
        this._nodeHeader = nodeHeader;
    }

    getNodeHeader(): TreeItem {
        return this._nodeHeader;
    }

    getNodeFooterTemplate(): TemplateFunction {
        return this.getOwner().getNodeFooterTemplate();
    }

    // TODO есть ExpandableMixin, иконку тоже наверное нужно туда перенести
    //  он используется для группы, но можно от него унаследоваться и расширить вот этим кодом
    // region Expandable

    getExpanderTemplate(expanderTemplate?: TemplateFunction): TemplateFunction {
        return this._$owner.getExpanderTemplate(expanderTemplate);
    }

    getExpanderIcon(expanderIcon?: string): string {
        return expanderIcon || this._$owner.getExpanderIcon();
    }

    getExpanderSize(expanderSize?: string): string {
        return expanderSize || this._$owner.getExpanderSize();
    }

    setExpanderIconSize(expanderIconSize: TExpanderIconSize): void {
        if (this._$expanderIconSize !== expanderIconSize) {
            this._$expanderIconSize = expanderIconSize;
            this._nextVersion();
        }
    }

    setExpanderIconStyle(expanderIconStyle: TExpanderIconStyle): void {
        if (this._$expanderIconStyle !== expanderIconStyle) {
            this._$expanderIconStyle = expanderIconStyle;
            this._nextVersion();
        }
    }

    getExpanderIconSize(expanderIconSize?: TExpanderIconSize): TExpanderIconSize {
        return expanderIconSize || this._$expanderIconSize;
    }

    getExpanderIconStyle(expanderIconStyle?: TExpanderIconStyle): TExpanderIconStyle {
        return expanderIconStyle || this._$expanderIconStyle;
    }

    shouldDisplayExpanderBlock(): boolean {
        return this._$owner.getExpanderVisibility() === 'hasChildren'
            ? this._$owner.hasNodeWithChildren()
            : this._$owner.hasNode();
    }

    shouldDisplayExpander(expanderIcon?: string, position: 'default'|'right' = 'default'): boolean {
        if (this.getExpanderIcon(expanderIcon) === 'none' || this.isNode() === null) {
            return false;
        }

        const correctPosition = this.getOwner().getExpanderPosition() === position;
        const hasChildren = this.getHasChildrenProperty() ? this.hasChildren() : this.hasChildrenByRecordSet();
        return (this._$owner.getExpanderVisibility() === 'visible' || hasChildren) && correctPosition;
    }

    setDisplayExpanderPadding(displayExpanderPadding: boolean): void {
        if (this._$displayExpanderPadding !== displayExpanderPadding) {
            this._$displayExpanderPadding = displayExpanderPadding;
            this._nextVersion();
        }
    }

    shouldDisplayExpanderPadding(tmplExpanderIcon?: string, tmplExpanderSize?: string): boolean {
        const expanderIcon = this.getExpanderIcon(tmplExpanderIcon);
        const expanderPosition = this._$owner.getExpanderPosition();
        const expanderSize = this.getExpanderSize(tmplExpanderSize);

        // нельзя заюзать _$displayExpanderPadding, т.к. экспандер могут скрыть для определенной записи
        if (this._$owner.getExpanderVisibility() === 'hasChildren') {
            const hasChildren = this.getHasChildrenProperty() ? this.hasChildren() : this.hasChildrenByRecordSet();
            return !hasChildren && expanderIcon !== 'none' && expanderPosition === 'default';
        } else {
            return !expanderSize && expanderIcon !== 'none' && expanderPosition === 'default';
        }
    }

    shouldDisplayLevelPadding(withoutLevelPadding?: boolean): boolean {
        return !withoutLevelPadding && this.getLevel() > 1;
    }

    getExpanderPaddingClasses(tmplExpanderSize?: string): string {
        // expanderSize по дефолту undefined, т.к. есть логика, при которой если он задан,
        // то скрытый экспандер для отступа не рисуем, но по факту дефолтное значение 'default'
        const expanderSize = this.getExpanderSize(tmplExpanderSize) || 'default';
        let expanderPaddingClasses = 'controls-TreeGrid__row-expanderPadding';
        expanderPaddingClasses += ` controls-TreeGrid__row-expanderPadding_size_${expanderSize}`;
        expanderPaddingClasses += ' js-controls-ListView__notEditable';
        return expanderPaddingClasses;
    }

    getLevelIndentClasses(expanderSizeTmpl?: string, levelIndentSize?: string): string {
        const sizes = ['null', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl'];
        let resultLevelIndentSize;
        const expanderSize = this.getExpanderSize(expanderSizeTmpl);
        const expanderPosition = this._$owner.getExpanderPosition();

        if (expanderSize && levelIndentSize) {
            // Если позиция экспандера не дефолтная, то нужно смотреть в первую очередь на levelIndentSize
            if (sizes.indexOf(expanderSize) >= sizes.indexOf(levelIndentSize) && expanderPosition === 'default') {
                resultLevelIndentSize = expanderSize;
            } else {
                resultLevelIndentSize = levelIndentSize;
            }
        } else if (!expanderSize && !levelIndentSize) {
            resultLevelIndentSize = 'default';
        } else {
            resultLevelIndentSize = expanderSize || levelIndentSize;
        }

        return `controls-TreeGrid__row-levelPadding controls-TreeGrid__row-levelPadding_size_${resultLevelIndentSize}`;
    }

    getExpanderClasses(tmplExpanderIcon?: string,
                       tmplExpanderSize?: string,
                       tmplExpanderIconSize?: TExpanderIconSize,
                       tmplExpanderIconStyle?: TExpanderIconStyle): string {
        const expanderIcon = this.getExpanderIcon(tmplExpanderIcon) || (this.isNode() ? 'node' : 'hiddenNode');
        const expanderSize = this.getExpanderSize(tmplExpanderSize) || 'default';
        const expanderPosition = this._$owner.getExpanderPosition();

        let expanderIconSize: TExpanderIconSize | 'master';
        let expanderIconStyle;

        if (this.getStyle() === 'master') {
            expanderIconSize = expanderPosition === 'default' ? 'master' : 'default';
            expanderIconStyle = 'unaccented';

        } else {
            expanderIconSize = this.getExpanderIconSize(tmplExpanderIconSize);
            expanderIconStyle = expanderIcon === 'hiddenNode' ? 'unaccented' :
                this.getExpanderIconStyle(tmplExpanderIconStyle);
        }

        let expanderClasses = 'js-controls-Tree__row-expander controls-TreeGrid__row-expander';
        expanderClasses += ' js-controls-ListView__notEditable';

        if (expanderPosition === 'default') {
            expanderClasses += ` controls-TreeGrid__row_${this.getStyle()}-expander_size_${expanderSize}`;
        } else if (expanderPosition === 'right') {
            expanderClasses += ' controls-TreeGrid__row_expander_position_right';
        }
        expanderClasses += ` controls-TreeGrid__row-expander__spacingTop_${this.getOwner().getTopPadding()}`;
        expanderClasses += ` controls-TreeGrid__row-expander__spacingBottom_${this.getOwner().getBottomPadding()}`;

        const style = this.getStyle() === 'master' && expanderPosition !== 'right' ? 'master' : 'default';

        let expanderIconClass = ` controls-TreeGrid__row-expander_${expanderIcon}`;
        if (expanderIcon === 'node' || expanderIcon === 'hiddenNode' || expanderIcon === 'emptyNode') {
            expanderIconClass += `_${style}`;
        }

        expanderClasses += ` controls-TreeGrid__row-expander_${expanderIcon}_${style}_position_${expanderPosition}`;
        expanderClasses += expanderIconClass;

        expanderClasses += ` controls-TreeGrid__row-expander_${expanderIcon}_iconSize_${expanderIconSize}`;
        expanderClasses += ` controls-TreeGrid__row-expander_${expanderIcon}_iconStyle_${expanderIconStyle}`;

        // добавляем класс свертнутости развернутости для тестов
        expanderClasses += ' controls-TreeGrid__row-expander' + (this.isExpanded() ? '_expanded' : '_collapsed');
        // добавляем класс свертнутости развернутости стилевой
        expanderClasses += expanderIconClass + (this.isExpanded() ? '_expanded' : '_collapsed');

        return expanderClasses;
    }

    // endregion Expandable

    // region SerializableMixin

    _getSerializableState(state: ICollectionItemSerializableState<T>): ISerializableState<T> {
        const resultState = super._getSerializableState(state) as ISerializableState<T>;

        // It's too hard to serialize context related method. It should be restored at class that injects this function.
        if (typeof resultState.$options.parent === 'function') {
            delete resultState.$options.parent;
        }

        return resultState;
    }

    _setSerializableState(state: ISerializableState<T>): Function {
        const fromSuper = super._setSerializableState(state);
        return function(): void {
            fromSuper.call(this);
        };
    }

    // endregion

    // region Protected methods

    /**
     * Генерирует событие у владельца об изменении свойства элемента.
     * Помимо родительской коллекции уведомляет также и корневой узел дерева.
     * @param property Измененное свойство
     * @protected
     */
    protected _notifyItemChangeToOwner(property: string): void {
        super._notifyItemChangeToOwner(property);

        const root = this.getRoot();
        const rootOwner = root ? root.getOwner() : undefined;
        if (rootOwner && rootOwner !== this._$owner) {
            rootOwner.notifyItemChange(this, {property});
        }
    }

    // endregion
}

Object.assign(TreeItem.prototype, {
    '[Controls/_display/TreeItem]': true,
    _moduleName: 'Controls/display:TreeItem',
    _$parent: undefined,
    _$node: null,
    _$hasChildrenByRecordSet: false,
    _$childrenProperty: '',
    _$hasChildrenProperty: '',
    _$hasMore: {
        forward: false,
        backward: false
    },
    _$displayExpanderPadding: false,
    _$expanderIconSize: 'default',
    _$expanderIconStyle: 'default',
    _instancePrefix: 'tree-item-'
});
