import IDateLinkView from 'Controls/_date/interface/ILinkView';
import componentTmpl = require('wml!Controls/_date/LinkView/LinkView');
import {Logger} from 'UI/Utils';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IFontColorStyleOptions} from 'Controls/interface';
import {isLeftMouseButton} from 'Controls/popup';
import {SyntheticEvent} from 'Vdom/Vdom';
import {descriptor} from "Types/entity";
import dateControlsUtils from "../_date/Utils";
import {Range as dateRangeUtils} from 'Controls/dateUtils';
import ICaptionOptions from 'Controls/_date/interface/ICaption';
import * as itemTemplate from 'wml!Controls/_date/LinkView/itemTemplate';
import 'css!Controls/dateRange';
import 'css!Controls/CommonClasses';

export interface ILinkView extends IControlOptions, IFontColorStyleOptions, ICaptionOptions {
}

class LinkView<T extends ILinkView> extends Control<T> {
    protected _template: TemplateFunction = componentTmpl;
    protected _itemTemplate: TemplateFunction = itemTemplate;
    protected _caption = '';
    protected _styleClass = null;
    protected _viewMode = null;
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
        this._updateStyles({}, options);

        if (options.clearButtonVisibility) {
            Logger.error('LinkView: Используется устаревшая опция clearButtonVisibility, используйте' +
                'resetStartValue и resetEndValue');
        }
        if (options.prevArrowVisibility) {
            Logger.error('LinkView: Используется устаревшая опция prevArrowVisibility, используйте контрол ArrowButton');
        }
        if (options.nextArrowVisibility) {
            Logger.error('LinkView: Используется устаревшая опция nextArrowVisibility, используйте контрол ArrowButton');
        }
        if (options.viewMode) {
            Logger.warn('LinkView: Используется устаревшая опция viewMode, используйте fontSize, fontColorStyle, fontWeight');
        }
    }

    protected _beforeUpdate(options: ILinkView): void {
        this._updateResetButtonVisible(options);
        this._updateCaption(options);
        this._setDefaultFontSettings(options.viewMode);
        this._updateStyles(this._options, options);
    }

    private _setDefaultFontSettings(viewMode: string): void {
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
        return this._children.openPopupTarget || this._container;
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
        if (!this._options.readOnly && this._options.clickable) {
            this._notify('linkClick');
        }
    }

    protected _updateCaption(options): void {
        if (this._options.value !== options.value || this._options.emptyCaption !== options.emptyCaption ||
            this._options.captionFormatter !== options.captionFormatter) {
            const opts = options || this._options;
            let captionFormatter;
            let startValue = options.value;
            let endValue = options.value;

            if (opts.captionFormatter) {
                captionFormatter = opts.captionFormatter;
            } else {
                captionFormatter = dateControlsUtils.formatDateRangeCaption;
            }
            this._caption = captionFormatter(startValue, endValue, options.emptyCaption);
        }
    }

    private _updateStyles(options, newOption): void {
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
}

LinkView.EMPTY_CAPTIONS = IDateLinkView.EMPTY_CAPTIONS;

LinkView.getDefaultOptions = () => {
    return {
        ...IDateLinkView.getDefaultOptions(),
        emptyCaption: IDateLinkView.EMPTY_CAPTIONS.NOT_SPECIFIED
    };
};

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
    }
}

export default LinkView;
