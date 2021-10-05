import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Popup/Sticky/Scroll/Template';
import 'wml!Controls-demo/Popup/Opener/DialogTpl';

class PopupStack extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    protected openStickyScroll(): void {
        this._children.sticky.open({
            target: this._children.stickyButton._container,
            opener: this._children.stickyButton,
            actionOnScroll: 'close',
            template: 'wml!Controls-demo/Popup/Opener/DialogTpl'
        });
    }
    protected openSticky(): void {
        this._children.sticky.open({
            target: this._children.stickyButton2._container,
            opener: this._children.stickyButton2,
            actionOnScroll: 'track',
            template: 'wml!Controls-demo/Popup/Opener/DialogTpl'
        });
    }

    static _styles: string[] = ['Controls-demo/Popup/PopupPage', 'Controls-demo/Popup/Opener/resources/StackHeader'];
}
export default PopupStack;
