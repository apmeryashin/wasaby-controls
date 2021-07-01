import {Control} from 'UI/Base';
import * as template from 'wml!Controls/_filterPanel/View/View';
import {SyntheticEvent} from 'Vdom/Vdom';
import {TemplateFunction} from 'UI/Base';
import {GroupItem} from 'Controls/display';
import {IFilterItem} from 'Controls/filter';
import {IItemPadding} from 'Controls/display';
import {Model} from 'Types/entity';
import 'css!Controls/filterPanel';
import {default as ViewModel} from './View/ViewModel';
import {StickyOpener} from 'Controls/popup';
import find = require('Core/helpers/Object/find');
import chain = require('Types/chain');
import Utils = require('Types/util');
import {HistoryUtils} from 'Controls/filter';
import {factory, List, RecordSet} from 'Types/collection';
import {isEqual} from 'Types/object';

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
}

const getPropValue = Utils.object.getPropertyValue.bind(Utils);

export default class View extends Control<IViewPanelOptions> {
    protected _template: TemplateFunction = template;
    protected _itemPadding: IItemPadding = {
        bottom: 'null'
    };
    protected _viewModel: ViewModel = null;
    protected _applyButtonSticky: StickyOpener;
    protected _historyItems: RecordSet | List<IFilterItem[]>;

    protected _beforeMount(options: IViewPanelOptions): Promise<RecordSet | List<IFilterItem[]>> {
        this._applyButtonSticky = new StickyOpener();
        this._viewModel = new ViewModel({
            source: options.source,
            collapsedGroups: options.collapsedGroups,
            applyButtonSticky: options.viewMode === 'default' && this._applyButtonSticky
        });
        return this._loadHistoryItems(options.historyId);
    }

    protected _beforeUpdate(options: IViewPanelOptions): void | Promise<RecordSet | List<IFilterItem[]>> {
        this._viewModel.update({
            source: options.source,
            collapsedGroups: options.collapsedGroups,
            applyButtonSticky: options.viewMode === 'default' && this._applyButtonSticky
        });
        if (options.historyId !== this._options.historyId) {
            return this._loadHistoryItems(options.historyId);
        }
    }

    protected _onPinClick(event: Event, item: Model): void {
        const historySource = this._getHistorySource();
        historySource.update(item, {
            $_pinned: !item.get('pinned')
        });
        this._historyItems = this._filterHistoryItems(historySource.getItems());
    }

    protected _handleHistoryItemClick(event: SyntheticEvent, filter: IFilterItem): void {
        const historyObject = this._getHistoryObject(filter);
        chain.factory(historyObject).each((elem) => {
            const name = getPropValue(elem, 'name');
            const textValue = getPropValue(elem, 'textValue');
            const value = getPropValue(elem, 'value');
            const needCollapse = getPropValue(elem, 'needCollapse');
            const editorValue = {
                value,
                textValue,
                needCollapse
            };
            this._viewModel.setEditingObjectValue(name, editorValue);
        });
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
        this._viewModel.collapseGroup(editorGroup);
        this._notify('filterApplied');
    }

    protected _editingObjectChanged(event: SyntheticEvent, editingObject: Record<string, any>): void {
        this._viewModel.setEditingObject(editingObject);
        if (this._options.viewMode === 'default') {
            this._notifyChanges();
        }
    }

    protected _propertyValueChanged(event: SyntheticEvent, filterItem: IFilterItem, itemValue: object): void {
        this._viewModel.setEditingObjectValue(filterItem.name, itemValue);
    }

    protected _groupClick(e: SyntheticEvent, dispItem: GroupItem<Model>, clickEvent: SyntheticEvent<MouseEvent>): void {
        const itemContents = dispItem.getContents() as string;
        const isResetClick = clickEvent?.target.closest('.controls-FilterViewPanel__groupReset');
        this._viewModel.handleGroupClick(itemContents, isResetClick);
        if (isResetClick) {
            this._resetFilterItem(dispItem);
        }
        this._notify('collapsedGroupsChanged', [this._viewModel.getCollapsedGroups()]);
    }

    private _resetFilterItem(dispItem: GroupItem<Model>): void {
        const itemContent = dispItem.getContents();
        this._viewModel.resetFilterItem(itemContent);
        this._notifyChanges();
    }

    private _notifyChanges(): void {
        this._notify('sendResult', [{
            items: this._viewModel.getSource(),
            filter: this._viewModel.getEditingObject()
        }], {bubbling: true});
        this._notify('filterChanged', [this._viewModel.getEditingObject()]);
        this._notify('sourceChanged', [this._viewModel.getSource()]);
    }

    private _getHistorySource(): Model {
        return HistoryUtils.getHistorySource({ historyId: this._options.historyId });
    }

    private _getHistoryObject(filterItem: IFilterItem): object {
        return this._getHistorySource().getDataObject(filterItem);
    }

    private _getItemText(filterItem: IFilterItem): string {
        const historyObject = this._getHistoryObject(filterItem);
        const textArr = [];
        chain.factory(historyObject).each((elem) => {
            const sourceItem = this._viewModel.getSourceItemByName(getPropValue(elem, 'name'));
            const value = getPropValue(elem, 'value');
            const textValue = getPropValue(elem, 'textValue');
            const visibility = getPropValue(elem, 'visibility');

            if (!isEqual(value, getPropValue(sourceItem, 'textValue')) && (visibility === undefined || visibility) && textValue) {
                textArr.push(textValue);
            }
        });
        return textArr.join(', ');
    }

    private _loadHistoryItems(historyId: string) {
        if (historyId) {
            const config = {
                historyId,
                recent: 'MAX_HISTORY'
            };
            return HistoryUtils.loadHistoryItems(config).then(
                (items) => {
                    this._historyItems = this._filterHistoryItems(items);
                    return this._historyItems;
                }, () => {
                    this._historyItems = new List({ items: [] });
                });
        }
    }

    private _filterHistoryItems(items: RecordSet): RecordSet {
        let result;
        if (items) {
            result = chain.factory(items).filter((item) => {
                let validResult = false;

                const objectData = JSON.parse(item.get('ObjectData'));
                if (objectData) {
                    const history = objectData.items || objectData;

                    for (let i = 0, length = history.length; i < length; i++) {
                        const textValue = getPropValue(history[i], 'textValue');
                        const value = getPropValue(history[i], 'value');

                        // 0 and false is valid
                        if (textValue !== '' && textValue !== undefined && textValue !== null) {
                            const originalItem = this._viewModel.getSourceItemByName(getPropValue(history[i], 'name'));
                            const hasResetValue = originalItem && originalItem.hasOwnProperty('resetValue');

                            if (!hasResetValue || hasResetValue && !isEqual(value, getPropValue(originalItem, 'resetValue'))) {
                                validResult = true;
                                break;
                            }
                        }
                    }
                }
                return validResult;
            }).value(factory.recordSet, {adapter: items.getAdapter()});
        } else {
            result = items;
        }

        return result;
    }
}

Object.defineProperty(View, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): Partial<IViewPanelOptions> {
        return {
            backgroundStyle: 'default',
            viewMode: 'default'
        };
    }
});
