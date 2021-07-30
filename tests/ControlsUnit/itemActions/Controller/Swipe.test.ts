import * as sinon from 'sinon';
import {
    Controller as ItemActionsController,
    IControllerOptions
} from 'Controls/_itemActions/Controller';
import {Collection, CollectionItem} from 'Controls/display';
import {RecordSet} from 'Types/collection';
import {Record} from 'Types/entity';
import {IItemAction, TItemActionShowType} from 'Controls/_itemActions/interface/IItemAction';
import {IItemActionsCollection} from 'Controls/_itemActions/interface/IItemActionsCollection';
import {IOptions as ICollectionOptions} from 'Controls/_display/Collection';
import {IItemActionsItem} from 'Controls/_itemActions/interface/IItemActionsItem';

const itemActions: IItemAction[] = [
    {
        id: 1,
        icon: 'icon-PhoneNull',
        title: 'phone',
        showType: TItemActionShowType.MENU
    },
    {
        id: 2,
        icon: 'icon-EmptyMessage',
        title: 'message',
        showType: TItemActionShowType.MENU_TOOLBAR
    },
    {
        id: 3,
        icon: 'icon-Profile',
        title: 'Profile',
        tooltip: 'This is awesome Profile you\'ve never seen',
        showType: TItemActionShowType.TOOLBAR
    },
    {
        id: 4,
        icon: 'icon-Time',
        title: 'Time management',
        showType: TItemActionShowType.TOOLBAR,
        'parent@': true
    },
    {
        id: 5,
        title: 'Documentation',
        showType: TItemActionShowType.TOOLBAR,
        parent: 4
    },
    {
        id: 6,
        title: 'Development',
        showType: TItemActionShowType.MENU_TOOLBAR,
        parent: 4
    },
    {
        id: 7,
        title: 'Exploitation',
        showType: TItemActionShowType.MENU,
        parent: 4,
        'parent@': true
    },
    {
        id: 8,
        title: 'Approval',
        showType: TItemActionShowType.MENU,
        parent: 7,
        'parent@': true
    }
];

const data = [
    {id: 1, name: 'Philip J. Fry', gender: 'M', itemActions: []},
    {
        id: 2,
        name: 'Turanga Leela',
        gender: 'F',
        itemActions: [
            {
                id: 1,
                icon: 'icon-Link',
                title: 'valar morghulis',
                showType: TItemActionShowType.TOOLBAR
            },
            {
                id: 2,
                icon: 'icon-Print',
                title: 'print',
                showType: TItemActionShowType.MENU
            }
        ]
    },
    {id: 3, name: 'Professor Farnsworth', gender: 'M', itemActions: []},
    {id: 4, name: 'Amy Wong', gender: 'F', itemActions: []},
    {id: 5, name: 'Bender Bending Rodriguez', gender: 'R', itemActions: []}
];

function makeCollection(rawData: Array<{
    id: number,
    name: string,
    gender: string,
    itemActions: IItemAction[]
}>): IItemActionsCollection {

    const list = new RecordSet({
        keyProperty: 'id',
        rawData
    });
    const collectionConfig: ICollectionOptions<Record, IItemActionsItem> = {
        collection: list,
        keyProperty: 'id',
        searchValue: null,
        editingConfig: null
    };
    // @ts-ignore
    return new Collection<Record>(collectionConfig);
}

function mockDocument(): object {
    return {
        createElement: () => ({
            style: ({}),
            classList: {
                add: () => {
                }
            },
            setAttribute: () => {
            },
            appendChild: () => {
            },
            getBoundingClientRect: () => ({width: ''}),
            getElementsByClassName: () => ([])
        }),
        body: {
            appendChild: () => {
            },
            removeChild: () => {
            }
        }
    };
}

function initializeControllerOptions(options?: IControllerOptions): IControllerOptions {
    return {
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
        editArrowVisibilityCallback: options ? options.editArrowVisibilityCallback: null,
        contextMenuConfig: options ? options.contextMenuConfig: null,
        iconSize: options ? options.iconSize: 'm',
        editingItem: options ? options.editingItem : null,
        itemActionsVisibility: options ? options.itemActionsVisibility : 'onhover',
        actionMode: "strict"
    };
}

describe('Controls/itemActions/Controller/Swipe', () => {
    let collection: IItemActionsCollection;
    let itemActionsController: ItemActionsController;

    before(() => {
        global.document = mockDocument();
    });

    after(() => {
        global.document = undefined;
    });

    beforeEach(() => {
        collection = makeCollection(data);
        itemActionsController = new ItemActionsController();
        // @ts-ignore
        itemActionsController.update(initializeControllerOptions({
            collection,
            itemActions
        }));
    });

   it('should reset ItemActions on swipe close', () => {
       itemActionsController.activateSwipe(1, 100, 50);
       const item = collection.at(0);
       const spySetActions = sinon.spy(item, 'setActions');
       itemActionsController.deactivateSwipe();
       sinon.assert.called(spySetActions);
       spySetActions.restore();
   });
});
