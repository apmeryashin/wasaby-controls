define('Controls/interface/IPrinter', [], function() {

   /**
    * Интерфейс для печати страниц. Печать - это действие, которое экспортирует файл в определенный формат (например, PDF, Excel).
    *
    * @interface Controls/interface/IPrinter
    * @public
    * @author Авраменко А.С.
    *
    * @see Unload/Action/PDF
    * @see Unload/Action/Excel
    */

   /*
    * Interface for printers. Printer is an action that exports a file to a certain format (e.g., PDF, Excel).
    *
    * @interface Controls/interface/IPrinter
    * @public
    * @author Авраменко А.С.
    *
    * @see Unload/Action/PDF
    * @see Unload/Action/Excel
    */    

   /**
    * @typedef {Object} Column
    * @property {String} field Имя поля, содержащего данные для отображения в столбце.
    * @property {String} title Заголовок столбца.
    */

   /*
    * @typedef {Object} Column
    * @property {String} field Name of the field that contains data to be rendered in the column.
    * @property {String} title Header of the column.
    */    

   /**
    * Prints items.
    * @function Controls/interface/IPrinter# Выгружает реестр в соответствующий формат.
    * @param {Object} params Дополнительная информация.
    * @param {String} params.name Имя файла, используемого для экспорта.
    * @param {Boolean} params.pageLandscape Определяет, какую ориентацию будет иметь страница - книжную или альбомную.
    * @param {Array.<Column>} params.columns Список столбцов для экспорта.
    * @param {String} params.parentProperty Имя поля, содержащего идентификатор родительского элемента.
    * @example
    * В следующем примере показано, как произвести печать.
    * <pre>
    *    var params = {
    *       name: 'myFile',
    *       pageLandscape: true,
    *       columns: [{ field: 'Name', name: 'Name' }, { field: 'Date', name: 'Date' }],
    *       parentProperty: 'parent'
    *    };
    *    this._children.printer.execute(params);
    * </pre>
    */

   /*
    * Prints items.
    * @function Controls/interface/IPrinter#execute
    * @param {Object} params Additional information.
    * @param {String} params.name File name to use for exported file.
    * @param {Boolean} params.pageLandscape Determines whether the page will be in portrait or landscape orientation.
    * @param {Array.<Column>} params.columns List of columns to export.
    * @param {String} params.parentProperty Name of the field that contains item's parent identifier.
    * @example
    * The following example shows how to print something.
    * <pre>
    *    var params = {
    *       name: 'myFile',
    *       pageLandscape: true,
    *       columns: [{ field: 'Name', name: 'Name' }, { field: 'Date', name: 'Date' }],
    *       parentProperty: 'parent'
    *    };
    *    this._children.printer.execute(params);
    * </pre>
    */    

   /**
    * @name Controls/interface/IPrinter#sorting
    * @cfg {Object.<string, 'ASC' | 'DESC'>} Конфигурация сортировки (ключи объектов-имена полей; значения - тип сортировки).
    * @example
    * JS:
    * <pre>
    *    _beforeMount: function() {
    *       this._sorting = {
    *          Name: 'DESC'
    *       }
    *    }
    * </pre>
    * WML:
    * <pre>
    *    <Unload.Action.PDF sorting="{{ _sorting }}" />
    * </pre>
    */

   /*
    * @name Controls/interface/IPrinter#sorting
    * @cfg {Object.<string, 'ASC' | 'DESC'>} Sorting config (object keys - field names; values - sorting type).
    * @example
    * JS:
    * <pre>
    *    _beforeMount: function() {
    *       this._sorting = {
    *          Name: 'DESC'
    *       }
    *    }
    * </pre>
    * WML:
    * <pre>
    *    <Unload.Action.PDF sorting="{{ _sorting }}" />
    * </pre>
    */    
});
