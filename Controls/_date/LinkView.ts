import IDateLinkView from 'Controls/_date/interface/ILinkView';
import componentTmpl = require('wml!Controls/_date/LinkView/LinkView');
import {Logger} from 'UI/Utils';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IFontColorStyleOptions} from 'Controls/interface';
import {isLeftMouseButton} from 'Controls/popup';
import {SyntheticEvent} from 'Vdom/Vdom';
import {descriptor} from 'Types/entity';
import dateControlsUtils from '../_date/Utils';
import {Range as dateRangeUtils} from 'Controls/dateUtils';
import ICaptionOptions from 'Controls/_date/interface/ICaption';
import IValueOptions from 'Controls/_date/interface/IValue';
import getFormattedDateRange = require('Core/helpers/Date/getFormattedDateRange');
import 'css!Controls/dateRange';
import 'css!Controls/CommonClasses';

export interface ILinkView extends IControlOptions, IFontColorStyleOptions, ICaptionOptions, IValueOptions {
}

class LinkView<T extends ILinkView> extends Control<T> {
    protected _template: TemplateFunction = componentTmpl;
    protected _caption = '';
    protected _fontColorStyle: string = null;
    protected _fontSize: string = null;
    protected _fontWeight: string = null;

    private _defaultFontColorStyle: string;
    private _defaultFontSize: string;
    private _defaultFontWeight: string;

    protected _resetButtonVisible: boolean;

    protected _beforeMount(options: ILinkView): void {
        this._updateResetButtonVisible(options);
        this._setDefaultFontSettings(options.viewMode);
        this._updateCaption(options);
        this._updateStyles(options);
        if (options.viewMode) {
            Logger.warn('LinkView: Используется устаревшая опция viewMode, используйте fontSize, fontColorStyle, fontWeight');
        }
    }

    protected _beforeUpdate(options: ILinkView): void {
        this._updateResetButtonVisible(options);
        this._updateCaption(options);
        this._setDefaultFontSettings(options.viewMode);
        this._updateStyles(options);
    }

    private _setDefaultFontSettings(viewMode: string): void {
        // TODO: https://online.sbis.ru/opendoc.html?guid=3e299f91-c46c-4a34-bf8f-d319d03591ac
        this._defaultFontSize = viewMode === 'selector' ? 'l' : 'm';
        this._defaultFontColorStyle = viewMode === 'label' ? 'label' : 'link';
        this._defaultFontWeight =  viewMode === 'selector' ? 'bold' : 'normal';
    }

    protected _resetButtonClickHandler(): void {
        this._notify('resetButtonClick');
    }

    private _updateResetButtonVisible(options): void {
        this._resetButtonVisible = dateRangeUtils.getResetButtonVisible(options.startValue, options.endValue,
            options.resetStartValue, options.resetEndValue);
    }

    getPopupTarget() {
        return this._children.openPopupTarget;
    }

    private _shiftPeriod(delta: number): void {
        const value: Date = this._options.value;
        const newValue = new Date(value.getFullYear(), value.getMonth(), value.getDate() + delta);
        this._notifyValueChanged(newValue);
    }

    shiftBack(): void {
        this._shiftPeriod(-1);
    }

    shiftForward(): void {
        this._shiftPeriod(1);
    }

    shiftPeriod(delta: number): void {
        this._shiftPeriod(delta);
    }

    private _notifyValueChanged(value: Date): void {
        this._notify('valueChanged', [value]);
    }

    protected _mouseDownHandler(event: SyntheticEvent<MouseEvent>): void {
        if (!isLeftMouseButton(event)) {
            return;
        }
        if (!this._options.readOnly) {
            this._notify('linkClick');
        }
    }

    protected _updateCaption(options): void {
        if (this._options.value !== options.value || this._options.emptyCaption !== options.emptyCaption ||
            this._options.captionFormatter !== options.captionFormatter) {
            const opts = options || this._options;
            let captionFormatter;
            const startValue = options.value;
            const endValue = options.value;

            if (opts.captionFormatter) {
                captionFormatter = opts.captionFormatter;
            } else {
                captionFormatter = this._formatDateCaption;
            }
            this._caption = captionFormatter(startValue, endValue, options.emptyCaption);
        }
    }

    private _formatDateCaption(startValue: Date, endValue: Date, emptyCaption: string): string {
        return getFormattedDateRange(
            startValue,
            endValue,
            {
                contractToMonth: true,
                fullNameOfMonth: true,
                contractToQuarter: true,
                contractToHalfYear: true,
                emptyPeriodTitle: emptyCaption || '\xA0'
            }
        );
    }

    private _updateStyles(newOption): void {
        this._fontColorStyle = newOption.fontColorStyle || this._defaultFontColorStyle;
        if (newOption.readOnly) {
            if (this._fontColorStyle === 'filterPanelItem' || this._fontColorStyle === 'filterItem') {
                this._fontColorStyle = this._fontColorStyle + '_readOnly';
            } else {
                this._fontColorStyle = 'default';
            }
        }
        this._fontSize = newOption.fontSize || this._defaultFontSize;
        this._fontWeight = newOption.fontWeight || this._defaultFontWeight;
    }

    static getDefaultOptions = () => {
        return {
            ...IDateLinkView.getDefaultOptions(),
            emptyCaption: IDateLinkView.EMPTY_CAPTIONS.NOT_SPECIFIED
        };
    };

    static getOptionTypes = () => {
        return {
            ...IDateLinkView.getOptionTypes(),
            captionFormatter: descriptor(Function)
        };
    }
}

Object.defineProperty(LinkView, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return LinkView.getDefaultOptions();
    }
});

LinkView.getOptionTypes = () => {
    return {
        ...IDateLinkView.getOptionTypes(),
        captionFormatter: descriptor(Function)
    };
};

export default LinkView;
