import {default as HistorySource} from 'Controls/_history/Source';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {TKey} from 'Controls/interface';

export interface IHistoryControllerOptions {
    source: HistorySource;
    keyProperty: string;
}

export default class HistoryController {
    protected _source: HistorySource = null;
    protected _options: IHistoryControllerOptions;

    constructor(options: IHistoryControllerOptions) {
        this._options = options;
        this._source = options.source;
    }

    togglePin(item: Model): Promise<void | Error> {
        const originalItem = HistoryController._getOriginalItem(item, this._options.keyProperty, this._source);
        return this._source.update(originalItem, {
            $_pinned: !originalItem.get('pinned')
        }).catch((error: Error) =>  error);
    }

    getItems(): RecordSet {
        return this._source.getItems();
    }

    getHistoryId(): string {
        return this._source.getHistoryId();
    }

    getRoot(): TKey {
        return this._source.getRoot();
    }

    private static _getOriginalItem(item: Model, keyProperty: string, source: HistorySource): Model {
        return source.resetHistoryFields(item, keyProperty);
    }
}
