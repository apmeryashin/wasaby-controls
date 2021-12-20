import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import * as template from 'wml!Controls/_newBrowser/navigation/Navigation';
import { RecordSet } from 'Types/collection';
import { Memory } from 'Types/source';
import { TKey } from 'Controls/interface';

interface INavigationControlOptions extends IControlOptions {
    items: RecordSet;
    root: TKey;
    parentProperty: string;
}

export default class Navigation<T = unknown> extends Control<INavigationControlOptions> {
    protected _template: TemplateFunction = template;

    protected _rootDirectories: RecordSet;
    protected _activeDirectoryKey: TKey;

    protected _subdirectories: Memory;
    protected _activeSubdirectoryKey: TKey;

    protected _beforeMount(options?: INavigationControlOptions, contexts?: object, receivedState?: void): void {
        // todo fix it
        this._activeDirectoryKey = 1;
        this._activeSubdirectoryKey = 11;

        this._prepareRootItems(options);
        this._prepareChildSource(options, this._activeDirectoryKey);
    }

    protected _prepareRootItems(params: INavigationControlOptions): void {
        const items = [];
        params.items.forEach((item) => {
            if (item.get(params.parentProperty) === params.root) {
                items.push(item.getRawData());
            }
        });
        this._rootDirectories = new RecordSet({
            keyProperty: params.items.getKeyProperty(),
            adapter: params.items.getAdapter(),
            rawData: items,
            format: params.items.getFormat()
        });
    }

    protected _prepareChildSource(params: INavigationControlOptions, rootMarkedKey: TKey): void {
        const items = [];
        params.items.forEach((item) => {
            // todo parent???
            if (item.get(params.parentProperty || 'parent') === rootMarkedKey) {
                items.push(item.getRawData());
            }
        });
        this._subdirectories = new Memory({
            keyProperty: params.items.getKeyProperty(),
            adapter: params.items.getAdapter(),
            data: items
        });
    }
}
