import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import InfoboxButtonTemplate = require('wml!Controls/_popup/InfoBox/resources/InfoboxButton');
import {IIconSize, IIconSizeOptions} from 'Controls/interface';
import 'css!Controls/popup';

export interface IInfoboxButton extends IControlOptions, IIconSizeOptions {
}

/**
 * Контрол, который представляет собой типовую кнопку для вызова подсказки.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
 *
 * @extends UI/Base:Control
 * @implements Controls/interface:IIconSize
 * @implements Controls/popup:IInfoBox
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/InfoBox/InfoboxButtonHelp
 */

class InfoboxButton extends Control<IInfoboxButton> implements IIconSize {
    readonly '[Controls/_interface/IIconSize]': boolean;
    protected _template: TemplateFunction = InfoboxButtonTemplate;

    static getDefaultOptions(): IInfoboxButton {
        return {
            iconSize: 'm'
        };
    }

}
/**
 * @name Controls/_popup/InfoBox/InfoboxButton#iconSize
 * @cfg
 * @default m
 */

Object.defineProperty(InfoboxButton, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return InfoboxButton.getDefaultOptions();
   }
});

export default InfoboxButton;
