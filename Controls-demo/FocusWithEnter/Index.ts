import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import template = require('wml!Controls-demo/FocusWithEnter/FocusWithEnter');

import 'wml!Controls-demo/gridNew/EditInPlace/EditingCell/_cellEditor';
import {Editing} from 'Controls-demo/gridNew/DemoHelpers/Data/Editing';
import {IColumnRes} from 'Controls-demo/gridNew/DemoHelpers/DataCatalog';
import {RecordSet} from 'Types/collection';

class FocusWithEnter extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _comboboxSource: Memory = null;
    protected _handbookSource: Memory = null;
    protected _gridSource: Memory = null;
    protected _markedKey: string | number = null;
    protected _gridColumns: IColumnRes[] = Editing.getEditingColumns();
    protected _keyProperty: string = 'id';
    protected _displayProperty: string = 'title';
    protected _dateValue: Date = null;
    protected _textValue: string = 'some text';
    protected _numberValue1: number = 0;
    protected _numberValue2: number = 0;
    protected _phoneValue: string = '8888888888';
    protected _flagValue: boolean = false;
    protected _handbookSelectedKeys: string[];
    protected _selectedKey: string | null = '1';
    protected _selectedKey1: string | null = '1';

    protected _radioGroupSelectedKey: string = '1';
    protected _radioGroupSource: Memory;
    protected _items1: RecordSet;

    protected _beforeMount(cfg: IControlOptions): void {
        this._dateValue = new Date();
        this._handbookSelectedKeys = ['1'];
        this._items1 = new RecordSet({
            rawData: [
                {
                    id: '1',
                    caption: 'Название 1'
                },
                {
                    id: '2',
                    caption: 'Название 2'
                }
            ],
            keyProperty: 'id'
        });
        this._radioGroupSource = new Memory({
            keyProperty: 'id',
            displayProperty: 'caption',
            data: [{
                id: '1',
                title: 'State1',
                caption: 'Additional caption1'
            }, {
                id: '2',
                title: 'State2',
                caption: 'Additional caption2',
                readOnly: true
            }, {
                id: '3',
                title: 'State3',
                caption: 'Additional caption3'
            }]
        });

        const sourceRawData = [{ id: '1', title: 'Красный', description: 'Стоп!'},
            { id: '2', title: 'Желтый', description: 'Жди!'},
            { id: '3', title: 'Зеленый', description: 'Поехали!'}];

        this._comboboxSource = new Memory({ keyProperty: this._keyProperty, data: sourceRawData });
        this._handbookSource = new Memory({ keyProperty: this._keyProperty, data: sourceRawData });

        this._gridSource = new Memory({
            keyProperty: 'key',
            data: Editing.getEditingData()
        });
    }

    /**
     * Обрабатывает событие активации контрола, когда фокус приходит на fakeFocusElem, с которого не ловится enter.
     * Если фокус пришел на таблицу с записями ставим маркер на первую.
     */
    protected _activatedHandler(): void {
        if (document.activeElement.className.includes('controls-BaseControl__fakeFocusElem')) {
            this._markedKey = Editing.getEditingData()[0].key;
        }
    }

    /**
     * Происходит при деактивации контрола
     */
    protected _deactivatedHandler(): void {
        this._markedKey = null;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/FocusWithEnter/FocusWithEnter'];
}
export default FocusWithEnter;
