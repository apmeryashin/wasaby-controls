import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as controlTemplate from 'wml!Controls-demo/Search/MisspellContainer/Index';
import * as SearchMemory from 'Controls-demo/Search/SearchMemory';
import * as memorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';

export default class FlatList extends Control<IControlOptions> {
   protected _template: TemplateFunction = controlTemplate;
   protected _source: SearchMemory;

   protected _beforeMount(): void {
      this._source = new SearchMemory({
         data: [
            {id: 1, title: 'Разработка'},
            {id: 2, title: 'Продвижение СБИС'},
            {id: 3, title: 'Федеральная клиентская служка'}
         ],
         searchParam: 'title',
         keyProperty: 'id',
         filter: memorySourceFilter('title')
      });
   }
   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
