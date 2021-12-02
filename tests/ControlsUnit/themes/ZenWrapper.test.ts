import {ZenWrapper} from 'Controls/themes';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import {assert} from 'chai';

interface IRgb {
    r: number;
    g: number;
    b: number;
}

describe('Controls/themes:ZenWrapper', () => {

    it('calculateRGB', () => {
        let result: IRgb;
        const emptyResult: IRgb = { r: 255, g: 255, b: 255 };

        result = ZenWrapper.calculateRGB('45,45,45');
        assert.deepEqual({ r: 45, g: 45, b: 45}, result, 'Wrong calculated color');

        result = ZenWrapper.calculateRGB('45, 45, 45');
        assert.deepEqual({ r: 45, g: 45, b: 45}, result, 'Wrong calculated color');

        result = ZenWrapper.calculateRGB('rgb(45, 45, 45)');
        assert.deepEqual({ r: 45, g: 45, b: 45}, result, 'Wrong calculated color');

        result = ZenWrapper.calculateRGB('(45,  45)');
        assert.deepEqual(emptyResult, result, 'Wrong calculated color');

        result = ZenWrapper.calculateRGB('');
        assert.deepEqual(emptyResult, result, 'Wrong calculated color');

        result = ZenWrapper.calculateRGB('#ccc');
        assert.deepEqual({ r: 204, g: 204, b: 204 }, result, 'Wrong calculated color');
    });

    it('getMonochromeColorRGB', () => {
        let result: string;
        result = ZenWrapper.getMonochromeColorRGB('dark');
        assert.equal('255,255,255', result, 'Wrong calculated color');

        result = ZenWrapper.getMonochromeColorRGB('light');
        assert.equal('0,0,0', result, 'Wrong calculated color');
    });

    it('getColor', () => {
        let result: string;
        result = ZenWrapper.getColor({ r: 45, g: 45, b: 45});
        assert.equal('rgb(45,45,45)', result, 'Wrong calculated color');
    });

    it('calculateVariables', () => {
        let result: object;
        result = ZenWrapper.calculateVariables({ r: 45, g: 46, b: 47},
            { r: 13, g: 14, b: 15}, 'dark');
        assert.deepEqual({
            '--dominant-color_zen': 'rgb(45,46,47)',
            '--dominant_zen_rgb': '45,46,47',
            '--complementary-color_zen': 'rgb(13,14,15)',
            '--complementary_zen_rgb': '13,14,15',
            '--mono_zen_rgb': '255,255,255'
        }, result, 'Wrong calculated color');
    });
});
