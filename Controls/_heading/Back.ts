import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import backTemplate = require('wml!Controls/_heading/Back/Back');
import {descriptor as EntityDescriptor} from 'Types/entity';
import 'css!Controls/heading';

import {
    IFontColorStyle,
    IFontColorStyleOptions,
    IFontSize,
    IFontSizeOptions,
    IIconStyle,
    IIconStyleOptions, TFontSize
} from 'Controls/interface';

/**
 * Интерфейс, описывающий структуру объекта конфигурации контрола {@link Controls/heading:Back}
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface IBackOptions extends IControlOptions, IFontColorStyleOptions, IFontSizeOptions, IIconStyleOptions {
    /**
     * @cfg {String} Задает режим отображения текста заголовка.
     * @variant ellipsis - Текст выводится в одну строку. Если текст целиком не помещается в отведенную область, то он обрезается и к концу строки добавляется многоточие.
     * @variant none - Текст выводится в одну строку. Если текст целиком не помещается в отведенную область, то он переносится на следующую строку.
     * @default ellipsis
     * @demo Controls-demo/Heading/Back/TextOverflow/Index
     */
    textOverflow?: 'ellipsis' | 'none';

    /**
     * @cfg {String} Задает режим отображения иконки кнопки.
     * @variant default - иконка кнопки отображается без обводки.
     * @variant functionalButton - иконка кнопки отображается с обводкой.
     * @default default
     * @demo Controls-demo/Heading/Back/IconViewMode/Index
     */
    iconViewMode?: 'functionalButton' | 'default';

    /**
     * @cfg {String | UI/Base:TemplateFunction} Шаблон, отображаемый между иконкой и заголовком кнопки
     * @see Controls/heading:IBackOptions#beforeCaptionTemplateOptions
     */
    beforeCaptionTemplate?: string | TemplateFunction;

    /**
     * @cfg {Object} Опции, которые будут переданы в шаблон, указанный в {@link Controls/heading:IBackOptions#beforeCaptionTemplate beforeCaptionTemplate}
     * @see Controls/heading:IBackOptions#beforeCaptionTemplate
     */
    beforeCaptionTemplateOptions?: object;
}

/**
 * Специализированный заголовок-кнопка для перехода на предыдущий уровень.
 *
 * @remark
 * Может использоваться самостоятельно или в составе составных кнопок, состоящих из {@link Controls/heading:Back} и прикладной верстки.
 * Для одновременной подсветки всех частей кнопки при наведении используйте класс controls-Header_all__clickable на контейнере.
 * Кликабельность заголовка зависит от {@link readOnly режима отображения}.
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/text-and-styles/heading/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_heading.less переменные тем оформления}
 *
 *
 * @class Controls/_heading/Back
 * @extends UI/Base:Control
 * @implements Controls/interface:ICaption
 * @implements Controls/buttons:IClick
 * @implements Controls/interface:ITooltip
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontSize
 * @implements Controls/interface:IIconStyle
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Heading/Back/SizesAndStyles/Index
 * @demo Controls-demo/Heading/SubCaption/Index
 */

/**
 * @name Controls/_heading/Back#fontColorStyle
 * @cfg
 * @variant primary
 * @variant secondary
 * @variant default
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.heading:Back caption="Back" fontColorStyle="primary"/>
 * <Controls.heading:Back caption="Back" fontColorStyle="secondary"/>
 * </pre>
 * @demo Controls-demo/Heading/Back/FontColorStyle/Index
 */

/*
 * Specialized heading to go to the previous level.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2FHeaders%2FstandartDemoHeader">Demo-example</a>.
 *
 * @class Controls/_heading/Back
 * @extends UI/Base:Control
 * @implements Controls/interface:ICaption
 * @mixes Controls/buttons:IClick
 * @implements Controls/interface:ITooltip
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontSize
 * @implements Controls/interface:IIconStyle
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Heading/Back/SizesAndStyles/Index
 */

export default class Back extends Control<IBackOptions> implements IFontColorStyle, IFontSize, IIconStyle {
    protected _template: TemplateFunction = backTemplate;

    protected _iconSize: string;
    protected _offsetSize: string;

    readonly '[Controls/_interface/IFontSize]': boolean = true;
    readonly '[Controls/_interface/IIconStyle]': boolean = true;
    readonly '[Controls/_interface/IFontColorStyle]': boolean = true;

    protected _beforeMount(options: IBackOptions): void {
        this._updateSizes(options.fontSize);
    }

    protected _beforeUpdate(newOptions: IBackOptions): void {
        if (this._options.fontSize !== newOptions.fontSize) {
            this._updateSizes(newOptions.fontSize);
        }
    }

    private _updateSizes(fontSize: TFontSize): void {
        switch (fontSize) {
            case 's':
            case 'm':
                this._iconSize = 's';
                this._offsetSize = '2xs';
                break;
            case 'l':
            case 'xl':
            case '2xl':
            case '3xl':
            case '4xl':
                this._iconSize = 'm';
                this._offsetSize = 'xs';
                break;
            case '5xl':
            case '6xl':
            case '7xl':
                this._iconSize = 'l';
                this._offsetSize = 'xs';
                break;
            default:
                this._iconSize = 'm';
                this._offsetSize = 'xs';
        }
    }

    static defaultProps: IBackOptions = {
        fontSize: '3xl',
        iconStyle: 'secondary',
        iconViewMode: 'default',
        textOverflow: 'ellipsis',
        fontColorStyle: 'primary'
    };

    static getOptionTypes(): object {
        return {
            caption: EntityDescriptor(String),
            fontColorStyle: EntityDescriptor(String).oneOf([
                'primary',
                'secondary',
                'default'
            ]),
            iconStyle: EntityDescriptor(String).oneOf([
                'primary',
                'secondary',
                'success',
                'warning',
                'danger',
                'info',
                'label',
                'default',
                'contrast',
                'unaccented'
            ])
        };
    }
}
