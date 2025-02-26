import { assert } from 'chai';
import { RecordSet } from 'Types/collection';
import { Model } from 'Types/entity';
import * as sinon from 'sinon';
import { GridCollection } from 'Controls/grid';
import Header from 'Controls/_grid/display/Header';

describe('Controls/grid_clean/Display/Grid/getHeader', () => {

    describe('headerVisibility', () => {

        describe('hasData', () => {
            /*-
             1. Создаём коллекцию на основе рекордсета (с header), в которой 1 запись и headerVisibility = hasData
             2. проверяем, что шапка есть
             3. Удаляем одну запись
             4. проверяем, что шапки нет
             */
            it('should remove the header when the only record has removed', () => {
                const recordSet = new RecordSet({
                    keyProperty: 'id',
                    rawData: [
                        {id: 1}
                    ]
                });
                const collection = new GridCollection({
                    collection: recordSet,
                    columns: [{ width: ''}],
                    header: [{ caption: ''}],
                    headerVisibility: 'hasdata'
                });

                assert.isTrue(!!collection.getHeader());

                recordSet.removeAt(0);

                assert.isFalse(!!collection.getHeader());
            });

            /*
             1. Создаём коллекцию на основе рекордсета (с header), в которой 0 записей и headerVisibility = hasData
             2. проверяем, что шапки нет
             3. + одну запись
             4. проверяем, что шапка есть
            */
            it('should add the header when a record has added', () => {
                const recordSet = new RecordSet({
                    keyProperty: 'id',
                    rawData: []
                });
                const collection = new GridCollection({
                    collection: recordSet,
                    columns: [{ width: ''}],
                    header: [{ caption: ''}],
                    headerVisibility: 'hasdata'
                });

                assert.isFalse(!!collection.getHeader());

                recordSet.add(new Model({
                    rawData: {id: 0},
                    keyProperty: 'id'
                }));

                assert.isTrue(!!collection.getHeader());
            });

            /*
             1. Создаём коллекцию на основе рекордсета (с header), в которой 2 записей и headerVisibility = hasData
             2. проверяем, что шапка есть
            */
            it('should not remove header when a record has removed', () => {
                const recordSet = new RecordSet({
                    keyProperty: 'id',
                    rawData: [
                        {id: 1},
                        {id: 2}
                    ]
                });
                const collection = new GridCollection({
                    collection: recordSet,
                    columns: [{ width: ''}],
                    header: [{ caption: ''}],
                    headerVisibility: 'hasdata'
                });

                assert.isTrue(!!collection.getHeader());

                recordSet.removeAt(1);

                assert.isTrue(!!collection.getHeader());
            });

            // обновляем шапку, проверяем, что columnSeparator проставился
            it('set columnSeparator on columns update', () => {
                const recordSet = new RecordSet({
                    keyProperty: 'id',
                    rawData: [
                        {id: 1, title: ''},
                        {id: 2, title: ''}
                    ]
                });
                const collection = new GridCollection({
                    collection: recordSet,
                    columns: [{ width: ''}],
                    header: [{ caption: ''}],
                    columnSeparatorSize: 's'
                });

                const stubGetHeaderConstructor = sinon.stub(collection, 'getHeaderConstructor');
                stubGetHeaderConstructor.callsFake(() => ((options) => {
                    assert.strictEqual(options.columnSeparatorSize, 's');
                }));

                // сбрасываем заголовок
                collection.setHeader([{ caption: ''}]);

                // Вызываем инициализацию заголовков
                collection.getHeader();

                sinon.assert.called(stubGetHeaderConstructor);
                stubGetHeaderConstructor.restore();
            });
        });
    });

    describe('constructor', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('constructor options', () => {
            const collection = new GridCollection({
                collection: new RecordSet({
                    keyProperty: 'key',
                    rawData: []
                }),
                columns: [{ width: ''}],
                headerVisibility: 'visible',
                multiSelectVisibility: 'visible'
            });

            const fakeGetHeaderConstructorMethod = (options) => {
                assert.strictEqual(options.multiSelectVisibility, 'visible');
            };
            sandbox.replace(collection, 'getHeaderConstructor', () => fakeGetHeaderConstructorMethod);

            collection.setHeader([{ caption: ''}]);
            collection.getHeader();
        });
    });
});
