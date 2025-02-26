import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as InputMask from 'Controls/_input/Mask';
import * as MaskFormatterValue from 'Controls/_input/Mask/FormatterValue';
import * as template from 'wml!Controls/_input/Adapter/Mask/Mask';
import {EventUtils} from 'UI/Events';
/**
 * Контрол обертка над полем ввода маски. Обеспечивает работу со значением с разделителями.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_input.less переменные тем оформления}
 *
 * @class Controls/_input/Adapter/Mask
 * @extends UICore/Base:Control
 * @mixes Controls/decorator:IMask
 * @public
 * @demo Controls-demo/Input/AdapterMask/Index
 *
 * @author Мочалов М.А.
 */
class Mask extends Control<IControlOptions> {
    protected _notifyHandler = EventUtils.tmplNotify;

    protected _template: TemplateFunction = template;

    protected _beforeMount(options): void {
        this._value = MaskFormatterValue.formattedValueToValue(options.value, {
            mask: options.mask,
            replacer: options.replacer,
            formatMaskChars: options.formatMaskChars
        });
    }

    protected _beforeUpdate(newOptions): void {
        if (this._options.value !== newOptions.value ||
            this._options.mask !== newOptions.mask ||
            this._options.replacer !== newOptions.replacer
        ) {
            this._value = MaskFormatterValue.formattedValueToValue(newOptions.value, {
                mask: newOptions.mask,
                replacer: newOptions.replacer,
                formatMaskChars: newOptions.formatMaskChars
            });
        }
    }

    static getDefaultOptions = InputMask.getDefaultOptions;
}

export default Mask;
