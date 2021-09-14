/**
 * Created by kraynovdo on 25.01.2018.
 */
import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import { location } from 'Application/Env';
import * as template from 'wml!Controls-demo/RootRouter';

interface IOptions extends IControlOptions {
   sourceUrl: string;
   appRoot: string;
}

interface IReceivedState {
   sourceUrl: string;
}

export default class extends Control<IOptions, IReceivedState> {
   protected _template: TemplateFunction = template;
   protected isReloading: boolean = false;
   protected pathName: string = 'Controls-demo/app/Controls-demo%2FIndexOld';
   protected sourceUrl: string = null;

   _beforeMount(options: IOptions, _: unknown, receivedState: IReceivedState): IReceivedState {
      const _state = {
         sourceUrl: (receivedState && receivedState.sourceUrl) || options.sourceUrl
      };
      this.sourceUrl = _state.sourceUrl;
      return _state;
   }

   _afterMount(): void {
      window.reloadDemo = this.reloadDemo.bind(this);
   }

   _afterUpdate(): void {
      this.isReloading = false;
   }

   reload(): void {
      this.isReloading = true;
   }

   reloadDemo(): void {
      this.reload();
      if (window.clearSettinngStorage !== false) {
         // При обновлении демки сбрасываем все что лежит в settingsController (задается на application);
         window.localStorage.setItem('controlSettingsStorage', '{}');
      }
   }

   _isMenuButtonVisible(): boolean {
      return location.pathname !== this._options.appRoot + this.pathName;
   }

   backClickHdl(): void {
      window.history.back();
   }

   goHomeHandler(): void {
      window.location = this._options.appRoot + this.pathName;
   }

   static _styles: string[] = ['Controls-demo/RootRouter'];
}
