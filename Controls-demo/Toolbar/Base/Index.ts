import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/Toolbar/Base/Template');
import {Memory, Record} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {data} from '../resources/toolbarItems';

class Base extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _buttonsSource: Memory;
    protected _toolButtonsSource: Memory;
    protected _toolButtonsSource2: RecordSet;
    protected _currentClick: string;

    protected _beforeMount(): void {
        this._buttonsSource = new Memory({
            keyProperty: 'id',
            data: data.getDefaultItemsWithoutToolButton()
        });
        this._toolButtonsSource = new Memory({
            keyProperty: 'id',
            data: data.getDefaultItems()
        });
        this._toolButtonsSource2 = new RecordSet({
            keyProperty: 'id',
            rawData: [
                {
                    id: '1',
                    icon: 'icon-Print',
                    title: 'Распечатать',
                    caption: 'Распечатать',
                    viewMode: 'link',
                    readOnly: false,
                    '@parent': false,
                    parent: null
                }
            ]
        });
    }

    protected _itemClick(e: Event, item: Record): void {
        this._currentClick = 'Вы нажали на ' + item.getId();
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Base;
