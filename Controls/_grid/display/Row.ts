import {TemplateFunction} from 'UI/Base';
import {mixin} from 'Types/util';

import {CollectionItem, TMarkerClassName, IItemPadding} from 'Controls/display';

import Collection from './Collection';
import GridRowMixin, {IOptions as IGridRowMixinOptions} from './mixins/Row';
import {Model} from 'Types/entity';

export interface IOptions<TContents extends Model = Model> extends IGridRowMixinOptions<TContents> {
    owner: Collection<TContents>;
}

/**
 * Базовый класс строки в таблице
 */
export default class Row<TContents extends Model = Model>
    extends mixin<CollectionItem<TContents>, GridRowMixin<TContents>>(CollectionItem, GridRowMixin) {
    readonly '[Controls/_display/grid/Row]': boolean;

    // По умолчанию любая абстрактная строка таблицы не имеет возможности редактироваться.
    // Данная возможность доступна только строке с данными.
    readonly '[Controls/_display/IEditableCollectionItem]': boolean;

    // TODO: Удалить имплементирование после выделения сущностей элементов списка
    //  (базовый элемент -> элемент данных / элемент группы /...)
    //  Интерфейс должен имплементироваться только у элементов, которые поддерживает отметку маркером.
    //  Сейчас, т.к. нет элемента данных, его имплементирует CollectionItem.
    readonly Markable: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly EnumerableItem: boolean = false;
    readonly EdgeRowSeparatorItem: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly ItemActionsItem: boolean = false;

    constructor(options?: IOptions<TContents>) {
        super(options);
        GridRowMixin.call(this, options);
    }

    // region overrides

    getTemplate(): TemplateFunction | string {
        return this.getDefaultTemplate();
    }

    setRowSeparatorSize(rowSeparatorSize: string): boolean {
        const changed = super.setRowSeparatorSize(rowSeparatorSize);
        if (changed && this._$columnItems) {
            this._updateSeparatorSizeInColumns('Row');
        }
        return changed;
    }

    getMarkerClasses(markerClassName: TMarkerClassName = 'default', itemPadding: IItemPadding = {}): string {
        let classes = 'controls-GridView__itemV_marker ';
        classes += `controls-GridView__itemV_marker-${this.getStyle()} `;
        const bottomPadding = itemPadding.bottom || this.getBottomPadding();
        classes += `controls-GridView__itemV_marker-${this.getStyle()}_rowSpacingBottom-${bottomPadding} `;
        const topPadding = itemPadding.top || this.getTopPadding();
        classes += `controls-GridView__itemV_marker-${this.getStyle()}_rowSpacingTop-${topPadding} `;

        classes += 'controls-ListView__itemV_marker_';
        if (markerClassName === 'default') {
            classes += 'height ';
            classes += 'controls-GridView__itemV_marker_vertical-position-top ';
        } else {
            classes += `${'padding-' + (topPadding || 'l') + '_' + markerClassName} `;
        }
        classes += `controls-ListView__itemV_marker-${this.getMarkerPosition()} `;
        return classes;
    }

    setMultiSelectVisibility(multiSelectVisibility: string): boolean {
        const isChangedMultiSelectVisibility = super.setMultiSelectVisibility(multiSelectVisibility);
        if (isChangedMultiSelectVisibility) {
            this._reinitializeColumns();
        }
        return isChangedMultiSelectVisibility;
    }

    setEditing(editing: boolean, editingContents?: TContents, silent?: boolean, columnIndex?: number): void {
        // TODO: Убрать columnIndex.
        //  Подробнее можно прочитать в коментарии базового метода CollectionItem.setEditing
        //  https://online.sbis.ru/opendoc.html?guid=b13d5312-a8f5-4cea-b88f-8c4c043e4a77
        super.setEditing(editing, editingContents, silent, columnIndex);
        const colspanCallback = this._$colspanCallback;
        if (colspanCallback) {
            this._reinitializeColumns();
        }
    }


    setMarked(marked: boolean, silent?: boolean): void {
        const changed = marked !== this.isMarked();
        super.setMarked(marked, silent);
        if (changed) {
            this._redrawColumns('first');
        }
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

    // endregion
}

Object.assign(Row.prototype, {
    '[Controls/_display/IEditableCollectionItem]': false,
    '[Controls/_display/grid/Row]': true,
    _moduleName: 'Controls/grid:GridRow',
    _instancePrefix: 'grid-row-'
});
