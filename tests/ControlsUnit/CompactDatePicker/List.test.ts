import {assert} from 'chai';
import List from 'Controls/_compactDatePicker/List';

describe('Controls/_compactDatePicker/List', () => {

    describe('_isLastMonth', () => {
        [{
            displayedRanges: [[new Date(2021, 0), new Date(2022, 3)]],
            date: new Date(2022, 3),
            result: true
        }, {
            displayedRanges: [[new Date(2021, 0), new Date(2022, 3)]],
            date: new Date(2021, 3),
            result: false
        }, {
            displayedRanges: [[new Date(2021, 0), null]],
            date: new Date(2022, 3),
            result: false
        }, {
            displayedRanges: [[new Date(2021, 0), new Date(2022, 3)], [new Date(2025, 0), new Date(2026, 5)]],
            date: new Date(2022, 3),
            result: false
        }, {
            displayedRanges: [[new Date(2021, 0), new Date(2022, 3)], [new Date(2025, 0), new Date(2026, 5)]],
            date: new Date(2026, 5),
            result: true
        }, {
            date: new Date(2022, 3),
            result: false
        }].forEach((test) => {
            it('should return ', () => {
                const component = new List();
                component._options = {
                    displayedRanges: test.displayedRanges
                };
                const result = component._isLastMonth(test.date);

                assert.equal(result, test.result);
            });
        });
    });

    describe('_getFormattedCaption', () => {
        it('should return correct caption in not current year', () => {
            const component = new List();
            const date = new Date(2020,  2, 1);
            const month = "Апрель'20";
            const result = component._getFormattedCaption(date);
            assert.equal(month, result);
        });

        it('should return correct caption in current year', () => {
            const component = new List();
            const clock = sinon.useFakeTimers(new Date(2020, 1).getTime(), 'Date');
            const date = new Date(2020,  2, 1);
            const month = 'Апрель';
            const result = component._getFormattedCaption(date);
            assert.equal(month, result);
            clock.restore();
        });
    });

});
