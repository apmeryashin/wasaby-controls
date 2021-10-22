import {Control} from 'UI/Base';
import * as template from 'wml!Controls/_filterPanel/View/View';
import {SyntheticEvent} from 'Vdom/Vdom';
import {TemplateFunction} from 'UI/Base';
import {GroupItem, IItemPadding} from 'Controls/display';
import {IFilterItem} from 'Controls/filter';
import {Model} from 'Types/entity';
import {default as ViewModel} from './View/ViewModel';
import Store from 'Controls/Store';
import 'css!Controls/filterPanel';

/**
 * Контрол "Панель фильтра с набираемыми параметрами".
 * @class Controls/_filterPanel/View
 * @extends UI/Base:Control
 * @author Мельникова Е.А.
 * @demo Controls-demo/filterPanel/View/Index
 *
 * @public
 */

/**
 * @typedef {Object} FilterPanelSource
 * @property {String} name Имя фильтра.
 * @property {String} group Имя группы.
 * @property {*} value Текущее значение фильтра.
 * @property {*} resetValue Значение фильтра по умолчанию.
 * @property {String} textValue Текстовое значение фильтра. Используется для отображения текста при закрытии группы.
 * @property {Controls/filter:EditorOptions.typedef} editorOptions Опции для редактора.
 * @property {String} editorTemplateName Имя редактора.
 * @property {boolean} expanderVisible Видимость экспандера редактора.
 * В настоящей версии фреймворка поддерживается только 2 значения для editorTemplateName — NumberRangeEditor и ListEditor.
 * При использовании NumberRangeEditor будет построен контрол {@link Controls/input:Number}.
 * При использовании ListEditor будет построен контрол {@link Controls/grid:View}.
 */

/**
 * @name Controls/_filterPanel/View#source
 * @cfg {FilterPanelSource} Устанавливает список полей фильтра и их конфигурацию.
 * В числе прочего, по конфигурации определяется визуальное представление поля фильтра в составе контрола. Обязательно должно быть указано поле editorTemplateName.
 * @demo Controls-demo/filterPanel/View/Index
 */

interface IViewPanelOptions {
    source: IFilterItem[];
    collapsedGroups: string[] | number[];
    backgroundStyle: string;
    viewMode: string;
    useStore?: boolean;
    style?: string;
}

export default class View extends Control<IViewPanelOptions> {
    protected _template: TemplateFunction = template;
    protected _itemPadding: IItemPadding = {
        bottom: 'null'
    };
    protected _viewModel: ViewModel = null;
    private _resetCallbackId: string;

    protected _beforeMount(options: IViewPanelOptions): void {
        this._viewModel = new ViewModel({
            source: options.source,
            collapsedGroups: options.collapsedGroups,
            filterViewMode: options.viewMode,
            style: options.style
        });
    }

    protected _afterMount(options: IViewPanelOptions): void {
        if (options.useStore) {
            this._resetCallbackId = Store.declareCommand('resetFilter', this._resetFilter.bind(this));
        }
    }

    protected _beforeUpdate(options: IViewPanelOptions): void {
        this._viewModel.update({
            source: options.source,
            collapsedGroups: options.collapsedGroups,
            filterViewMode: options.viewMode,
            style: options.style
        });
    }

    protected _beforeUnmount(): void {
        if (this._options.useStore) {
            Store.unsubscribe(this._resetCallbackId);
        }
    }

    protected _handleHistoryItemClick(event: SyntheticEvent, filterValue: object): void {
        this._viewModel.setEditingObjectValue(filterValue.name, filterValue.editorValue);
        if (this._options.viewMode === 'default') {
            this._notifyChanges();
        }
    }

    protected _resetFilter(): void {
        this._viewModel.resetFilter();
        this._notifyChanges();
    }

    protected _applyFilter(editorGroup: string): void {
        this._notifyChanges();
        this._notify('filterApplied');
    }

    protected _editingObjectChanged(event: SyntheticEvent, editingObject: Record<string, any>): void {
        this._viewModel.setEditingObject(editingObject);
        this._notifyFilterItemChanged();
    }

    protected _propertyValueChanged(event: SyntheticEvent, filterItem: IFilterItem, itemValue: object): void {
        this._viewModel.setEditingObjectValue(filterItem.name, itemValue);
        if (this._options.viewMode === 'default') {
            this._notifyChanges();
        }
    }

    protected _groupClick(e: SyntheticEvent, dispItem: GroupItem<Model>, clickEvent: SyntheticEvent<MouseEvent>): void {
        const itemContents = dispItem.getContents() as string;
        const isResetClick = clickEvent?.target.closest('.controls-FilterViewPanel__groupReset');
        const isResultClick = clickEvent?.target.closest('.controls-FilterViewPanel__group-result_wrapper');
        this._viewModel.handleGroupClick(itemContents, !isResetClick);
        if (isResetClick) {
            this._resetFilterItem(dispItem);
        }
        // Будет удалено после: https://online.sbis.ru/opendoc.html?guid=53839728-e9dc-4af0-88a8-e847b5b4c5f8
        if (isResultClick) {
            this._notify('groupClick');
        }
        this._notify('collapsedGroupsChanged', [this._viewModel.getCollapsedGroups()]);
    }

    private _resetFilterItem(dispItem: GroupItem<Model>): void {
        const itemContent = dispItem.getContents();
        this._viewModel.resetFilterItem(itemContent);
        this._notifyFilterItemChanged();
    }

    private _notifyFilterItemChanged(): void {
        if (this._options.viewMode === 'default') {
            this._notifyChanges();
        } else {
            this._notify('sourceChanged', [this._viewModel.getSource()]);
        }
    }

    private _notifyChanges(): void {
        this._notify('sendResult', [{
            items: this._viewModel.getSource(),
            filter: this._viewModel.getEditingObject()
        }], {bubbling: true});
        this._notify('filterChanged', [this._viewModel.getEditingObject()]);
        this._notify('sourceChanged', [this._viewModel.getSource()]);
    }
}

Object.defineProperty(View, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): Partial<IViewPanelOptions> {
        return {
            backgroundStyle: 'default',
            viewMode: 'default',
            style: 'default'
        };
    }
});
