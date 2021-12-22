import Deferred = require('Core/Deferred');
import {Date as WSDate} from 'Types/entity';
import { Memory, Query } from 'Types/source';
import ITEM_TYPES from './ItemTypes';
import {TemplateFunction} from 'UI/Base';
import monthListUtils from './Utils';
import {Base as dateUtils} from 'Controls/dateUtils';

/**
 * Источник данных который возвращает данные для построения календарей в списочных контролах.
 * Каждый элемент это месяц.
 *
 * @class Controls/_calendar/MonthList/MonthSource
 * @extends Types/source:Base
 * @author Красильников А.С.
 * @private
 */

export default class MonthsSource extends Memory {
    _moduleName: 'Controls._calendar.MonthList.MonthsSource';

    $protected: {
        _dataSetItemsProperty: 'items',
        _dataSetMetaProperty: 'meta'
    };

    _$keyProperty: 'id';

    _header: boolean = false;
    protected _dateConstructor: Function;
    protected _displayedRanges: [];
    protected _viewMode: string;
    protected _order: string;
    private _stubTemplate: TemplateFunction;

    constructor(options) {
        super(options);
        this._header = options.header;
        this._stubTemplate = options.stubTemplate;
        this._dateConstructor = options.dateConstructor || WSDate;

        this._displayedRanges = options.displayedRanges || this._getDefaultDisplayedRanges();
        this._viewMode = options.viewMode;
        this._order = options.order;
    }

    private _getDefaultDisplayedRanges(): [Date[]] {
        // Ограничиваем период с 1400 года по (текущий год + 1000)
        const lastMonth = 11;
        return [[new Date(dateUtils.MIN_YEAR_VALUE, 0), new Date( dateUtils.MAX_YEAR_VALUE, lastMonth)]];
    }

    query(query: Query)/*: ExtendPromise<DataSet>*/ {
        const offset = query.getOffset();
        const where = query.getWhere();
        const limit = query.getLimit() || 1;
        let executor;

        executor = (() => {
            const adapter = this.getAdapter().forTable();
            let items = [];
            const monthEqual = where['id~'];
            const monthGt = where['id>='];
            const monthLt = where['id<='];
            let month = monthEqual || monthGt || monthLt;
            let delta: number = 1;
            let before: boolean = true;
            let monthHeader: Date;
            let period: Date[];

            month = monthListUtils.idToDate(month, this._dateConstructor);

            month = this._shiftRange(month, offset);

            // Проверяем, что месяц непоследний отображаемый, иначе нужно указать в items, что сверху данных больше нет
            const monthBefore = new Date(month.getFullYear(), month.getMonth() - 1);
            if (!this._isDisplayed(monthBefore)) {
                const hiddenPeriod = this._getHiddenPeriod(monthBefore);
                if (hiddenPeriod[0] === null) {
                    before = false;
                }
            }
            if (this._order === 'desc') {
                delta *= -1;
            }
            if (monthLt) {
                delta *= -1;
                month = this._shiftRange(month, delta);
            }

            if (monthGt && !this._header) {
                month = this._shiftRange(month, delta);
            }

            for (let i = 0; i < limit; i++) {
                if (this._header && delta < 0) {
                    monthHeader = this._shiftRange(month, 1);
                    if (this._isDisplayed(monthHeader)) {
                        this._pushHeader(items, monthHeader);
                    }
                }

                if (this._isDisplayed(month)) {
                    items.push({
                        id: monthListUtils.dateToId(month),
                        date: month,
                        type: ITEM_TYPES.body
                    });
                } else {
                    period = this._getHiddenPeriod(month, delta);
                    // для заглушки от минус бесконечности до даты используем в качестве id дату конца(period[1])
                    if (this._stubTemplate) {
                        items.push({
                            id: monthListUtils.dateToId(period[0] || period[1]),
                            date: period[0] || period[1],
                            startValue: period[0],
                            endValue: period[1],
                            type: ITEM_TYPES.stub
                        });
                    }
                    if (i === 0 && !period[0]) {
                        before = false;
                    }
                    month =  delta > 0 ? period[1] : period[0];
                }

                if (this._header && delta > 0 && month) {
                    monthHeader = this._shiftRange(month, delta);
                    if (this._isDisplayed(monthHeader)) {
                        this._pushHeader(items, monthHeader);
                    }
                }

                if (!month) {
                    break;
                }
                month = this._shiftRange(month, delta);
            }

            if (monthLt) {
                items = items.reverse();
            }

            this._each(
                items,
                (item) => {
                    adapter.add(item);
                }
            );
            items = this._prepareQueryResult({
                items: adapter.getData(),
                meta: {
                    total: monthEqual ?
                        { before, after: Boolean(month) } : Boolean(month)
                }
            }, null);

            return items;
        });

        if (this._loadAdditionalDependencies) {
            return this._loadAdditionalDependencies().addCallback(executor);
        } else {
            return Deferred.success(executor());
        }
    }

    private _pushHeader(items: any[], month: Date): void {
        items.push({
            id: 'h' + monthListUtils.dateToId(month),
            date: month,
            type: ITEM_TYPES.header
        });
    }

    private _isDisplayed(date: Date): boolean {
        if (!this._displayedRanges || !this._displayedRanges.length) {
            return true;
        }
        for (const range of this._displayedRanges) {
            // Строим ленту до тех пор, пока мы не дошли до конца периода, указанного в displayedRanges
            // При проверке, какая дата больше, даты переводятся в формат Unix-времени, т.е. количество секунд прошедшее
            // c 1970 года. Даты раньше 1970 года переводятся в отрицательное число.
            // Если в displayedRanges передали null, то лента должна строится бесконечно. Соотвественно, если мы будем
            // проверять date > null, дата преобразуется в Unix, а null в ноль. Результатом проверки будет false в тех
            // случаях, когда дата раньше 1970 (отрицательное число мньше, чем 0).
            // Добавляем проверку на null.
            if ((date >= range[0] || range[0] === null) && (date <= range[1] || range[1] === null)) {
                return true;
            }
        }
        return false;
    }

    private _getHiddenPeriod(date: Date): Date[] {
        let range: Date[] = [];
        for (let i = 0; i < this._displayedRanges.length; i++) {
            range = this._displayedRanges[i];
            // См. коммент в методе _isDisplayed. Та же самая ситуация, только мы наоборот ищем период, который не
            // попадает в displayedRanges
            if (date < range[0] && range[0] !== null) {
                return [
                    i === 0 ? null : this._shiftRange(this._displayedRanges[i - 1][1], 1),
                    this._shiftRange(range[0], -1)
                ];
            }
        }
        return [range[1] ? this._shiftRange(range[1], 1) : date, null];
    }

    private _shiftRange(date: Date, delta: number): Date {
        if (this._viewMode === 'month') {
            return new this._dateConstructor(date.getFullYear(), date.getMonth() + delta);
        }
        return new this._dateConstructor(date.getFullYear() + delta, 0);
    }
}
