import {assert} from 'chai';
import {assert as sinonAssert, createSandbox} from 'sinon';
import {Control} from 'UI/Base';
import {Logger} from 'UI/Utils';
import {CrudEntityKey, LOCAL_MOVE_POSITION, Memory} from 'Types/source';
import {IHashMap} from 'Types/declarations';
import {Model} from 'Types/entity';
import * as clone from 'Core/core-clone';
import * as popup from 'Controls/popup';
import {IMoveControllerOptions, MoveController} from 'Controls/list';
import {ISelectionObject} from 'Controls/interface';
import {IMoverDialogTemplateOptions} from 'Controls/moverDialog';

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

describe('Controls/list_clean/MoveController', () => {
    let controller;
    let cfg: IMoveControllerOptions;
    let source: Memory;
    let stubLoggerError: any;
    let validPopupArgs: popup.IBasePopupOptions;
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

        validPopupArgs = {
            opener,
            templateOptions: {
                source,
                movedItems: selectionObject.selected,
                keyProperty: 'id',
                nodeProperty: 'folder@',
                parentProperty: 'folder'
            } as Partial<IMoverDialogTemplateOptions>,
            closeOnOutsideClick: true,
            template: 'fakeTemplate'
        };

        cfg = {
            parentProperty: 'folder',
            source,
            popupOptions: {
                opener: validPopupArgs.opener,
                templateOptions: {
                    keyProperty: (validPopupArgs.templateOptions as IMoverDialogTemplateOptions).keyProperty,
                    nodeProperty: (validPopupArgs.templateOptions as IMoverDialogTemplateOptions).nodeProperty,
                    parentProperty: (validPopupArgs.templateOptions as IMoverDialogTemplateOptions).parentProperty
                },
                template: validPopupArgs.template
            }
        };

        // to prevent throwing console error
        stubLoggerError = sandbox.stub(Logger, 'error').callsFake((message, errorPoint, errorInfo) => ({}));

        callCatch = false;
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('constructor', () => {

        // Передан source===undefined при перемещении методом move()
        it('move() + source is not set/invalid', () => {
            controller = new MoveController({...cfg, source: undefined});
            return controller
                .move(selectionObject, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.After)
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {
                    // Ожидаю, что перемещение провалится из-за того, что source не задан
                    sinonAssert.called(stubLoggerError);
                    assert.isTrue(callCatch);
                });
        });

        // Если при перемещении методом moveWithDialog() в popupOptions.templateOptions передан source,
        // то он используется в диалоге перемещения вместо source, переданного в контроллер
        it('moveWithDialog() + source set within popupOptions.templateOptions object', () => {
            const source2: Memory = new Memory({
                keyProperty: 'id',
                data: clone(data)
            });
            // to prevent popup open
            sandbox.replaceGetter(popup, 'DialogOpener', getFakeDialogOpener((args) => {
                assert.notEqual((args.templateOptions as {source: Memory}).source, source);
                assert.equal((args.templateOptions as {source: Memory}).source, source2);
                return Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])));
            }));
            cfg.popupOptions.templateOptions = {
                ...cfg.popupOptions.templateOptions as object,
                source: source2
            };
            controller = new MoveController(cfg);
            return controller.moveWithDialog(selectionObject, {myProp: 'test'})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    assert.isFalse(callCatch);
                });
        });

        it('moveWithDialog() + source !== null', () => {
            const stubMove = sandbox.stub(source, 'move')
                .callsFake((items: CrudEntityKey[], target: CrudEntityKey, meta?: IHashMap<any>) => {

                    // assertion here
                    assert.equal(target, 'ROOT');
                    return Promise.resolve();
                });
            sandbox.replaceGetter(popup, 'DialogOpener', getFakeDialogOpener((args) => {
                return Promise.resolve(args.eventHandlers.onResult('ROOT'));
            }));
            cfg.popupOptions.templateOptions = {
                ...cfg.popupOptions.templateOptions as object,
                root: 'ROOT'
            };
            controller = new MoveController(cfg);
            return controller.moveWithDialog(selectionObject, {myProp: 'test'})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {
                    // assertion is above
                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    sinonAssert.called(stubMove);
                    assert.isFalse(callCatch);
                });
        });

        // Передан popupOptions без template при перемещении методом moveWithDialog()
        it('moveWithDialog() + popupOptions.template is not set', () => {
            // to prevent popup open
            sandbox.replaceGetter(popup, 'DialogOpener', getFakeDialogOpener((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            )));
            controller = new MoveController({...cfg, popupOptions: {}});
            return controller.moveWithDialog(selectionObject, {myProp: 'test'})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю, что перемещение провалится из-за некорректно заданного шаблона
                    sinonAssert.called(stubLoggerError);
                    assert.isTrue(callCatch);
                });
        });

        // Все статические параметры должны соответствовать эталонам при перемещении методом moveWithDialog()
        it('moveWithDialog() + necessary and static popupOptions', () => {
            sandbox.replaceGetter(popup, 'DialogOpener', getFakeDialogOpener((args) => {
                assert.equal(args.opener, validPopupArgs.opener, 'opener is invalid');
                assert.deepEqual(args.templateOptions, validPopupArgs.templateOptions, 'templateOptions are invalid');
                assert.equal(args.closeOnOutsideClick, validPopupArgs.closeOnOutsideClick, 'closeOnOutsideClick should be true');
                assert.equal(args.template, validPopupArgs.template, 'template is not the same as passed');
                return Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])));
            }));
            controller = new MoveController({
                ...cfg,
                popupOptions: {
                    opener: validPopupArgs.opener,
                    templateOptions: {
                        keyProperty: (validPopupArgs.templateOptions as IMoverDialogTemplateOptions).keyProperty,
                        nodeProperty: (validPopupArgs.templateOptions as IMoverDialogTemplateOptions).nodeProperty,
                        parentProperty: (validPopupArgs.templateOptions as IMoverDialogTemplateOptions).parentProperty
                    },
                    template: validPopupArgs.template
                }
            });
            return controller.moveWithDialog(selectionObject, {myProp: 'test'})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    sinonAssert.notCalled(stubLoggerError);
                    assert.isFalse(callCatch);
                });
        });

        // Случай, когда movePosition === on, parentProperty === undefined, и source instanceof Memory
        it('moveWithDialog() + _parentProperty is not set', () => {
            // to prevent popup open
            sandbox.replaceGetter(popup, 'DialogOpener', getFakeDialogOpener((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            )));
            controller = new MoveController({...cfg, parentProperty: undefined});
            return controller.moveWithDialog(selectionObject, {myProp: 'test'})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение провалится из-за ошибки, брошенной в source
                    assert.isTrue(callCatch);
                });
        });
    });

    // Проверка параметров, переданных при обновлении параметров
    describe('update', () => {

        // Изначально у нас не задан source, но делаем обновление и вызываем move()
        it('move() + source set via update()', () => {
            controller = new MoveController({...cfg, source: undefined});
            controller.updateOptions({...cfg, source});
            return controller.move(selectionObject, {myProp: 'test'}, 4, LOCAL_MOVE_POSITION.After)
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {
                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    assert.isFalse(callCatch);
                });
        });

        // Изначально у нас не задан source, но делаем обновление и вызываем moveWithDialog()
        it('moveWithDialog() + source set via update', () => {
            // to prevent popup open
            sandbox.replaceGetter(popup, 'DialogOpener', getFakeDialogOpener((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            )));
            controller = new MoveController({...cfg, source: undefined});
            controller.updateOptions({...cfg, source});
            return controller.moveWithDialog(selectionObject, {myProp: 'test'})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    assert.isFalse(callCatch);
                });
        });

        // Изначально не передан template, но делаем обновление и вызываем moveWithDialog()
        it('moveWithDialog() + popupOptions.template set via update', () => {
            // to prevent popup open
            sandbox.replaceGetter(popup, 'DialogOpener', getFakeDialogOpener((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            )));
            controller = new MoveController({...cfg, popupOptions: {}});
            controller.updateOptions({...cfg, popupOptions: { template: 'anyNewTemplate' }});
            return controller.moveWithDialog(selectionObject, {myProp: 'test'})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    assert.isFalse(callCatch);
                });
        });

        // Все статические параметры должны соответствовать эталонам при перемещении методом moveWithDialog()
        it('moveWithDialog() + necessary and static popupOptions set via update', () => {
            sandbox.replaceGetter(popup, 'DialogOpener', getFakeDialogOpener((args) => {
                assert.equal(args.opener, validPopupArgs.opener, 'opener is invalid');
                assert.deepEqual(args.templateOptions, validPopupArgs.templateOptions, 'templateOptions are invalid');
                assert.equal(args.closeOnOutsideClick, validPopupArgs.closeOnOutsideClick, 'closeOnOutsideClick should be true');
                assert.equal(args.template, validPopupArgs.template, 'template is not the same as passed');
                return Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])));
            }));
            controller = new MoveController(cfg);
            controller.updateOptions({
                ...cfg,
                popupOptions: {
                    opener: validPopupArgs.opener,
                    templateOptions: {
                        keyProperty: (validPopupArgs.templateOptions as IMoverDialogTemplateOptions).keyProperty,
                        nodeProperty: (validPopupArgs.templateOptions as IMoverDialogTemplateOptions).nodeProperty,
                        parentProperty: (validPopupArgs.templateOptions as IMoverDialogTemplateOptions).parentProperty
                    },
                    template: validPopupArgs.template
                }
            });
            return controller.moveWithDialog(selectionObject, {myProp: 'test'})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    assert.isFalse(callCatch);
                });
        });

        // Случай, когда movePosition === on, parentProperty === undefined, и source instanceof Memory.
        // Но потом при обновлении все парметры выставляются корректно
        it('moveWithDialog() + _parentProperty is set via update', () => {
            // to prevent popup open
            sandbox.replaceGetter(popup, 'DialogOpener', getFakeDialogOpener((args) => (
                Promise.resolve(args.eventHandlers.onResult(createFakeModel(data[3])))
            )));
            controller = new MoveController({...cfg, parentProperty: undefined});
            controller.updateOptions(cfg);
            return controller.moveWithDialog(selectionObject, {myProp: 'test'})
                .catch(() => {
                    callCatch = true;
                })
                .finally(() => {

                    // Ожидаю. что перемещение произойдёт успешно, т.к. все условия соблюдены
                    assert.isFalse(callCatch);
                });
        });
    });
});
