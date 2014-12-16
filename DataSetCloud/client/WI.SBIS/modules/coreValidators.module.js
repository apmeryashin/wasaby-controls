define('js!SBIS3.CORE.CoreValidators', [],function() {

   'use strict';

   var obj;

   function ctrlDigFromStartWeight(value, start, period) {
      var
         summ = 0,
         weight = start,
         len = value.length;
      for (var i = 0; i < len - 1; i++, weight = (period && i % period === 0 ? start : weight + 1)) {
         summ += parseInt(value.charAt(i), 10) * weight;
      }
      return summ % 11;
   }
   function getValueForValidation(ctlValue) {
      if (ctlValue === undefined || ctlValue === null || ctlValue === '') {
         return '';
      }
      return ctlValue;
   }

   return obj = {
      required : function() {
         var value = this.getValue();
         if (value instanceof $ws.proto.Enum) {
            value = value.getCurrentValue();
         }
         if (value === undefined || value === null || value === ''){
            return 'Поле обязательно для заполнения';
         }
         return true;
      },

      kpp : function(innFieldName) {
         var parent = this.getParentWindow() || this.getTopParent();
         var innField = parent.getChildControlByName(innFieldName);

         // Указанное поле ИНН существует и корректно заполнено
         if(obj.inn.call(innField) === true) {
            var innVal = innField.getValue() + '';
            if(innVal.length == 10) {
               var kppVal = this.getValue();
               if(kppVal instanceof $ws.proto.Enum) {
                  kppVal = kppVal.getCurrentValue();
               }
               return ((/^([0-9]+)$/).test(kppVal) && ('' + kppVal).length == 9) ? true : 'КПП должен состоять из 9 цифр'; // Должно быть заполнено 9 цифрами
            } else if (innVal.length == 12) {
               return obj.required.call(this) !== true ? true : 'КПП не должен быть заполнен'; // Если НЕ заполненно то все хорошо!
            } else{ // Сюда мы попадем, если ИНН путой
               return true; // тогда считаем что и КПП заполнено правильно т.к. не можем выявить ошибку
            }
         } else {
            return true;
         }
      },

      kppAtPlace: function(innColumn){
         var record = this.getLinkedContext().getRecord(),
            inn = record.get(innColumn);
         if (obj.innCheckValue(inn)) {
            if (inn.length == 10) {
               var kppVal = this.getValue();
               return ((/^([0-9]+)$/).test(kppVal) && ('' + kppVal).length == 9) ? true : 'КПП должен состоять из 9 цифр'; // Должно быть заполнено 9 цифрами
            } else if (inn.length == 12) {
               if (!kppVal) {
                  return 'КПП не должен быть заполнен'; // Если НЕ заполненно то все хорошо!
               }
            }
         }
         return true;
      },

      /**
       * Валидируем только чексумму, если длина 10 или 12
       */
      innCheckSum : function(){
         var value = getValueForValidation(this.getValue());
         return obj.innCheckValue(value);
      },

      /**
       * Валидирует значение инн. Может быть использовано не только на полях ввода
       * @param  {String} value Значение инн
       * @return {Boolean|String}
       */
      innCheckValue: function(value){
         if(value === ''){
            return true;
         }

         if (value === '000000000000' || value === '0000000000'){
            return 'ИНН не может состоять из одних нулей';
         }

         var
            koef = [3,7,2,4,10,3,5,9,4,6,8],
            val = value.toString(),
            sum = 0, i, j;

         if (val.length === 12) {
            for(i = 0,j = 1; i < 10; i++, j++){
               sum += val.charAt(i) * koef[j];
            }
            if((sum % 11) % 10 == val.charAt(10)){
               sum = 0;
               for(i = 0, j = 0; i < 11; i++, j++){
                  sum += val.charAt(i) * koef[j];
               }
               if((sum % 11) % 10 == val.charAt(11))
                  return true;
            }
         } else {
            if( val.length === 10 ){// 10 digits
               for(i = 0, j = 2; i < 9; i++, j++){
                  sum += val.charAt(i) * koef[j];
               }
               if((sum % 11) % 10 == val.charAt(9)){
                  return true;
               }
            } else {
               return true;
            }
         }
         return 'Неверная контрольная сумма ИНН';
      },

      inn : function(innLen) {
         innLen = parseInt(innLen, 10) || 0;
         var value = getValueForValidation(this.getValue());
         if(value === ''){
            return true;
         }

         var
            valLen = ('' + value).length,
            isNumbers = (/^([0-9]+)$/).test(value),
            isCorrectLength = (innLen > 0) ?  (('' + value).length == innLen) : (valLen === 10 || valLen === 12);
         if(!isNumbers || !isCorrectLength){
            return 'ИНН должен состоять из ' + (innLen > 0 ? innLen : '10 или 12') + ' цифр';
         }

         return obj.innCheckSum.apply( this );
      },

      email : function(){
         var value = getValueForValidation(this.getValue());
         if(value === ''){
            return true;
         }
         if ((/^[-a-z0-9_]+(\.[-a-z0-9_]+)*@([a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?\.)*(aero|arpa|asia|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|[a-z][a-z])$/i).test(value)){
            return true;
         }
         return 'В поле требуется ввести адрес электронной почты';
      },

      inRange : function(min, max) {
         var value = getValueForValidation(this.getValue());
         if(value === ''){
            return true;
         }
         min = parseFloat(min);
         max = parseFloat(max);
         var
            min_ = isNaN(min) ? value : min,
            max_ = isNaN(max) ? value : max;
         return (!isNaN(parseFloat(value)) && isFinite(value) && value >= min_ && value <= max_) ?
            true : 'Значение должно попадать в диапазон ['+(isNaN(min)? '*' : min)+';'+(isNaN(max)? '*' : max)+']';
      },

      length : function(min, max) {
         var value = this.getStringValue() || '';
         if(value === ''){
            return true;
         }
         min = parseInt(min, 10);
         max = parseInt(max, 10);
         var
            l =  value.length,
            min_ = (isNaN(min)) ? l : min,
            max_ = (isNaN(max)) ? l : max;
         return (l >= min_ && l <= max_) ? true : 'Длина должна попадать в указаный диапазон ['+(isNaN(min)? '*' : min)+';'+(isNaN(max)? '*' : max)+']';
      },

      url : function() {
         var value = getValueForValidation(this.getValue());
         if(value === ''){
            return true;
         }
         return ((/^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/i).test(value)) ? true : 'Должен быть указан корректный URL';
      },

      compare : function(name) {
         var value = this.getStringValue() || '',
            valueCmp;
         try {
            valueCmp = $ws.single.ControlStorage.getByName(name).getStringValue() || '';
         } catch(e) {
            return false;
         }
         // Возможно, нужно будет использовать equals из core.js
         return (value === valueCmp) ? true : 'Значение поля должно совпадать с полем "' + name + '"';
      },

      okpo : function() {
         var
            inputValue = String.trim(getValueForValidation(this.getValue())),
            len, lastDig, ctrlDig;
         if(inputValue === '' ) {
            return true;
         }

         len = inputValue.length;
         if(len < 8 || len > 14) { // Комментарий отдела форм отчётности - от 8 до 14 знаков
            return 'ОКПО должен содержать от 8 до 14 цифр';
         }

         lastDig = parseInt(inputValue.charAt(len-1), 10);
         ctrlDig = ctrlDigFromStartWeight(inputValue, 1, 10);
         if (ctrlDig === 10) {
            ctrlDig = ctrlDigFromStartWeight(inputValue, 3, 10);
         }
         if (ctrlDig === 10) {
            ctrlDig = 0;
         }
         if (ctrlDig !== lastDig) {
            return 'Неверная контрольная сумма ОКПО';
         }
         return true;
      },

      ogrn : function(length, field) { // Работает как для организации, так и для ИП
         var
            inputValue = String.trim(getValueForValidation(this.getValue())),
            len, lastDig, ctrlDig, lstctrldig,
            effectivLen = parseInt(inputValue,10).toString().length;
         if (inputValue === '') {
            return true;
         }

         len = inputValue.length;
         field = field || (length == 15 ? 'ОГРНИП' : 'ОГРН');
         if (length && len != length || !length && (len !== 13 && len !== 15)) {
            return field + ' должен состоять из ' + (length || '13 или 15') + ' цифр';
         }

         lastDig = parseInt(inputValue.charAt(len - 1), 10);
         ctrlDig = parseInt(inputValue.substr(0, len - 1), 10) % (effectivLen - 2);
         lstctrldig = ctrlDig % 10;

         if (lstctrldig !== lastDig) {
            return 'Неверная контрольная сумма ' + field;
         }
         return true;
      },

      //Валидатор для СНИЛС
      snils : function(){
         var inputValue = getValueForValidation( this.getValue() );
         if ( inputValue === '' ){
            return true;
         }
         //Проверим длину входных данных
         if ( inputValue.length !== 11 ){
            return 'СНИЛС должен состоять из 11 цифр';
         }
         //Проверим корректность входных данных(только числа)
         if ( !(/^[\d]+$/).test( inputValue ) ){
            return 'СНИЛС должен состоять из 11 цифр';
         }
         //Получим контрольные цифры
         var lastDigs = inputValue % 100;
         //Считаем контрольную сумму ( сумма произведений цифры на( 10 - (позиция, на которой она стоит) ) )
         var snilsNum = inputValue.substr( 0, 9 );
         var ctrlDigs = 0;
         for(var i = 1; i<10; i++ ){
            ctrlDigs += snilsNum.substr( i-1, 1 ) * ( 10 - i );
         }
         //Посчитанную контрольную сумму надо взять по модулю 101 и после этого по модулю 100( контрольная сумма для 100 должна быть 00 )
         ctrlDigs = ( ctrlDigs % 101 ) % 100;
         //Сравним значения контрольных сумм
         if (ctrlDigs != lastDigs){
            return 'Неверная контрольная сумма СНИЛС';
         }
         return true;
      },

      PFNumber : function() {
         var value = getValueForValidation(this.getValue());
         if (value === '' || !(/^[0-9]{3}-[0-9]{3}-[0-9]{6}$/).test(value)) {
            return 'Регистрационный номер в ПФ должен состоять из 12 цифр';
         }
         return true;
      },

      FSSNumber : function() {
         var value = getValueForValidation(this.getValue());
         if (value === '') {
            return true;
         }
         if (value.length != 10) {
            return 'Номер в ФСС должен состоять из 10 цифр';
         }
         return true;
      },

      kodPodchinennostiFSS : function() {
         var value = getValueForValidation(this.getValue());
         if (value === '' || !(/^[0-9]{4} [0-9]{1}$/).test(value)) {
            return 'Код подчиненности в ФСС должен состоять из 5 цифр';
         }
         return true;
      },

      TFOMS : function() {
         var
            weights = [3, 5, 7, 9, 11, 13, 15, 13, 11, 9, 7, 5, 3, 1],
            summ = 0,
            value = String.trim(getValueForValidation(this.getValue())),
            lstctrldig = parseInt(value.charAt(value.length - 1), 10);
         if (value === '') {
            return true;
         }
         if (value.length != 15) {
            return 'Номер должен состоять из 15 цифр';
         }
         else if (value === '000000000000000') {
            return 'Номер ТФОМС не может состоять из одних нулей';
         }
         for (var i = 0; i < value.length - 1; i++) {
            summ += parseInt(value.charAt(i), 10) * weights[i];
         }
         if ((summ % 9) === lstctrldig) {
            return true;
         }
         return 'Неверная контрольная сумма ТФОМС';
      },

      //Валидатор обрезает пробелы в начале и конце строки, а также, заменяет несколько подряд идущих пробелов на 1
      removeExcessSpaces : function(){
         var new_value = getValueForValidation( this.getValue() ).trim().replace(/\s+/g, ' ');
         //Установим новое значение в поле
         this.setValue( new_value );
         //Возвратим true, функция отработала
         return true;
      }
   };
});