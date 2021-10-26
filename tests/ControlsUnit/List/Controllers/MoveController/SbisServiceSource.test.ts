import {assert} from 'chai';
import {createSandbox, assert as sinonAssert} from 'sinon';

import {Logger} from 'UI/Utils';
import {Control} from 'UI/Base';
import {IHashMap} from 'Types/declarations';

import {CrudEntityKey, DataSet, SbisService, LOCAL_MOVE_POSITION} from 'Types/source';
import {IMoveControllerOptions, MoveController} from 'Controls/list';
import {ISelectionObject} from 'Controls/interface';
import * as popup from 'Controls/popup';
import {Model, adapter, Record} from 'Types/entity';

const sbisServiceSource: Partial<SbisService> = {
    getAdapter(): any {
        return new adapter.Json();
    },
    getBinding(): any {
        return {
            move: 'move',
            list: 'list'
        };
    },
    move(items: CrudEntityKey[], target: CrudEntityKey, meta?: IHashMap<any>): Promise<void> {
        return Promise.resolve();
    },
    call(command: string, data?: object): Promise<DataSet> {
        return Promise.resolve(undefined);
    },
    getKeyProperty(): string {
        return 'id';
    }
};

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
    let stubLoggerError: any;
    let selectionObject: ISelectionObject;
    let sandbox: any;
    let callCatch: boolean;

    beforeEach(() => {

        // fake opener
        const opener = new Control({});

        sandbox = createSandbox();

        selectionObject = {
            selected: [1, 3, 5, 7],
            excluded: [3]
        };

        cfg = {
            parentProperty: 'folder',
            source: sbisServiceSource as SbisService,
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

    describe('SbisService', () => {
        let dataSet: DataSet;

        beforeEach(() => {
            dataSet = new DataSet({
                rawData: [
                    {
                        '@DocRoutingRule': 1327,
                        id: 1351
                    }
                ],
                keyProperty: 'id'
            });
            controller = new MoveController({...cfg, source: (sbisServiceSource as SbisService)});
        });

        // Попытка вызвать move() с невалидным selection
        it ('should not move "after" with invalid selection', () => {
            // @ts-ignore
            return controller.move(['1', '2', '2'], {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.After)
                .then(() => {/* FIXME: sinon mock */})
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
                .then(() => {/* FIXME: sinon mock */})
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
                .then(() => {/* FIXME: sinon mock */})
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

            const stubCall = sandbox.stub(sbisServiceSource, 'call')
                .callsFake((command: string, data?: { method: string, filter: Record, folder_id: number }) => {
                    assert.exists(data.filter, 'filter should exist');
                    assert.deepEqual(data.filter.get('selection').get('marked'),
                        correctSelection.selected.map((key) => `${key}`));
                    assert.deepEqual(data.filter.get('selection').get('excluded'),
                        correctSelection.excluded.map((key) => `${key}`));
                    return Promise.resolve(dataSet);
                });
            return controller.move(correctSelection, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.On)
                .then((result: DataSet) => {
                    assert.equal(result, dataSet);
                })
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubCall);
                    assert.isFalse(callCatch);
                });
        });

        // Попытка вызвать move() с заполненным excluded[] но с пустым selected[]
        it ('should try to move "on" without selected keys', () => {
            const correctSelection: ISelectionObject = {
                selected: [],
                excluded: [3]
            };
            const stubCall = sandbox.stub(sbisServiceSource, 'call')
                .callsFake((command: string, data?: { method: string, filter: Record, folder_id: number }) => {
                    assert.exists(data.filter, 'filter should exist');
                    assert.deepEqual(data.filter.get('selection').get('marked'),
                        correctSelection.selected.map((key) => `${key}`));
                    assert.deepEqual(data.filter.get('selection').get('excluded'),
                        correctSelection.excluded.map((key) => `${key}`));
                    return Promise.resolve(dataSet);
                });

            return controller.move(correctSelection, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.On)
                .then((result: DataSet) => {
                    assert.equal(result, dataSet);
                })
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubCall);
                    assert.isFalse(callCatch);
                });
        });

        // Попытка вызвать move() с заполненным selected[] но с пустым excluded[]
        it ('should try to move without excluded keys', () => {
            const correctSelection: ISelectionObject = {
                selected: [1, 3, 5, 7],
                excluded: []
            };
            const stubCall = sandbox.stub(sbisServiceSource, 'call')
                .callsFake((command: string, data?: { method: string, filter: Record, folder_id: number }) => {
                    assert.exists(data.filter, 'filter should exist');
                    assert.deepEqual(data.filter.get('selection').get('marked'),
                        correctSelection.selected.map((key) => `${key}`));
                    assert.deepEqual(data.filter.get('selection').get('excluded'),
                        correctSelection.excluded.map((key) => `${key}`));
                    return Promise.resolve(dataSet);
                });
            return controller.move(correctSelection, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.On)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubCall);
                    assert.isFalse(callCatch);
                });
        });

        // Попытка вызвать move() с target===undefined
        it ('should not move to undefined target', () => {
            const spyCall = sandbox.spy(sbisServiceSource, 'call');
            return controller.move(selectionObject, {myProp: 'test'}, undefined, LOCAL_MOVE_POSITION.On)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyCall);
                    assert.isTrue(callCatch);
                });
        });

        // Попытка вызвать move() с некорректным filter
        it ('should not move with incorrect filter (sbisService)', () => {
            const spyCall = sandbox.spy(sbisServiceSource, 'call');
            return controller.move(selectionObject, () => {/* FIXME: sinon mock */}, 4, LOCAL_MOVE_POSITION.On)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyCall);
                    assert.isTrue(callCatch);
                });
        });

        // Попытка вызвать move() с некорректным position
        it ('should not move to invalid position', () => {
            const spyCall = sandbox.spy(sbisServiceSource, 'call');
            // @ts-ignore
            return controller.move(selectionObject, {}, 4, 'incorrect')
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyCall);
                    assert.isTrue(callCatch);
                });
        });

        // Попытка вызвать move() с filter===undefined
        it ('should move with undefined filter', () => {
            const stubCall = sandbox.stub(sbisServiceSource, 'call')
                .callsFake((command: string, data?: { method: string, filter: Record, folder_id: number }) => {
                    assert.exists(data.filter, 'filter should exist anyway');
                    return Promise.resolve(dataSet);
                });
            return controller.move(selectionObject, undefined, 4, LOCAL_MOVE_POSITION.On)
                .then((result: DataSet) => {
                    assert.equal(result, dataSet);
                })
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubCall);
                    assert.isFalse(callCatch);
                });
        });

        // Попытка вызвать move() с target === null при перемещении в папку
        it ('should move with target === null', () => {
            const spyCall = sandbox.spy(sbisServiceSource, 'call');
            return controller.move(selectionObject, {}, null, LOCAL_MOVE_POSITION.On)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение пройдёт успешно
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(spyCall);
                    assert.isFalse(callCatch);
                });
        });

        // Попытка вызвать move() с target===null при смене мест
        it ('should not move "Before"/"After" to null target', () => {
            const spyCall = sandbox.spy(sbisServiceSource, 'call');
            return controller.move(selectionObject, {myProp: 'test'}, null, LOCAL_MOVE_POSITION.Before)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере,
                    // При этом не будет записана ошибка в лог
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.notCalled(spyCall);
                    assert.isTrue(callCatch);
                });
        });

        // Попытка вызвать move() с position===undefined
        it ('should not move to invalid position', () => {
            const spyCall = sandbox.spy(sbisServiceSource, 'call');
            // @ts-ignore
            return controller.move(selectionObject, {}, 4, undefined)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyCall);
                    assert.isTrue(callCatch);
                });
        });

        // Попытка вызвать move() с position===on
        it ('should move with position === LOCAL_MOVE_POSITION.On', () => {
            const spyCall = sandbox.spy(sbisServiceSource, 'call');
            return controller.move(selectionObject, {}, 4, LOCAL_MOVE_POSITION.On)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(spyCall);
                    assert.isFalse(callCatch);
                });
        });

        // Попытка вызвать move() с position===after
        it ('should move with position === LOCAL_MOVE_POSITION.After', () => {
            const spyMove = sandbox.spy(sbisServiceSource, 'move');
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
            const spyMove = sandbox.spy(sbisServiceSource, 'move');
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

        // parentProperty передаётся на backend при вызове move()
        it ('incorrect parentProperty does not affect move() result', () => {
            const parentProperty = {};
            controller = new MoveController({
                ...cfg,
                // @ts-ignore
                parentProperty,
                source: (sbisServiceSource as SbisService)
            });
            const stubMove = sandbox.stub(sbisServiceSource, 'move')
                .callsFake((items: CrudEntityKey[], target: CrudEntityKey, meta?: IHashMap<any>) => {
                    // @ts-ignore
                    assert.exists(meta.parentProperty);
                    return Promise.resolve();
                });
            return controller.move(selectionObject, {}, 4, LOCAL_MOVE_POSITION.Before)
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

        // move() вызывается с учётом sorting
        it('should call move() with Sorting', () => {
            const parentProperty = {};
            controller = new MoveController({
                ...cfg,
                // @ts-ignore
                parentProperty,
                source: (sbisServiceSource as SbisService),
                sorting: [{field: 'ASC'}]
            });
            const stubMove = sandbox.stub(sbisServiceSource, 'move')
                .callsFake((items: CrudEntityKey[], target: CrudEntityKey, meta?: IHashMap<any>) => {
                    // @ts-ignore
                    assert.exists(meta.query);
                    const orderBy = meta.query.getOrderBy();
                    assert.equal(orderBy[0].getSelector(), 'field');
                    assert.isFalse(orderBy[0].getOrder());
                    return Promise.resolve();
                });
            return controller.move(selectionObject, {}, 4, LOCAL_MOVE_POSITION.Before)
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {
                    sinonAssert.called(stubMove);
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

                    // Ожидаю. что перемещение провалится из-за ошибки,
                    // брошенной в контроллере на этапе открытия диалога
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

                    // Ожидаю. что перемещение провалится из-за ошибки,
                    // брошенной в контроллере на этапе открытия диалога
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
            const stubConfirmation = sandbox.stub(popup.Confirmation, 'openPopup')
                .callsFake((args) => Promise.resolve(true));
            // @ts-ignore
            return controller.moveWithDialog(correctSelection, {myProp: 'test'})
                .then(() => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение провалится из-за popup.Confirmation,
                    // открытого в контроллере на этапе открытия диалога
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
                Promise.resolve(args.eventHandlers.onResult(createFakeModel({
                    id: 3,
                    folder: null,
                    'folder@': null
                }))
            ))));
            const stubCall = sandbox.stub(sbisServiceSource, 'call')
                .callsFake((command: string, data?: { method: string, filter: Record, folder_id: number }) => {
                    assert.exists(data.filter, 'filter should exist');
                    assert.deepEqual(data.filter.get('selection').get('marked'),
                        correctSelection.selected.map((key) => `${key}`));
                    assert.deepEqual(data.filter.get('selection').get('excluded'),
                        correctSelection.excluded.map((key) => `${key}`));
                    return Promise.resolve(dataSet);
                });
            controller = new MoveController({...cfg, source: (sbisServiceSource as SbisService)});
            return controller.moveWithDialog(correctSelection, {myProp: 'test'})
                .then((result: DataSet) => {
                    assert.equal(result, dataSet);
                })
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubCall);
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
                Promise.resolve(args.eventHandlers.onResult(createFakeModel({
                    id: 3,
                    folder: null,
                    'folder@': null
                })))
            )));
            const stubCall = sandbox.stub(sbisServiceSource, 'call')
                .callsFake((command: string, data?: { method: string, filter: Record, folder_id: number }) => {
                    assert.exists(data.filter, 'filter should exist');
                    assert.deepEqual(data.filter.get('selection').get('marked'),
                        correctSelection.selected.map((key) => `${key}`));
                    assert.deepEqual(data.filter.get('selection').get('excluded'),
                        correctSelection.excluded.map((key) => `${key}`));
                    return Promise.resolve(dataSet);
                });
            controller = new MoveController({...cfg, source: (sbisServiceSource as SbisService)});
            return controller.moveWithDialog(correctSelection, {myProp: 'test'})
                .then((result: DataSet) => {
                    assert.equal(result, dataSet);
                })
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubCall);
                    assert.isFalse(callCatch);
                });
        });

        // Попытка вызвать resolveMoveWithDialog() с некорректным filter
        it ('should not move with dialog with incorrect filter (sbisService)', () => {
            const spyCall = sandbox.spy(sbisServiceSource, 'call');
            // to prevent popup open
            sandbox.replaceGetter(popup, 'DialogOpener', getFakeDialogOpener((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel({
                    id: 3,
                    folder: null,
                    'folder@': null
                })))
            )));
            controller = new MoveController({...cfg, source: (sbisServiceSource as SbisService)});
            return controller.moveWithDialog(selectionObject, () => {/* FIXME: sinon mock */})
                .then((result: DataSet) => {/* FIXME: sinon mock */})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в контроллере
                    sinonAssert.called(stubLoggerError);
                    sinonAssert.notCalled(spyCall);
                    assert.isTrue(callCatch);
                });
        });

        // Попытка вызвать resolveMoveWithDialog() с filter===undefined
        it ('should move with dialog and undefined filter (sbisService)', () => {
            const stubCall = sandbox.stub(sbisServiceSource, 'call')
                .callsFake((command: string, data?: { method: string, filter: Record, folder_id: number }) => {
                    assert.exists(data.filter, 'filter should exist anyway');
                    return Promise.resolve(dataSet);
                });
            // to prevent popup open
            sandbox.replaceGetter(popup, 'DialogOpener', getFakeDialogOpener((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel({
                    id: 3,
                    folder: null,
                    'folder@': null
                })))
            )));
            controller = new MoveController({...cfg, source: (sbisServiceSource as SbisService)});
            return controller.moveWithDialog(selectionObject, undefined)
                .then((result: DataSet) => {
                    assert.equal(result, dataSet);
                })
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubCall);
                    assert.isFalse(callCatch);
                });
        });

        // Попытка вызвать resolveMoveWithDialog() с заполненным filter
        it ('should move with dialog and filter (sbisService)', () => {
            const stubCall = sandbox.stub(sbisServiceSource, 'call')
                .callsFake((command: string, data?: { method: string, filter: Record, folder_id: number }) => {
                    assert.exists(data.filter, 'filter should exist anyway');
                    assert.equal(data.filter.get('mother'), 'anarchy');
                    return Promise.resolve(dataSet);
                });
            // to prevent popup open
            sandbox.replaceGetter(popup, 'DialogOpener', getFakeDialogOpener((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel({
                    id: 3,
                    folder: null,
                    'folder@': null
                })))
            )));
            controller = new MoveController({...cfg, source: (sbisServiceSource as SbisService)});
            return controller.moveWithDialog(selectionObject, {mother: 'anarchy'})
                .then((result: DataSet) => {
                    assert.equal(result, dataSet);
                })
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubCall);
                    assert.isFalse(callCatch);
                });
        });
    });
});
