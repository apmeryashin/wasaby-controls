import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/breadCrumbs_new/HeadingPath/DisplayMode/Index';
import {Model} from 'Types/entity';

export default class Index extends Control {
    protected _template: TemplateFunction = template;

    protected _items: Model[];

    protected _beforeMount(): void {
        this._items = [
            { id: 1, title: 'Первая папка', parent: null },
            { id: 2, title: 'Вторая папка', parent: 1 },
            { id: 3, title: 'Третья папка', parent: 2 },
            { id: 4, title: 'Четвертая папка', parent: 4 }
        ].map((item) => {
            return new Model({
                rawData: item,
                keyProperty: 'id'
            });
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
