import {isRequired} from 'Controls/toggle';
import {assert} from 'chai';

describe('Controls/toggle:isRequired', () => {
    it('TriState = true', () => {
        const args = {
            value: false
        };

        let value = isRequired(args);
        assert.equal(value, true);

        args.value = true;
        value = isRequired(args);
        assert.equal(value, true);

        args.value = null;
        value = isRequired(args);
        assert.notEqual(typeof value, 'boolean');
    });

    it('TriState = false', () => {
        const args = {
            value: true,
            triState: false
        };

        let value = isRequired(args);
        assert.equal(value, true);

        args.value = false;
        value = isRequired(args);
        assert.notEqual(typeof value, 'boolean');
    });
});
