import MonthListItem from 'Controls/_calendar/MonthList/MonthListItem';
import {Base as dateUtils} from 'Controls/dateUtils';
import {assert} from 'chai';

describe('Controls/_calendar/MonthList/MonthListItem', () => {
    describe('_updateRangeValues', () => {
        [{
            startValue: new Date(2020, 0),
            endValue: new Date(2020, 0, 31),
            month: new Date(2020, 0),
            shouldUpdateValues: true
        }, {
            startValue: new Date(2020, 0),
            endValue: new Date(2020, 0 , 31),
            month: new Date(2021, 0),
            shouldUpdateValues: false
        }, {
            startValue: null,
            endValue: null,
            month: new Date(2021, 0),
            shouldUpdateValues: true
        }, {
            startValue: new Date(2020, 0, 2),
            endValue: new Date(2020, 0, 5),
            month: new Date(2020, 0, 1),
            shouldUpdateValues: true
        }, {
            startValue: new Date(2020, 0, 2),
            endValue: new Date(2020, 0, 5),
            month: new Date(2020, 0, 8),
            shouldUpdateValues: true
        }].forEach((options, index) => {
            it('should update startValue and endValue if values hits this month ' + index, () => {
                const component = new MonthListItem({});
                component._updateRangeValues(options.startValue, options.endValue, options.month);

                if (options.shouldUpdateValues) {
                    assert.isTrue(dateUtils.isDatesEqual(options.startValue, component._startValue));
                    assert.isTrue(dateUtils.isDatesEqual(options.endValue, component._endValue));
                } else {
                    assert.isUndefined(component._startValue);
                    assert.isUndefined(component._endValue);
                }
            });
        });
    });
});
