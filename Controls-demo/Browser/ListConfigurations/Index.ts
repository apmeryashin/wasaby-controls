import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import {object} from 'Types/util';
import controlTemplate = require('wml!Controls-demo/Browser/ListConfigurations/ListConfigurations');
import {Memory} from 'Types/source';
import {TKey} from 'Controls/interface';

class Demo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _selectedKeys: TKey[] = [];
    protected _excludedKeys: TKey[] = [];

    protected _beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        const firstListSource = new Memory({
            keyProperty: 'key',
            data: [
                {
                    id: 0,
                    title: 'Sasha'
                },
                {
                    id: 1,
                    title: 'Sergey'
                },
                {
                    id: 2,
                    title: 'Dmitry'
                }
            ]
        });
        const secondListSource = new Memory({
            keyProperty: 'key',
            data: [
                {
                    id: 3,
                    title: 'Yaroslavl'
                },
                {
                    id: 4,
                    title: 'Moscow'
                },
                {
                    id: 5,
                    title: 'Kostroma'
                }
            ]
        });
        this._listConfigurations = [
            {
                id: 'firstList',
                source: firstListSource,
                keyProperty: 'id',
                searchParam: 'title'
            },
            {
                id: 'secondList',
                source: secondListSource,
                keyProperty: 'id',
                searchParam: 'title'
            }
        ];
    }

    private _filterChanged(event: SyntheticEvent, filter: object, listId: string): void {
        this._listConfigurations = object.clone(this._listConfigurations);
        this._getListConfig(listId).filter = filter;
    }

    private _getListConfig(listId) {
        return this._listConfigurations.find(({id}) => id === listId);
    }
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Browser/ListConfigurations/ListConfigurations'];
}

export default Demo;
