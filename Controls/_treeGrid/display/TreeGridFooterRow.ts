import { GridFooterRow, IGridFooterRowOptions } from 'Controls/grid';
import TreeGridFooterCell, {ITreeGridFooterCellOptions} from './TreeGridFooterCell';

export interface ITreeGridFooterRowOptions extends IGridFooterRowOptions, ITreeGridFooterRowAspectOptions { }

export interface ITreeGridFooterRowAspectOptions {
   displayExpanderPadding: boolean;
}

/**
 * Строка футера иерархической коллекции
 */
export default class TreeGridFooterRow extends GridFooterRow {
   /**
    * Признак, означающий что нужно рисовать отступ вместо экспандеров
    */
   protected _$displayExpanderPadding: boolean;

   getExpanderSize(): string {
      return this.getOwner().getExpanderSize();
   }

   getExpanderIcon(): string {
      return this.getOwner().getExpanderIcon();
   }

   getExpanderPosition(): string {
      return this.getOwner().getExpanderPosition();
   }

   getExpanderVisibility(): string {
      return this.getOwner().getExpanderVisibility();
   }

   // region DisplayExpanderPadding

   setDisplayExpanderPadding(displayExpanderPadding: boolean): void {
      if (this._$displayExpanderPadding !== displayExpanderPadding) {
         this._$displayExpanderPadding = displayExpanderPadding;

         this._updateColumnsDisplayExpanderPadding(displayExpanderPadding);

         this._nextVersion();
      }
   }

   protected _updateColumnsDisplayExpanderPadding(displayExpanderPadding: boolean): void {
      // После пересчета displayExpanderPadding _$columnItems могут быть не созданы, т.к. они создаются лениво
      if (this._$columnItems) {
         this._$columnItems.forEach((cell: TreeGridFooterCell<TreeGridFooterRow>) => {
            if (cell['[Controls/treeGrid:TreeGridFooterCell]']) {
               cell.setDisplayExpanderPadding(displayExpanderPadding);
            }
         });
      }
   }

   // endregion DisplayExpanderPadding

   getColumnsFactory(): (options: ITreeGridFooterCellOptions) => TreeGridFooterCell<TreeGridFooterRow> {
      const superFactory = super.getColumnsFactory();
      return (options: ITreeGridFooterCellOptions) => {
         options.displayExpanderPadding = this._$displayExpanderPadding;
         return superFactory.call(this, options);
      };
   }
}

Object.assign(TreeGridFooterRow.prototype, {
   '[Controls/treeGrid:TreeGridFooterRow]': true,
   _moduleName: 'Controls/treeGrid:TreeGridFooterRow',
   _instancePrefix: 'tree-grid-footer-row-',
   _cellModule: 'Controls/treeGrid:TreeGridFooterCell',
   _$displayExpanderPadding: true
});
