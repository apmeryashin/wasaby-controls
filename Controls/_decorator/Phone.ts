import {descriptor} from 'Types/entity';
import {FORMAT_MASK_CHARS, REPLACER, phoneMask} from './Phone/phoneMask';
import * as Formatter from './resources/Formatter';
import * as FormatBuilder from './resources/FormatBuilder';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
// @ts-ignore
import * as template from 'wml!Controls/_decorator/Phone/Phone';

import toString from 'Controls/_decorator/inputUtils/toString';

export interface IPhoneOptions extends IControlOptions {
    /**
     * @name Controls/_decorator/IPhone#value
     * @cfg {String|null} Декорируемый телефонный номер.
     * @default ''
     * @demo Controls-demo/Decorator/Phone/Index
     */
    value: string | null;
}

/**
 * Графический контрол, декорирующий телефонный номер таким образом, что он приводится к заданному формату.
 *
 * @remark
 * Форматы телефонных номеров:
 *
 * * Российские мобильные номера, например +7(XXX) XXX-XX-XX[ доб. {остальные цифры}];
 * * Российские мобильные номера в зависимости от кода города, например +7(XXXX) XX-XX-XX[ доб. {остальные цифры}] или +7(XXXXX) X-XX-XX[ доб. {остальные цифры}];
 * * Иностранные номера, например +{иностранный код} {остальные цифры};
 * * Остальные номера отображаются как есть без формата.
 *
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_decorator.less переменные тем оформления}
 *
 * @class Controls/_decorator/Phone
 * @extends UI/Base:Control
 * @mixes Controls/decorator:IPhone
 * @public
 * @demo Controls-demo/Decorator/Phone/Index
 *
 * @author Красильников А.С.
 */
class Phone extends Control<IPhoneOptions> {
    protected _formattedPhone: string = null;

    protected _template: TemplateFunction = template;

    protected _beforeMount(options: IPhoneOptions): void {
        this._formattedPhone = Phone._formatPhone(options.value);
    }

    protected _beforeUpdate(newOptions: IPhoneOptions): void {
        const oldValue = this._options.value;
        const newValue = newOptions.value;

        if (oldValue !== newValue) {
            this._formattedPhone = Phone._formatPhone(newValue);
        }
    }

    private static _formatPhone(phone: string | null): string {
        const validPhone = toString(phone.replace(/[^+\d]/g, ''));
        const mask = phoneMask(validPhone);
        const format = FormatBuilder.getFormat(mask, FORMAT_MASK_CHARS, REPLACER);
        const data = Formatter.formatData(format, {
            value: validPhone,
            carriagePosition: 0
        });
        if (data) {
            return data.value;
        }
        return '';
    }

    static getOptionTypes() {
        return {
            value: descriptor(String, null)
        };
    }

    static getDefaultOptions() {
        return {
            value: ''
        };
    }
}

Object.defineProperty(Phone, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Phone.getDefaultOptions();
   }
});

export default Phone;

/**
 * Интерфейс для опций контрола {@link Controls/decorator:Phone}.
 * @interface Controls/_decorator/IPhone
 * @public
 * @author Красильников А.С.
 */
