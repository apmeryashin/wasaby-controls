import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import headingTemplate = require('wml!Controls/_heading/Heading/Heading');
import {descriptor as EntityDescriptor} from 'Types/entity';
import 'css!Controls/heading';
import {
    ITooltip,
    ITooltipOptions,
    ICaption,
    ICaptionOptions,
    IFontColorStyle,
    IFontColorStyleOptions,
    IFontSize,
    IFontSizeOptions,
    IFontWeight,
    IFontWeightOptions,
    ITextTransformOptions
} from 'Controls/interface';

export interface IHeadingOptions
    extends IControlOptions, ICaptionOptions, ITooltipOptions, IFontColorStyleOptions, IFontSizeOptions,
            IFontWeightOptions, ITextTransformOptions {
}

/**
 * Простой заголовок с поддержкой различных стилей отображения и размеров.
 *
 * @remark
 * Может использоваться самостоятельно или в составе сложных заголовков, состоящих из {@link Controls/heading:Separator}, {@link Controls/heading:Counter} и {@link Controls/heading:Title}.
 * Для одновременной подсветки всех частей сложного заголовка при наведении используйте класс controls-Header_all__clickable на контейнере.
 * Кликабельность заголовка зависит от {@link readOnly режима отображения}.
 *
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/text-and-styles/heading/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_heading.less переменные тем оформления}
 *
 * @class Controls/_heading/Heading
 * @extends UI/Base:Control
 * @implements Controls/interface:ITooltip
 * @implements Controls/interface:ICaption
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontSize
 * @implements Controls/interface:IFontWeight
 * @implements Controls/interface:ITextTransform
 * @public
 * @author Мочалов М.А.
 *
 * @demo Controls-demo/Heading/Title/SizesAndStyles/Index
 * @demo Controls-demo/Heading/Group/Index
 *
 */
class Header extends Control<IHeadingOptions> implements ICaption, ITooltip, IFontColorStyle, IFontSize, IFontWeight {
    protected _template: TemplateFunction = headingTemplate;

    readonly '[Controls/_interface/ICaption]': boolean = true;
    readonly '[Controls/_interface/ITooltip]': boolean = true;
    readonly '[Controls/_interface/IFontSize]': boolean = true;
    readonly '[Controls/_interface/IFontColorStyle]': boolean = true;
    readonly '[Controls/_interface/IFontWeight]': boolean = true;

    static getDefaultOptions(): object {
        return {
            fontSize: 'l',
            textTransform: 'none',
            fontWeight: 'default',
            fontColorStyle: 'default'
        };
    }

    static getOptionTypes(): object {
        return {
            caption: EntityDescriptor(String)
        };
    }
}

Object.defineProperty(Header, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Header.getDefaultOptions();
   }
});

/**
 * @name Controls/_heading/Heading#textTransform
 * @cfg {Controls/interface:ITextTransform/TTextTransform.typedef}
 * @default none
 * @demo Controls-demo/Heading/Title/TextTransform/Index
 * @remark
 * Вместе с установкой преобразования текста, меняется так же расстояние между буквами.
 */

/**
 * @name Controls/_heading/Heading#fontSize
 * @cfg {String}
 * @default l
 * @demo Controls-demo/Heading/Title/SizesAndStyles/Index
 * @example
 * <pre class="brush: html">
 * <Controls.heading:Title caption="Heading" fontColorStyle="primary" fontSize="xs"/>
 * </pre>
 */

/**
 * @name Controls/_heading/Heading#fontWeight
 * @cfg {TFontWeight}
 * @demo Controls-demo/Heading/Title/FontWeight/Index
 */

/**
 * @name Controls/_heading/Heading#fontColorStyle
 * @cfg {Controls/interface:IFontColorStyle/TFontColorStyle.typedef}
 * @demo Controls-demo/Heading/Title/SizesAndStyles/Index
 * @default default
 * @example
 * <pre class="brush: html">
 * <Controls.heading:Title caption="Heading" fontColorStyle="primary" fontSize="xs"/>
 * </pre>
 */

/**
 * @name Controls/_heading/Heading#caption
 * @cfg {String}
 * @demo Controls-demo/Heading/Title/SizesAndStyles/Index
 * @example
 * <pre class="brush: html">
 * <Controls.heading:Title caption="Heading" fontColorStyle="primary" fontSize="xs"/>
 * </pre>
 */

export default Header;
