import {View} from 'Controls/newBrowser';
import {assert} from 'chai';
import {getDefaultViewCfg} from './ConfigurationHelper';
import {RecordSet} from 'Types/collection';

describe('Controls/_newBrowser:View', () => {
    let browserInstance;
    let items;
    let context;
    let listConfiguration = getDefaultViewCfg();
    beforeEach(() => {
        items = new RecordSet({
            rawData: [{
                id: 1,
                title: 'Алеша'
            }],
            keyProperty: 'id'
        });
        browserInstance = new View();
        browserInstance._detailDataSource = {
            getRoot(): number {
                return 2;
            }
        };
        context = {
            listsConfigs: {
                detail: {},
                master: {}
            },
            getVersion: () => 10
        };
        browserInstance._detailExplorerOptions = {};
    });
    describe('_processItemsMetaData', () => {
        it('from metadata', () => {
            items.setMetaData({listConfiguration});
            browserInstance._processItemsMetadata(items, {
                detail: {
                    columns: []
                }
            });
            assert.equal(browserInstance._tileCfg.tileSize, 'm');
        });
        it('from options', () => {
            browserInstance._processItemsMetadata(items, {
                listConfiguration, detail: {
                    columns: []
                }
            });
            assert.equal(browserInstance._tileCfg.tileSize, 'm');
        });
    });

    describe('_beforeUpdate', () => {
        it('detail options changed with columns', () => {
            browserInstance._tableCfg = 'tableConfig';
            browserInstance._dataContext = context;
            browserInstance._options = {
                detail: {
                    columns: [{
                        template: 'columnsTemplate'
                    }]
                }
            };
            const newOptions = {
                detail: {
                    columns: [{
                        template: 'newColumnsTemplate'
                    }]
                }
            };
            browserInstance._dataContext = {
                dataContext: context
            };
            browserInstance._beforeUpdate(newOptions, {
                    dataContext: context
                }
            );
            assert.equal(browserInstance._columns[0].templateOptions.tableCfg, 'tableConfig');
        });
    });

    describe('_updateBackgroundColor', () => {
        it('with contrast background in options', () => {
            browserInstance._updateDetailBgColor({
                detail: {
                    backgroundColor: 'color',
                    contrastBackground: false
                }
            });
            assert.isFalse(browserInstance._contrastBackground);
            assert.equal(browserInstance._detailBgColor, '#ffffff');
        });

        it('without contrast background in options', () => {
            browserInstance._viewMode = 'tile';
            browserInstance._updateDetailBgColor({
                detail: {
                    backgroundColor: 'color'
                }
            });
            assert.equal(browserInstance._detailBgColor, 'color');
            assert.isFalse(browserInstance._contrastBackground);

            browserInstance._viewMode = 'table';
            browserInstance._updateDetailBgColor({
                detail: {
                    backgroundColor: 'color'
                }
            });
            assert.equal(browserInstance._detailBgColor, '#ffffff');
            assert.isTrue(browserInstance._contrastBackground);

            browserInstance._viewMode = 'search';
            browserInstance._updateDetailBgColor({
                detail: {
                    backgroundColor: 'color'
                }
            });
            assert.equal(browserInstance._detailBgColor, '#ffffff');
            assert.isTrue(browserInstance._contrastBackground);

            browserInstance._viewMode = 'list';
            browserInstance._updateDetailBgColor({
                detail: {
                    backgroundColor: 'color'
                }
            });
            assert.equal(browserInstance._detailBgColor, 'color');
            assert.isFalse(browserInstance._contrastBackground);
        });
    });
});
