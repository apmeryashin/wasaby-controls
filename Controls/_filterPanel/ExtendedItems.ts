import {Control, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_filterPanel/ExtendedItems/ExtendedItems';
import {SyntheticEvent} from 'Vdom/Vdom';
import {TemplateFunction} from 'UI/Base';
import {IFilterItem} from 'Controls/filter';
import {default as ViewModel} from 'Controls/_filterPanel/View/ViewModel';
import 'css!Controls/filterPanel';

interface IExtendedItemsOptions extends IControlOptions {
    viewModel: ViewModel;
}

export default class History extends Control<IExtendedItemsOptions> {
    protected _template: TemplateFunction = template;
    protected _viewModel: ViewModel = null;
    protected _expandButtonVisible: boolean;
    protected _additionalListExpanded: boolean;
    protected _additionalColumns: object;

    protected _beforeMount(options: IExtendedItemsOptions): void {
        this._viewModel = options.viewModel;
        this._additionalListExpanded = false;
        this._additionalColumns = this._viewModel.getAdditionalColumns(this._additionalListExpanded);
        this._expandButtonVisible = this._viewModel.needToCutColumnItems();
    }

    protected _beforeUpdate(options: IExtendedItemsOptions): void {
        this._additionalColumns = this._viewModel.getAdditionalColumns(this._additionalListExpanded);
        this._expandButtonVisible = this._viewModel.needToCutColumnItems();
    }

    protected _handleExpanderClick(): void {
        this._additionalListExpanded = !this._additionalListExpanded;
        this._additionalColumns = this._viewModel.getAdditionalColumns(this._additionalListExpanded);
    }

    protected _extendedValueChanged(event: SyntheticEvent, filterItem: IFilterItem, itemValue: object): void {
        this._viewModel.setEditingObjectValue(filterItem.name, itemValue);
        this._notify('extendedItemsChanged');
    }
}
