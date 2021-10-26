import TableController from 'Controls/_newBrowser/TemplateControllers/Table';
import {getDefaultViewCfg} from 'ControlsUnit/newBrowser/ConfigurationHelper';
import {assert} from 'chai';

describe('Controls/_newBrowser/TemplateControllers/List', () => {
    const controller = new TableController({
        templateProperties: {
            imageProperty: 'image',
            descriptionProperty: 'description',
            gradientColorProperty: 'gradient'
        },
        listConfiguration: getDefaultViewCfg()
    });
    it('getters', () => {
        assert.equal(controller.imageViewMode, 'circle');
    });
});
