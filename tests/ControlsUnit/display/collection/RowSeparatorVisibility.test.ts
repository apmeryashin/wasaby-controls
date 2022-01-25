import {assert} from 'chai';
import {Collection} from 'Controls/display';
import {RecordSet} from 'Types/collection';
import {createSandbox} from 'sinon';

describe('Controls/_display/collection/RowSeparatorVisibility', () => {
    let collection = Collection;
    const sandBox = createSandbox();

    afterEach(() => {
        sandBox.restore();
    });

    describe('setRowSeparatorVisibility', () => {

        beforeEach(() => {
            const recordSet = new RecordSet({
                rawData: [
                    {key: 0},
                    {key: 1},
                    {key: 2}
                ]
            });
            collection = new Collection({
                keyProperty: 'key',
                collection: recordSet,
                rowSeparatorSize: 's'
            });
        });

        describe('edges', () => {
            beforeEach(() => {
                collection.setRowSeparatorVisibility('edges');
            });

            it('set top separator', () => {
                assert.isTrue(collection.at(0).isTopSeparatorEnabled());
                assert.isFalse(collection.at(1).isTopSeparatorEnabled());
                assert.isFalse(collection.at(2).isTopSeparatorEnabled());
            });

            it('set bottom separator', () => {
                assert.isFalse(collection.at(0).isBottomSeparatorEnabled());
                assert.isFalse(collection.at(1).isBottomSeparatorEnabled());
                assert.isTrue(collection.at(2).isBottomSeparatorEnabled());
            });
        });

        describe('items', () => {
            beforeEach(() => {
                collection.setRowSeparatorVisibility('items');
            });

            it('set top separator', () => {
                assert.isFalse(collection.at(0).isTopSeparatorEnabled());
                assert.isTrue(collection.at(1).isTopSeparatorEnabled());
                assert.isTrue(collection.at(2).isTopSeparatorEnabled());
            });

            it('set bottom separator', () => {
                assert.isFalse(collection.at(0).isBottomSeparatorEnabled());
                assert.isFalse(collection.at(1).isBottomSeparatorEnabled());
                assert.isFalse(collection.at(2).isBottomSeparatorEnabled());
            });
        });

        describe('all (default)', () => {
            beforeEach(() => {
                collection.setRowSeparatorVisibility('all');
            });

            it('set top separator', () => {
                assert.isTrue(collection.at(0).isTopSeparatorEnabled());
                assert.isTrue(collection.at(1).isTopSeparatorEnabled());
                assert.isTrue(collection.at(2).isTopSeparatorEnabled());
            });

            it('set bottom separator', () => {
                assert.isFalse(collection.at(0).isBottomSeparatorEnabled());
                assert.isFalse(collection.at(1).isBottomSeparatorEnabled());
                assert.isTrue(collection.at(2).isBottomSeparatorEnabled());
            });
        });
    });

    describe('setRowSeparatorVisibility with the only record', () => {
        beforeEach(() => {
            const recordSet = new RecordSet({
                rawData: [
                    {key: 0}
                ]
            });
            collection = new Collection({
                keyProperty: 'key',
                collection: recordSet,
                rowSeparatorSize: 's'
            });
        });

        it('edges', () => {
            collection.setRowSeparatorVisibility('edges');
            assert.isTrue(collection.at(0).isTopSeparatorEnabled());
            assert.isTrue(collection.at(0).isBottomSeparatorEnabled());
        });

        it('items', () => {
            collection.setRowSeparatorVisibility('items');
            assert.isFalse(collection.at(0).isTopSeparatorEnabled());
            assert.isFalse(collection.at(0).isBottomSeparatorEnabled());
        });

        it('all (default)', () => {
            collection.setRowSeparatorVisibility('all');
            assert.isTrue(collection.at(0).isTopSeparatorEnabled());
            assert.isTrue(collection.at(0).isBottomSeparatorEnabled());
        });
    });
});
