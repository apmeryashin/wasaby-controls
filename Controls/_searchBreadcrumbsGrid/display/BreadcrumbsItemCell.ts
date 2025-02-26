import { GridDataCell } from 'Controls/grid';
import { Model } from 'Types/entity';
import BreadcrumbsItemRow from 'Controls/_searchBreadcrumbsGrid/display/BreadcrumbsItemRow';
import { TemplateFunction } from 'UI/Base';
import {IOptions as IDataCellOptions} from 'Controls/_grid/display/DataCell';

export interface IOptions<T> extends IDataCellOptions<T> {
   breadCrumbsMode?: 'row' | 'cell';
}

export default class BreadcrumbsItemCell<S extends Model, TOwner extends BreadcrumbsItemRow<S>>
    extends GridDataCell<any, any> {
   protected _$breadCrumbsMode: 'row' | 'cell';

   readonly listInstanceName: string = 'controls-SearchBreadcrumbsGrid';

   readonly listElementName: string = 'cell';

   getTemplate(): TemplateFunction|string {
      // Только в первой ячейке отображаем хлебную крошку
      if (this.isFirstColumn() || this.getOwner().hasMultiSelectColumn() && this.getColumnIndex() === 1) {
         return this.getOwner().getCellTemplate();
      } else {
         if (this._$breadCrumbsMode === 'cell') {
            return super.getTemplate();
         } else {
            return this._defaultCellTemplate;
         }
      }
   }

   getDefaultDisplayValue(): string {
      return '';
   }

   getDisplayValue(): string {
      return this.getDefaultDisplayValue();
   }

   getSearchValue(): string {
      return this.getOwner().getSearchValue();
   }

   getContents(): S[] {
      return this.getOwner().getContents();
   }

   getKeyProperty(): string {
      return this.getOwner().getKeyProperty();
   }

   getWrapperClasses(theme: string,
                     backgroundColorStyle: string,
                     style: string = 'default',
                     templateHighlightOnHover?: boolean,
                     templateHoverBackgroundStyle?: string): string {
      return super.getWrapperClasses(backgroundColorStyle, templateHighlightOnHover, templateHoverBackgroundStyle)
         + ' controls-TreeGrid__row__searchBreadCrumbs js-controls-ListView__notEditable';
   }

   getContentClasses(): string {
      // Только в первой ячейке выводятся хлебные крошки
      if (this.isFirstColumn() || this.getOwner().hasMultiSelectColumn() && this.getColumnIndex() === 1) {
         let classes = 'controls-Grid__row-cell__content controls-Grid__row-cell__content_colspaned ';

         if (!this.getOwner().hasMultiSelectColumn()) {
            classes += `controls-Grid__cell_spacingFirstCol_${this.getOwner().getLeftPadding()} `;
         }

         classes += `controls-Grid__row-cell_rowSpacingTop_${this.getOwner().getTopPadding()} `;
         classes += `controls-Grid__row-cell_rowSpacingBottom_${this.getOwner().getBottomPadding()} `;

         if (this.isLastColumn()) {
            classes += `controls-Grid__cell_spacingLastCol_${this.getOwner().getRightPadding()} `;
         } else {
            classes += ' controls-Grid__cell_spacingRight';
         }

         return classes;
      } else {
         return super.getContentClasses();
      }
   }

   shouldDisplayEditArrow(contentTemplate?: TemplateFunction): boolean {
      if (!!contentTemplate || this.getColumnIndex() > 0) {
         return false;
      }
      const contents = this._$owner.getLast().getContents();
      return this._$owner.editArrowIsVisible(contents);
   }

   getDisplayProperty(): string {
      return this._$owner.getDisplayProperty();
   }

   getBreadCrumbsMode(): 'row' | 'cell' {
      return this._$breadCrumbsMode;
   }
}

Object.assign(BreadcrumbsItemCell.prototype, {
   '[Controls/_searchBreadcrumbsGrid/BreadcrumbsItemCell]': true,
   _moduleName: 'Controls/searchBreadcrumbsGrid:BreadcrumbsItemCell',
   _instancePrefix: 'search-breadcrumbs-grid-cell-',
   _$breadCrumbsMode: 'row'
});
