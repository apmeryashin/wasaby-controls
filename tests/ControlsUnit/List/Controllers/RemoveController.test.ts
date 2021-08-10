import {assert} from 'chai';
import * as sinon from 'sinon';

import {Logger} from 'UI/Utils';
import {Control} from 'UI/Base';
import * as clone from 'Core/core-clone';
import {Memory} from 'Types/source';
import {RemoveController} from 'Controls/list';
import {ISelectionObject} from 'Controls/interface';
import {Confirmation} from 'Controls/popup';
import {EntityKey} from "Types/_source/ICrud";
import Query from "Types/_source/Query";
import DataSet from "Types/_source/DataSet";

const data = [
    {
        id: 1,
        folder: null,
        'folder@': true
    },
    {
        id: 2,
        folder: null,
        'folder@': null
    },
    {
        id: 3,
        folder: null,
        'folder@': null
    },
    {
        id: 4,
        folder: 1,
        'folder@': true
    },
    {
        id: 5,
        folder: 1,
        'folder@': null
    },
    {
        id: 6,
        folder: null,
        'folder@': null
    }
];

function resolveRemoveWithConfirmation(controller: RemoveController, selectionObject: ISelectionObject) {
    return new Promise((resolve) => {
        controller.removeWithConfirmation(selectionObject).then(() => resolve(true)).catch(() => resolve(false));
    })
}

function resolveRemove(controller: RemoveController, selectionObject: ISelectionObject) {
    return new Promise((resolve) => {
        controller.remove(selectionObject).then(() => resolve(true)).catch(() => resolve(false));
    })
}

describe('Controls/list_clean/RemoveController', () => {
    let controller;
    let source: Memory;
    let stubLoggerError: any;
    let selectionObject: ISelectionObject;
    let sandBox: sinon.SinonSandbox;

    beforeEach(() => {
        const _data = clone(data);

        // fake opener
        const opener = new Control({});

        selectionObject = {
            selected: [1, 3, 5],
            excluded: [3]
        };

        source = new Memory({
            keyProperty: 'id',
            data: _data
        });

        sandBox = sinon.createSandbox();

        // to prevent throwing console error
        stubLoggerError = sandBox.stub(Logger, 'error').callsFake((message, errorPoint, errorInfo) => ({}));
    });

    afterEach(() => {
        sandBox.restore();
    })

    it('remove() should not remove without source', () => {
        controller = new RemoveController({source: undefined});
        return resolveRemove(controller, selectionObject).then((result: boolean) => {

            // Ожидаем, что упадёт из-за ошибки, брошенной в контроллере
            assert.isFalse(result);
        });
    });

    it('removeWithConfirmation() should not remove without source', () => {
        controller = new RemoveController({source: undefined});
        const stubConfirmation = sandBox.stub(Confirmation, 'openPopup').callsFake(() => Promise.resolve(true));
        return resolveRemoveWithConfirmation(controller, selectionObject).then((result: boolean) => {

            // Ожидаем, что пользователь увидит окно подтверждения
            sandBox.assert.called(stubConfirmation);

            // Ожидаем, что упадёт из-за ошибки, брошенной в контроллере
            assert.isFalse(result);
        });
    });

    it('remove() should remove when correct source set via update', () => {
        controller = new RemoveController({source: undefined});
        controller.updateOptions({source: source});
        return resolveRemove(controller, selectionObject).then((result: boolean) => {

            // Ожидаем, что удаление пройдёт успешно
            assert.isTrue(result);
        });
    });

    it('removeWithConfirmation() should remove when correct source set via update', () => {
        controller = new RemoveController({source: undefined});
        controller.updateOptions({source: source});
        const stubConfirmation = sandBox.stub(Confirmation, 'openPopup').callsFake(() => Promise.resolve(true));
        return resolveRemoveWithConfirmation(controller, selectionObject).then((result: boolean) => {

            // Ожидаем, что пользователь увидит окно подтверждения
            sandBox.assert.called(stubConfirmation);

            // Ожидаем, что удаление пройдёт успешно
            assert.isTrue(result);
        });
    });

    it('remove() should not remove with incorrect selection', () => {
        controller = new RemoveController({source});

        // @ts-ignore
        return resolveRemove(controller, [0, 1, 2]).then((result: boolean) => {

            // Ожидаем, что упадёт из-за ошибки, брошенной в контроллере
            assert.isFalse(result);
        });
    });

    it('removeWithConfirmation() should not remove with incorrect selection', () => {
        controller = new RemoveController({source});
        const stubConfirmation = sandBox.stub(Confirmation, 'openPopup').callsFake(() => Promise.resolve(true));

        // @ts-ignore
        return resolveRemoveWithConfirmation(controller, [0, 1, 2]).then((result: boolean) => {

            // Ожидаем, что пользователь увидит окно подтверждения
            sandBox.assert.called(stubConfirmation);

            // Ожидаем, что упадёт из-за ошибки, брошенной в контроллере
            assert.isFalse(result);
        });
    });

    it('remove() should not remove with undefined selection', () => {
        controller = new RemoveController({source});

        // @ts-ignore
        return resolveRemove(controller, undefined).then((result: boolean) => {

            // Ожидаем, что упадёт из-за ошибки, брошенной в контроллере
            assert.isFalse(result);
        });
    });

    it('removeWithConfirmation() should not remove with undefined selection', () => {
        controller = new RemoveController({source});
        const stubConfirmation = sandBox.stub(Confirmation, 'openPopup').callsFake(() => Promise.resolve(true));

        // @ts-ignore
        return resolveRemoveWithConfirmation(controller, undefined).then((result: boolean) => {

            // Ожидаем, что пользователь увидит окно подтверждения
            sandBox.assert.called(stubConfirmation);

            // Ожидаем, что упадёт из-за ошибки, брошенной в контроллере
            assert.isFalse(result);
        });
    });

    it('remove() should remove with correct selection', () => {
        const correctSelection = {
            selected: [1, 3, 5],
            excluded: [3]
        };
        controller = new RemoveController({source});
        const stubQuery = sandBox.stub(source, 'query').callsFake((query?: Query) => Promise.resolve(new DataSet({
            keyProperty: 'id',
            rawData: [{id: 1}, {id: 5}]
        })));
        const stubDestroy = sandBox.stub(source, 'destroy').callsFake((keys: EntityKey | EntityKey[], meta?: object) => {
            assert.equal(keys[1], 5);
            return Promise.resolve();
        })

        return resolveRemove(controller, correctSelection).then((result: boolean) => {

            // Ожидаем, что удаление пройдёт успешно
            assert.isTrue(result);
            sandBox.assert.called(stubQuery);
            sandBox.assert.called(stubDestroy);
        });
    });

    it('removeWithConfirmation() should remove with correct selection', () => {
        const correctSelection = {
            selected: [1, 3, 5],
            excluded: [3]
        };
        controller = new RemoveController({source});
        const spyQuery = sandBox.spy(source, 'query');
        const spyDestroy = sandBox.spy(source, 'destroy')
        const stubConfirmation = sandBox.stub(Confirmation, 'openPopup').callsFake(() => Promise.resolve(true));
        return resolveRemoveWithConfirmation(controller, correctSelection).then((result: boolean) => {

            // Ожидаем, что пользователь увидит окно подтверждения
            sandBox.assert.called(stubConfirmation);

            // Ожидаем, что удаление пройдёт успешно
            assert.isTrue(result);
            sandBox.assert.called(spyQuery);
            sandBox.assert.called(spyDestroy);
        });
    });

    it('remove() should remove with empty selection', () => {
        const correctSelection = {
            selected: [],
            excluded: [3]
        };
        const stubQuery = sandBox.stub(source, 'query').callsFake((query?: Query) => Promise.resolve(new DataSet({
            keyProperty: 'id',
            rawData: [{id: 1}, {id: 2}, {id: 5}]
        })));
        const stubDestroy = sandBox.stub(source, 'destroy').callsFake((keys: EntityKey | EntityKey[], meta?: object) => {
            assert.equal(keys[1], 2);
            return Promise.resolve();
        })
        controller = new RemoveController({source});
        return resolveRemove(controller, correctSelection).then((result: boolean) => {

            // Ожидаем, что удаление пройдёт успешно
            assert.isTrue(result);
            sandBox.assert.called(stubQuery);
            sandBox.assert.called(stubDestroy);
        });
    });

    it('removeWithConfirmation() should remove with empty selection', () => {
        const correctSelection = {
            selected: [],
            excluded: [3]
        };
        controller = new RemoveController({source});
        const spyQuery = sandBox.spy(source, 'query');
        const spyDestroy = sandBox.spy(source, 'destroy')
        const stubConfirmation = sandBox.stub(Confirmation, 'openPopup').callsFake(() => Promise.resolve(true));
        return resolveRemoveWithConfirmation(controller, correctSelection).then((result: boolean) => {

            // Ожидаем, что пользователь увидит окно подтверждения
            sandBox.assert.called(stubConfirmation);

            // Ожидаем, что удаление пройдёт успешно
            assert.isTrue(result);
            sandBox.assert.called(spyQuery);
            sandBox.assert.called(spyDestroy);
        });
    });

    it('removeItems() should call query for [null] selection', () => {
        const correctSelection = {
            selected: [null],
            excluded: []
        };
        const stubQuery = sandBox.stub(source, 'query').callsFake((query?: Query) => Promise.resolve(new DataSet({
            keyProperty: 'id',
            rawData: [{id: 1}, {id: 2}, {id: 5}]
        })));
        const stubDestroy = sandBox.stub(source, 'destroy').callsFake((keys: EntityKey | EntityKey[], meta?: object) => {
            assert.equal(keys[1], 2);
            return Promise.resolve();
        })
        controller = new RemoveController({source});
        return resolveRemove(controller, correctSelection).then((result: boolean) => {

            // Ожидаем, что удаление пройдёт успешно
            assert.isTrue(result);
            sandBox.assert.called(stubQuery);
            sandBox.assert.called(stubDestroy);
        });
    });
});
