import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Navigation/Paging/End/Default/End';
import {Memory} from 'Types/source';
import {generateData} from '../../../../DemoHelpers/DataCatalog';

const MAX_ELEMENTS_COUNT: number = 60;
const TIMEOUT = 20;

/**
 * Отображение пейджинга с одной командой прокрутки. Отображается только кнопка в конец.
 */
export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _dataArray: unknown = generateData({count: MAX_ELEMENTS_COUNT, entityTemplate: {title: 'lorem'}});

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: this._dataArray
        });
    }

    protected _afterMount(): void {
        setTimeout(() => {
            this._children.list.scrollToItem(MAX_ELEMENTS_COUNT - 1, 'bottom', true);
        }, TIMEOUT);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
