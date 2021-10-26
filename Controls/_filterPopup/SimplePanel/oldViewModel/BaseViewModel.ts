/**
 * Created by kraynovdo on 24.05.2018.
 */
/**
 * Created by kraynovdo on 16.11.2017.
 */
import cExtend = require('Core/core-simpleExtend');
import entity = require('Types/entity');

/**
 *
 * @author Авраменко А.С.
 * @private
 */
const BaseViewModel = cExtend.extend([entity.ObservableMixin.prototype, entity.VersionableMixin], {
    constructor(cfg) {
        this._options = cfg;
    },

    isCachedItemData(itemKey) {
        throw new Error(`BaseViewModel#isCachedItemData is not implemented for ${this._moduleName}`);
    },
    getCachedItemData(itemKey) {
        throw new Error(`BaseViewModel#getCachedItemData is not implemented for ${this._moduleName}`);
    },
    setCachedItemData(itemKey, cache) {
        throw new Error(`BaseViewModel#setCachedItemData is not implemented for ${this._moduleName}`);
    },
    resetCachedItemData(itemKey) {
        throw new Error(`BaseViewModel#resetCachedItemData is not implemented for ${this._moduleName}`);
    },

    destroy() {
        entity.ObservableMixin.prototype.destroy.apply(this, arguments);
        this._options = null;
    }
});

export = BaseViewModel;
