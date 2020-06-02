import rk = require('i18n!Controls');

import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import { RecordSet } from 'Types/collection';
import { Model } from 'Types/entity';
import { create as diCreate } from 'Types/di';
import { Sticky } from 'Controls/popup';

import {
    Collection,
    CollectionItem,
    ICollectionCommand,
    ANIMATION_STATE
} from 'Controls/display';
import {
    Controller as ItemActionsController,
    TItemActionVisibilityCallback,
    TEditArrowVisibilityCallback,
    IItemAction,
    TItemActionShowType,
    TItemActionsPosition
} from 'Controls/itemActions';
import tmplNotify = require('Controls/Utils/tmplNotify');

import { load as libraryLoad } from 'Core/library';
import { SyntheticEvent } from 'Vdom/Vdom';

import { constants } from 'Env/Env';

import { ISwipeEvent } from './Render';
import { MarkerController, TVisibility, Visibility } from 'Controls/marker';

import template = require('wml!Controls/_listRender/View/View');

export interface IViewOptions extends IControlOptions {
    items: RecordSet;

    collection: string;
    render: string;

    itemActions?: any[];
    itemActionsVisibility?: 'onhover'|'delayed'|'visible';
    itemActionVisibilityCallback?: TItemActionVisibilityCallback;
    itemActionsPosition?: TItemActionsPosition;
    itemActionsProperty?: string;
    style?: string;
    itemActionsClass?: string;

    actionAlignment?: 'horizontal'|'vertical';
    actionCaptionPosition?: 'right'|'bottom'|'none';

    editingConfig?: any;

    markerVisibility: TVisibility;
    markedKey: number|string;
    showEditArrow: boolean;
    editArrowVisibilityCallback: TEditArrowVisibilityCallback
}

export default class View extends Control<IViewOptions> {
    protected _template: TemplateFunction = template;
    protected _tmplNotify: Function = tmplNotify;

    protected _collection: Collection<Model>;

    private _itemActionsController: ItemActionsController;

    // Идентификатор текущего открытого popup
    private _itemActionsMenuId: string = null;

    private _markerController: MarkerController = null;

    protected async _beforeMount(options: IViewOptions): Promise<void> {
        this._collection = this._createCollection(options.collection, options.items, options);

        if (options.itemActionsVisibility === 'visible') {
            this._updateItemActions(options);
        }

        if (options.markerVisibility !== Visibility.Hidden) {
            this._markerController = new MarkerController({
                model: this._collection,
                markerVisibility: options.markerVisibility,
                markedKey: options.markedKey
            });
        }
        return libraryLoad(options.render).then(() => null);
    }

    protected _beforeUpdate(options: IViewOptions): void {
        let collectionRecreated = false;

        if (options.items !== this._options.items) {
            if (this._collection) {
                this._collection.destroy();
            }
            this._collection = this._createCollection(options.collection, options.items, options);
            collectionRecreated = true;
        }

        if (options.editingConfig !== this._options.editingConfig || options.editingConfig && collectionRecreated) {
            this._collection.setEditingConfig(options.editingConfig);
        }

        if (options.markedKey !== this._options.markedKey
           || options.markerVisibility !== this._options.markerVisibility
           || collectionRecreated) {
            if (this._markerController) {
                this._markerController.update({
                    model: this._collection,
                    markerVisibility: options.markerVisibility,
                    markedKey: options.markedKey
                });
            }
        }

        // UC: Record might be editing on page load, then we should initialize Item Actions.
        if (
            options.itemActions !== this._options.itemActions ||
            options.itemActionVisibilityCallback !== this._options.itemActionVisibilityCallback ||
            (options.itemActions || options.itemActionsProperty) && collectionRecreated ||
            options.itemActionsProperty ||
            (options.editingConfig && options.editingConfig.item)
        ) {
            this._updateItemActions();
        }
    }

    protected _beforeUnmount(): void {
        if (this._collection) {
            this._collection.destroy();
            this._collection = null;
        }
    }

    /**
     * По событию youch мы должны показать операции
     * @param e
     * @private
     */
    protected _onRenderTouchStart(e: SyntheticEvent<TouchEvent>): void {
        this._updateItemActions();
    }

    /**
     * По событию youch мы должны показать операции
     * @param e
     * @private
     */
    protected _onRenderMouseEnter(e: SyntheticEvent<TouchEvent>): void {
        if (this._options.itemActionsVisibility !== 'visible') {
            if (!this._collection.isActionsAssigned()) {
                this._updateItemActions(this._options);
            }
        }
    }

    /**
     * По клику на запись в списке нужно переместить маркер
     * @param e
     * @param item
     * @param clickEvent
     * @private
     */
    protected _onItemClick(
        e: SyntheticEvent<null>,
        item: Model,
        clickEvent: SyntheticEvent<MouseEvent>
    ): void {
        if (this._markerController) {
            this._markerController.setMarkedKey(item.getKey());
        }
        // TODO fire 'markedKeyChanged' event
    }

    /**
     * Обработчик свайпа по записи. Показывает операции по свайпу
     * @param e
     * @param item
     * @param swipeEvent
     * @param swipeContainerHeight
     * @private
     */
    protected _onItemSwipe(
        e: SyntheticEvent<null>,
        item: CollectionItem<Model>,
        swipeEvent: SyntheticEvent<ISwipeEvent>,
        swipeContainerHeight: number
    ): void {
        switch (swipeEvent.nativeEvent.direction) {
        case 'left':
            this._itemActionsController.activateSwipe(item.getContents().getKey(), swipeContainerHeight);
            break;
        default:
            this._itemActionsController.setSwipeAnimation(ANIMATION_STATE.CLOSE);
            this._collection.nextVersion();
            break;
        }
    }

    /**
     * Обработчик события окончания анимации свайпа по записи
     * @param e
     * @private
     */
    _onCloseSwipe(e: SyntheticEvent<null>): void {
        this._itemActionsController.deactivateSwipe();
    }

    /**
     * Обрабатывает событие клика по записи и бросает событие actionClick
     * @param e
     * @param item
     * @param action
     * @param clickEvent
     * @private
     */
    protected _onItemActionClick(
        e: SyntheticEvent<MouseEvent>,
        item: CollectionItem<Model>,
        action: IItemAction,
        clickEvent: SyntheticEvent<MouseEvent>
    ): void {
        if (this._markerController) {
            this._markerController.setMarkedKey(item.getContents().getKey());
        }
        // TODO fire 'markedKeyChanged' event

        if (action && !action._isMenu && !action['parent@']) {
            this._handleItemActionClick(action, clickEvent, item);
        } else {
            this._openItemActionsMenu(action, clickEvent, item, false);
        }
    }

    /**
     * Обработка события возникновения контекстного меню
     * @param e
     * @param item
     * @param clickEvent
     * @private
     */
    protected _onItemContextMenu(
        e: SyntheticEvent<null>,
        item: CollectionItem<Model>,
        clickEvent: SyntheticEvent<MouseEvent>
    ): void {
        this._openItemActionsMenu(null, clickEvent, item, true);
    }

    /**
     * Обработка события клика по элементу списка
     * @param e
     * @param item
     * @param keyDownEvent
     * @private
     */
    protected _onItemKeyDown(
        e: SyntheticEvent<null>,
        item: CollectionItem<Model>,
        keyDownEvent: SyntheticEvent<KeyboardEvent>
    ): void {
        switch (keyDownEvent.nativeEvent.keyCode) {
        case constants.key.down:
            if (this._markerController) {
                this._markerController.moveMarkerToNext();
            }
            break;
        case constants.key.up:
            if (this._markerController) {
                this._markerController.moveMarkerToPrev();
            }
            break;
        }
        // TODO fire 'markedKeyChanged' event if needed
    }

    protected _executeCommands(commands: Array<ICollectionCommand<unknown>>): void {
        commands.forEach((command) => command.execute(this._collection));
    }

    /**
     * Возвращает видимость опций записи.
     * @private
     */
    _isVisibleItemActions(itemActionsMenuId: number): boolean {
        return !itemActionsMenuId || this._options.itemActionsVisibility === 'visible';
    }

    /**
     * Обрабатывает клик по конкретной операции
     * @param action
     * @param clickEvent
     * @param item
     * @private
     */
    private _handleItemActionClick(action: IItemAction, clickEvent: SyntheticEvent<MouseEvent>, item: CollectionItem<Model>): void {
        // TODO нужно заменить на item.getContents() при переписывании моделей. item.getContents() должен возвращать Record
        let contents = View._getItemContents(item);
        // TODO Проверить. В старом коде был поиск controls-ListView__itemV по текущему индексу записи
        // TODO Корректно ли тут обращаться по CSS классу для поиска контейнера?
        const itemContainer = (clickEvent.target as HTMLElement).closest('.controls-ListView__itemV');
        this._notify('actionClick', [action, contents, itemContainer]);
        if (action.handler) {
            action.handler(contents);
        }
        this._closeActionsMenu();
    }

    /**
     * Обработчик событий, брошенных через onResult в выпадающем/контекстном меню
     * @param eventName название события, брошенного из Controls/menu:Popup.
     * Варианты значений itemClick, applyClick, selectorDialogOpened, pinClick, menuOpened
     * @param actionModel
     * @param clickEvent
     * @private
     */
    private _itemActionsMenuResultHandler(
        eventName: string,
        actionModel: Model,
        clickEvent: SyntheticEvent<MouseEvent>): void {
        if (eventName === 'itemClick') {
            const action = actionModel && actionModel.getRawData();
            if (action && !action['parent@']) {
                const item = this._itemActionsController.getActiveItem();
                this._handleItemActionClick(action, clickEvent, item);
            }
        }
    }

    /**
     * Обработчик закрытия выпадающего/контекстного меню
     * @param e
     * @param clickEvent
     * @private
     */
    private _itemActionsMenuCloseHandler(e: SyntheticEvent<MouseEvent>, clickEvent: SyntheticEvent<MouseEvent>): void {
        // Actions dropdown can start closing after the view itself was unmounted already, in which case
        // the model would be destroyed and there would be no need to process the action itself
        if (this._collection && !this._collection.destroyed) {
            this._itemActionsController.setActiveItem(null);
            this._itemActionsController.deactivateSwipe();
            this._itemActionsMenuId = null;
        }
    }

    /**
     * Открывает меню операций
     * @param action
     * @param clickEvent
     * @param item
     * @param isContextMenu
     */
    private _openItemActionsMenu(
        action: IItemAction,
        clickEvent: SyntheticEvent<MouseEvent>,
        item: CollectionItem<Model>,
        isContextMenu: boolean): void {
        const opener = this._children.renderer;
        const menuConfig = this._itemActionsController.prepareActionsMenuConfig(item, clickEvent, action, opener, isContextMenu);
        if (menuConfig) {
            clickEvent.nativeEvent.preventDefault();
            clickEvent.stopImmediatePropagation();
            const onResult = this._itemActionsMenuResultHandler.bind(this);
            const onClose = this._itemActionsMenuCloseHandler.bind(this);
            menuConfig.eventHandlers = {onResult, onClose};
            this._itemActionsController.setActiveItem(item);
            Sticky.openPopup(menuConfig).then((popupId) => {
                this._itemActionsMenuId = popupId;
            });
        }
    }

    /**
     * Метод, который закрывает меню
     * @private
     */
    private _closeActionsMenu(): void {
        this._itemActionsController.setActiveItem(null);
        this._itemActionsController.deactivateSwipe();
        Sticky.closePopup(this._itemActionsMenuId);
        this._itemActionsMenuId = null;
    }

    /**
     * Создаёт коллекцию из пришедших данных
     * @param module
     * @param items
     * @param collectionOptions
     * @private
     */
    private _createCollection(
        module: string,
        items: RecordSet,
        collectionOptions: IViewOptions
    ): Collection<Model> {
        return diCreate(module, { ...collectionOptions, collection: items });
    }

    /**
     * Инициализирует контрорллере и обновляет в нём данные
     * @private
     */
    protected _updateItemActions(options: IViewOptions): void {
        if (!this._itemActionsController) {
            this._itemActionsController = new ItemActionsController();
        }
        const editingConfig = this._collection.getEditingConfig();
        let editArrowAction: IItemAction;
        if (this._options.showEditArrow) {
            editArrowAction = {
                id: 'view',
                icon: 'icon-Forward',
                title: rk('Просмотреть'),
                showType: TItemActionShowType.TOOLBAR,
                handler: (item) => {
                    this._notify('editArrowClick', [item]);
                }
            };
        }
        this._itemActionsController.update({
            collection: this._collection,
            itemActions: options.itemActions,
            itemActionsProperty: options.itemActionsProperty,
            visibilityCallback: options.itemActionVisibilityCallback,
            itemActionsPosition: options.itemActionsPosition,
            style: options.itemActionsVisibility === 'visible' ? 'transparent' : options.style,
            theme: options.theme,
            actionAlignment: options.actionAlignment,
            actionCaptionPosition: options.actionCaptionPosition,
            itemActionsClass: options.itemActionsClass,
            iconSize: editingConfig ? 's' : 'm',
            editingToolbarVisible: editingConfig?.toolbarVisibility,
            editArrowAction,
            editArrowVisibilityCallback: this._options.editArrowVisibilityCallback
        });
    }

    /**
     * Возвращает contents записи.
     * Если запись - breadcrumbs, то берётся последняя Model из списка contents
     * TODO нужно выпилить этот метод при переписывании моделей. item.getContents() должен возвращать Record
     *  https://online.sbis.ru/opendoc.html?guid=acd18e5d-3250-4e5d-87ba-96b937d8df13
     * @param item
     */
    private static _getItemContents(item: CollectionItem<Model>): Model {
        let contents = item?.getContents();
        if (item['[Controls/_display/BreadcrumbsItem]']) {
            contents = contents[(contents as any).length - 1];
        }
        return contents;
    };

    static getDefaultOptions(): Partial<IViewOptions> {
        return {
            itemActionsPosition: 'inside',
            actionAlignment: 'horizontal',
            actionCaptionPosition: 'none',
            style: 'default',
            itemActionsVisibility: 'onhover'
        };
    }
}
