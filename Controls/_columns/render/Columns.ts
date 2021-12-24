import { TemplateFunction } from 'UI/Base';
import template = require('wml!Controls/_columns/render/Columns');

import defaultItemTemplate = require('wml!Controls/_columns/render/resources/ItemTemplate');

import {ListView, IList} from 'Controls/baseList';
import ColumnsCollection from 'Controls/_columns/display/Collection';
import {DEFAULT_COLUMNS_COUNT} from '../Constants';
import { IItemPadding } from 'Controls/display';
import 'Controls/listRender';

export interface IColumnsRenderOptions extends IList {
    columnMinWidth: number;
    columnMaxWidth: number;
    columnsMode: 'auto' | 'fixed';
    columnsCount: number;
    spacing: number;
    listModel: ColumnsCollection;
    availableWidth?: number;
    itemsContainerPadding?: IItemPadding;
    itemPadding?: IItemPadding;
}

export default class Columns extends ListView {
    protected _options: IColumnsRenderOptions;
    protected _template: TemplateFunction = template;
    protected _templateKeyPrefix: string;

    protected _beforeMount(options: IColumnsRenderOptions): void {
        super._beforeMount(options);
        this._templateKeyPrefix = 'columns-render';
    }

    protected _afterMount(options: IColumnsRenderOptions): void {
        super._afterMount(options);
        this._resizeHandler();
    }

    protected _beforeUpdate(options: IColumnsRenderOptions): void {
        super._beforeUpdate(options);
        if (options.availableWidth && options.availableWidth !== this._options.availableWidth) {
            this._options.listModel.setCurrentWidth(options.availableWidth, this._options.columnMinWidth);
        }
        if (options.columnsCount !== this._options.columnsCount) {
            this._options.listModel.setColumnsCount(options.columnsCount);
        }
    }

    protected _resizeHandler(): void {

        // Список, скрыт на другой вкладке/панели. Не нужно обрабатывать такой ресайз (сейчас ширина 0)
        if (this._container && this._container.closest && this._container.closest('.ws-hidden')) {
            return;
        }
        const itemsContainer = this.getItemsContainer();
        const currentWidth = itemsContainer.getBoundingClientRect().width;
        this._options.listModel.setCurrentWidth(currentWidth, this._options.columnMinWidth);
    }

    protected _getColumnMinWidth(columnMinWidth: number | void, spacing: number = 0, columnsCount: number): string {
        if (columnMinWidth) {
            return `${columnMinWidth + spacing}px`;
        } else {
            return `calc(${Math.round(100 / columnsCount)}%)`;
        }
    }

    protected _getColumnMaxWidth(columnMaxWidth: number | void, spacing: number): string {
        if (columnMaxWidth) {
            return `${columnMaxWidth + spacing}px`;
        } else {
            return '100%';
        }
    }

    private _getPadding(paddingOption: string): IItemPadding {
        return {
            left: this._options[paddingOption]?.left || 'default',
            right: this._options[paddingOption]?.right || 'default',
            top: this._options[paddingOption]?.top || 'default',
            bottom: this._options[paddingOption]?.bottom || 'default'
        };
    }

    protected _getItemsPaddingContainerClasses(): string {
        let classes = ' controls-ColumnsView__itemPaddingContainer';

        const prefix = ' controls-ColumnsView__itemsPaddingContainer_spacing';
        const itemPadding = this._getPadding('itemPadding');
        if (this._options.itemsContainerPadding) {
            const itemsContainerPadding = this._getPadding('itemsContainerPadding');
            classes += `${prefix}Left_${itemsContainerPadding.left}_itemPadding_${itemPadding.left}`;
            classes += `${prefix}Right_${itemsContainerPadding.right}_itemPadding_${itemPadding.right}`;
            classes += `${prefix}Top_${itemsContainerPadding.top}_itemPadding_${itemPadding.top}`;
            classes += `${prefix}Bottom_${itemsContainerPadding.bottom}_itemPadding_${itemPadding.bottom}`;
        } else {
            classes += `${prefix}Left_${itemPadding.left}`;
            classes += `${prefix}Right_${itemPadding.right}`;
            classes += `${prefix}Top_${itemPadding.top}`;
            classes += `${prefix}Bottom_${itemPadding.bottom}`;
        }
        return classes;
    }

    protected _getColumnPaddingClasses(): string {
        let classes = '';
        const itemPadding = this._getPadding('itemPadding');
        classes += ` controls-ColumnsView__item_spacingLeft_${itemPadding.left}`;
        classes += ` controls-ColumnsView__item_spacingRight_${itemPadding.right}`;
        return classes;
    }

    protected _getItemsContainerStyle(): string {
        const spacing = this._options.listModel.getSpacing();
        const columnsCount = this._options.listModel.getColumnsCount();
        const columnMinWidth = this._getColumnMinWidth(this._options.columnMinWidth, spacing, columnsCount);
        const columnMaxWidth = this._getColumnMaxWidth(this._options.columnMaxWidth, spacing);
        const minmax = `minmax(${columnMinWidth}, ${columnMaxWidth}) `;
        const gridTemplate = minmax.repeat(columnsCount);
        return `grid-template-columns: ${gridTemplate};
                -ms-grid-columns: ${gridTemplate};`;
    }
    protected _getMinMaxWidthStyle(min: number, max: number): string {
        const spacing = this._options.listModel.getSpacing();
        const columnsCount = this._options.listModel.getColumnsCount();
        const columnMinWidth = this._getColumnMinWidth(min, spacing, columnsCount);
        const columnMaxWidth = this._getColumnMaxWidth(max, spacing);
        return `min-width:${columnMinWidth}; max-width:${columnMaxWidth}px; `;
    }
    protected _getPlaceholderStyle(): string {
        return this._getMinMaxWidthStyle(this._options.columnMinWidth, this._options.columnMaxWidth);
    }

    protected _getColumnStyle(index: number): string {
        return this._getMinMaxWidthStyle(this._options.columnMinWidth, this._options.columnMaxWidth)
               + `-ms-grid-column: ${index + 1};`;
    }

    static getDefaultOptions(): Partial<IColumnsRenderOptions> {
        return {
            itemTemplate: defaultItemTemplate,
            columnsMode: 'auto',
            columnsCount: DEFAULT_COLUMNS_COUNT
        };
    }
}

Object.defineProperty(Columns, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Columns.getDefaultOptions();
   }
});

/**
 * Имя сущности для идентификации списка.
 */
Object.defineProperty(Columns.prototype, 'listInstanceName', {
    value: 'controls-Columns',
    writable: false
});
