import {assert} from 'chai';
import {assert as sinonAssert, createSandbox} from 'sinon';
import {Control} from 'UI/Base';
import {Logger} from 'UI/Utils';
import {CrudEntityKey, DataSet, LOCAL_MOVE_POSITION, Memory} from 'Types/source';
import {IHashMap} from 'Types/declarations';
import {Model} from 'Types/entity';
import * as clone from 'Core/core-clone';
import * as popup from 'Controls/popup';
import {IMoveControllerOptions, MoveController} from 'Controls/list';
import {ISelectionObject} from 'Controls/interface';

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

function createFakeModel(rawData: {id: number, folder: number, 'folder@': boolean}): Model {
    return new Model({
        rawData,
        keyProperty: 'id'
    });
}

function getFakeDialogOpener(openFunction?: (args: popup.IBasePopupOptions) => Promise<any>): Function {
    if (!openFunction) {
        openFunction = (args): Promise<any> => {
            return Promise.resolve(args.eventHandlers.onResult(null));
        };
    }
    return function FakeDialogOpener(): any {
        function FakeDialogOpener(): any {
            this._popupId = null;
            this.open = function(popupOptions: popup.IBasePopupOptions): Promise<void> {
                return new Promise((resolve, reject) => {
                    this._popupId = 'POPUP_ID';
                    return openFunction(popupOptions);
                });
            };
            this.isOpened = function(): boolean {
                return !!this._popupId;
            };
        }
        return FakeDialogOpener;
    };
}

describe('Controls/list_clean/MoveController/MemorySource', () => {
    let controller;
    let cfg: IMoveControllerOptions;
    let source: Memory;
    let stubLoggerError: any;
    let selectionObject: ISelectionObject;
    let sandbox: any;
    let callCatch: boolean;

    beforeEach(() => {
        const _data = clone(data);

        // fake opener
        const opener = new Control({});

        sandbox = createSandbox();

        source = new Memory({
            keyProperty: 'id',
            data: _data
        });

        selectionObject = {
            selected: [1, 3, 5, 7],
            excluded: [3]
        };

        cfg = {
            parentProperty: 'folder',
            source,
            popupOptions: {
                opener,
                templateOptions: {
                    keyProperty: 'id',
                    nodeProperty: 'folder@',
                    parentProperty: 'folder'
                },
                template: 'fakeTemplate'
            }
        };

        // to prevent throwing console error
        stubLoggerError = sandbox.stub(Logger, 'error').callsFake((message, errorPoint, errorInfo) => ({}));

        callCatch = false;
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('ICrudPlus', () => {
        beforeEach(() => {
            controller = new MoveController(cfg);
        });

        // Попытка вызвать move() с невалидным selection
        it ('should not move "after" with invalid selection', () => {
            // @ts-ignore
            return controller.move(['1', '2', '2'], {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.After)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    assert.isTrue(callCatch);
                });
        });

        // Попытка вызвать move() с selection===undefined
        it ('should not move "after" with undefined selection', () => {
            return controller.move(undefined, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.After)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    assert.isTrue(callCatch);
                });
        });

        // Попытка вызвать move() с пустым selection
        it ('should try to move "after" with empty selection', () => {
            const emptySelectionObject: ISelectionObject = {
                selected: [],
                excluded: []
            };
            return controller.move(emptySelectionObject, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.After)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    assert.isFalse(callCatch);
                });
        });

        // Попытка вызвать move() с заполненными selected[] и excluded[]
        it ('should try to move "after" with correct selection', () => {
            const correctSelection: ISelectionObject = {
                selected: [1, 3, 5, 7],
                excluded: [3]
            };

            const stubMove = sandbox.stub(source, 'move')
                .callsFake((items: CrudEntityKey | CrudEntityKey[], target: CrudEntityKey, meta?: IHashMap<any>) => {
                    assert.equal(items, correctSelection.selected, 'items are not equal');
                    assert.equal(target, 4, 'targets are not equal');
                    assert.equal(meta.position, LOCAL_MOVE_POSITION.On, 'positions are not equal');
                    assert.equal(meta.parentProperty, cfg.parentProperty, 'parentProperties are not equal');
                    return Promise.resolve();
                });
            return controller.move(correctSelection, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.On)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubMove);
                    assert.isFalse(callCatch);
                });
        });

        // Попытка вызвать move() с заполненным excluded[] но с пустым selected[]
        it ('should try to move "on" without selected keys', () => {
            const correctSelection: ISelectionObject = {
                selected: [],
                excluded: [3]
            };
            const stubMove = sandbox.stub(source, 'move')
                .callsFake((items: CrudEntityKey | CrudEntityKey[], target: CrudEntityKey, meta?: IHashMap<any>) => {
                    assert.equal(items, correctSelection.selected, 'items are not equal');
                    assert.equal(target, 4, 'targets are not equal');
                    assert.equal(meta.position, LOCAL_MOVE_POSITION.On, 'positions are not equal');
                    assert.equal(meta.parentProperty, cfg.parentProperty, 'parentProperties are not equal');
                    return Promise.resolve();
                });

            return controller.move(correctSelection, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.On)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubMove);
                    assert.isFalse(callCatch);
                });
        });

        // Попытка вызвать move() с заполненным selected[] но с пустым excluded[]
        it ('should try to move without excluded keys', () => {
            const correctSelection: ISelectionObject = {
                selected: [1, 3, 5, 7],
                excluded: []
            };
            const stubMove = sandbox.stub(source, 'move')
                .callsFake((items: CrudEntityKey | CrudEntityKey[], target: CrudEntityKey, meta?: IHashMap<any>) => {
                    assert.equal(items, correctSelection.selected, 'items are not equal');
                    assert.equal(target, 4, 'targets are not equal');
                    assert.equal(meta.position, LOCAL_MOVE_POSITION.On, 'positions are not equal');
                    assert.equal(meta.parentProperty, cfg.parentProperty, 'parentProperties are not equal');
                    return Promise.resolve();
                });
            return controller.move(correctSelection, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.On)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubMove);
                    assert.isFalse(callCatch);
                });
        });

        // Попытка вызвать move() с target===undefined
        it ('should not move to undefined target', () => {
            const spyMove = sandbox.spy(source, 'move');
            return controller.move(selectionObject, {myProp: 'test'}, undefined, LOCAL_MOVE_POSITION.On)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyMove);
                    assert.isTrue(callCatch);
                });
        });

        // Попытка вызвать move() с некорректным filter
        it ('should not move with incorrect filter (source)', () => {
            const spyMove = sandbox.spy(source, 'move');
            return controller.move(selectionObject, () => {/* FIXME: sinon mock */}, 4, LOCAL_MOVE_POSITION.On)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyMove);
                    assert.isTrue(callCatch);
                });
        });

        // Попытка вызвать move() с некорректным position
        it ('should not move to invalid position', () => {
            const spyMove = sandbox.spy(source, 'move');
            // @ts-ignore
            return controller.move(selectionObject, {}, 4, 'incorrect')
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyMove);
                    assert.isTrue(callCatch);
                });
        });

        // Попытка вызвать move() с filter===undefined
        it ('should move with undefined filter', () => {
            const spyMove = sandbox.spy(source, 'move');
            return controller.move(selectionObject, undefined, 4, LOCAL_MOVE_POSITION.On)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(spyMove);
                    assert.isFalse(callCatch);
                });
        });

        // Попытка вызвать move() с target === null при перемещении в папку
        it ('should move "On" with target === null', () => {
            const spyMove = sandbox.spy(source, 'move');
            return controller.move(selectionObject, {}, null, LOCAL_MOVE_POSITION.On)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(spyMove);
                    assert.isFalse(callCatch);
                });
        });

        // Попытка вызвать move() с target===null при смене мест
        it ('should not move "Before"/"After" to null target', () => {
            const spyMove = sandbox.spy(source, 'move');
            return controller.move(selectionObject, {myProp: 'test'}, null, LOCAL_MOVE_POSITION.Before)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере,
                    // При этом не будет записана ошибка в лог
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.notCalled(spyMove);
                    assert.isTrue(callCatch);
                });
        });

        // Попытка вызвать move() с position===undefined
        it ('should not move to invalid position', () => {
            const spyMove = sandbox.spy(source, 'move');
            // @ts-ignore
            return controller.move(selectionObject, {}, 4, undefined)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyMove);
                    assert.isTrue(callCatch);
                });
        });

        // Попытка вызвать move() с position===on
        it ('should move with position === LOCAL_MOVE_POSITION.On', () => {
            const spyMove = sandbox.spy(source, 'move');
            return controller.move(selectionObject, {}, 4, LOCAL_MOVE_POSITION.On)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(spyMove);
                    assert.isFalse(callCatch);
                });
        });

        // Попытка вызвать move() с position===after
        it ('should move with position === LOCAL_MOVE_POSITION.After', () => {
            const spyMove = sandbox.spy(source, 'move');
            return controller.move(selectionObject, {}, 4, LOCAL_MOVE_POSITION.After)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(spyMove);
                    assert.isFalse(callCatch);
                });
        });

        // Попытка вызвать move() с position===after
        it ('should move with position === LOCAL_MOVE_POSITION.Before', () => {
            const spyMove = sandbox.spy(source, 'move');
            return controller.move(selectionObject, {}, 4, LOCAL_MOVE_POSITION.Before)
                .then((result: boolean) => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(spyMove);
                    assert.isNotFalse(result);
                });
        });

        // Некорректный parentProperty вызове move()
        it ('incorrect parentProperty does not affect move() result', () => {
            const parentProperty = {};
            // @ts-ignore
            controller = new MoveController({ ...cfg, parentProperty });
            const spyMove = sandbox.spy(source, 'move');
            return controller.move(selectionObject, {}, 4, LOCAL_MOVE_POSITION.Before)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(spyMove);
                    assert.isFalse(callCatch);
                });
        });

        // Попытка вызвать moveWithDialog() с невалидным selection
        it ('should not move with dialog and invalid selection', () => {
            sandbox.replaceGetter(popup, 'DialogOpener', getFakeDialogOpener(() => Promise.reject('FAKE')));
            const spyConfirmation = sandbox.spy(popup.Confirmation, 'openPopup');
            // @ts-ignore
            return controller.moveWithDialog(['1', '2', '2'], {myProp: 'test'})
                .then(() => {/* FIXME: sinon mock */})
                .catch((error) => {
                    callCatch = true;
                    assert.notEqual(error, 'FAKE');
                })
                .finally(() => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере на этапе открытия диалога
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyConfirmation);
                    assert.isTrue(callCatch);
                });
        });

        // Попытка вызвать moveWithDialog() с selection===undefined
        it ('should not move with dialog and selection === undefined', () => {
            sandbox.replaceGetter(popup, 'DialogOpener', getFakeDialogOpener(() => Promise.reject('FAKE')));
            const spyConfirmation = sandbox.spy(popup.Confirmation, 'openPopup');
            // @ts-ignore
            return controller.moveWithDialog(undefined, {myProp: 'test'})
                .then(() => {/* FIXME: sinon mock */})
                .catch((error) => {
                    callCatch = true;
                    assert.notEqual(error, 'FAKE');
                })
                .finally(() => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере на этапе открытия диалога
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyConfirmation);
                    assert.isTrue(callCatch);
                });
        });

        // Попытка вызвать moveWithDialog() с пустым selection
        it ('should not move with dialog and empty selection', () => {
            const correctSelection: ISelectionObject = {
                selected: [],
                excluded: [3]
            };
            // to prevent popup open
            sandbox.replaceGetter(popup, 'DialogOpener', getFakeDialogOpener(() => Promise.reject('FAKE')));
            const stubConfirmation = sandbox.stub(popup.Confirmation, 'openPopup').callsFake((args) => Promise.resolve(true));
            // @ts-ignore
            return controller.moveWithDialog(correctSelection, {myProp: 'test'})
                .then(() => {/* FIXME: sinon mock */})
                .catch((error) => {
                    callCatch = true;
                    assert.notEqual(error, 'FAKE');
                })
                .finally(() => {

                    // Ожидаю. что перемещение провалится из-за popup.Confirmation, открытого в контроллере на этапе открытия диалога
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubConfirmation);
                    assert.isTrue(callCatch);
                });
        });

        // Попытка вызвать moveWithDialog() с заполненными selected[] и excluded[]
        it ('should try to move with dialog and correct selection', () => {
            const correctSelection: ISelectionObject = {
                selected: [1, 3, 5, 7],
                excluded: [3]
            };
            // to prevent popup open
            sandbox.replaceGetter(popup, 'DialogOpener', getFakeDialogOpener((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            )));
            const stubMove = sandbox.stub(source, 'move')
                .callsFake((items: CrudEntityKey | CrudEntityKey[], target: CrudEntityKey, meta?: IHashMap<any>) => {
                    assert.equal(items, correctSelection.selected, 'items are not equal');
                    assert.equal(target, 4, 'targets are not equal');
                    assert.equal(meta.position, LOCAL_MOVE_POSITION.On, 'positions are not equal');
                    assert.equal(meta.parentProperty, cfg.parentProperty, 'parentProperties are not equal');
                    return Promise.resolve();
                });
            controller = new MoveController({ ...cfg });
            return controller.moveWithDialog(correctSelection, {myProp: 'test'})
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubMove);
                    assert.isFalse(callCatch);
                });
        });

        // Попытка вызвать move() с заполненным selected[] но с пустым excluded[]
        it ('should try to move with dialog and without excluded keys', () => {
            const correctSelection: ISelectionObject = {
                selected: [1, 3, 5, 7],
                excluded: []
            };
            // to prevent popup open
            sandbox.replaceGetter(popup, 'DialogOpener', getFakeDialogOpener((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            )));
            const stubMove = sandbox.stub(source, 'move')
                .callsFake((items: CrudEntityKey | CrudEntityKey[], target: CrudEntityKey, meta?: IHashMap<any>) => {
                    assert.equal(items, correctSelection.selected, 'items are not equal');
                    assert.equal(target, 4, 'targets are not equal');
                    assert.equal(meta.position, LOCAL_MOVE_POSITION.On, 'positions are not equal');
                    assert.equal(meta.parentProperty, cfg.parentProperty, 'parentProperties are not equal');
                    return Promise.resolve();
                });
            controller = new MoveController({ ...cfg });
            return controller.moveWithDialog(correctSelection, {myProp: 'test'})
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubMove);
                    assert.isFalse(callCatch);
                });
        });

        // Попытка вызвать resolveMoveWithDialog() с некорректным filter
        it ('should not move with dialog with incorrect filter (source)', () => {
            const spyMove = sandbox.spy(source, 'move');
            // to prevent popup open
            sandbox.replaceGetter(popup, 'DialogOpener', getFakeDialogOpener((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            )));
            controller = new MoveController({...cfg, source});
            return controller.moveWithDialog(selectionObject, () => {/* FIXME: sinon mock */})
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyMove);
                    assert.isTrue(callCatch);
                });
        });

        // Попытка вызвать resolveMoveWithDialog() с filter===undefined
        it ('should move with dialog and undefined filter (source)', () => {
            const spyMove = sandbox.spy(source, 'move');
            // to prevent popup open
            sandbox.replaceGetter(popup, 'DialogOpener', getFakeDialogOpener((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            )));
            controller = new MoveController({...cfg, source});
            return controller.moveWithDialog(selectionObject, undefined)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(spyMove);
                    assert.isFalse(callCatch);
                });
        });

        // move + target is out of source
        // moveWithDialog + target is out of source
    });
});
