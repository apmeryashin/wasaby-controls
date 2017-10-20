define('js!SBIS3.SPEC.input.Text', [
], function() {

   /**
    * Однострочное текстовое поле ввода.
    * @class SBIS3.SPEC.input.Text
    * @extends SBIS3.SPEC.Control
    * @mixes SBIS3.SPEC.input.interface.IInputText
    * @mixes SBIS3.SPEC.input.interface.IInputPlaceholder
    * @mixes SBIS3.SPEC.input.interface.IValidation
    * @mixes SBIS3.SPEC.input.interface.IInputTag
    * @control
    * @public
    * @category Inputs
    */

   /**
    * @name SBIS3.SPEC.input.Text#maxLength
    * @cfg {Number} Максимальное количество символов, которое может содержать поле ввода.
    */

   /**
    * @name SBIS3.SPEC.input.Text#trim
    * @cfg {Boolean} Режим обрезки пробелов в начале и конце добавляемого текста.
    * @variant true Обрезать пробелы.
    * @variant false Не обрезать пробелы.
    */

   /**
    * @name SBIS3.SPEC.input.Text#selectOnClick
    * @cfg {Boolean} Определяет режим выделения текста в поле ввода при получении фокуса.
    * @variant true Выделять текст.
    * @variant false Не выделять текст.
    */

   /**
    * @name SBIS3.SPEC.input.Text#inputCharRegExp
    * @cfg {String} Регулярное выражение, в соответствии с которым будет осуществляться валидация вводимых символов.
    */

});