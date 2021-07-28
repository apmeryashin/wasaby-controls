import { GridFooterCell, IGridFooterCellOptions } from 'Controls/grid';
import TreeGridFooterRow, {ITreeGridFooterRowAspectOptions} from './TreeGridFooterRow';

export interface ITreeGridFooterCellOptions extends IGridFooterCellOptions, ITreeGridFooterRowAspectOptions {}

/**
 * Ячейка футера иерархической коллекции
 */
export default class TreeGridFooterCell<TOwner extends TreeGridFooterRow> extends GridFooterCell<TOwner> {
   /**
    * Признак, означающий что нужно рисовать отступ вместо экспандеров
    * @protected
    */
   protected _$displayExpanderPadding: boolean;

   getWrapperClasses(
      backgroundColorStyle: string,
      templateHighlightOnHover: boolean
   ): string {
      const classes = super.getWrapperClasses(backgroundColorStyle, templateHighlightOnHover);
      return `${classes} ${this._getExpanderPaddingClasses('cellWrapper')}`;
   }

    getContentClasses(): string {
       return `${super.getContentClasses()} ${this._getExpanderPaddingClasses('contentWrapper')}`;
    }

   // region HasNodeWithChildren

   setDisplayExpanderPadding(displayExpanderPadding: boolean): void {
      if (this._$displayExpanderPadding !== displayExpanderPadding) {
         this._$displayExpanderPadding = displayExpanderPadding;
         this._nextVersion();
      }
   }

   // endregion HasNodeWithChildren

   private _shouldDisplayExpanderPadding(): boolean {
      const isFirstColumnWithCorrectingForCheckbox = this._$owner.hasMultiSelectColumn() ?
          this.getColumnIndex() === 1 : this.isFirstColumn();
      return isFirstColumnWithCorrectingForCheckbox && this._$displayExpanderPadding;
   }

   private _getExpanderPaddingClasses(target: 'cellWrapper' | 'contentWrapper'): string {
       // Отступ под экспандер. При табличной верстки корневой блок ячейки - <td>, который не поддерживает
       // отступы. В таком случае, отступ применяется на обертке контента ячейки.
       if (this._shouldDisplayExpanderPadding() && (
           this._$owner.isFullGridSupport() ? target === 'cellWrapper' : target === 'contentWrapper'
       )) {
           const expanderSize = this.getOwner().getExpanderSize() || 'default';
           return `controls-TreeGridView__expanderPadding-${expanderSize}`;
       }
       return '';
   }
}

Object.assign(TreeGridFooterCell.prototype, {
   '[Controls/treeGrid:TreeGridFooterCell]': true,
   _moduleName: 'Controls/treeGrid:TreeGridFooterCell',
   _instancePrefix: 'tree-grid-footer-cell-',
   _$displayExpanderPadding: true
});
