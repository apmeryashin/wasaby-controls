import {Control, IControlOptions} from 'UI/Base';
import {Model} from 'Types/entity';
import {ISingleSelectableOptions, IItemsOptions, IHeightOptions} from 'Controls/interface';
import * as itemTemplate from 'wml!Controls/_toggle/ButtonGroup/itemTemplate';
import {IItemTemplateOptions} from 'Controls/interface';
import {SyntheticEvent} from 'Vdom/Vdom';
import 'css!Controls/buttons';
import 'css!Controls/toggle';
import 'css!Controls/CommonClasses';

export interface IButtonGroupOptions extends ISingleSelectableOptions, IControlOptions, IItemsOptions<object>,
    IItemTemplateOptions, IHeightOptions {
    allowEmptySelection?: boolean;
    direction?: string;
}

/**
 * @name Controls/_toggle/ButtonGroupBase#allowEmptySelection
 * @cfg {Boolean} Использование единичного выбора с возможностью сбросить значение.
 * @default false
 * @demo Controls-demo/toggle/ButtonGroup/AllowEmptySelection/Index
 */

/**
 * @name Controls/_toggle/ButtonGroupBase#direction
 * @cfg {string} Расположение элементов в контейнере.
 * @variant horizontal Элементы расположены один за другим (горизонтально).
 * @variant vertical Элементы расположены один под другим (вертикально).
 * @default vertical
 * @example
 * Вертикальная ориентация.
 * <pre>
 *    <Controls.toggle:Chips direction="vertical"/>
 * </pre>
 */

/**
 * @class Controls/_toggle/ButtonGroupBase
 * @extends UI/Base:Control
 * @implements Controls/interface:ISingleSelectable
 * @implements Controls/interface:IItems
 * @mixes Controls/toggle:IButtonGroupOptions
 *
 * @public
 * @author Красильников А.С.
 */

class ButtonGroupBase<TOptions extends IButtonGroupOptions = IButtonGroupOptions> extends Control<TOptions> {

    protected _getIconStyle(item: Model): string {
        if (this._isSelectedItem(item)) {
            return 'contrast';
        }
        return item.get('iconStyle') || 'default';
    }

    protected _isSelectedItem(item: Model): boolean {
        return item.get(this._options.keyProperty) === this._options.selectedKey;
    }

    protected _onItemClick(event: SyntheticEvent<Event>, item: Model): void {
        const keyProperty = this._options.keyProperty;
        const isNewItemSelected = item.get(keyProperty) !== this._options.selectedKey;
        if (!this._options.readOnly && isNewItemSelected) {
            this._notify('selectedKeyChanged', [item.get(keyProperty)]);
        } else if (!isNewItemSelected && this._options.allowEmptySelection) {
            this._notify('selectedKeyChanged', [null]);
        }
    }

    static defaultProps: Partial<IButtonGroupOptions> = {
        keyProperty: 'id',
        allowEmptySelection: false,
        itemTemplate,
        inlineHeight: 'm'
    };
}

export default ButtonGroupBase;
