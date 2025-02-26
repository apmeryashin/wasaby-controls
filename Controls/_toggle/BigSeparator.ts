import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {ICheckable, ICheckableOptions} from './interface/ICheckable';
import BigSeparatorTemplate = require('wml!Controls/_toggle/BigSeparator/BigSeparator');
import {descriptor as EntityDescriptor} from 'Types/entity';
import 'css!Controls/toggle';
import {SyntheticEvent} from 'Vdom/Vdom';
import {constants} from 'Env/Env';
import {default as WorkByKeyboardContext, IWorkByKeyboardContext} from '../Context/WorkByKeyboardContext';

/**
 * @typedef TViewMode
 * @variant ellipsis Иконка открытия отображатеся в виде троеточия
 * @variant arrow Иконка открытия отображатеся в виде стрелки
 */
type TViewMode = 'ellipsis' | 'arrow';

export interface IBigSeparatorOptions extends IControlOptions, ICheckableOptions {
    /**
     * @name Controls/_toggle/BigSeparator#viewMode
     * @cfg {String} Режим отображения иконки открытия.
     * @variant ellipsis
     * @variant arrow
     * @default ellipsis
     * @demo Controls-demo/toggle/BigSeparator/ViewMode/Index
     */
    viewMode?: TViewMode;
    /**
     * @name Controls/_toggle/BigSeparator#contrastBackground
     * @cfg {Boolean} Определяет контрастность фона кнопки по отношению к ее окружению.
     * @default true
     * @demo Controls-demo/toggle/BigSeparator/ContrastBackground/Index
     */
    contrastBackground?: boolean;
    /**
     * @name Controls/_toggle/BigSeparator#iconSize
     * @cfg {String} Размер кнопки.
     * @variant s
     * @variant m
     * @variant l
     * @default m
     * @demo Controls-demo/toggle/BigSeparator/SeparatorSize/Index
     */
    iconSize?: string;
}

/**
 * Контрол служит для визуального ограничения контента. При клике на него отображаются скрытые записи, попавшие в ограничение.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2Ftoggle%2FBigSeparator%2FIndex демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_toggle.less переменные тем оформления}
 *
 * @class Controls/_toggle/BigSeparator
 * @extends UI/Base:Control
 *
 * @public
 * @author Мочалов М.А.
 * @implements Controls/toggle:ICheckable
 *
 * @demo Controls-demo/toggle/BigSeparator/Index
 */

class BigSeparator extends Control<IBigSeparatorOptions> implements ICheckable {
    readonly '[Controls/_toggle/interface/ICheckable]': boolean = true;

    protected _template: TemplateFunction = BigSeparatorTemplate;
    protected _workByKeyboard: WorkByKeyboardContext;

    protected _beforeMount(options: IBigSeparatorOptions, context: IWorkByKeyboardContext = {}): void {
        this._workByKeyboard = context.workByKeyboard;
    }

    protected _beforeUpdate(newOptions: IBigSeparatorOptions, context: IWorkByKeyboardContext = {}): void {
        if (this._workByKeyboard !== context.workByKeyboard) {
            this._workByKeyboard = context.workByKeyboard;
        }
    }

    protected _highlightedOnFocus(): boolean {
        return !!this._workByKeyboard?.status && !this._options.readOnly;
    }

    protected _keyUpHandler(e: SyntheticEvent<KeyboardEvent>): void {
        if (e.nativeEvent.keyCode === constants.key.space && !this._options.readOnly) {
            e.preventDefault();
            this._clickHandler();
        }
    }

    protected _clickHandler(): void {
        if (!this._options.readOnly) {
            this._notify('valueChanged', [!this._options.value]);
        }
    }

    static getDefaultOptions(): IBigSeparatorOptions {
        return {
            value: false,
            iconSize: 'm',
            contrastBackground: true
        };
    }

    static getOptionTypes(): object {
        return {
            value: EntityDescriptor(Boolean)
        };
    }

    static contextTypes(): object {
        return {
            workByKeyboard: WorkByKeyboardContext
        };
    }
}

Object.defineProperty(BigSeparator, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return BigSeparator.getDefaultOptions();
    }
});

/**
 * @name Controls/_toggle/Separator#value
 * @cfg {Boolean} Если значение - "true", то будет отображаться иконка открытия, иначе будет отображаться иконка закрытия.
 */

export default BigSeparator;
