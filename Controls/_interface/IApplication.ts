import {IHTMLOptions, IHTML} from 'UI/Base';
import {ZoomSize} from 'Controls/sizeUtils';

/**
 * Интерефейс для контролов, поддерживающих конфигурацию метатегов html-документа.
 * @public
 * @author Санников К.А.
 */
export default interface IApplication extends IHTML {
    readonly '[Controls/_interface/IApplication]': boolean
};

/**
 * @name Controls/_interface/IApplication#scripts
 * @cfg {Content} Описание скриптов, которые будут вставлены в тег head.
 * @example
 * <pre class="brush: html">
 * <ws:scripts>
 *     <ws:Array>
 *         <ws:Object type="text/javascript" src="/cdn/Maintenance/1.0.1/js/checkSoftware.js" data-pack-name="skip" async="" />
 *     </ws:Array>
 * </ws:scripts>
 * </pre>
 */

/** 
 * @name Controls/_interface/IApplication#links
 * @cfg {Content} Позволяет описывать ссылки на дополнительные ресурсы, которые необходимы при загрузке страницы.
 * @example
 * <pre class="brush: js">
 * // JavaScript
 * import {getResourceUrl} from 'RequireJsLoader/conduct';
 * </pre>
 * <pre class="brush: html">
 * <!-- WML -->
 * <ws:links>
 *     <ws:Array>
 *         <ws:Object rel="icon" href="{{getResourceUrl('/CustomLogo/custom_favicon.ico')}}" type="image/x-icon"/>
 *     </ws:Array>
 * </ws:links>
 * </pre>
 */

/** 
 * @name Controls/_interface/IApplication#headJson
 * @deprecated Используйте одну из опций: {@link scripts} или {@link links}.
 * @cfg {object} Разметка, которая будет встроена в содержимое тега head.
 * Используйте эту опцию, чтобы подключить на страницу внешние библиотеки (скрипты), стили или шрифты.
 * @remark
 * Список разрешённых тегов: link, script, meta, title.
 * Список разрешённых атрибутов: rel, as, name, sizes, crossorigin, type, href, property, http-equiv, content, id, class.
 * @example
 * <pre class="brush: html">
 * <ws:headJson>
 *     <ws:Array>
 *         <ws:Array>
 *             <ws:String>link</ws:String>
 *             <ws:Object
 *                 rel="preload"
 *                 as="font"
 *                 href="/cdn/TensorFont/1.0.3/TensorFont/TensorFont.woff2"
 *                 type="font/woff2"
 *                 crossorigin="crossorigin"/>
 *         </ws:Array>
 *         <ws:Array>
 *             <ws:String>meta</ws:String>
 *             <ws:Object name="apple-itunes-app" content="app-id=12345"/>
 *         </ws:Array>
 *     </ws:Array>
 * </ws:headJson>
 * </pre>
 */

/**
 * @name Controls/_interface/IApplication#title
 * @cfg {String} Значение опции встраивается в содержимое тега title, который определяет заголовок веб-страницы и подпись на вкладке веб-браузера.
 */

/**
 * @name Controls/_interface/IApplication#title
 * @cfg {String} title of the tab
 */

/**
 * @name Controls/_interface/IApplication#isAdaptive
 * @cfg {boolean} Определяет режим отображения сайта. Если опция включена, то используется адаптивный дизайн, шрифты на мобильных устройствах используются системные.
 * @default false
 */

/**
 * @name Controls/_interface/IApplication#zoom
 * @cfg {string} Определяет скалирование размеров интерфейса приложения. https://developer.mozilla.org/en-US/docs/Web/CSS/zoom
 * @variant zoom-0.75
 * @variant zoom-0.85
 * @variant zoom-1
 * @variant zoom-1.15
 * @variant zoom-1.3
 * @demo Controls-demo/Application/Zoom/Index
 * @default zoom-1
 */

export interface IAttributes {
    [index: string]: string | undefined
}

export type HeadJson = [string, Record<string, string>][];

export interface IApplicationOptions extends IHTMLOptions {
    scripts?: Array<IAttributes>;
    links?: Array<IAttributes>;
    meta?: Array<IAttributes>;
    headJson?: HeadJson;
    title?: string;
    zoom?: ZoomSize;
}
