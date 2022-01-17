import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/OpenUrl/Template';
import {Memory} from 'Types/source';
import {MaskResolver} from 'Router/router';

function convertUrl(url: string): string {
    return MaskResolver.calculateHref('Controls-demo/app/:app', {app: url});
}

const DATA = [
    {
        key: 1,
        title: 'В этом списке',
        url: convertUrl('Controls-demo/list_new/OpenUrl/Pages/First')
    },
    {
        key: 2,
        title: 'При нажатии на записи',
        url: convertUrl('Controls-demo/list_new/OpenUrl/Pages/Second')
    },
    {
        key: 3,
        title: 'Средней кнопкой',
        url: convertUrl('Controls-demo/list_new/OpenUrl/Pages%2FThird')
    },
    {
        key: 4,
        title: 'Открываются новые вкладки. А если нажать на ссылку www.google.com, то откроется она.',
        url: convertUrl('Controls-demo/list_new/OpenUrl/Pages/Fourth')
    }
];
export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: DATA
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
