import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_search/Input/ExpandableInput/Search');
import {EventUtils} from 'UI/Events';
import {ITextOptions, IBaseOptions} from 'Controls/input';
import {IRenderOptions, IPaddingOptions, ITagOptions} from 'Controls/interface';
import {Input} from 'Controls/search';
import 'css!Controls/search';

interface IExpandableInputOptions extends IBaseOptions, ITextOptions,
 IRenderOptions, IPaddingOptions, ITagOptions {
   /**
    * @name Controls/_search/Input/ExpandableInput/ExpandableInput#inlineWidth
    * @cfg {String} Ширина строки поиска.
    * @variant s Строка поиска малой ширины.
    * @variant l Строка поиска большой ширины.
    * @default s
    */
   inlineWidth?: string;
   /**
    * @name Controls/_search/Input/ExpandableInput/ExpandableInput#expanded
    * @cfg {Boolean} Состояние развернутости строки поиска.
    * @variant false Строка поиска свернута.
    * @variant true Строка поиска развернута.
    * @default false
    */
   expanded?: boolean;

    /**
     * @name Controls/_search/Input/ExpandableInput/ExpandableInput#searchInputContrastBackground
     * @cfg {Boolean} Определяет контрастность фона строки поиска.
     * @variant false Фон строки поиска неконтрастный.
     * @variant true Фон строки поиска контрастный.
     * @default false
     * @demo Controls-demo/Search/ExpandableInput/SearchInputContrastBackground/Index
     */
    searchInputContrastBackground?: string;
}
/**
 * Контрол "Разворачиваемый поиск". Является однострочным полем ввода. Контрол используют в реестрах для ввода поискового запроса.
 *
 * @extends UI/Base:Control
 * @implements Controls/search:Input
 * @implements Controls/search:IExpandableInput
 * @public
 * @demo Controls-demo/Search/ExpandableInput/Index
 * @author Мельникова Е.А.
 */

export default class ExpandableInput extends Control<IControlOptions> {
   protected _expanded: boolean = false;
   protected _template: TemplateFunction = template;
   protected _tmplNotify: Function = EventUtils.tmplNotify;
   protected _needShowAnimation: boolean = false;
   protected _children: {
      searchInput: Input
   };

   protected _beforeMount(options: IExpandableInputOptions): void {
      this._expanded = this._getExpanded(options.expanded);
   }

   reset(): void {
      if (this._expanded) {
         this._children.searchInput.reset();
      }
   }

   protected _animationendHandler(): void {
      this._needShowAnimation = false;
   }

   private _getExpanded(expanedOption?: boolean): boolean {
      return typeof expanedOption !== 'undefined' ? expanedOption : this._expanded;
   }

   protected _afterUpdate(): void {
      if (this._expanded) {
         this._children.searchInput.activate({enableScreenKeyboard: true});
      }
   }

   protected _handleOpenClick(): void {
      this._expanded = true;
      this._needShowAnimation = true;
   }

   protected _handleCloseClick(): void {
      this._expanded = false;
      this._needShowAnimation = true;
      this._notify('valueChanged', ['']);
   }

   static getDefaultOptions(): object {
      return {
         inlineWidth: 's',
         expanded: false
      };
   }
}

Object.defineProperty(ExpandableInput, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return ExpandableInput.getDefaultOptions();
   }
});
