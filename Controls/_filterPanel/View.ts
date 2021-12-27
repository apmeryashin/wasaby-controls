import {Control} from 'UI/Base';
import * as template from 'wml!Controls/_filterPanel/View/View';
import {SyntheticEvent} from 'Vdom/Vdom';
import {TemplateFunction} from 'UI/Base';
import {GroupItem, IItemPadding} from 'Controls/display';
import {IFilterItem, isEqualItems} from 'Controls/filter';
import {Model} from 'Types/entity';
import {default as ViewModel} from './View/ViewModel';
import Store from 'Controls/Store';
import {object} from 'Types/util';
import * as coreClone from 'Core/core-clone';
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
 * @typedef {String} TEditorTemplateName
 * @variant Controls/filterPanel:ListEditor редактор выбора из справочника в виде {@link Controls/filterPanel:ListEditor списка}
 * @variant Controls/filterPanel:LookupEditor редактор выбора из справочника в виде {@link Controls/filterPanel:LookupEditor кнопки выбора}
 * @variant Controls/filterPanel:NumberRangeEditor редактор {@link Controls/filterPanel:NumberRangeEditor диапазона чисел}
 * @variant Controls/filterPanel:DropdownEditor редактор перечисляемого типа в виде {@link Controls/filterPanel:DropdownEditor меню}
 * @variant Controls/filterPanel:TumblerEditor редактор перечисляемого типа в виде {@link Controls/filterPanel:TumblerEditor переключателя}
 * @variant Controls/filterPanel:TextEditor редактор {@link Controls/filterPanel:TextEditor логического типа}
 */

/**
 * @typedef {object} FilterPanelSource
 * @property {string} name Имя фильтра.
 * @property {?} value Текущее значение фильтра.
 * @property {?} resetValue Значение фильтра по умолчанию.
 * @property {string} caption Текст метки редактора.
 * При передаче текста метки, так же будет отображён разделитель.
 * Если caption передать в виде пустой строки (''), то разделитель будет отображён без текстовой метки.
 * Если caption передать как null или не передавать, то у редактора не будет отображаться метка и разделитель.
 * @property {TEditorTemplateName} editorTemplateName Имя редактора.
 * @property {object} editorOptions Опции для редактора. Тип опций зависит от {@link editorTemplateName редактора}.
 * @property {boolean} expanderVisible Определяет видимость экспандера редактора.
 */

/**
 * @name Controls/_filterPanel/View#source
 * @cfg {FilterPanelSource} Устанавливает список полей фильтра и их конфигурацию.
 * В числе прочего, по конфигурации определяется визуальное представление поля фильтра в составе контрола. Обязательно должно быть указано поле editorTemplateName.
 * @demo Controls-demo/filterPanel/View/Index
 */

export interface IViewPanelOptions {
    source: IFilterItem[];
    collapsedGroups: string[] | number[];
    backgroundStyle: string;
    viewMode: string;
    useStore?: boolean;
    style?: string;
    orientation: string;
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
            source: coreClone(options.source),
            collapsedGroups: options.collapsedGroups,
            filterViewMode: options.viewMode,
            style: options.style
        });
    }

    protected _afterMount(options: IViewPanelOptions): void {
        if (options.useStore) {
            this._resetCallbackId = Store.declareCommand('resetFilter', this.resetFilter.bind(this));
        }
    }

    protected _beforeUpdate(options: IViewPanelOptions): void {
        this._viewModel.update({
            source: coreClone(options.source),
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
        this._notifyChanges();
    }

    protected _editingObjectChanged(event: SyntheticEvent, editingObject: Record<string, any>): void {
        this._viewModel.setEditingObject(editingObject);
        this._notifyChanges();
    }

    protected _groupClick(e: SyntheticEvent, dispItem: GroupItem<Model>, clickEvent: SyntheticEvent<MouseEvent>): void {
        const itemContents = dispItem.getContents() as string;
        const isResetClick = clickEvent?.target.closest('.controls-FilterViewPanel__groupReset');
        const isExpanderClick = clickEvent?.target.closest('.controls-FilterViewPanel__groupExpander');
        this._viewModel.handleGroupClick(itemContents, isExpanderClick);
        if (isResetClick) {
            this._resetFilterItem(dispItem);
        }
        this._notify('collapsedGroupsChanged', [this._viewModel.getCollapsedGroups()]);
    }

    protected _handleExtendedItemsChanged(): void {
        this._notifyChanges();
    }

    private _resetFilterItem(dispItem: GroupItem<Model>): void {
        const itemContent = dispItem.getContents();
        this._viewModel.resetFilterItem(itemContent);
        this._notifyChanges();
    }

    private _notifyChanges(): void {
        const newSource = this._getUpdatedSource(coreClone(this._options.source), this._viewModel.getSource());
        this._notify('filterChanged', [this._viewModel.getEditingObject()]);
        this._notify('sourceChanged', [newSource]);
    }

    private _getUpdatedSource(target: IFilterItem[] = [], source: IFilterItem[] = []): IFilterItem[] {
        target.forEach((targetItem) => {
            source.forEach((sourceItem) => {
                if (isEqualItems(targetItem, sourceItem)) {
                    if (targetItem.hasOwnProperty('value')) {
                        object.setPropertyValue(targetItem, 'value', sourceItem.value);
                    }
                    if (targetItem.hasOwnProperty('viewMode')) {
                        object.setPropertyValue(targetItem, 'viewMode', sourceItem.viewMode);
                    }
                    if (targetItem.hasOwnProperty('textValue')) {
                        object.setPropertyValue(targetItem, 'textValue', sourceItem.textValue);
                    }
                }
            });
        });
        return target;
    }

    resetFilter(): void {
        this._viewModel.resetFilter();
        this._notifyChanges();
    }
}

Object.defineProperty(View, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): Partial<IViewPanelOptions> {
        return {
            backgroundStyle: 'default',
            viewMode: 'default',
            style: 'default',
            orientation: 'vertical'
        };
    }
});
