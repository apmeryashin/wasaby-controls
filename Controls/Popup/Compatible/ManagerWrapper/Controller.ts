/**
 * Created by as.krasilnikov on 20.11.2018.
 */

import {SyntheticEvent} from 'Vdom/Vdom';

export default {
   _managerWrapper: null,
   _globalPopup: null,
   _theme: undefined,
   registerManager(ManagerWrapper) {
      this._managerWrapper = ManagerWrapper;
   },
   registerGlobalPopup(GlobalPopup) {
      this._globalPopup = GlobalPopup;
   },
   getManagerWrapper() {
      return this._managerWrapper;
   },
   getGlobalPopup() {
      return this._globalPopup;
   },
   getTheme(): string {
      return this._theme;
   },
   setTheme(theme: string): void {
      this._theme = theme;
      this._managerWrapper?.setTheme(theme);
   },
   registerGlobalPopupOpeners(GlobalPopupOpeners) {
      this._globalPopupOpeners = GlobalPopupOpeners;
   },
   getGlobalPopupOpeners() {
      return this._globalPopupOpeners;
   },
   scrollHandler(container) {
      if (this._managerWrapper) {
         this._managerWrapper._scrollHandler(container);
      }
   },
   registerListener(event, registerType, component, callback) {
      if (this._managerWrapper) {
         this._managerWrapper.registerListener(event, registerType, component, callback);
      }
   },
   unregisterListener(event, registerType, component) {
      if (this._managerWrapper) {
         this._managerWrapper.unregisterListener(event, registerType, component);
      }
   },

   getMaxZIndex() {
      if (this._managerWrapper) {
         return this._managerWrapper.getMaxZIndex();
      }
      return 0;
   },

   startResizeEmitter(): void {
      if (this._managerWrapper) {
         const eventCfg = {
            type: 'controlResize'
         };
         this._managerWrapper.startResizeEmitter(new SyntheticEvent(null, eventCfg));
      }
   }
};
