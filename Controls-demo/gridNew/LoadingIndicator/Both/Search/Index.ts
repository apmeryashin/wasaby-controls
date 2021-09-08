import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/LoadingIndicator/Both/Search/Search';
import { IColumn } from 'Controls/grid';
import PortionedSearchMemory from './PortionedSearchMemory';

export default class Explorer extends Control<IControlOptions> {
   protected _template: TemplateFunction = Template;
   protected _viewSource: PortionedSearchMemory;
   protected _filter: object = {};
   protected _columns: IColumn[] = [{ displayProperty: 'title' }];
   protected _position: number = 0;

   protected _beforeMount(): void {
      this._viewSource = new PortionedSearchMemory({keyProperty: 'key'});
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
