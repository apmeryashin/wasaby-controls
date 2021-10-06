import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/themes/ThemeWrapper/ThemeWrapper';

class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default Index;
