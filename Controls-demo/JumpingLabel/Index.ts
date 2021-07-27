import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {_companies} from 'Controls-demo/Lookup/DemoHelpers/DataCatalog';
import controlTemplate = require('wml!Controls-demo/JumpingLabel/JumpingLabel');
import selectorTemplate = require('Controls-demo/Lookup/FlatListSelector/FlatListSelector');

import 'Controls/input';

class JumpingLabel extends Control<IControlOptions> {
    private _name: string = 'Maxim';
    protected _selectorTemplate: object;
    private _source: Memory = new Memory({
        data: _companies,
        idProperty: 'id',
        filter: (item) => Boolean(item)
    });
    protected _beforeMount(): void {
        this._selectorTemplate = {
            templateName: selectorTemplate,
            templateOptions: {
                headingCaption: 'Выберите организацию'
            },
            popupOptions: {
                width: 500
            }
        };
    }
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default JumpingLabel;
