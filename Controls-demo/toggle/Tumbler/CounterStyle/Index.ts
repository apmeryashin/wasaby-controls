import {Control, TemplateFunction} from 'UI/Base';
import * as Template from "wml!Controls-demo/toggle/Tumbler/CounterStyle/CounterStyle";
import {RecordSet} from 'Types/collection';

interface CounterStyleItem {
    style: string;
    items: RecordSet;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items: CounterStyleItem[] = [];
    protected _selectedKey: string = '1';

    protected _beforeMount(): void {
        const styles = ['secondary', 'primary', 'warning', 'danger', 'unaccented', 'link', 'label', 'info', 'default']
        styles.forEach(style=>{
            this._items.push({
                style,
                items: new RecordSet({
                    rawData: [
                    {
                        id: '1',
                        caption: 'Название 1',
                        count: 10,
                        counter: 15,
                        counterStyle: style
                    },
                    {
                        id: '2',
                        caption: 'Название 2'
                    }
                ]})
            });
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
