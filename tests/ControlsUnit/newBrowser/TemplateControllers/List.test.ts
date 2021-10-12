import ListController from 'Controls/_newBrowser/TemplateControllers/List';
import {getDefaultViewCfg} from 'ControlsUnit/newBrowser/ConfigurationHelper';
import {assert} from 'chai';

describe('Controls/_newBrowser/TemplateControllers/List', () => {
    const controller = new ListController({
        templateProperties: {
            imageProperty: 'image',
            descriptionProperty: 'description',
            gradientColorProperty: 'gradient'
        },
        listConfiguration: getDefaultViewCfg()
    });
    it('getters', () => {
        assert.equal(controller.imagePosition, 'left');
        assert.equal(controller.imageViewMode, 'circle');
        assert.equal(controller.imageProperty, 'image');
    });
})
