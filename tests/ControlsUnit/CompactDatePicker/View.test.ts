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

        it('should set _todayIconVisible to false', () => {
            const component = new View();
            const clock = sinon.useFakeTimers(new Date(2020, 1).getTime(), 'Date');
            const startValue = new Date(2020, 2);
            component._beforeMount({startValue});
            assert.isFalse(component._todayIconVisible);
            clock.restore();
        });
    });

});
