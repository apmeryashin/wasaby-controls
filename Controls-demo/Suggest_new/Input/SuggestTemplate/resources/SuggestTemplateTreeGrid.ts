import {Control, TemplateFunction} from 'UI/Base';
// tslint:disable-next-line:max-line-length
import controlTemplate = require('wml!Controls-demo/Suggest_new/Input/SuggestTemplate/resources/SuggestTemplateTreeGrid');

class SuggestTemplateGrid extends Control {
   protected _template: TemplateFunction = controlTemplate;
   protected _columns: object[] = null;

   _beforeMount(): void {
      this._columns = [
         { displayProperty: 'title'}
      ];
   }
}
export default SuggestTemplateGrid;
