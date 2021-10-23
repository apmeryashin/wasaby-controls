import {factory} from 'Types/chain';
import CoreClone = require('Core/core-clone');

const differentFields = ['id', 'visibility'];

function convertToFilterSource(detailPanelItems) {
    const filterSource = CoreClone(detailPanelItems);
    factory(filterSource).each(function(filterSourceItem, index) {
        for (let property in filterSourceItem) {
            if (filterSourceItem.hasOwnProperty(property)) {
                if (differentFields.indexOf(property) !== -1) {
                    delete filterSourceItem[property];
                }
            }
        }
        filterSourceItem.name = detailPanelItems[index].id ? detailPanelItems[index].id : detailPanelItems[index].name; // items from history have a field 'name' instead of 'id'
        if (detailPanelItems[index].visibility !== undefined) {
            filterSourceItem.visibility = detailPanelItems[index].visibility;
        }
    });
    return filterSource;
}

function convertToDetailPanelItems(filterSource) {
    const detailPanelItems = CoreClone(filterSource);
    factory(detailPanelItems).each(function(detailPanelItem, index) {
        for (let property in detailPanelItem) {
            if (detailPanelItem.hasOwnProperty(property)) {
                if (differentFields.indexOf(property) !== -1) {
                    delete detailPanelItem[property];
                }
            }
        }
        detailPanelItem.id = filterSource[index].name;
        detailPanelItem.visibility = filterSource[index].viewMode === 'extended' ? filterSource[index].visibility : undefined;
    });
    return detailPanelItems;
}

export = {
    convertToFilterSource,
    convertToDetailPanelItems
};
