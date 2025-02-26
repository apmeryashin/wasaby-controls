import Deferred = require('Core/Deferred');
import moduleStubs = require('Core/moduleStubs');
import isNewEnvironment = require('Core/helpers/isNewEnvironment');
import {Logger} from 'UI/Utils';

const _private = {
   prepareDeps(config) {
      const dependencies = ['Controls/popup'];
      if (config.isStack === true) {
         dependencies.push('Controls/popupTemplate');
         config._path = 'StackController';
         config._type = 'stack';
      } else if (config.target) {
         dependencies.push('Controls/popupTemplate');
         config._path = 'StickyController';
         config._type = 'sticky';
      } else {
         dependencies.push('Controls/popupTemplate');
         config._path = 'DialogController';
         config._type = 'dialog';
      }
      // В номенклатуре написали свою recordFloatArea, отнаследовавшись от платформенной.
      // В слое совместимости нам как-то нужно понимать, какое окно сейчас хотят открыть,
      // чтобы грузить нужные зависимости. Договорились понимать по опции _mode
      config._popupComponent = config._mode || 'floatArea';
      dependencies.push(config.template);
      return dependencies;
   }
};

const DialogHelper = {
   open(path, config) {
      const result = moduleStubs.requireModule(path).addCallback((Component) => {
         if (isNewEnvironment()) {
            let dfr = new Deferred();
            const deps = _private.prepareDeps(config);
            requirejs(['Lib/Control/LayerCompatible/LayerCompatible'], (CompatiblePopup) => {
               CompatiblePopup.load().addCallback(() => {
                  require(deps, (popup, Strategy) => {
                     const CoreTemplate = require(config.template);
                     config._initCompoundArea = (compoundArea) => {
                        if (dfr) {
                            dfr.callback(compoundArea);
                        }
                        dfr = null;
                     };
                     popup.BaseOpener.showDialog(
                        CoreTemplate, config, config._path ? Strategy[config._path] : Strategy
                     );
                  }, (err) => {
                     Logger.error(`Не удалось загрузить модули для открытия окна: ${err.requireModules.join(',')}`);
                  });
               });
            });
            return dfr;
         }
         return new Component[0](config);
      });
      return result;
   }
};
DialogHelper._private = _private;

export default DialogHelper;
