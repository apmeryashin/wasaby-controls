import Base, {IBaseOptions} from './Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import {TemplateFunction} from 'UI/Base';

// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_jumpingLabel/InputContainer/InputContainer';

export interface IInputContainerOptions extends IBaseOptions {
    value: null | string;
}

/**
 * Контрол, отображающий подсказку рядом с полем ввода. Если в поле ввода нет данных, подсказка отображается как placeholder.
 * <b>Важно:</b> При использовании прыгающей метки опцию value нужно задавать не на полях ввода, а на самой метке.
 * @remark
 * Используется с контролами, поддерживающими интерфейс {@link Controls/input:IValue}.
 *
 * Полезные ссылки
 * * {@link /materials/Controls-demo/app/Controls-demo%2FJumpingLabel%2FStandard%2FIndex демо-пример}
 * * {@link http://axure.tensor.ru/StandardsV8/%D0%BF%D0%BE%D0%BB%D1%8F_%D0%B2%D0%B2%D0%BE%D0%B4%D0%B0.html Стандарт}
 *
 * @class Controls/_jumpingLabel/InputContainer
 * @extends Controls/jumpingLabel:Abstract
 * @exclude Base
 *
 * @public
 * @demo Controls-demo/JumpingLabel/Index
 *
 * @author Красильников А.С.
 */
class InputContainer extends Base<IInputContainerOptions> {
    protected _template: TemplateFunction = template;

    protected _setShowFromAbove(options: IInputContainerOptions): void {
        this._showFromAbove = options.value !== null && options.value !== undefined && options.value !== '';
    }

    private _valueChangedHandler(event: SyntheticEvent, inputValue: any, inputDisplayValue: string): void {
        this._showFromAbove = Boolean(inputDisplayValue);
    }
}

export default InputContainer;
