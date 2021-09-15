import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!Controls-demo/ReceivedStatesDemo/TestControlWithRS';

const rsData = '654';

export default class extends Control<{}, string> {
   protected _template: TemplateFunction = template;
   protected gotRSInner: string;
   protected gotRSOuter: string;

   protected _beforeMount(options: {wrapperRS: boolean}, _: unknown, receivedState: string): string {
      if (receivedState === rsData) {
         this.gotRSInner = 'true';
         this.gotRSOuter = '' + options.wrapperRS;
         return;
      }
      return rsData;
   }
}
