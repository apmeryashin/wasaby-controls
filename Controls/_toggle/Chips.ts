import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IFontSizeOptions, IHeightOptions, IItemsOptions, IMultiSelectableOptions} from 'Controls/interface';
import {ButtonTemplate} from 'Controls/buttons';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as template from 'wml!Controls/_toggle/ButtonGroup/ButtonGroup';
import * as itemTemplate from 'wml!Controls/_toggle/ButtonGroup/itemTemplate';
import {IItemTemplateOptions} from 'Controls/interface';
import 'css!Controls/buttons';
import 'css!Controls/toggle';
import 'css!Controls/CommonClasses';

export interface IChipsOptions extends IMultiSelectableOptions, IControlOptions, IItemsOptions<object>,
    IItemTemplateOptions, IHeightOptions, IFontSizeOptions {
    direction?: string;
    keyProperty?: string;
    multiline?: boolean;
}

/**
 * Контрол представляет собой набор из нескольких взаимосвязанных между собой кнопок. Используется, когда необходимо выбрать несколько параметров.
 * @class Controls/_toggle/Chips
 * @extends UI/Base:Control
 * @implements Controls/interface:IMultiSelectable
 * @implements Controls/interface:IItems
 * @implements Controls/interface:IHeight
 * @implements Controls/interface:IFontSize
 * @public
 * @author Мочалов М.А.
 * @demo Controls-demo/toggle/Chips/Index
 * @demo Controls-demo/toggle/Chips/ManyContent/Index
 * @demo Controls-demo/toggle/Chips/MultiSelect/Index
 */

/**
 * @name Controls/_toggle/Chips#direction
 * @cfg {string} Расположение элементов в контейнере.
 * @variant horizontal Элементы расположены один за другим (горизонтально).
 * @variant vertical Элементы расположены один под другим (вертикально).
 * @default horizontal
 * @demo Controls-demo/toggle/Chips/Direction/Index
 * @example
 * Вертикальная ориентация.
 * <pre>
 *    <Controls.toggle:Chips direction="vertical"/>
 * </pre>
 */

/**
 * @name Controls/_toggle/Chips#multiline
 * @cfg {boolean} Поведение кнопок, если они не умещается.
 * @variant false Кнопки не переносятся на новую строку.
 * @variant true Кнопки переносятся на новую строку.
 * @default true
 * @demo Controls-demo/toggle/Chips/Multiline/Index
 */

/**
 * @name Controls/_toggle/Chips#inlineHeight
 * @cfg {String}
 * @demo Controls-demo/toggle/Chips/inlineHeight/Index
 */

/**
 * @name Controls/_toggle/Chips#fontSize
 * @cfg {String}
 * @demo Controls-demo/toggle/Chips/inlineHeight/Index
 */

/**
 * @name Controls/_toggle/Chips#displayProperty
 * @cfg {String} Имя поля элемента, значение которого будет отображаться в названии кнопок тумблера.
 *
 * @example
 * Пример описания.
 * <pre>
 *    <Controls.toggle:Chips displayProperty="caption" items="{{_items1}}" bind:selectedKey="_selectedKey1"/>
 * </pre>
 *
 * <pre>
 *   new RecordSet({
 *          rawData: [
 *              {
 *                  id: '1',
 *                  caption: 'caption 1',
 *                  title: 'title 1'
 *              },
 *              {
 *                  id: '2',
 *                  caption: 'Caption 2',
 *                  title: 'title 2'
 *              }
 *          ],
 *          keyProperty: 'id'
 *      });
 * </pre>
 *
 * @demo Controls-demo/toggle/Chips/displayProperty/Index
 */

/**
 * @name Controls/_toggle/Chips#itemTemplate
 * @cfg {TemplateFunction|String} Шаблон элемента кнопочного переключателя.
 * @demo Controls-demo/toggle/Chips/ItemTemplate/Index
 *
 * По умолчанию используется шаблон "Controls/toogle:chipsItemTemplate".
 * Также есть базовый шаблон для отображения записей со счетчиком Controls/toggle:chipsItemCounterTemplate
 *
 * Шаблон chipsItemCounterTemplate поддерживает следующие параметры:
 * - item {Types/entity:Record} — Отображаемый элемент;
 * - counterProperty {string} — Имя свойства элемента, содержимое которого будет
 * отображаться в счетчике. По умолчанию counter;
 * - counterStyle {string} - Стиль цвета текста счетчика;
 *
 * @example
 * Отображение записей со счетчиками
 * JS:
 * <pre>
 * this._items = new RecordSet({
 *    keyProperty: 'key',
 *    rawData: [
 *       {key: 1, caption: 'Element 1', counter: 5},
 *       {key: 2, caption: 'Element 2', counter: 3},
 *       {key: 3, caption: 'Element 3', counter: 7}
 *    ]
 * });
 * </pre>
 *
 * WML
 * <pre>
 *    <Controls.toggle:Chips items="{{_items}}" >
 *       <ws:itemTemplate>
 *          <ws:partial template="Controls/toggle:chipsItemCounterTemplate" scope="{{itemTemplate}}" />
 *       </ws:itemTemplate>
 *    </Controls.toggle:Chips>
 * </pre>
 */

/**
 * @name Controls/_toggle/Chips#readOnly
 * @cfg
 * @demo Controls-demo/toggle/Chips/ReadOnly/Index
 */

class Chips extends Control<IChipsOptions> {
    protected _template: TemplateFunction = template;
    protected _buttonTemplate: TemplateFunction = ButtonTemplate;

    protected _getIconStyle(item: Model): string {
        if (this._isSelectedItem(item)) {
            return 'contrast';
        }
        return item.get('iconStyle') || 'default';
    }

    protected _isSelectedItem(item: Model): boolean {
        return this._options.selectedKeys.includes(item.get(this._options.keyProperty));
    }

    protected _onItemClick(event: SyntheticEvent<Event>, item: Model): void {
        if (!this._options.readOnly) {
            const keyProperty = this._options.keyProperty;
            const selectedKeys = [...this._options.selectedKeys];
            const added = [];
            const deleted = [];
            const itemKeyProperty = item.get(keyProperty);
            const itemIndex = selectedKeys.indexOf(itemKeyProperty);
            if (itemIndex === -1) {
                added.push(itemKeyProperty);
                selectedKeys.unshift(itemKeyProperty);
            } else {
                deleted.push(itemKeyProperty);
                selectedKeys.splice(itemIndex, 1);
            }
            this._notify('selectedKeysChanged', [selectedKeys, added, deleted]);
        }
    }

    static defaultProps: Partial<IChipsOptions> = {
        keyProperty: 'id',
        itemTemplate,
        inlineHeight: 'm',
        direction: 'horizontal',
        multiline: true
    };
}

export default Chips;
