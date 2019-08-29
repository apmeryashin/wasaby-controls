define('Controls/interface/IGrouped', [
], function() {

   /**
    * Интерфейс для контролов, реализующих группировку элементов.
    *
    * @interface Controls/interface/IGrouped
    * @public
    * @author Авраменко А.С.
    */

   /*
    * Interface for components implementing item grouping.
    *
    * @interface Controls/interface/IGrouped
    * @public
    * @author Авраменко А.С.
    */

   /**
    * @name Controls/interface/IGrouped#groupingKeyCallback
    * @cfg {Function} Функция обратного вызова для получения идентификатора группы элемента списка.
    * <a href="/materials/demo-ws4-list-group">Example</a>.
    * @remark
    * Среди групп списка существует "скрытая группа".
    * Для такой группы не создаётся заголовок, а её элементы визуально размещены в начале списка.
    * Чтобы отнести элемент к скрытой группе, из функции groupingKeyCallback верните константу view.hiddenGroup, которая принадлежит библиотеке Controls/Constants.
    * @example
    * <pre>
    *    _groupByBrand: function(item) {
    *       if (item.get('brand') === 'apple') {
    *          return ControlsConstants.view.hiddenGroup;
    *       }
    *       return item.get('brand');
    *    }
    * </pre>
    * <pre>
    *    groupingKeyCallback ="{{_groupByBrand}}",
    * </pre>
    */

   /*
    * @name Controls/interface/IGrouped#groupingKeyCallback
    * @cfg {Function} Function that returns group identifier for a given item.
    * <a href="/materials/demo-ws4-list-group">Example</a>.
    * @remark
    * In addition, there is a "hidden group".
    * Items in the hidden group will appear at the top of the list, and the group itself will appear untitled.
    * To define an element in the "hidden group" it is necessary to return the constant view.hiddenGroup from the "Controls/Constants" library from the function passed to the groupingKeyCallback.
    * @example
    * <pre>
    *    _groupByBrand: function(item) {
    *       if (item.get('brand') === 'apple') {
    *          return ControlsConstants.view.hiddenGroup;
    *       }
    *       return item.get('brand');
    *    }
    * </pre>
    * <pre>
    *    groupingKeyCallback ="{{_groupByBrand}}",
    * </pre>
    */

   /**
    * @name Controls/interface/IGrouped#groupTemplate
    * @cfg {Function} Шаблон группировки.
    * <a href="/materials/demo-ws4-list-group">Example</a>.
    * @remark
    * Базовый шаблон группировки "Controls/grid:GroupTemplate".
    * Шаблон группировки поддерживает параметры:
    * <ul>
    *    <li>separatorVisibility (тип Boolean) — видимость горизонтальной линии-разделителя.</li>
    *    <li>expanderAlign (тип enum('right'|'left')) — расположение кнопки-экспандера. Стандартное расположение - слева.</li>
    *    <li>expanderVisibile (тип Boolean) — ваидимость кнопки-экспандера.</li>
    *    <li>textAlign (тип String) — горизонтальное выравнивание текста группы. Доступные значения: 'left' и 'right'. По умолчанию используется выравнивание текста по центру.</li>
    *    <li>rightTemplate (тип Function) — шаблон, выводимый в правой части группы. Может использоваться, например, для вывода итогов по группе.</li>
    * </ul>
    * @example
    * Пример использования пользовательских параметров для группового рендеринга в Controls.list:View без экспандера и с выравниванием текста слева:
    * <pre>
    *    <Controls.list:View
    *       <ws:groupTemplate>
    *          <ws:partial template="Controls/list:GroupTemplate" expanderVisible="{{ false }}" textAlign="left" />
    *       </ws:groupTemplate>
    *    </Controls.list:View>
    * </pre>
    */

   /*
    * @name Controls/interface/IGrouped#groupTemplate
    * @cfg {Function} Group template.
    * <a href="/materials/demo-ws4-list-group">Example</a>.
    * @remark
    * Base groupTemplate for Controls.list:View: "Controls/list:GroupTemplate".
    * Group template supports these parameters:
    * <ul>
    *    <li>separatorVisibility {Boolean} - The presence of a horizontal line - separator.</li>
    *    <li>expanderVisibility {Boolean} - The presence of a group expander.</li>
    *    <li>textAlign {String} - Group text horizontal alignment. Supported values: 'left' and 'right'. By default using center text alignment.</li>
    *    <li>rightTemplate {Function} - Template of group right part. May be using for rendering totals.</li>
    * </ul>
    * @example
    * Using custom parameters for group rendering in Controls.list:View without expander and with left text alignment:
    * <pre>
    *    <Controls.list:View
    *       <groupTemplate>
    *          <ws:partial template="Controls/list:GroupTemplate" expanderVisible="{{ false }}" textAlign="left" />
    *       </groupTemplate>
    *    </Controls.list:View>
    * </pre>
    */

   /**
    * @name Controls/interface/IGrouped#collapsedGroups
    * @cfg {Array} Список идентификаторов свернутых групп. Идентификаторы групп получаются в результате вызова {@link groupingKeyCallback}.
    * <a href="/materials/demo-ws4-list-group">Example</a>.
    */

   /*
    * @name Controls/interface/IGrouped#collapsedGroups
    * @cfg {Array} List of collapsed group identifiers. Identifiers of groups are obtained as a result of calling the {@link groupingKeyCallback}.
    * <a href="/materials/demo-ws4-list-group">Example</a>.
    */

   /**
    * @name Controls/interface/IGrouped#groupHistoryId
    * @cfg {String} Идентификатор для сохранения в истории списка идентификаторов свернутых групп.
    */

   /*
    * @name Controls/interface/IGrouped#groupHistoryId
    * @cfg {String} Unique id for save to history a list of identifiers collapsed groups.
    */

   /**
    * @event Controls/interface/IGrouped#groupExpanded Происходит при развертывании группы.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * <a href="/materials/demo-ws4-list-group">Example</a>.
    */

   /*
    * @event Controls/interface/IGrouped#groupExpanded Occurs after group expansion.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
    * <a href="/materials/demo-ws4-list-group">Example</a>.
    */

   /**
    * @event Controls/interface/IGrouped#groupCollapsed Происходит при сворачивании группы.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * <a href="/materials/demo-ws4-list-group">Example</a>.
    */

   /*
    * @event Controls/interface/IGrouped#groupCollapsed Occurs after group collapse.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
    * <a href="/materials/demo-ws4-list-group">Example</a>.
    */

});
