import {assert} from 'chai';
import {CollectionEditor, ERROR_MSG} from 'Controls/_editInPlace/CollectionEditor';
import {Collection} from 'Controls/display';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';

describe('Controls/_editInPlace/CollectionEditor', () => {
    let items: RecordSet<{ id: number, title: string }>;
    let collection: Collection<Model>;
    let collectionEditor: CollectionEditor;
    let newItem: Model<{ id: number, title: string }>;

    beforeEach(() => {
        items = new RecordSet<{ id: number, title: string }>({
            keyProperty: 'id',
            rawData: [
                {id: 1, title: 'First'},
                {id: 2, title: 'Second'},
                {id: 3, title: 'Third'}
            ]
        });

        newItem = new Model<{ id: number, title: string }>({
            keyProperty: 'id',
            rawData: {id: 4, title: 'Fourth'}
        });

        collection = new Collection({
            keyProperty: 'id',
            collection: items
        });

        collectionEditor = new CollectionEditor({collection});
    });

    describe('updateOptions', () => {
        it('should use old collection if new is undefined', () => {
            collectionEditor.updateOptions({});
            //@ts-ignore
            const currentCollection = collectionEditor._options.collection;
            assert.equal(currentCollection, collection);
        });

        it('should use new collection if it is defined', () => {
            const newCollection = new Collection({
                keyProperty: 'id',
                collection: items
            });

            collectionEditor.updateOptions({collection: newCollection});
            //@ts-ignore
            const currentCollection = collectionEditor._options.collection;
            assert.equal(currentCollection, newCollection);
        });

        it('should throw error and use old collection if new has source not type of Types/collection:RecordSet', () => {
            const newCollection = new Collection({
                keyProperty: 'id',
                collection: items
            });

            newCollection.getCollection()['[Types/_collection/RecordSet]'] = false;

            assert.throws(() => {
                collectionEditor.updateOptions({collection: newCollection});
            }, ERROR_MSG.SOURCE_COLLECTION_MUST_BE_RECORDSET);

            //@ts-ignore
            const currentCollection = collectionEditor._options.collection;
            assert.equal(currentCollection, collection);
        });
    });

    describe('edit', () => {
        it('correct', () => {
            // Нет редактирования
            assert.notExists(collectionEditor.getEditingItem());

            // Запуск редактирования первой записи
            collectionEditor.edit(items.at(0));

            // Редактирование успешно запустилось
            assert.equal(collectionEditor.getEditingItem().getKey(), 1);
        });

        it('should throw error if trying to begin new edit before end current', () => {
            // Нет редактирования
            assert.notExists(collectionEditor.getEditingItem());

            // Запуск редактирования первой записи
            collectionEditor.edit(items.at(0));
            assert.equal(collectionEditor.getEditingItem().getKey(), 1);

            // Запуск редактирования второй записи должен привести к исключению
            assert.throws(() => {
                collectionEditor.edit(items.at(1));
            }, ERROR_MSG.EDITING_IS_ALREADY_RUNNING);

            // Осталось редактирование первой записи
            assert.equal(collectionEditor.getEditingItem().getKey(), 1);
        });

        it('should throw error if trying to begin edit of item that doesn\'t exist in collection', () => {
            // Нет запущенного редактирования
            assert.notExists(collectionEditor.getEditingItem());

            // Попытка начать редактирование несуществующей записи должна привести к исключению
            assert.throws(() => {
                collectionEditor.edit(newItem);
            }, ERROR_MSG.ITEM_FOR_EDITING_MISSED_IN_COLLECTION);

            // Нет запущенного редактирования
            assert.notExists(collectionEditor.getEditingItem());
        });

        it('should accept all changes made before starting editing', () => {
            // Нет запущенного редактирования
            assert.notExists(collectionEditor.getEditingItem());

            // Вручную меняем запись перед запуском редактирования
            items.at(0).set('title', 'changedTitle');

            // Запись и набор данных изменены
            assert.isTrue(items.at(0).isChanged());
            assert.isTrue(items.isChanged());

            // Запуск редактирования записи с имеющимися изменениями приведет к их фиксации
            collectionEditor.edit(items.at(0));

            // Редактирование запустилось
            assert.equal(collectionEditor.getEditingItem().getKey(), 1);

            // Запись и набор данных не содержат изменений
            assert.isFalse(items.at(0).isChanged());
            assert.isFalse(items.isChanged());
        });
    });

    describe('add', () => {
        it('correct', () => {
            // Нет редактирования
            assert.notExists(collectionEditor.getEditingItem());

            // Запуск редактирования первой записи
            collectionEditor.add(newItem);

            // Редактирование успешно запустилось
            assert.equal(collectionEditor.getEditingItem().getKey(), 4);
        });

        it('should throw error if trying to begin new edit before end current editing', () => {
            // Нет редактирования
            assert.notExists(collectionEditor.getEditingItem());

            // Запуск редактирования первой записи
            collectionEditor.edit(items.at(0));
            assert.equal(collectionEditor.getEditingItem().getKey(), 1);

            // Запуск добавления новой записи должен привести к исключению
            assert.throws(() => {
                collectionEditor.add(newItem);
            }, ERROR_MSG.EDITING_IS_ALREADY_RUNNING);

            // Осталось редактирование первой записи
            assert.equal(collectionEditor.getEditingItem().getKey(), 1);
        });

        it('should throw error if trying to begin edit of item that already exists in collection', () => {
            // Нет запущенного редактирования
            assert.notExists(collectionEditor.getEditingItem());

            // Попытка начать добавление существующей записи должна привести к исключению
            assert.throws(() => {
                collectionEditor.add(items.at(0));
            }, ERROR_MSG.ADD_ITEM_KEY_DUPLICATED + ' Duplicated key: 1.');

            // Нет запущенного редактирования
            assert.notExists(collectionEditor.getEditingItem());
        });

        it('should accept all changes made before starting adding', () => {
            // Нет запущенного редактирования
            assert.notExists(collectionEditor.getEditingItem());

            // Вручную меняем запись перед запуском редактирования
            newItem.set('title', 'changedTitle');

            // Запись изменена
            assert.isTrue(newItem.isChanged());

            // Запуск добавления записи с имеющимися изменениями приведет к их фиксации
            collectionEditor.add(newItem);

            // Добавление запустилось
            assert.equal(collectionEditor.getEditingItem().getKey(), 4);

            // Запись и набор данных не содержат изменений
            assert.isFalse(collectionEditor.getEditingItem().isChanged());
            assert.isFalse(items.isChanged());
        });

        it('should set temporary adding item key if it is undefined', () => {
            // Нет запущенного редактирования
            assert.notExists(collectionEditor.getEditingItem());

            newItem.set('id', undefined);

            // Запуск добавления записи с пустым ключом.
            collectionEditor.add(newItem);

            // Добавление запустилось, записи установлен временный ключ.
            assert.equal(collectionEditor.getEditingItem().getKey(), 'ADDING_ITEM_EMPTY_KEY');
        });

        describe('addPosition', () => {
            const addPositionAssociations = [
                ['anyInvalid', 'bottom', 3],
                ['default', 'bottom', 3],
                ['top', 'top', 0],
                ['bottom', 'bottom', 3],
                [undefined, 'bottom', 3]
            ];

            addPositionAssociations.forEach(([intoMethodValue, expectedValue, addingItemIndex]: [string|undefined, string, number]) => {

                it(`should set add position as '${expectedValue}' if passed into method '${intoMethodValue}' as add position`, () => {
                    // Нет запущенного редактирования
                    assert.notExists(collectionEditor.getEditingItem());

                    // Запуск добавления записи с в указанную позицию.
                    // @ts-ignore
                    collectionEditor.add(newItem, intoMethodValue);

                    // Добавление запустилось
                    assert.equal(collectionEditor.getEditingItem().getKey(), newItem.getKey());

                    // Позиция добавления у элемента коллекции должна быть верная (expectedValue).
                    assert.equal(
                        collection.getItemBySourceKey(newItem.getKey()).addPosition,
                        expectedValue,
                        'Wrong value of addPosition at collection item.'
                    );

                    // Запись отображается в верной позиции
                    assert.equal(collection.at(addingItemIndex).contents, collectionEditor.getEditingItem());
                });

            });
        });
    });

    describe('commit', () => {
        it('correct commit editing', () => {
            // Нет редактирования
            assert.notExists(collectionEditor.getEditingItem());

            // Запуск редактирования первой записи
            collectionEditor.edit(items.at(0));

            // Редактирование успешно запустилось
            assert.equal(collectionEditor.getEditingItem().getKey(), 1);

            // Редактируем поля записи
            const editingItem = collectionEditor.getEditingItem();
            editingItem.set('title', 'First edited');
            assert.isTrue(editingItem.isChanged(), 'Editing item has no changes.');

            // Завершаем редактирование с применением изменений
            collectionEditor.commit();

            // Редактирование завершилось
            assert.notExists(collectionEditor.getEditingItem());

            // Изменения применились
            assert.equal(editingItem.get('title'), 'First edited');
            assert.isFalse(editingItem.isChanged());
            assert.isFalse(items.isChanged());
        });

        it('correct commit adding', () => {
            // Нет редактирования
            assert.notExists(collectionEditor.getEditingItem());

            // В коллекции 3 элемента
            const itemsCountBeforeAdd = collection.getCount();

            // Запуск редактирования первой записи
            collectionEditor.add(newItem);

            // Редактирование успешно запустилось
            assert.equal(collectionEditor.getEditingItem().getKey(), newItem.getKey());

            // Запись отображается
            assert.equal(collection.getCount(), itemsCountBeforeAdd + 1);

            // Редактируем поля записи
            const addingItem = collectionEditor.getEditingItem();
            addingItem.set('title', 'Fourth adding');
            assert.isTrue(addingItem.isChanged(), 'New item has no changes.');

            // Завершаем редактирование с применением изменений
            collectionEditor.commit();

            // Редактирование завершилось
            assert.notExists(collectionEditor.getEditingItem());

            // Изменения применились, но запись не добавилась.
            // Контролл не имеет ответственности добавлять запись в источник, только в проекцию.
            assert.equal(collection.getCount(), itemsCountBeforeAdd);

            assert.equal(addingItem.get('title'), 'Fourth adding');
            assert.isFalse(addingItem.isChanged());
            assert.isFalse(addingItem.isChanged());
        });

        it('should throw error if trying to commit without running editing', () => {
            // Нет запущенного редактирования
            assert.notExists(collectionEditor.getEditingItem());

            // Завершение редактирования должно привести к исключению
            assert.throws(() => {
                collectionEditor.commit();
            }, ERROR_MSG.HAS_NO_EDITING);
        });

        it('should throw error if trying to commit adding item with undefined key', () => {
            // Нет запущенного редактирования
            assert.notExists(collectionEditor.getEditingItem());

            // Запуск добавления записи с пустым ключом.
            newItem.set('id', undefined);
            collectionEditor.add(newItem);

            // Добавление запустилось, записи установлен временный ключ.
            assert.equal(collectionEditor.getEditingItem().getKey(), 'ADDING_ITEM_EMPTY_KEY');

            // Запуск добавления новой записи должен привести к исключению
            assert.throws(() => {
                collectionEditor.commit();
            }, ERROR_MSG.ADDING_ITEM_KEY_WAS_NOT_SET);
        });
    });
    describe('cancel', () => {
        it('correct cancel editing', () => {
            // Нет редактирования
            assert.notExists(collectionEditor.getEditingItem());

            // Запуск редактирования первой записи
            collectionEditor.edit(items.at(0));

            // Редактирование успешно запустилось
            assert.equal(collectionEditor.getEditingItem().getKey(), 1);

            // Редактируем поля записи
            const editingItem = collectionEditor.getEditingItem();
            editingItem.set('title', 'First edited');
            assert.isTrue(editingItem.isChanged(), 'Editing item has no changes.');

            // Завершаем редактирование с применением изменений
            collectionEditor.cancel();

            // Редактирование завершилось
            assert.notExists(collectionEditor.getEditingItem());

            // Изменения не применились
            assert.equal(items.at(0).get('title'), 'First');
            assert.isFalse(items.at(0).isChanged());
            assert.isFalse(items.isChanged());
        });

        it('correct cancel adding', () => {
            // Нет редактирования
            assert.notExists(collectionEditor.getEditingItem());

            // В коллекции 3 элемента
            const itemsCountBeforeAdd = collection.getCount();

            // Запуск редактирования первой записи
            collectionEditor.add(newItem);

            // Редактирование успешно запустилось
            assert.equal(collectionEditor.getEditingItem().getKey(), newItem.getKey());

            // Редактируем поля записи
            const addingItem = collectionEditor.getEditingItem();
            addingItem.set('title', 'Fourth adding');
            assert.isTrue(addingItem.isChanged(), 'Adding item has no changes.');

            // Завершаем добавление с применением изменений
            collectionEditor.cancel();

            // Добавление завершилось
            assert.notExists(collectionEditor.getEditingItem());

            // Изменения не применились, добавляемой записи нет
            assert.equal(items.getCount(), itemsCountBeforeAdd);
            assert.isFalse(items.isChanged());
        });

        it('should throw error if trying to cancel without running editing', () => {
            // Нет запущенного редактирования
            assert.notExists(collectionEditor.getEditingItem());

            // Завершение редактирования должно привести к исключению
            assert.throws(() => {
                collectionEditor.cancel();
            }, ERROR_MSG.HAS_NO_EDITING);
        });
    });
});
