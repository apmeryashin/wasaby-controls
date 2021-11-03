/**
 * Библиотека контролов, которые служат для отображения и выбора дат из выпадающей панели.
 * @library
 * @includes Input Controls/_date/Input
 * @includes BaseInput Controls/_date/BaseInput
 * @includes IBaseInputMask Controls/_date/interface/IBaseInputMask
 * @includes IDatePopupType Controls/_date/interface/IDatePopupType
 * @includes ICaption Controls/_date/interfaces/ICaption
 */

export {default as Input} from 'Controls/_date/Input';
export {default as BaseInput} from 'Controls/_date/BaseInput';
export {default as LinkView} from 'Controls/_date/LinkView';
export {default as Selector} from 'Controls/_date/Selector';
export {default as BaseSelector} from 'Controls/_date/BaseSelector';
export {default as SelectorConsumer} from 'Controls/_date/SelectorConsumer';
export {default as ArrowButtonConsumer} from 'Controls/_date/ArrowButtonConsumer';
export {default as ContextProvider} from 'Controls/_date/DateContextProvider';

// TODO: Временная поддержка, удалить по https://online.sbis.ru/opendoc.html?guid=84607f88-046c-4331-a402-68061666d88c
export {default as _DateSelectorConsumer} from 'Controls/_date/_DateSelectorConsumer';
export {default as IValue} from 'Controls/_date/interface/IValue';
import * as MonthCaptionTemplate from 'wml!Controls/_date/Selector/monthCaptionTemplate';
export {default as IMonthCaptionTemplate, IMonthCaptionTemplateOptions} from 'Controls/_date/interface/IMonthCaptionTemplate';
export {IDatePopupTypeOptions} from 'Controls/_date/interface/IDatePopupType';
export {default as getDatePopupName} from 'Controls/_date/Utils/getPopupName';
export {IBaseSelectorOptions} from 'Controls/_date/BaseSelector';
export {ILinkView} from 'Controls/_date/LinkView';
import ILinkViewDefaultOptions from 'Controls/_date/interface/ILinkView';
export {default as ICaptionOptions} from 'Controls/_date/interface/ICaption';
export {default as IBaseInputMask} from 'Controls/_date/interface/IBaseInputMask';
export {default as StringValueConverter} from 'Controls/_date/BaseInput/StringValueConverter';
export {ICalendarButtonVisibleOptions} from 'Controls/_date/interface/ICalendarButtonVisible';

export {
    MonthCaptionTemplate,
    ILinkViewDefaultOptions
};
