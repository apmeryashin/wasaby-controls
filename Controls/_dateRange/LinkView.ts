import {LinkView as LinkViewBase, ILinkView as ILinkViewBase} from 'Controls/date';
import dateControlsUtils from 'Controls/_dateRange/Utils';
import {IDateRangeOptions} from 'Controls/_dateRange/interfaces/IDateRange';
import rk = require('i18n!Controls');
import DateRangeModel from 'Controls/_dateRange/DateRangeModel';
import {EventUtils} from 'UI/Events';

interface ILinkView extends IDateRangeOptions, ILinkViewBase {
}

export default class LinkView extends LinkViewBase<ILinkView> {

    private _rangeModel: DateRangeModel;
    protected _caption: string;

    constructor(options: ILinkView) {
        super(options);
        this._rangeModel = new DateRangeModel({
            dateConstructor: options.dateConstructor
        });
        EventUtils.proxyModelEvents(this, this._rangeModel, ['startValueChanged', 'endValueChanged', 'rangeChanged']);
    }

    protected _beforeMount(options: ILinkView): void {
        super._beforeMount(options);
    }

    protected _beforeUpdate(options: ILinkView): void {
        super._beforeUpdate(options);
    }

    protected _beforeUnmount(): void {
        this._rangeModel.destroy();
    }

    shiftPeriod(delta: number): void {
        if (delta === 1) {
            this.shiftForward();
        } else {
            this.shiftBack();
        }
    }

    shiftBack(): void {
        this._rangeModel.shiftBack();
        this._setNewCaption(this._options);
    }

    shiftForward(): void {
        this._rangeModel.shiftForward();
        this._setNewCaption(this._options);
    }

    protected _updateCaption(options: ILinkView): void {
        const changed = this._rangeModel.update(options);
        if (changed || this._options.emptyCaption !== options.emptyCaption ||
            this._options.captionFormatter !== options.captionFormatter) {
            this._setNewCaption(options);
        }
    }

    private _setNewCaption(options: ILinkView): void {
        let captionFormatter;
        let startValue;
        let endValue;
        let captionPrefix = '';

        if (options.captionFormatter) {
            captionFormatter = options.captionFormatter;
            startValue = this._rangeModel.startValue;
            endValue = this._rangeModel.endValue;
        } else {
            captionFormatter = dateControlsUtils.formatDateRangeCaption;

            if (this._rangeModel.startValue === null && this._rangeModel.endValue === null) {
                startValue = null;
                endValue = null;
            } else if (this._rangeModel.startValue === null) {
                startValue = this._rangeModel.endValue;
                endValue = this._rangeModel.endValue;
                captionPrefix = `${rk('по', 'Period')} `;
            } else if (this._rangeModel.endValue === null) {
                startValue = this._rangeModel.startValue;
                endValue = this._rangeModel.startValue;
                captionPrefix = `${rk('с')} `;
            } else {
                startValue = this._rangeModel.startValue;
                endValue = this._rangeModel.endValue;
            }
        }
        this._caption = captionPrefix + captionFormatter(startValue, endValue, options.emptyCaption);
    }
}
