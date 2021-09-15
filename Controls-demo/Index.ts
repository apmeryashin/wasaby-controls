/**
 * Created by kraynovdo on 25.01.2018.
 */
import { Control, TemplateFunction } from 'UI/Base';
import { cookie, location } from 'Application/Env';
import * as Deferred from 'Core/Deferred';
import { detection, constants } from 'Env/Env';
import { MaskResolver } from 'Router/router';
import { addPageDeps } from 'UICommon/Deps';
import { loadAsync } from 'WasabyLoader/ModulesLoader';
import * as template from 'wml!Controls-demo/Index';

export default class extends Control {
   protected _template: TemplateFunction = template;
   protected _links: string[];
   protected _title: string;
   protected _settigsController: {};

   protected _beforeMount(options: {resourceRoot: string}): Promise<void> | void {
      this._links = this._prepareLinks(options);
      this._title = this._getTitle();
      this._settigsController = {
         getSettings: (ids) => {
            const storage = window && JSON.parse(window.localStorage.getItem('controlSettingsStorage')) || {};
            const controlId = ids[0];
            if (!storage[controlId]) {
               storage[controlId] = 1000;
               if (controlId.indexOf('master') > -1) {
                  storage[controlId] = undefined;
               }
               if (controlId.indexOf('scrollContainerWheelEventHappened') > -1) {
                  // Уберем скроллбар с демок
                  storage[controlId] = true;
               }
            }
            return (new Deferred()).callback(storage);
         },
         setSettings: (settings) => {
            window.localStorage.setItem('controlSettingsStorage', JSON.stringify(settings));
            // 'Сохранили панель с шириной ' + settings['123']
            // 'Сохранили masterDetail с шириной ' + settings['master111']
         }
      };

      if (cookie.get('compatibleMode')) {
         return new Promise((resolve, reject) => {
            require([
               'Core/helpers/Hcontrol/makeInstanceCompatible',
               'Lib/Control/LayerCompatible/LayerCompatible'
            ], (makeInstanceCompatible, LayerCompatible) => {
               makeInstanceCompatible(this);
               LayerCompatible.load([], true, false);
               resolve();
            }, reject);
         });
      }
   }

   _afterMount(): void {
      if (window.clearSettinngStorage !== false) {
         window.localStorage.setItem('controlSettingsStorage', JSON.stringify({}));
      }

      // активация системы фокусов
      if (!detection.isMobilePlatform) {
         this.activate();
      }
   }

   _prepareLinks(options: {resourceRoot: string}): string[] {
      const fontsArray = [
         constants.tensorFont,
         constants.tensorFontBold,
         constants.cbucIcons,
         constants.cbucIcons24
      ];
      const links = [];
      for (let i = 0; i < fontsArray.length; i++) {
         links.push({
            rel: 'preload', as: 'font', href: fontsArray[i],
            type: 'font/woff2', crossorigin: 'anonymous'
         });
      }
      links.push({
         rel: 'shortcut icon',
         href: options.resourceRoot + 'Controls-demo/wasaby.ico?v=1',
         type: 'image/x-icon'
      });
      return links;
   }

   _getPopupHeaderTheme(theme: string): string {
      const retailHead = 'retail__';

      if (theme.indexOf(retailHead) !== -1) {
         return retailHead + 'header-' + theme.slice(retailHead.length);
      }
      return theme;
   }

   _getTitle(): string {
      const splitter = '%2F';
      const index = location.pathname.lastIndexOf(splitter);
      if (index > -1) {
         const splittedName = location.pathname.slice(index + splitter.length)
            .split('/');
         const controlName = splittedName[0];
         return this._replaceLastChar(controlName);
      }
      return 'Wasaby';
   }

   _replaceLastChar(controlName: string): string {
      if (controlName[controlName.length - 1] === '/') {
         return controlName.slice(0, -1);
      }
      return controlName;
   }
}

// в этом методе сделаем предзагрузку модуля демки,
// чтобы исключить асинхронный _beforeMount в Controls-demo/RootTemplateWrapper
export function getDataToRender(url: string): Promise<void> | void {
   const data = MaskResolver.calculateUrlParams('app/:app', url);
   if (data.app) {
      return loadAsync(data.app)
         .then(() => addPageDeps([data.app]));
   }
}
