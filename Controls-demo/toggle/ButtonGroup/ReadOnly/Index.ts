import {Control, TemplateFunction} from 'UI/Base';
// @ts-ignore
import * as Template from 'wml!Controls-demo/toggle/ButtonGroup/ReadOnly/ReadOnly';
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
                    icon: 'icon-Admin2'
                },
                {
                    id: '2',
                    icon: 'icon-AdminInfo'
                },
                {
                    id: '3',
                    icon: 'icon-Android'
                },
                {
                    id: '4',
                    icon: 'icon-AreaGeom'
                },
                {
                    id: '5',
                    icon: 'icon-AutoTuning'
                }
            ],
            keyProperty: 'id'
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
