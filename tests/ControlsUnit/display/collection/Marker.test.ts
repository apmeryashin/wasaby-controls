import {IObservable, RecordSet} from 'Types/collection';
import {Collection} from 'Controls/display';
import {assert} from 'chai';
import {SyntheticEvent} from 'Vdom/Vdom';

describe('Controls/display/collection/Marker', () => {
    it('should notify onCollectionChange event', () => {
        const collection = new Collection({
            keyProperty: 'id',
            collection: new RecordSet({ rawData: [ {id: 1} ], keyProperty: 'id' })
        });

        const onCollectionChange = (event: SyntheticEvent, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
            assert.equal(action, IObservable.ACTION_CHANGE);
            assert.equal(newItems.length, 1);
            assert.equal(newItems[0].getContents().getKey(), 1);
            assert.equal(newItems.properties, 'marked');
            assert.equal(oldItems.length, 1);
            assert.equal(oldItems[0].getContents().getKey(), 1);
            assert.equal(oldItems.properties, 'marked');
        };
        collection.subscribe('onCollectionChange', onCollectionChange);
        collection.setMarkedKey(1, true);
    });

    it('set marker on item', () => {
        const collection = new Collection({
            keyProperty: 'id',
            collection: new RecordSet({ rawData: [ {id: 1}, {id: 2} ], keyProperty: 'id' })
        });
        collection.setMarkedKey(1, true);
        assert.isTrue(collection.getItemBySourceKey(1).isMarked());
    });

    it('unset marker on item', () => {
        const collection = new Collection({
            keyProperty: 'id',
            collection: new RecordSet({ rawData: [ {id: 1}, {id: 2} ], keyProperty: 'id' })
        });
        collection.setMarkedKey(1, true);
        assert.isTrue(collection.getItemBySourceKey(1).isMarked());
        collection.setMarkedKey(1, false);
        assert.isFalse(collection.getItemBySourceKey(1).isMarked());
    });
});
