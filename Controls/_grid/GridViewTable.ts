import GridView from './GridView';
import {TemplateFunction} from 'UI/Base';
import * as TableTemplate from 'wml!Controls/_grid/Render/table/GridView';
import * as TableItem from 'wml!Controls/_grid/Render/table/Item';
import { IGridOptions } from 'Controls/grid';

/**
 * Представление таблицы, которое не поддерживает css grid
 */
const GridViewTable = GridView.extend({
    _template: TableTemplate,

    _resolveItemTemplate(options: IGridOptions): TemplateFunction {
        return options.itemTemplate || this._resolveBaseItemTemplate();
    },

    _resolveBaseItemTemplate(): TemplateFunction {
        return TableItem;
    },

    _getGridViewWrapperClasses(options: IGridOptions): string {
        const classes = GridViewTable.superclass._getGridViewWrapperClasses.apply(this, arguments);
        return `${classes} controls-Grid__Wrapper_table-layout`;
    },

    _getGridViewClasses(options: IGridOptions): string {
        const classes = GridViewTable.superclass._getGridViewClasses.apply(this, arguments);

        // При горизонтальном скролле ЕДИНСТВЕННО ВЕРНОЕ значение свойства table-layout - это auto.
        // Такая настройка позволяет колонкам тянуться, тогда как fixed жестко ограничивает их ширины.
        const isFixedLayout = options.columnScroll !== true;
        return `${classes} controls-Grid_table-layout controls-Grid_table-layout_${isFixedLayout ? 'fixed' : 'auto'}`;
    },

    _getGridViewStyles(): string {
        return '';
    },

    onViewResized(): void {
        GridViewTable.superclass.onViewResized.apply(this, arguments);

        // Обновление авто-высоты контента, в IE иначе не работает.
        this._fixIETableCellAutoHeightBug();
    },

    _fixIETableCellAutoHeightBug(): void {
        if (typeof window === 'undefined') {
            return;
        }

        const setStyles = (styles: string): void => {
            // Контрол может быть разрушен к моменту следующего animationFrame,
            // используем именно такую проверку, т.к. запоминание таймера и очистка
            // его гораздо медленнее и вызовет дополнительные скачки.
            if (!this._destroyed && 'redrawWrapperStyles' in this._children) {
                this._children.redrawWrapperStyles.innerHTML = styles;
            }
        };

        // Данная конструкция "пересчелкивает" высоту блока, довольно безопасно, без скачков.
        // В IE td поддерживает position: relative лишь частично, который так нужен для
        // позиционирования абсолютных частей элементов(actions, marker).
        // Не поддерживается автовысота, она считается только когда действительно поменялась высота стилями.
        window.requestAnimationFrame(() => {
            setStyles('.controls-Grid_table-layout .controls-Grid__row-cell__content { flex-basis: 100% }');
            window.requestAnimationFrame(() => {
                setStyles('');
            });
        });
    }
});

export default GridViewTable;
