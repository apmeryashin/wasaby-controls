import {Memory, Query, FilterExpression} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {showType} from 'Controls/toolbars';
import ActionsCollection from './ActionsCollection';

export interface IActionsSourceOptions {
    collection: ActionsCollection;
}
export default class ActionsSource extends Memory {
    protected _collection: ActionsCollection = null;
    constructor(options: IActionsSourceOptions) {
        super();
        this._collection = options.collection;
    }

    query(query?: Query): Promise<RecordSet> {
        const where = query.getWhere() as FilterExpression;
        if (where.parent) {
            const action = this._collection.getActionById(where.parent);
            return action.load(where.parent).then((result) => {
                this._collection.addChildItems(where.parent, result);
                return result;
            });
        } else {
            const menuItems = this._collection.getToolbarItems().filter((item) => {
                return item.showType !== showType.TOOLBAR;
            });
            return Promise.resolve(new RecordSet({
                keyProperty: 'id',
                rawData: menuItems
            }));
        }
    }
}
