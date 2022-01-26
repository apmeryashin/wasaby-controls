import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Searching/PortionedSearchUp/PortionedSearchUp';
import PortionedSearchMemory from './PortionedSearchMemory';
import {SyntheticEvent} from 'UI/Vdom';
import {Memory} from 'Types/source';

// Необходимо для автотестов
import { SetTimeoutMocker } from 'Controls-demo/Utils/SetTimeoutMocker';
SetTimeoutMocker.initialize();

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: PortionedSearchMemory = null;
    protected _filter: Object = null;
    protected _position: number = 0;
    protected _initialScrollPosition = {
        vertical: 'end'
    };

    protected _longLoad: boolean = false;
    protected _fastLoad: boolean = false;
    private _fastFilterData: any;

    protected _beforeMount(): void {
        this._viewSource = new PortionedSearchMemory({keyProperty: 'key'});
        this._filter = {};
        this._fastFilterData = [{
            name: 'filter',
            value: null,
            resetValue: null,
            emptyText: 'Все',
            editorOptions: {
                source: new Memory({
                    keyProperty: 'id',
                    data: [
                        {id: 'few-items', title: 'Мало записей'}
                    ]
                }),
                displayProperty: 'title',
                keyProperty: 'id'
            },
            viewMode: 'frequent'
        }];
    }

    protected _longLoadChangedHandler(event: SyntheticEvent, newValue: boolean): void {
        this._viewSource.setLongLoad(newValue);
        this._fastLoad = false;
    }

    protected _fastLoadChangedHandler(event: SyntheticEvent, newValue: boolean): void {
        this._viewSource.setFastLoad(newValue);
        this._longLoad = false;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
