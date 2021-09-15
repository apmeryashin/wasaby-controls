import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {PositionSourceMock} from 'Controls-demo/list_new/DemoHelpers/PositionSourceMock';

import * as Template from 'wml!Controls-demo/list_new/Grouped/WithPositionNavigation/WithPositionNavigation';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _viewSource: PositionSourceMock;
    protected _position: number = 90;

    protected _beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._viewSource = new PositionSourceMock({keyProperty: 'key'});
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
