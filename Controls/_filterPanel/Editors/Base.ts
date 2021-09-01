import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {StickyOpener} from 'Controls/popup';
import ApplyButton from 'Controls/_filterPanel/View/ApplyButton';
import 'css!Controls/filterPanel';

export abstract class BaseEditor extends Control<IControlOptions> {
    protected _applyButtonSticky: StickyOpener;
    protected _applyButtonTemplate: TemplateFunction = ApplyButton;
    protected _editorTarget: HTMLElement | EventTarget | Control<{}, void>;

    abstract _getExtendedValue(needCollapse?: boolean): object;

    protected _notifyPropertyValueChanged(needCollapse?: boolean): void {
        if (needCollapse || !this._options.applyButtonSticky) {
            this._hideApplyButton();
            this._notify('propertyValueChanged', [this._getExtendedValue(needCollapse)], {bubbling: true});
        } else {
            this._getApplyButtonSticky().open({
                opener: null,
                autofocus: false,
                template: this._applyButtonTemplate,
                targetPoint: {
                    horizontal: 'right'
                },
                templateOptions: {
                    resultHandler: this._resultHandler.bind(this),
                    name: this._options.name
                },
                direction: {
                    horizontal: 'right'
                },
                target: this._editorTarget || this._container,
                eventHandlers: {
                    onResult: this._hideApplyButton.bind(this)
                }
            });
        }
    }

    protected _resultHandler(): void {
        this._notify('propertyValueChanged', [this._getExtendedValue(true)], {bubbling: true});
    }

    protected _hideApplyButton(): void {
        if (this._applyButtonSticky) {
            this._applyButtonSticky.close();
        }
    }

    private _getApplyButtonSticky(): StickyOpener {
        if (!this._applyButtonSticky) {
            this._applyButtonSticky = this._options.applyButtonSticky;
        }
        return this._applyButtonSticky;
    }
}
