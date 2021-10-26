import {assert} from 'chai';
import View from 'Controls/_compactDatePicker/View';
import {Base as dateUtils} from 'Controls/dateUtils';

describe('Controls/_compactDatePicker/View', () => {

    describe('_beforeMount', () => {
        [{
            startValue: new Date(2021, 2, 5),
            position: new Date(2021, 2)
        }, {
            startValue: new Date(2021, 11, 11),
            position: new Date(2021, 11)
        }, {
            position: dateUtils.getStartOfMonth(new Date())
        }].forEach((test, index) => {
            it('should set correct position' + index, () => {
                const component = new View();
                component._beforeMount(test);
                assert.deepEqual(test.position.getFullYear(), component._position.getFullYear());
                assert.deepEqual(test.position.getMonth(), component._position.getMonth());
            });
        });

        it('should set _todayIconVisible to true', () => {
            const component = new View();
            const clock = sinon.useFakeTimers(new Date(2020, 1).getTime(), 'Date');
            const startValue = new Date(2020, 1);
            component._beforeMount({startValue});
            assert.isFalse(component._todayIconVisible);
            clock.restore();
        });

        it('should set _todayIconVisible to true', () => {
            const component = new View();
            const clock = sinon.useFakeTimers(new Date(2020, 1).getTime(), 'Date');
            const startValue = new Date(2020, 2);
            component._beforeMount({startValue});
            assert.isTrue(component._todayIconVisible);
            clock.restore();
        });
    });

    describe('_updateTodayIconVisible', () => {
        it('should set icon visible to false if current date does not hit current date', () => {
            const component = new View();
            const currentDate = new Date(2019, 7);
            const clock = sinon.useFakeTimers(currentDate.getTime(), 'Date');
            const displayedRanges = [
                [new Date(2018, 0), new Date(2019, 5)],
                [new Date(2020, 1), new Date(2021, 0)]
            ];
            component._updateTodayIconVisible(true, displayedRanges);
            assert.isFalse(component._todayIconVisible);
            clock.restore();
        });
        it('should set icon visible to true if current date hits current date', () => {
            const component = new View();
            const currentDate = new Date(2018, 7);
            const clock = sinon.useFakeTimers(currentDate.getTime(), 'Date');
            const displayedRanges = [
                [new Date(2018, 0), new Date(2019, 5)],
                [new Date(2020, 1), new Date(2021, 0)]
            ];
            component._updateTodayIconVisible(true, displayedRanges);
            assert.isTrue(component._todayIconVisible);
            clock.restore();
        });
    });
});
