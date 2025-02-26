import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {IColumn} from 'Controls/grid';
import {Tasks} from 'Controls-demo/gridNew/DemoHelpers/Data/Tasks';

import * as Template from 'wml!Controls-demo/gridNew/MarkerClassName/Image/Image';

const imageSizes = {
    l: 40,
    m: 32,
    s: 24,
    xs: 16
};

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _sources: {[p: string]: Memory};
    protected _columns: IColumn[] = Tasks.getColumns();
    protected _padding: string[] = ['default', 's', 'l'];
    protected _imageSizes: string[] = ['l', 'm', 's', 'xs'];

    protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
        this._sources = {
            default: this._getSourceWithImageSize()
        };
        this._sources = this._imageSizes.reduce((obj, size) => ({
            ...obj,
            [size]: this._getSourceWithImageSize(size)
        }), this._sources);
    }

    private _getSourceWithImageSize(imageSize?: string): Memory {
        const data = Tasks.getData().slice(0, 1).map((el) => {
            const newEl = {...el};
            if (imageSizes[imageSize]) {
                newEl.width = `${imageSizes[imageSize]}px`;
            }
            if (imageSizes[imageSize]) {
                newEl.height = `${imageSizes[imageSize]}px`;
            }
            return newEl;
        });
        return new Memory({
            keyProperty: 'key',
            data
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
