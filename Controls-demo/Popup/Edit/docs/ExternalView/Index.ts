import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import template = require('wml!Controls-demo/Popup/Edit/docs/ExternalView/Template');
import 'css!Controls-demo/Controls-demo';

class ExternalView extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _viewSource: Memory;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: '0',
                    name: 'Ivan',
                    origin: 'Yaroslavl',
                    position: 'Software engineer',
                    additionalInfo: 'Hardworking and energetic specialist'
                }
            ]
        });
    }
}
export default ExternalView;
