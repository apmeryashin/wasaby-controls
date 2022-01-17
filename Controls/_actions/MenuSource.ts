import {Memory, Query, FilterExpression} from 'Types/source';
import {RecordSet} from 'Types/collection';
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
            const action = this._collection.getActionByParentItemKey(where.parent);
            return action.getChildren(where.parent, query).then((result) => {
                this._collection.addChildItems(where.parent, result);
                return result;
            });
        } else {
            return Promise.resolve(new RecordSet({
                keyProperty: 'id',
                rawData: this._collection.getMenuItems()
            }));
        }
    }
}
