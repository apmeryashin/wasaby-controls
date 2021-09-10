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

});
