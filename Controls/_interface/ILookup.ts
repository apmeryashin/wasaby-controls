export interface ILookupOptions {
   dataLoadCallback?: Function;
}

/**
 * Интерфейс для полей и кнопок выбора.
 * @public
 * @author Герасимов А.М.
 */
/*
 * Interface for fields and selection buttons.
 * @public
 * @author Kapustin I.A.
 */
export default interface ILookup {
   readonly '[Controls/_interface/ILookup]': boolean;
}

/**
 * Открыть справочник.
 * @function Controls/_interface/ILookup#showSelector
 * @returns {Promise}
 * @param {Object} popupOptions {@link Controls/popup:IStackOpener.PopupOptions.typedef Опции всплывающего окна}.
 *
 * @example
 * Откроем окно с заданными параметрами.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.lookup:Input
 *     name="directoriesLookup"
 *     bind:selectedKeys="_selectedKeysDirectories"
 *     source="{{_source}}"
 *     searchParam="title"
 *     keyProperty="id">
 *     <ws:placeholder>
 *         Specify the
 *         <Controls.lookup:Link caption="department" on:click="showSelector('department')"/>
 *         and
 *         <Controls.lookup:Link caption="company" on:click="showSelector('company')"/>
 *     </ws:placeholder>
 *     <ws:selectorTemplate templateName="Engine-demo/Selector/FlatListSelectorWithTabs/FlatListSelectorWithTabs"/>
 *     <ws:suggestTemplate templateName="Controls-demo/Input/Lookup/Suggest/SuggestTemplate"/>
 * </Controls.lookup:Input>
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * class MyControl extends Control<IControlOptions> {
 *    ...
 *    showSelector: function(selectedTab) {
 *       this._children.directoriesLookup.showSelector({
 *          templateOptions: {
 *             selectedTab: selectedTab
 *          }
 *       });
 *    }
 *    ...
 * }
 * </pre>
 */
/*
 * Open stack popup.
 * @function Controls/_interface/ILookup#showSelector
 * @returns {Promise}
 * @param {Object} popupOptions {@link Controls/_popup/Opener/Stack/PopupOptions.typedef Stack popup options.}
 *
 * @example
 * Откроем окно с заданными параметрами.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.lookup:Input
 *     name="directoriesLookup"
 *     bind:selectedKeys="_selectedKeysDirectories"
 *     source="{{_source}}"
 *     searchParam="title"
 *     keyProperty="id">
 *     <ws:placeholder>
 *         Specify the
 *         <Controls.lookup:Link caption="department" on:click="showSelector('department')"/>
 *         and
 *         <Controls.lookup:Link caption="company" on:click="showSelector('company')"/>
 *     </ws:placeholder>
 *     <ws:selectorTemplate templateName="Engine-demo/Selector/FlatListSelectorWithTabs/FlatListSelectorWithTabs"/>
 *     <ws:suggestTemplate templateName="Controls-demo/Input/Lookup/Suggest/SuggestTemplate"/>
 * </Controls.lookup:Input>
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * class MyControl extends Control<IControlOptions> {
 *    ...
 *    showSelector: function(selectedTab) {
 *       this._children.directoriesLookup.showSelector({
 *          templateOptions: {
 *             selectedTab: selectedTab
 *          }
 *       });
 *    }
 *    ...
 * }
 * </pre>
 */

/**
 * @event Происходит перед открытием справочника через интерфейс.
 * @name Controls/_interface/ILookup#showSelector
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Object} popupOptions {@link Controls/_popup/Opener/Stack/PopupOptions.typedef Опции всплывающего окна}
 * @example
 * В следующем примере создается Controls/lookup:Input и демонстрируется сценарий использования.
 * <pre class="brush: html">
 * <Controls.lookup:Input
 *     source="{{_source}}"
 *     keyProperty="id"
 *     searchParam="title"
 *     on:showSelector="_showSelectorHandler()">
 * </Controls.lookup:Input>
 * </pre>
 * 
 * <pre class="brush: js">
 * // JavaScript
 * _loadParams: function() {
 *    ...
 * },
 *
 * _showSelectorHandler: function(e, popupOptions) {
 *    var self = this;
 *
 *    this._loadParams(popupOptions).addCallback(function(newPopupOptions) {
 *       self.showSelector(newPopupOptions);
 *    });
 *
 *    // отменить открытие справочника
 *    return false;
 * }
 * </pre>
 */
/*
 * @event Occurs before opening the selector through the interface.
 * @name Controls/_interface/ILookup#showSelector
 * @param {UICommon/Events:SyntheticEvent} eventObject The event descriptor.
 * @param {Object} popupOptions {@link Controls/_popup/Opener/Stack/PopupOptions.typedef Stack popup options.}
 * @example
 * The following example creates Controls/lookup:Input and shows how to handle the event.
 * <pre class="brush: html">
 * <Controls.lookup:Input
 *     source="{{_source}}"
 *     keyProperty="id"
 *     searchParam="title"
 *     on:showSelector="_showSelectorHandler()">
 * </Controls.lookup:Input>
 * </pre>
 * 
 * <pre class="brush: js">
 * // JavaScript
 * _loadParams: function() {
 *    ...
 * },
 *
 * _showSelectorHandler: function(e, popupOptions) {
 *    var self = this;
 *
 *    this._loadParams(popupOptions).addCallback(function(newPopupOptions) {
 *       self.showSelector(newPopupOptions);
 *    });
 *
 *    // отменить открытие справочника
 *    return false;
 * }
 * </pre>
 */
