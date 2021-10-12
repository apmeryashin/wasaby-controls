import TileController from 'Controls/_newBrowser/TemplateControllers/Tile';
import {getDefaultViewCfg} from 'ControlsUnit/newBrowser/ConfigurationHelper';
import {assert} from 'chai';
import {Tree} from 'Controls/display';
import {RecordSet} from 'Types/collection';

describe('Controls/_newBrowser/TemplateControllers/Tile', () => {
    let controller;
    let config;
    const RS = new RecordSet({
        rawData: [{
            id: 'node',
            parent: null,
            node: true,
            gradient: 'gradientFromNode'
        }, {
            id: 'node',
            parent: null,
            node: true,
            gradient: 'gradientFromList'
        }]
    });
    const collection = new Tree({
        collection: RS,
        keyProperty: 'id',
        parentProperty: 'parent',
        nodeProperty: 'node',
        root: null
    });
    beforeEach(() => {
        config = getDefaultViewCfg();
        controller = new TileController({
            templateProperties: {
                imageProperty: 'image',
                descriptionProperty: 'description',
                gradientColorProperty: 'gradient'
            },
            listConfiguration: config
        });
    });
    describe('getImageProperty', () => {
        it('returns value from templateProperties', () => {
            assert.equal(controller.getImageProperty(), 'image');
        });
    });
    describe('getDescriptionLines', () => {
        it('returns value by item', () => {
            assert.equal(controller.getDescriptionLines(collection.at(0)), 3);
            assert.equal(controller.getDescriptionLines(collection.at(1)), 4);
        });
    });
    describe('getDescriptionProperty', () => {
        it('returns value from templateProperties', () => {
            assert.equal(controller.getDescriptionProperty(), 'description');
        });
    });
    describe('getTileSize', () => {
        it('returns value by config', () => {
            assert.equal(controller.getTileSize(), 'm');
        });
    });
    describe('imagePosition', () => {
        it('returns value by config', () => {
            assert.equal(controller.imagePosition, 'top');
        });
    });
    describe('getGradientColorProperty', () => {
        it('returns value by item', () => {
            assert.equal(controller.getGradientColor(collection.at(0)), 'gradientFromNode');
            assert.equal(controller.getGradientColor(collection.at(1)), '#fff');
        });
    });
    describe('getImageViewMode', () => {
        it('returns value by item', () => {
            assert.equal(controller.getImageViewMode(collection.at(0)), 'circle');
            assert.equal(controller.getImageViewMode(collection.at(1)), 'rectangle');
        });
    });
    describe('getImageProportion', () => {
        it('returns value by item', () => {
            assert.equal(controller.getImageProportion(collection.at(0)), '16:9');
            assert.equal(controller.getImageProportion(collection.at(1)), '4:3');
        });
    });
});
