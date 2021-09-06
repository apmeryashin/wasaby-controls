import {TKey} from 'Controls/_interface/IItems';
import {LOCAL_MOVE_POSITION} from 'Types/source';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {Tree} from 'Controls/display';

export interface IMoveViewCommandOptions {
    items: TKey[];
    direction: LOCAL_MOVE_POSITION;
    collection: RecordSet;
    target: Model;
    parentProperty: string;
    nodeProperty: string;
    keyProperty: string;
    root: TKey;
}
export default class MoveViewCommand {
    protected _options: IMoveViewCommandOptions;

    constructor(options: IMoveViewCommandOptions) {
        this._options = options;
    }

    _moveToSiblingPosition(id: TKey): void {
        const targetItem = this._getTargetItemById(id);
        return targetItem ? this._move(targetItem, [id]) : null;
    }

    execute(): void {
        if (this._options.direction !== LOCAL_MOVE_POSITION.On) {
            this._moveToSiblingPosition(this._options.items[0]);
        } else {
            return this._move();
        }
    }

    private _hierarchyMove(items: Model[], target: Model): void {
        const targetId = target.getKey();
        items.forEach((item): void => {
            if (item) {
                item.set(this._options.parentProperty, targetId);
            }
        });
    }

    private _reorderMove(collection: RecordSet, items: Model[], target: Model, direction: LOCAL_MOVE_POSITION): void {
        let movedIndex;
        const parentProperty = this._options.parentProperty;
        let targetIndex = collection.getIndex(target);

        items.forEach((item): void => {
            if (item) {
                if (direction === LOCAL_MOVE_POSITION.Before) {
                    targetIndex = collection.getIndex(target);
                }

                movedIndex = collection.getIndex(item);
                if (movedIndex === -1) {
                    collection.add(item);
                    movedIndex = collection.getCount() - 1;
                }

                if (parentProperty && target.get(parentProperty) !== item.get(parentProperty)) {
                    item.set(parentProperty, target.get(parentProperty));
                }

                if (direction === LOCAL_MOVE_POSITION.After && targetIndex < movedIndex) {
                    targetIndex = (targetIndex + 1) < collection.getCount() ? targetIndex + 1 : collection.getCount();
                } else if (direction === LOCAL_MOVE_POSITION.Before && targetIndex > movedIndex) {
                    targetIndex = targetIndex !== 0 ? targetIndex - 1 : 0;
                }
                collection.move(movedIndex, targetIndex);
            }
        });
    }

    private _getTargetItemById(id: TKey): Model | void {
        let display;
        let collectionItem;
        let sublingItem;
        let resultItem;
        if (this._options.parentProperty) {
            display = new Tree({
                collection: this._options.collection,
                keyProperty: this._options.keyProperty,
                parentProperty: this._options.parentProperty,
                nodeProperty: this._options.nodeProperty,
                root: this._options.root
            });
            collectionItem = display.getItemBySourceKey(id);
            sublingItem = this._options.direction === LOCAL_MOVE_POSITION.Before ?
                display.getPrevious(collectionItem) :
                display.getNext(collectionItem);
            resultItem = sublingItem ? sublingItem.getContents() : null;
        } else {
            let itemIndex = this._options.collection.getIndexByValue(this._options.keyProperty, id);
            resultItem = this._options.collection.at(this._options.direction === LOCAL_MOVE_POSITION.Before ?
                --itemIndex : ++itemIndex);
        }

        return resultItem;
    }

    protected _getItemsByKeys(items: TKey[]): Model[] {
        return items.map((key) => {
            return this._options.collection.getRecordById(key);
        });
    }

    protected _moveItems(items: Model[], collection: RecordSet, target: Model, direction: LOCAL_MOVE_POSITION): void {
        if (direction === LOCAL_MOVE_POSITION.On) {
            this._hierarchyMove(items, target);
        } else {
            this._reorderMove(collection, items, target, direction);
        }
    }

    protected _move(target: Model = this._options.target, items: TKey[] = this._options.items): void {
        const moveItems = this._getItemsByKeys(items);
        this._moveItems(moveItems, this._options.collection, target, this._options.direction);
    }
}
