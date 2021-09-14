import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!Controls-demo/ReceivedStatesDemo/Index';

export default class extends Control {
   protected _template: TemplateFunction = template;
}
