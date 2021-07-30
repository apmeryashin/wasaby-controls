import {Control, TemplateFunction} from 'UI/Base';
import * as Template from "wml!Controls-demo/toggle/Tumbler/CounterStyle/CounterStyle";
import {RecordSet} from 'Types/collection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items: RecordSet;
    protected _selectedKey: string = '1';

    protected _beforeMount(): void {
        this._items = new RecordSet({
            rawData: [
                {
                    id: '1',
                    caption: 'secondary',
                    counter: 15,
                    counterStyle: 'secondary'
                },
                {
                    id: '2',
                    caption: 'primary',
                    counter: 15,
                    counterStyle: 'primary'
                },
                {
                    id: '3',
                    caption: 'warning',
                    counter: 15,
                    counterStyle: 'warning'
                },
                {
                    id: '4',
                    caption: 'danger',
                    counter: 15,
                    counterStyle: 'danger'
                },
                {
                    id: '5',
                    caption: 'unaccented',
                    counter: 15,
                    counterStyle: 'unaccented'
                },
                {
                    id: '6',
                    caption: 'link',
                    counter: 15,
                    counterStyle: 'link'
                },
                {
                    id: '7',
                    caption: 'label',
                    counter: 15,
                    counterStyle: 'label'
                },
                {
                    id: '8',
                    caption: 'info',
                    counter: 15,
                    counterStyle: 'info'
                },
                {
                    id: '9',
                    caption: 'default',
                    counter: 15,
                    counterStyle: 'default'
                }
            ],
            keyProperty: 'id'
        });
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
