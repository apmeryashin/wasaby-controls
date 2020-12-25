import rk = require('i18n!Controls');
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as ListTemplate from 'wml!Controls/_filterPanel/Editors/ListBase';
import * as ColumnTemplate from 'wml!Controls/_filterPanel/Editors/resources/ColumnTemplate';
import * as CircleTemplate from 'wml!Controls/_filterPanel/Editors/resources/CircleTemplate';
import {StackOpener} from 'Controls/popup';
import {Model} from 'Types/entity';
import {IFilterOptions, ISourceOptions, INavigationOptions, IItemActionsOptions, ISelectorDialogOptions, ISelectorTemplate} from 'Controls/interface';
import {IList} from 'Controls/list';
import {IColumn} from 'Controls/grid';
import {RecordSet} from 'Types/collection';

export interface IListEditorOptions extends IControlOptions, IFilterOptions, ISourceOptions, INavigationOptions,
    IItemActionsOptions, IList, IColumn, ISelectorDialogOptions {
    propertyValue: number[]|string[];
    showSelectorCaption?: string;
    additionalTextProperty: string;
}

abstract class ListEditorBase extends Control<IListEditorOptions> {
    protected _template: TemplateFunction = ListTemplate;
    protected _circleTemplate: TemplateFunction = CircleTemplate;
    protected _columns: object[] = null;
    protected _stackOpener: StackOpener = null;
    protected _items: RecordSet = null;
    protected _selectedKeys: string[]|number[] = [];
    private _itemsReadyCallback: Function = null;

    protected abstract _handleSelectedKeysChanged(event: SyntheticEvent, keys: string[]|number[]): void;
    protected abstract _handleSelectorResult(result: Model[]): void;

    protected _beforeMount(options: IListEditorOptions): void {
        this._selectedKeys = options.propertyValue;
        this._setColumns(options.displayProperty, options.propertyValue, options.additionalTextProperty);
        this._itemsReadyCallback = this._handleItemsReadyCallback.bind(this);
    }

    protected _beforeUpdate(options: IListEditorOptions): void {
        const valueChanged = options.propertyValue !== this._options.propertyValue;
        const displayPropertyChanged = options.displayProperty !== this._options.displayProperty;
        const additionalDataChanged = options.additionalTextProperty !== this._options.additionalTextProperty;
        if (additionalDataChanged || valueChanged || displayPropertyChanged) {
            this._selectedKeys = options.propertyValue;
            this._setColumns(options.displayProperty, options.propertyValue, options.additionalTextProperty);
        }
    }

    protected _handleFooterClick(event: SyntheticEvent): void {
        const selectorOptions = this._options.selectorTemplate;
        this._getStackOpener().open({
            ...{
                opener: this,
                templateOptions: this._getTemplateOptions(selectorOptions),
                template: selectorOptions.templateName,
                eventHandlers: {
                    onResult: this._handleSelectorResult.bind(this)
                }
            },
            ...selectorOptions.popupOptions
        });
    }

    protected _getTemplateOptions(selectorOptions: ISelectorTemplate): object {
        return selectorOptions.templateOptions;
    }

    protected _handleItemsReadyCallback(items: RecordSet): void {
        this._items = items;
    }

    protected _handleItemClick(event: SyntheticEvent, item: Model, nativeEvent: SyntheticEvent): void {
        const contentClick = nativeEvent.target.closest('.controls-EditorList__columns');
        if (contentClick) {
            this._notifyPropertyValueChanged([item.get(this._options.keyProperty)], true);
        }
    }

    protected _setColumns(displayProperty: string, propertyValue: number|string|string[]|number[], additionalTextProperty?: string): void {
        this._columns = [{
            template: ColumnTemplate,
            selected: propertyValue,
            displayProperty
        }];
        if (additionalTextProperty) {
            this._columns.push({align: 'right', displayProperty: additionalTextProperty, width: 'auto'});
        }
    }

    protected _beforeUnmount(): void {
        if (this._stackOpener) {
            this._stackOpener.destroy();
        }
    }

    protected _notifyPropertyValueChanged(value: string[]|number[], needColapse?: boolean): void {
        const extendedValue = {
            value,
            textValue: this._getTextValue(value),
            needColapse
        };
        this._selectedKeys = value;
        this._setColumns(this._options.displayProperty, this._selectedKeys, this._options.additionalTextProperty);
        this._notify('propertyValueChanged', [extendedValue], {bubbling: true});
    }

    private _getTextValue(selectedKeys: number[]|string[]): string {
        let text = '';
        selectedKeys.forEach((item, index) => {
            const record = this._items.getRecordById(item);
            text = text + record.get(this._options.displayProperty) + (index === selectedKeys.length - 1 ? '' : ', ');
        });
        return text;
    }

    private _getStackOpener(): StackOpener {
        if (!this._stackOpener) {
            this._stackOpener = new StackOpener();
        }
        return this._stackOpener;
    }

    static _theme: string[] = ['Controls/filterPanel', 'Controls/toggle'];

    static getDefaultOptions(): object {
        return {
            showSelectorCaption: rk('Другие'),
            circleStyle: 'default',
            itemPadding: {
                right: 'm'
            }
        };
    }
}
export default ListEditorBase;
