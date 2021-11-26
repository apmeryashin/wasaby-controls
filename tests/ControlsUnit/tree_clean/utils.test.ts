/* tslint:disable */
import {assert} from 'chai';
import {Tree} from 'Controls/display';
import {RecordSet} from 'Types/collection';
import {getItemHierarchy, getReloadItemsHierarchy} from 'Controls/_tree/utils';

const data = [
    {
        id: 1,
        node: true,
        parent: null
    },
        {
            id: 11,
            node: true,
            parent: 1
        },
            {
                id: 111,
                node: true,
                parent: 11
            },
                {
                    id: 1111,
                    node: null,
                    parent: 111
                },
                {
                    id: 1112,
                    node: null,
                    parent: 111
                },
            {
                id: 112,
                node: null,
                parent: 11
            },
    {
        id: 2,
        node: true,
        parent: null
    },
        {
            id: 21,
            node: true,
            parent: 2
        }
];

describe('Controls/_tree/utils', () => {
    // Инстанс тестовой коллекции, который создается для каждого теста
    let collection: Tree;

    beforeEach(() => {
        collection = new Tree({
            root: null,
            keyProperty: 'id',
            nodeProperty: 'node',
            parentProperty: 'parent',
            collection: new RecordSet({keyProperty: 'id', rawData: data})
        });
    });


    describe('getItemHierarchy', () => {

        // Для записи из глубины дерева должен вернуть полную иерархию от корня до записи
        it('deep item', function () {
            const result = getItemHierarchy(collection, 1111);
            assert.equal(result.length, 5);
            assert.includeOrderedMembers(result, [null, 1, 11, 111, 1111]);
        });

        // Для записи из корня дерева должен вернуть массив из 2х элементов (корень и сам итем)
        it('root item', function () {
            const result = getItemHierarchy(collection, 2);
            assert.equal(result.length, 2);
            assert.includeOrderedMembers(result, [null, 2]);
        });

    });


    describe('getReloadItemsHierarchy', () => {

        // Проверяем что для одной id метод возвращает полную иерархию этого итема
        it('should return leaf hierarchy for one id', () => {
            const result = getReloadItemsHierarchy(collection, [1111]);
            assert.equal(result.length, 4);
            assert.includeOrderedMembers(result, [null, 1, 11, 111]);
        });

        // Проверяем что метод возвращает в результирующем массиве только уникальные значения иерархии
        it('should return unique hierarchy ids', () => {
            // Получаем результат для записей из одной папки
            let result = getReloadItemsHierarchy(collection, [1111, 1112]);
            assert.equal(result.length, 4);
            assert.includeOrderedMembers(
                result,
                [null, 1, 11, 111],
                'Записи из одной папки'
            );

            // Получаем результат для записей из разных папой
            result = getReloadItemsHierarchy(collection, [1111, 21]);
            assert.equal(result.length, 5);
            assert.includeOrderedMembers(
                result,
                [null, 1, 11, 111, 2],
                'Записи из разных папок'
            );
        });

    });
});
