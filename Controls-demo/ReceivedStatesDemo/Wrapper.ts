import { Control, TemplateFunction } from 'UI/Base';
import { constants } from 'Env/Env';
import * as template from 'wml!Controls-demo/ReceivedStatesDemo/Wrapper';

const rsData = '123';

export default class extends Control<{}, string> {
   protected _template: TemplateFunction = template;
   protected gotRS: boolean = false;

   protected _beforeMount(options: {}, _: unknown, receivedState: string): string {
      if (constants.isServerSide) {
         return rsData;
      }
      this.gotRS = receivedState === rsData;
   }
}
