import {TemplateFunction} from 'UI/Base';

/**
 * Шаблон, который по умолчанию используется для отображения элементов в дополнительном меню {@link Controls/toolbars:View тулбара}.
 * @class Controls/toolbars:ItemTemplate
 * @author Мочалов М.А.
 * @public
 * @see Controls/toolbars:View
 * @see Controls/toolbars
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/input-elements/buttons-switches/toolbar/#template-standart руководство разработчика}
 */

export default interface IItemTemplateOptions {

    /**
     * @deprecated Опция устарела и в ближайшее время её поддержка будет прекращена.
     */
    buttonStyle?: string;

    /**
     * @deprecated Опция устарела и в ближайшее время её поддержка будет прекращена.
     */
    buttonReadOnly?: boolean;

    /**
     * @deprecated Опция устарела и в ближайшее время её поддержка будет прекращена.
     */
    buttonTransparent?: boolean;

    /**
     * @deprecated Опция устарела и в ближайшее время её поддержка будет прекращена.
     */
    buttonViewMode?: string;

    /**
     * @deprecated Опция устарела и в ближайшее время её поддержка будет прекращена.
     */
    displayProperty?: string;

    /**
     * @deprecated Опция устарела и в ближайшее время её поддержка будет прекращена.
     */
    iconStyleProperty?: string;

    /**
     * @deprecated Опция устарела и в ближайшее время её поддержка будет прекращена.
     */
    iconProperty?: string;

    /**
     * @deprecated Опция устарела и в ближайшее время её поддержка будет прекращена.
     */
    contentTemplate?: string;
    /**
     * @name Controls/toolbars:ItemTemplate#itemsSpacing
     * @cfg {String} Размер расстояния между кнопками.
     * @variant medium
     * @variant big
     * @default medium
     * @remark
     * Размер расстояния задается константой из стандартного набора размеров, который определен для текущей темы оформления.
     */
    itemSpacing?: string;
    /**
     * @name Controls/toolbars:ItemTemplate#theme
     * @cfg {String} Название темы оформления. В зависимости от темы загружаются различные таблицы стилей и применяются различные стили к контролу.
     */
    theme?: string;
    /**
     * @name Controls/toolbars:ItemTemplate#item
     * @cfg {Object} Элемент тулбара.
     */
    item?: object;
    /**
     * @name Controls/toolbars:ItemTemplate#buttonTemplate
     * @cfg {String|TemplateFunction} Шаблон кнопки тулбара.
     */
    buttonTemplate?: string | TemplateFunction;
    /**
     * @name Controls/toolbars:ItemTemplate#buttonTemplateOptions
     * @cfg {Object} Опции шаблона кнопки.
     */
    buttonTemplateOptions?: object;
 }
