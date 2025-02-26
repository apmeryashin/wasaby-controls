import { TemplateFunction } from 'UI/Base';

/**
 * Шаблон, который по умолчанию используется для отображения элементов в {@link Controls/tile:View плитке}.
 * @class Controls/_tile/interface/ItemTemplate
 * @implements Controls/list:IBaseItemTemplate
 * @implements Controls/list:IContentTemplate
 * @author Авраменко А.С.
 * @see Controls/tile:View
 * @example
 * <pre class="brush: html; highlight: [3-12]">
 * <!-- WML -->
 * <Controls.tile:View source="{{_viewSource}}">
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/tile:ItemTemplate">
 *          <ws:contentTemplate>
 *             <img src="{{contentTemplate.item.contents.Image}}"/>
 *             <div title="{{contentTemplate.item.contents.Name}}">
 *                {{contentTemplate.item.contents.Name}}
 *             </div>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.tile:View>
 * </pre>
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/controls/list/tile/item/ здесь}.
 * @public
 * @demo Controls-demo/tileNew/DifferentItemTemplates/CustomTemplate/Index
 */

export default interface IItemTemplateOptions {
   /**
    * @cfg {Boolean} Видимость заголовка плитки.
    * @see titleStyle
    */
   hasTitle?: boolean;
   /**
    * @cfg {Boolean} Динамическое изменение высоты плитки, когда плитка отображается со статической шириной,
    * т.е. опция {@link Controls/tile:ITile#tileMode tileMode} установлена в значение static.
    */
   staticHeight?: boolean;
   /**
    * @cfg {String} Отображение тени для плитки.
    * @variant visible Отображается.
    * @variant hidden Не отображается.
    * @variant onhover Отображается только при наведении курсора на плитку.
    * @default visible
    * @demo Controls-demo/tileNew/Shadows/Index
    */
   shadowVisibility?: string;
   /**
    * @cfg {Boolean} Видимость рамки вокруг элемента плитки.
    * @default true
    * @example
    * В следующем примере отображение рамки вокруг элемента плитки отключено.
    * <pre class="brush: html; highlight: [8]">
    * <!-- WML -->
    * <Controls.tile:View
    *    source="{{_source}}"
    *    imageProperty="image">
    *    <ws:itemTemplate>
    *       <ws:partial
    *          template="Controls/tile:ItemTemplate"
    *          border="{{false}}"/>
    *    </ws:itemTemplate>
    * </Controls.tile:View>
    * </pre>
    */
   border?: boolean;

   /**
    * @cfg {UI/Base:TemplateFunction} Шаблон отображения содержимого узла (папки)
    */
   nodeContentTemplate?: TemplateFunction;

   /**
    * @cfg {number | string} Ширина элемента плитки. Можно задать как число (в пикселях) или строку (например, в процентах)
    */
   width?: number | string;
}
