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

    it('getMonochromeColor', () => {
        let result: string;
        result = ZenWrapper.getMonochromeColor('dark');
        assert.equal('#fff', result, 'Wrong calculated color');

        result = ZenWrapper.getMonochromeColor('light');
        assert.equal('#000', result, 'Wrong calculated color');
    });

    it('getMonochromeColorWithOpacity', () => {
        let result: string;
        result = ZenWrapper.getMonochromeColorWithOpacity('dark', '0.2');
        assert.equal('rgba(255,255,255,0.2)', result, 'Wrong calculated color');

        result = ZenWrapper.getMonochromeColorWithOpacity('light', '0.3');
        assert.equal('rgba(0,0,0,0.3)', result, 'Wrong calculated color');

        result = ZenWrapper.getMonochromeColorWithOpacity('light');
        assert.equal('rgba(0,0,0,1)', result, 'Wrong calculated color');
    });

    it('getColor', () => {
        let result: string;
        result = ZenWrapper.getColor({ r: 45, g: 45, b: 45});
        assert.equal('rgb(45,45,45)', result, 'Wrong calculated color');
    });

    it('getColorWithOpacity', () => {
        let result: string;
        result = ZenWrapper.getColor({ r: 45, g: 45, b: 45});
        assert.equal('rgb(45,45,45)', result, 'Wrong calculated color');

        result = ZenWrapper.getColorWithOpacity({ r: 45, g: 45, b: 45}, '0.2');
        assert.equal('rgba(45,45,45,0.2)', result, 'Wrong calculated color');
    });
});
