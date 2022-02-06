import {TreeItem, ICollectionItemOptions as IBaseOptions} from 'Controls/display';
import ColumnsCollection from './Collection';
import {Model} from 'Types/entity';

export interface IOptions<T extends Model = Model> extends IBaseOptions<T> {
    columnProperty: number;
    column: number;
}

export default class CollectionItem<T extends Model = Model> extends TreeItem<T> {
    protected _$columnProperty: string;
    protected _$column: number = 0;
    protected _$owner: ColumnsCollection<T>;

    readonly listInstanceName: string =  'controls-Columns';

    readonly listElementName: string =  'item';

    constructor(options?: IOptions<T>) {
        super(options);
        this._$column = options?.column || 0;
    }

    getColumn(): number {
        return this._$column;
    }

    setColumn(column: number): void {
        if (this._$column === column) {
            return;
        }
        this._$column = column;
        this._nextVersion();
    }

    get index(): number {
        return this.getOwner().getIndex(this);
    }

    /**
     * Возвращает классы с отступами элемента
     */
    getItemPaddingClasses(): string {
        let classes = '';
        classes += ` controls-ColumnsView__item_spacingTop_${this.getTopPadding()}`;
        classes += ` controls-ColumnsView__item_spacingBottom_${this.getBottomPadding()}`;

        return classes;
    }

    getWrapperClasses(templateHighlightOnHover: boolean = true,
                      cursor: string | boolean = 'pointer',
                      shadowVisibility: 'visible'|'hidden'): string {
        let result: string = super.getWrapperClasses.apply(this, arguments);
        result += this.getItemContainerClasses(false);
        result += ' controls-ColumnsView__itemV';

        result += ` ${this.getItemPaddingClasses()}`;
        result += ` ${this.getRoundBorderClasses()}`;

        if (cursor === true || cursor === 'pointer') {
            result += ' controls-ListView__itemV_cursor-pointer';
        }

        if (shadowVisibility !== 'hidden') {
            result += ' controls-ColumnsView__item_shadow';
        }

        // При днд отключаем стиль ховера, т.к. он тоже рисуется тенями
        // и возможна путаница между dragged и hovered итемами
        if (!this.getOwner().isDragging()) {
            result += ' controls-ColumnsView__item_hovering';
        }

        if (this.isDragged()) {
            result += ' controls-ColumnsView__item_dragging';
        }

        result += this.getFadedClass();

        if (this.isDragTargetNode()) {
            result += ' controls-ColumnsView__dragTargetNode';
        }

        return result;
    }

    getMultiSelectPositionClasses(): string {
        return `controls-ColumnsView__checkbox_position-${this.getOwner().getMultiSelectPosition()} `;
    }

    getContentClasses(): string {
        // Тут должен быть вызов метода суперкласса, НО нам не нужны почти все классы, которые он предлагает
        return ' controls-ColumnsView__itemContent';
    }

    getItemActionClasses(itemActionsPosition: string): string {
        return `controls-ColumnsView__itemActionsV_${itemActionsPosition}`;
    }

    getItemActionPositionClasses(itemActionsPosition: string,
                                 templateItemActionClass: string,
                                 itemPadding: {top?: string, bottom?: string}): string {
        let classes: string;
        let itemActionClass: string;
        itemActionClass = templateItemActionClass || 'controls-itemActionsV_position_bottomRight';
        classes = `${itemActionClass} `;
        if (this._$roundBorder) {
            // Если располагаем ItemActions снизу, то скругляем им верхний левый угол.
            if (itemActionClass === 'controls-itemActionsV_position_bottomRight') {
                classes += ` controls-itemActionsV_roundBorder_topLeft_${this.getTopRightRoundBorder()}`;

                // Если располагаем ItemActions вверху, то скругляем им нижний левый угол
            } else if (itemActionClass === 'controls-itemActionsV_position_topRight') {
                classes += ` controls-itemActionsV_roundBorder_bottomLeft_${this.getBottomRightRoundBorder()}`;
            }
        }
        return classes;
    }
}

Object.assign(CollectionItem.prototype, {
    '[Controls/_columns/display/CollectionItem]': true,
    _moduleName: 'Controls/columns:ColumnsCollectionItem',
    _instancePrefix: 'columns-item-',
    _$column: 1
});
