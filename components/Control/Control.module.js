/**
 * Created by iv.cheremushkin on 21.08.2014.
 */

define('js!SBIS3.CONTROLS.Control', [], function() {

   'use strict';

   /**
    * базовый класс для всех контролов. Включает в себя объединенные старые классы Control и CompoundControl.
    * Объединение помогает однозначно понимать от какого класса должны наследоваться все остальные контролы.
    * @class SBIS3.CONTROLS.Control
    * @extends $ws.core.extend
    */

   var Control = $ws.core.extend({}, /** @lends SBIS3.CONTROLS.Control.prototype */{
      $protected: {
         _options: {
            /**
             * @cfg {Boolean} Взаимодействие с пользователя контролом
             * Для контрола контейнерного типа опция меняет состояние всех дочерних элементов.
             * Возможные значения:
             * <ul>
             *    <li>true - контрол активен;</li>
             *    <li>false - контрол неактивен;</li>
             * </ul>
             */
            disabled: false,
            /**
             * @cfg {String|jQuery|HTMLElement} Контейнер, в котором создается контрол
             */
            container : null,
            /**
             * @cfg {Object} Связанный с данным контролом контекст
             *
             */
            context : null,
            /**
             * @cfg {String} Имя контрола
             * Имя - уникальное название, выделяющее контрол среди других элементов веб-страницы.
             * Иными словами, это "идентификатор", по которому можно получить экземпляр класса контрола.
             *
             * Имя следует давать осмысленно, максимально характеризуя предназначение контрола.
             * Если имя состоит из нескольких слов, то они пишутся слитно, каждое с заглавной буквы.
             *
             * Имена контролов, находящихся в одной области видимости, не должны совпадать.
             * В противном случае по общему имени будет доступен один контрол, который раньше других объявлен на странице.
             */
            name: '',
            /**
             * @cfg {SBIS3.CONTROLS.Control} Логический родитель контрола
             * Это контрол, с которым установлена односторонняя связь.
             * К нему приходят необработанные команды от других контролов, которыми он владеет.
             *
             * Значение null говорит об отсутствии владельца.
             */
            owner: null,
            /**
             * @cfg {SBIS3.CONTROLS.Control} Физический родитель контрола
             * Это тот контрол, на котором находится элемент.
             */
            parent: null,
            /**
             * @cfg {String} Текст всплывающая подсказка
             * Текст простой всплывающей подсказки при наведении курсора мыши.
             */
            tooltip: '',
            /**
             * @cfg {Boolean} Видимость контрола
             * Видимость - это отображение на веб-странице.
             * Место за скрытым контролом не резервируется и веб-страница формируется так, будто контрола не существует.
             *
             * Возможные значения:
             * <ul>
             *    <li>true - контрол виден.</li>
             *    <li>false - контрол скрыт.</li>
             * </ul>
             */
            visibility: true
         }
      },

      $constructor: function() {

      },

      /**
       * Разрешить/запретить пользовательское взаимодействие с контролом
       * @param flag
       */
      setDisabled: function(flag){

      },

      /**
       * Узнать запрещено или разрешено пользовательское взаимодействие
       */
      isDisabled: function(){

      },

      /**
       * Получить контейнер контрола
       */
      getContainer: function(){

      },

      /**
       * Получить имя контрола
       */
      getName: function(){

      },

      /**
       * Получить логического родителя контрола
       */
      getOwner: function(){

      },

      /**
       * Получить физического родителя контрола
       */
      getParent: function(){

      },

      /**
       * Запустить валидацию
       */
      validate: function(){

      },

      /**
       * Сменить всплывающую подсказку
       */
      setTooltip: function(){

      },

      /**
       * Показать контрол
       */
      show: function(){

      },

      /**
       * Скрыть контрол
       */
      hide: function(){

      },

      /**
       * Скрыть контрол если он отображается или показать если не отображается
       */
      toggle: function(){

      },

      /**
       * Установить фокус на контрол
       */
      setFocus: function(){

      },

      /**
       * Установить контекст
       * @param context
       */
      setContext: function(context){

      },

      /**
       * Получить контекст
       */
      getContext: function(){

      },

      /**
       * Получить дочерние контролы
       */
      getChildControls: function(){

      },

      /**
       * Получить дочерний контрол по имени
       */
      getChildControlByName: function(){

      },

      /**
       * Перевести фокус на следующий контрол
       */
      moveFocusNext: function(){

      }
   });

   return Control;

});
