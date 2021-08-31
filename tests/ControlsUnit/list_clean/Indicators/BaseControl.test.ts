import {assert} from 'chai';
import {getCorrectBaseControlConfig} from '../BaseControl.test';
import {Memory} from 'Types/source';
import {BaseControl} from 'Controls/baseList';

describe('Controls/list_clean/Indicators/BaseControl', () => {
    describe('onCollectionChanged', () => {
        it('not throw errors', async () => {
            const options = getCorrectBaseControlConfig({
                source: new Memory({
                    keyProperty: 'id',
                    data: [ { id: 1 } ]
                })
            });
            const baseControl = new BaseControl(options, {});
            await baseControl._beforeMount(options);
            baseControl.saveOptions(options);

            const newOptions = getCorrectBaseControlConfig({
                source: new Memory({
                    keyProperty: 'id',
                    data: [ { id: 1 }, { id: 2 } ]
                }),
                viewModelConstructor: 'Controls/grid:GridCollection',
                columns: []
            });
            assert.doesNotThrow(baseControl._beforeUpdate.bind(baseControl, newOptions));
        });
    });
});
