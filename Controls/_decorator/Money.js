define('Controls/_decorator/Money', ['UI/Executor', 'Controls/_decorator/resources/Money'], function(Executor, Money) {
   var filename = 'Controls/_decorator/Money';
   var thelpers = Executor.TClosure;

   var templateFunction = function MoneyTemplate(data, attr, context, isVdom, sets, forceCompatible, generatorConfig) {
      var key = thelpers.validateNodeKey(attr && attr.key);
      var value = typeof data.value !== 'undefined' ? data.value : null;
      var useGrouping = data.useGrouping !== false;
      var abbreviationType = data.abbreviationType || 'none';
      var precision = data.precision === 0 ? 0 : 2;
      var formattedNumber = Money.calculateFormattedNumber(value, useGrouping, abbreviationType,
         precision, data.onlyPositive);
      var stroked = data.stroked || false;
      var fontColorStyle = Money.calculateFontColorStyle(stroked, data) || 'default';
      var fontSize = data.fontSize || 'm';
      var fontWeight = data.fontWeight || 'default';
      var showEmptyDecimals = data.showEmptyDecimals !== false;
      var currencySize = data.currencySize || 's';
      var currencyPosition = data.currencyPosition || 'right';
      var underline = data.underline || 'none';
      var currency = Money.calculateCurrency(data.currency);
      var fractionFontSize = Money.calculateFractionFontSize(fontSize);
      var isDisplayFractionPath = Money.isDisplayFractionPath(formattedNumber.fraction, showEmptyDecimals, precision);
      var tooltip = Money.calculateTooltip(formattedNumber, data);

      var mainClass = Money.calculateMainClass(fontColorStyle, underline, data.style);
      var calculateCurrencyClass = Money.calculateCurrencyClass(currencySize, fontColorStyle, fontWeight);
      var strokedClass = Money.calculateStrokedClass(stroked);
      var integerClass = Money.calculateIntegerClass(fontSize, fontColorStyle, fontWeight, data.currency,
         currencyPosition, isDisplayFractionPath);
      var fractionClass = Money.calculateFractionClass(formattedNumber.fraction, fontColorStyle,
         fractionFontSize, data.currency, currencyPosition);
      var isForceCompatible = forceCompatible;

      var defCollection = {
         id: [],
         def: undefined
      };

      // tslint:disable-next-line
      // @ts-ignore
      var viewController = thelpers.calcParent(this, undefined, data);
      if (typeof isForceCompatible === 'undefined') {
         isForceCompatible = false;
      }
      var markupGenerator = thelpers.createGenerator(isVdom, isForceCompatible, generatorConfig);

      thelpers.getContext(this);
      var out = null;
      try {
         out = markupGenerator.joinElements([markupGenerator.createTag('span', {
            'attributes': {
               'class': mainClass,
               'title': thelpers.wrapUndef(markupGenerator.escape(tooltip))
            },
            'events': {},
            'key': key + '0_'
         }, [((data.currency && currencyPosition === 'left') ? ([markupGenerator.createTag('span', {
            'attributes': {
               'class': calculateCurrencyClass
            },
            'events': {},
            'key': key + '0_0_0_'
         }, [markupGenerator.createText('' + (thelpers.wrapUndef(markupGenerator.escape(currency))) + '', key + '0_0_0_0_')], attr ? {
            context: attr.context,
            key: key + '0_0_0_'
         } : {}, defCollection, viewController)]) : markupGenerator.createText('')), markupGenerator.createTag('span', {
            'attributes': {
               'class': strokedClass
            },
            'events': {},
            'key': key + '0_1_'
         }, [markupGenerator.createTag('span', {
            'attributes': {
               'class': integerClass
            },
            'events': {},
            'key': key + '0_1_0_'
         }, [markupGenerator.createText('' + (thelpers.wrapUndef(markupGenerator.escape(formattedNumber.integer))) + '', key + '0_1_0_0_')], attr ? {
            context: attr.context,
            key: key + '0_1_0_'
         } : {}, defCollection, viewController), ((isDisplayFractionPath && abbreviationType !== 'long') ? ([markupGenerator.createTag('span', {
            'attributes': {
               'class': fractionClass
            },
            'events': {},
            'key': key + '0_1_1_0_'
         }, [markupGenerator.createText('' + (thelpers.wrapUndef(markupGenerator.escape(formattedNumber.fraction))) + '', key + '0_1_1_0_0_')], attr ? {
            context: attr.context,
            key: key + '0_1_1_0_'
         } : {}, defCollection, viewController)]) : markupGenerator.createText(''))], attr ? {
            context: attr.context,
            key: key + '0_1_'
         } : {}, defCollection, viewController), ((data.currency && currencyPosition === 'right') ? ([markupGenerator.createTag('span', {
            'attributes': {
               'class': calculateCurrencyClass
            },
            'events': {},
            'key': key + '0_2_0_'
         }, [markupGenerator.createText('' + (thelpers.wrapUndef(markupGenerator.escape(currency))) + '', key + '0_2_0_0_')], attr ? {
            context: attr.context,
            key: key + '0_2_0_'
         } : {}, defCollection, viewController)]) : markupGenerator.createText(''))], attr, defCollection, viewController, true)], key, defCollection);
         if (defCollection && defCollection.def) {
            out = markupGenerator.chain(out, defCollection, this);
         }
      } catch (e) {
         thelpers.templateError(filename, e, data);
      }
      return out || markupGenerator.createText('');
   };
   templateFunction.stable = true;
   templateFunction.reactiveProps = [];
   templateFunction.isWasabyTemplate = true;
   return templateFunction;
});

/**
 * Графический контрол, декорирующий число таким образом, что оно приводится к денежному формату.
 * Денежным форматом является число с неограниченной целой частью, и двумя знаками в дробной части.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_decorator.less переменные тем оформления}
 *
 * @class Controls/_decorator/Money
 * @extends UI/Base:Control
 *
 * @implements Controls/decorator:IOnlyPositive
 * @implements Controls/interface:ITooltip
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontWeight
 * @implements Controls/interface:IFontSize
 * @implements Controls/interface:INumberFormat
 * @mixes Controls/decorator:IMoney
 *
 * @public
 * @demo Controls-demo/Decorator/Money/Index
 * @demo Controls-demo/Decorator/Money/Hovered/Index
 *
 * @author Красильников А.С.
 */

/**
 * Интерфейс для опций контрола {@link Controls/decorator:Money}.
 * @interface Controls/_decorator/IMoney
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/_decorator/IMoney#value
 * @cfg {String | Number | Null} Декорируемое число.
 * @default null
 * @demo Controls-demo/Decorator/Money/Value/Index
 */

/**
 * @name Controls/_decorator/IMoney#abbreviationType
 * @cfg {Controls/_decorator/IMoney/TAbbreviationType.typedef} Тип аббревиатуры.
 * @default none
 * @demo Controls-demo/Decorator/Money/Abbreviation/Index
 */

/**
 * @name Controls/_decorator/IMoney#currency
 * @cfg {Controls/_decorator/IMoney/TCurrency.typedef} Отображаемая валюта.
 * @demo Controls-demo/Decorator/Money/Currency/Index
 */

/**
 * @name Controls/_decorator/IMoney#currencySize
 * @cfg {Controls/_decorator/IMoney/TCurrencySize.typedef} Размер отображаемой валюты.
 * @default s
 * @demo Controls-demo/Decorator/Money/CurrencySize/Index
 */

/**
 * @name Controls/_decorator/IMoney#currencyPosition
 * @cfg {Controls/_decorator/IMoney/TCurrencyPosition.typedef} Позиция отображаемой валюты относительно суммы.
 * @default right
 * @demo Controls-demo/Decorator/Money/Currency/Index
 */

/**
 * @name Controls/_decorator/IMoney#underline
 * @cfg {Controls/_decorator/IMoney/TUnderline.typedef} Вариант подчеркивания.
 * @default none
 * @demo Controls-demo/Decorator/Money/Underline/Index
 */


/**
 * @name Controls/_decorator/IMoney#precision
 * @cfg {Number} Количество знаков после запятой.
 * @default 2
 * @demo Controls-demo/Decorator/Money/Precision/Index
 */

/**
 * @name Controls/_decorator/IMoney#showEmptyDecimals
 * @cfg {Boolean}
 * @default true
 */

/**
 * @name Controls/_decorator/IMoney#fontColorStyle
 * @cfg {TFontColorStyle}
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.decorator:Money value="{{100000.00}}" fontColorStyle="primary"/>
 * <Controls.decorator:Money value="{{100000.00}}" fontColorStyle="secondary"/>
 * </pre>
 * @demo Controls-demo/Decorator/Money/FontColorStyle/Index
 */

/**
 * Тип данных для форматируемого значения
 * @typedef {String | Number | Null} Controls/_decorator/IMoney/TValue
 */

/**
 * Тип данных для аббревиатуры (сокращения) суммы
 * @typedef {String} Controls/_decorator/IMoney/TAbbreviationType
 * @variant long Использвать длинную аббревиатуру (например, 1 000 = 1 тыс)
 * @variant none Не использовать аббревиатуру
 */

/**
 * Тип данных для отображаемой валюты
 * @typedef {String} Controls/_decorator/IMoney/TCurrency
 * @variant Ruble Отображать символ валюты рубль
 * @variant Euro Отображать символ валюты евро
 * @variant Dollar Отображать символ валюты доллар
 */

/**
 * Тип данных для позиции отображаемой валюты
 * @typedef {String} Controls/_decorator/IMoney/TCurrencyPosition
 * @variant right Валюта отображается справа от суммы
 * @variant left Валюта отображается слева от суммы
 */

/**
 * Тип данных для размера отображаемой валюты
 * @typedef {String} Controls/_decorator/IMoney/TCurrencySize
 * @variant 2xs
 * @variant xs
 * @variant s
 * @variant m
 * @variant l
 */

/**
 * Тип данных для подчеркивания
 * @typedef {String} Controls/_decorator/IMoney/TUnderline
 * @variant hovered Подчеркивать по наведению
 * @variant none Не подчеркивать
 */

/**
 * Тип данных количества знаков после запятой
 * @typedef {String} Controls/_decorator/IMoney/TPrecision
 * @variant 0
 * @variant 2
 */
