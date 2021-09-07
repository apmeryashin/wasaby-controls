import * as template from 'wml!Controls/_lookup/MultipleInputNew/MultipleInputNew';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {ILookupInputOptions, default as BaseLookupInput} from 'Controls/_lookup/BaseLookupInput';
import {SyntheticEvent} from 'UICommon/Events';
import {TKeysSelection} from 'Controls/interface';
import {IStackPopupOptions} from 'Controls/popup';
import {EventUtils} from 'UI/Events';
import 'css!Controls/lookup';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {isEqual} from 'Types/object';

interface IMultipleLookupInputOptions extends ILookupInputOptions {
    name: string;
}

export interface IMultipleInputNewOptions extends IControlOptions {
    lookupsOptions: IMultipleLookupInputOptions[];
}

type TMultipleSelectedKeys = Record<string, TKeysSelection>;
type TMultipleValue = Record<string, string>;
type TMultipleItems = Record<string, RecordSet>;
type TLookupSizes = Record<string, number>;

/**
 * Поле ввода с автодополнением и возможностью выбора значений из нескольких справочников.
 *
 * @remark
 * Отличается от {@link Controls/_lookup/Lookup поля связи} тем, что контрол разделён на несколько полей,
 * для каждого поля выводится своё автодополнение и открывается свой справочник.
 * Ширина выбранных значений будет пропорционально распределена по ширине контрола, чтобы все значения поместились.
 *
 *
 * @class Controls/_lookup/MultipleInputNew
 * @extends UI/Base:Control
 * @implements Controls/interface:ILookup
 * @demo Controls-demo/Lookup/MultipleInputNew/MultipleInputNew
 *
 * @public
 * @author Герасимов А.М.
 */
export default class MultipleInputNew extends Control<IMultipleInputNewOptions> {
    protected _template: TemplateFunction = template;
    protected _suggestTarget: HTMLElement;
    protected _selectedKeys: TMultipleSelectedKeys = {};
    protected _value: TMultipleValue = {};
    protected _items: TMultipleItems = {};
    protected _lookupSizes: TLookupSizes = {};
    protected _notifyProxy: Function = EventUtils.tmplNotify;
    private _calcSizesAfterDraw: boolean = false;
    protected _children: Record<string, BaseLookupInput>;

    protected _beforeMount(options: IMultipleInputNewOptions): void {
        options.lookupsOptions.forEach(({name, value, selectedKeys, items}) => {
            this._cloneAndSetStateByOptionValue(selectedKeys || options.selectedKeys || [], 'selectedKeys', name);
            this._cloneAndSetStateByOptionValue(value ||  options.value, 'value', name);
            this._cloneAndSetStateByOptionValue(items ||  options.items, 'items', name);
        });
    }

    _beforeUpdate(newOptions: IMultipleInputNewOptions): void {
        if (!isEqual(newOptions.selectedKeys, this._options.selectedKeys)) {
            newOptions.lookupsOptions.forEach(({name, selectedKeys}) => {
                this._cloneAndSetStateByOptionValue(selectedKeys || newOptions.selectedKeys, 'selectedKeys', name);
            });
        }
    }

    protected _afterRender(): void {
        if (this._calcSizesAfterDraw) {
            this._calcSizesAfterDraw = false;
            this._calcSizes();
        }
    }

    protected _lookupActivated(): void {
        this._suggestTarget = this._container;
        this._calcSizes();
    }

    protected _selectedKeysChanged(
        event: SyntheticEvent,
        lookupName: string,
        selectedKeys: TKeysSelection[],
        added: TKeysSelection[]
    ): void {
        this._setStateAndNotifyEventByOptionName(selectedKeys, 'selectedKeys', lookupName);
        if (added.length) {
            this._calcSizes();
        } else {
            this._calcSizesAfterDraw = true;
        }
    }

    protected _valueChanged(event: SyntheticEvent, lookupName: string, value: string): void {
        this._setStateAndNotifyEventByOptionName(value, 'value', lookupName);
    }

    protected _itemsChanged(event: SyntheticEvent, lookupName: string, items: RecordSet): void {
        this._setStateAndNotifyEventByOptionName(items, 'items', lookupName);
    }

    protected _getLookupOptions(options: IMultipleInputNewOptions, lookupName: string): IMultipleLookupInputOptions {
        return options.lookupsOptions.find(({name}) => name === lookupName);
    }

    protected _cloneAndSetStateByOptionValue(value: unknown, optionName: string, lookupName: string): void {
        const state = this._getStateNameByOptionName(optionName);
        this[state] = this._cloneObject(this[state]);
        this[state][lookupName] = (value instanceof Object && value[lookupName]) ? value[lookupName] : value;
    }

    protected _getValueFromStateByOptionName(optionName: string, lookupName: string): unknown {
        return this[this._getStateNameByOptionName(optionName)][lookupName];
    }

    protected _getStateNameByOptionName(optionName: string): string {
        return '_' + optionName;
    }

    protected _setStateAndNotifyEventByOptionName(value: unknown, optionName: string, lookupName: string): void {
        this._cloneAndSetStateByOptionValue(value, optionName, lookupName);
        this._notify(optionName + 'Changed', [this[this._getStateNameByOptionName(optionName)], lookupName]);
    }

    protected _cloneObject(obj: object): object {
        const newObject = {};

        for (const i in obj) {
            if (obj.hasOwnProperty(i)) {
                newObject[i] = obj[i];
            }
        }

        return newObject;
    }

    protected _calcSizes(): void {
        this._options.lookupsOptions.forEach(({name}, index) => {
            if (!this._selectedKeys[name].length && index !== this._options.lookupsOptions.length - 1) {
                if (!this._lookupSizes[name]) {
                    this._lookupSizes = {...this._lookupSizes};
                    this._lookupSizes[name] = this._children[name].getLookupContainer().getBoundingClientRect().width;
                }
            } else if (this._lookupSizes.hasOwnProperty(name)) {
                this._lookupSizes = {...this._lookupSizes};
                delete this._lookupSizes[name];
            }
        });
    }

    protected _showSelector(event: SyntheticEvent, lookupName: string): void {
        if (this._notify('showSelector') !== false) {
            this.showSelector(lookupName);
        }
        event.stopPropagation();
    }

    protected _itemClick(event: SyntheticEvent, lookupName: string, item: Model): void {
        this._notify('itemClick', [item, lookupName]);
    }

    protected _choose(event: SyntheticEvent, lookupName: string, item: Model): void {
        this._notify('choose', [item, lookupName]);
    }

    protected _proxyEvent(event: SyntheticEvent, eventName: string, lookupName: string): void {
        const eventArgsIndex = 3;
        const args = Array.prototype.slice.call(arguments, eventArgsIndex);
        return this._notify(eventName, args.concat(lookupName));
    }

    showSelector(lookupName: string, popupOptions?: IStackPopupOptions): void {
        this._children[lookupName].showSelector(popupOptions);
    }
}
