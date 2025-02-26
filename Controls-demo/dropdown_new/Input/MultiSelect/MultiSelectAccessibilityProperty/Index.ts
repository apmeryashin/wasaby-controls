import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as controlTemplate from 'wml!Controls-demo/dropdown_new/Input/MultiSelect/MultiSelectAccessibilityProperty/Index';
import {Memory} from 'Types/source';
import {MultiSelectAccessibility} from 'Controls/dropdown';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;
    protected _items: object[];
    protected _navigation: object;
    protected _selectedKeys: number[] = [1, 3];

    protected _beforeMount(): void {
        this._navigation = {
            view: 'page',
            source: 'page',
            sourceConfig: {
                pageSize: 4,
                page: 0,
                hasMore: false
            }
        };

        this._items = [
            {
                key: 1,
                title: 'Banking and financial services, credit',
                checkBoxState: MultiSelectAccessibility.disabled },
            {
                key: 2,
                title: 'Gasoline, diesel fuel, light oil products',
                comment: 'comment',
                checkBoxState: MultiSelectAccessibility.disabled},
            { key: 3, title: 'Transportation, logistics, customs' },
            { key: 4, title: 'Oil and oil products', comment: 'comment' },
            { key: 5, title: 'Pipeline transportation services', comment: 'comment' },
            {
                key: 6,
                title: 'Services in tailoring and repair of clothes, textiles',
                checkBoxState: MultiSelectAccessibility.hidden
            },
            {
                key: 7,
                title: 'Computers and components, computing, office equipment',
                checkBoxState: MultiSelectAccessibility.hidden
            }
        ];

        this._source = new Memory({
            data: this._items,
            keyProperty: 'key'
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
