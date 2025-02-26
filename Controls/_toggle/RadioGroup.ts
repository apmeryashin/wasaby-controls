import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import {descriptor as EntityDescriptor, Model, Record} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {CrudWrapper} from 'Controls/dataSource';
import template = require('wml!Controls/_toggle/RadioGroup/RadioGroup');
import defaultItemTemplate = require('wml!Controls/_toggle/RadioGroup/resources/ItemTemplate');
import * as groupTemplate from 'wml!Controls/_toggle/RadioGroup/GroupTemplate';
import {
    ISource,
    ISourceOptions,
    ISingleSelectable,
    ISingleSelectableOptions,
    IHierarchyOptions
} from 'Controls/interface';
import {IToggleGroup, IToggleGroupOptions} from './interface/IToggleGroup';
import 'css!Controls/toggle';
import 'css!Controls/CommonClasses';
import {constants} from 'Env/Env';
import {default as WorkByKeyboardContext, IWorkByKeyboardContext} from '../Context/WorkByKeyboardContext';

export interface IRadioGroupOptions extends IControlOptions,
    ISingleSelectableOptions,
    IHierarchyOptions,
    ISourceOptions,
    IToggleGroupOptions {
    captionPosition: string;
    radioCircleVisible?: boolean;
    items?: RecordSet;
}

/**
 * Группа контролов, которые предоставляют пользователям возможность выбора между двумя или более параметрами.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2Ftoggle%2FRadioGroup%2FIndex демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_toggle.less переменные тем оформления}
 *
 * @class Controls/_toggle/RadioGroup
 * @extends UI/Base:Control
 * @implements Controls/interface:ISource
 * @implements Controls/interface:ISingleSelectable
 * @implements Controls/interface:IValidationStatus
 * @implements Controls/interface:IHierarchy
 * @implements Controls/toggle:IToggleGroup
 *
 * @public
 * @author Мочалов М.А.
 * @demo Controls-demo/toggle/RadioGroup/Base/Index
 */

/*
 * Controls are designed to give users a choice among two or more settings.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2Ftoggle%2fRadioGroup%2fIndex">Demo-example</a>.
 *
 * @class Controls/_toggle/RadioGroup
 * @extends UI/Base:Control
 * @implements Controls/interface:ISource
 * @implements Controls/interface:ISingleSelectable
 * @implements Controls/toggle:IToggleGroup
 *
 * @public
 * @author Мочалов М.А.
 * @demo Controls-demo/toggle/RadioGroup/Base/Index
 */

class Radio extends Control<IRadioGroupOptions, RecordSet> implements ISource, ISingleSelectable, IToggleGroup {
    '[Controls/_interface/ISource]': boolean = true;
    '[Controls/_interface/ISingleSelectable]': boolean = true;
    '[Controls/_toggle/interface/IToggleGroup]': boolean = true;

    protected _template: TemplateFunction = template;
    protected _defaultItemTemplate: TemplateFunction = defaultItemTemplate;
    protected _groupTemplate: TemplateFunction = groupTemplate;
    protected _items: RecordSet;
    protected _crudWrapper: CrudWrapper;
    protected _groups: object = {};
    protected _workByKeyboard: WorkByKeyboardContext;

    protected _beforeMount(options: IRadioGroupOptions,
                           context: IWorkByKeyboardContext,
                           receivedState: RecordSet): void | Promise<RecordSet> {
        this._selectKeyChanged = this._selectKeyChanged.bind(this);
        this._isSelected = this._isSelected.bind(this);
        this._workByKeyboard = context?.workByKeyboard;
        if (options.items) {
            this._items = options.items;
            this._sortGroup(options, options.items);
        } else if (receivedState) {
            this._items = receivedState;
            this._sortGroup(options, receivedState);
        } else {
            return this._initItems(options).then((items: RecordSet) => {
                this._items = items;
                this._sortGroup(options, items);
                return items;
            });
        }
    }

    protected _beforeUpdate(newOptions: IRadioGroupOptions, context: IWorkByKeyboardContext = {}): Promise<void> {
        if (this._workByKeyboard !== context.workByKeyboard) {
            this._workByKeyboard = context.workByKeyboard;
        }

        if (newOptions.items && newOptions.items !== this._options.items) {
            this._items = newOptions.items;
            this._sortGroup(newOptions, newOptions.items);
        }

        if (newOptions.source && newOptions.source !== this._options.source) {
            return this._initItems(newOptions).then((items: RecordSet) => {
                this._items = items;
                this._sortGroup(newOptions, items);
                this._forceUpdate();
            });
        }
    }

    protected _highlightedOnFocus(): boolean {
        return !!this._workByKeyboard?.status && !this._options.readOnly;
    }

    protected _keyUpHandler(e: SyntheticEvent<KeyboardEvent>): void {
        if (e.nativeEvent.keyCode === constants.key.space && !this._options.readOnly) {
            e.preventDefault();
            const newActiveItem = this._getNextActiveItem();
            if (newActiveItem) {
                this._selectKeyChanged(e, newActiveItem, this._options.keyProperty);
            }
        }
    }

    private _getNextActiveItem(): Model {
        let firstItem = null;
        let nextActiveItem: Model = null;
        let isNextActiveItem: boolean = false;
        const thisActiveItem = this._items.getRecordById(this._options.selectedKey);
        this._items.forEach((item) => {
            if (!firstItem && !item.get('readOnly')) {
                firstItem = item;
            }
            if (item === thisActiveItem) {
                isNextActiveItem = true;
            } else if (isNextActiveItem && !item.get('readOnly')) {
                isNextActiveItem = false;
                nextActiveItem = item;
            }
        });
        if (!nextActiveItem) {
            nextActiveItem = firstItem;
        }
        return nextActiveItem;
    }

    private _sortGroup(options: IRadioGroupOptions, items: RecordSet): void {
        this._groups = {};
        items.each((item) => {
            let parent = options.parentProperty ? item.get(options.parentProperty) : null;
            if (typeof parent === 'undefined') {
                parent = null;
            }
            if (!this._groups[parent]) {
                this._groups[parent] = [];
                this._groups[parent] = {
                    selectedKey: null,
                    items: []
                };
            }
            this._groups[parent].items.push(item);
        });
    }

    protected _isSelected(item: Record): boolean {
        if (item.get(this._options.keyProperty) === this._options.selectedKey) {
            return true;
        }
        const parent = this._options.parentProperty ?
            this._items.getRecordById(this._options.selectedKey).get(this._options.parentProperty) : null;
        if (parent) {
            const parentKey = this._items.getRecordById(parent).get(this._options.keyProperty);
            return parentKey === item.get(this._options.keyProperty);
        }
        return false;
    }

    protected _selectKeyChanged(e: SyntheticEvent<MouseEvent | TouchEvent>, item: Model, keyProperty: string): void {
        if (!this._options.readOnly && item.get('readOnly') !== true) {
            let selectedKey = item.get(keyProperty);
            if (this._groups[selectedKey]) {
                if (this._groups[selectedKey].selectedKey !== null) {
                    selectedKey = this._groups[selectedKey].selectedKey;
                } else {
                    selectedKey = this._groups[selectedKey].items[0].get(keyProperty) || selectedKey;
                }
            }
            this._notify('selectedKeyChanged', [selectedKey]);
            const parent = this._options.parentProperty ? item.get(this._options.parentProperty) : null;
            if (parent) {
                this._groups[parent].selectedKey = selectedKey;
            }
        }
    }

    private _initItems(options: IRadioGroupOptions): Promise<RecordSet> {
        this._crudWrapper = new CrudWrapper({
            source: options.source
        });
        return this._crudWrapper.query({}).then((items) => {
            return items;
        });
    }

    static getDefaultOptions(): object {
        return {
            direction: 'vertical',
            validationStatus: 'valid',
            captionPosition: 'right',
            radioCircleVisible: true
        };
    }

    static getOptionTypes(): object {
        return {
            captionPosition: EntityDescriptor(String).oneOf([
                'left',
                'right'
            ]),
            radioCircleVisible: EntityDescriptor(Boolean)
        };
    }

    static contextTypes(): object {
        return {
            workByKeyboard: WorkByKeyboardContext
        };
    }
}

Object.defineProperty(Radio, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return Radio.getDefaultOptions();
    }
});

export default Radio;

/**
 * @name Controls/_toggle/RadioGroup#items
 * @cfg {RecordSet} Определяет набор записей по которым строится контрол.
 * @demo Controls-demo/toggle/RadioGroup/Base/Index
 */

/**
 * @name Controls/_toggle/RadioGroup#direction
 * @cfg
 * @demo Controls-demo/toggle/RadioGroup/Direction/Index
 */

/**
 * @name Controls/_toggle/RadioGroup#parentProperty
 * @cfg
 * @demo Controls-demo/toggle/RadioGroup/ParentProperty/Index
 */

/**
 * @name Controls/_toggle/RadioGroup#radioCircleVisible
 * @cfg {Boolean} Определяет, видимость иконки радиокруга.
 * @default true
 * @demo Controls-demo/toggle/RadioGroup/RadioCircleVisible/Index
 */

/**
 * @name Controls/_toggle/RadioGroup#captionPosition
 * @cfg {String} Определяет, с какой стороны расположен заголовок кнопки.
 * @variant left Заголовок расположен перед кнопкой.
 * @variant right Заголовок расположен после кнопки.
 * @default right
 * @demo Controls-demo/toggle/RadioGroup/CaptionPosition/Index
 */

/**
 * @name Controls/_toggle/RadioGroup#displayProperty
 * @cfg {String} Имя поля элемента, значение которого будет отображаться в названии кнопок тумблера.
 *
 * @example
 * Пример описания.
 * <pre>
 *    <Controls.toggle:RadioGroup displayProperty="caption" source="{{_items1}}" bind:selectedKey="_selectedKey1"/>
 * </pre>
 *
 * <pre>
 *   new Memory({
 *       keyProperty: 'key',
 *       data: [
 *           {
 *               key: 1,
 *               title: 'title 1',
 *               caption: 'caption 1'
 *           },
 *           {
 *               key: 2,
 *               title: 'title 2',
 *               caption: 'caption 2'
 *           },
 *           {
 *               key: 3,
 *               title: 'title 3',
 *               caption: 'caption 3'
 *           }
 *       ]
 *   });
 * </pre>
 *
 * @demo Controls-demo/toggle/RadioGroup/displayProperty/Index
 */
