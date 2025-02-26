import {assert} from 'chai';

import {
    Controller as ItemActionsController,
    IControllerOptions
} from 'Controls/_itemActions/Controller';

import {
    IItemAction,
    TItemActionShowType,
    IItemActionsCollection,
    IItemActionsItem, IItemActionsObject, IItemActionsTemplateConfig
} from 'Controls/itemActions';
import {ISwipeConfig} from 'Controls/display';

function mockItem(): IItemActionsItem {
    return {
        ItemActionsItem: true,
        actions: undefined,
        swiped: undefined,
        getContents: () => ({
            getKey: () => 1
        }),
        isEditing: () => false,
        setActions(actions: IItemActionsObject): void {
            this.actions = actions;
        },
        getActions(): IItemActionsObject {
            return this.actions;
        },
        isSwiped(): boolean {
            return this.swiped;
        },
        setSwiped(state: boolean): void {
            this.swiped = state;
        },
        setSwipeAnimation: () => {/* FIXME: sinon mock */}
    } as undefined as IItemActionsItem;
}

function mockCollection(item: IItemActionsItem): IItemActionsCollection {
    return {
        eventRaising: true,
        swipeConfig: undefined,
        actionsTemplateConfig: undefined,
        isEventRaising(): boolean {
            return this.eventRaising;
        },
        setEventRaising(state: boolean): void {
            this.eventRaising = state;
        },
        each: (callback) => callback(item, 0),
        getViewIterator: (): any => ({
            each: (callback) => callback(item, 0)
        }),
        find: () => item,
        setActiveItem: () => {/* FIXME: sinon mock */},
        getItemBySourceKey: () => item,
        isEditing: () => false,
        getSwipeConfig(): ISwipeConfig {
            return this.swipeConfig;
        },
        setSwipeConfig(state: ISwipeConfig): void {
            this.swipeConfig = state;
        },
        getActionsTemplateConfig(): IItemActionsTemplateConfig {
            return this.actionsTemplateConfig;
        },
        setActionsTemplateConfig(state: IItemActionsTemplateConfig): void {
            this.actionsTemplateConfig = state;
        },
        nextVersion: () => {/* FIXME: sinon mock */}
    } as undefined as IItemActionsCollection;
}

function mockDocument(): object {
    return {
        createElement: () => ({
            style: ({}),
            classList: {
                add: () => {/* FIXME: sinon mock */}
            },
            setAttribute: () => {/* FIXME: sinon mock */},
            appendChild: () => {/* FIXME: sinon mock */},
            getBoundingClientRect: () => ({width: ''}),
            getElementsByClassName: () => ([])
        }),
        body: {
            appendChild: () => {/* FIXME: sinon mock */},
            removeChild: () => {/* FIXME: sinon mock */}
        }
    };
}

describe('Controls/itemActions/Controller/EditArrow', () => {
    let collection: IItemActionsCollection;
    let item: IItemActionsItem;
    const editArrowAction: IItemAction = {
        id: 'view',
        icon: '',
        showType: TItemActionShowType.TOOLBAR
    };

    function initController(options: IControllerOptions): ItemActionsController {
        const controller = new ItemActionsController();
        // @ts-ignore
        controller.update({
            collection: options ? options.collection : null,
            itemActions: options ? options.itemActions : null,
            itemActionsProperty: options ? options.itemActionsProperty : null,
            visibilityCallback: options ? options.visibilityCallback : null,
            itemActionsPosition: options ? options.itemActionsPosition : null,
            style: options ? options.style : null,
            theme: options ? options.theme : 'default',
            actionAlignment: options ? options.actionAlignment : null,
            actionCaptionPosition: options ? options.actionCaptionPosition : null,
            editingToolbarVisible: options ? options.editingToolbarVisible : false,
            editArrowAction: options ? options.editArrowAction : null,
            editArrowVisibilityCallback: options ? options.editArrowVisibilityCallback : null,
            contextMenuConfig: options ? options.contextMenuConfig : null,
            iconSize: options ? options.iconSize : 'm',
            editingItem: options ? options.editingItem : null,
            itemActionsVisibility: options ? options.itemActionsVisibility : 'onhover',
            actionMode: 'strict'
        });
        return controller;
    }

    before(() => {
        global.document = mockDocument();
    });

    after(() => {
        global.document = undefined;
    });

    describe('showEditArrow', () => {
        beforeEach(() => {
            item = mockItem();
            collection = mockCollection(item);
        });

        // T2.10. При свайпе добавляется editArrow в набор операций, вызывается editArrowVisibilityCallback.
        it('should add editArrow for every item action when necessary', () => {
            // @ts-ignore
            const controller = initController({
                collection,
                itemActions: undefined,
                theme: 'default',
                editArrowAction
            });

            controller.activateSwipe(1, 100, 50);
            const config = collection.getSwipeConfig();
            assert.exists(config, 'Swipe activation should make configuration');
            assert.equal(config.itemActions.showed[0].id, 'view', 'First action should be \'editArrow\'');
        });
    });
});
