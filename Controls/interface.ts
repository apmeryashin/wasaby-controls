/**
 * Библиотека, содержащая интерфейсы, которые используются в нескольких библиотеках.
 * @library
 * @includes ITextValue Controls/_interface/ITextValue
 * @includes ICanBeDefaultOpener Controls/_interface/ICanBeDefaultOpener
 * @includes IContrastBackground Controls/_interface/IContrastBackground
 * @includes ISeparatorVisible Controls/_interface/ISeparatorVisible
 * @public
 * @author Крайнов Д.О.
 */

import {INavigationSourceConfig} from './_interface/INavigation';

export {default as ITooltip, ITooltipOptions} from './_interface/ITooltip';
export {default as IItemTemplate, IItemTemplateOptions} from './_interface/IItemTemplate';
export {default as IIconStyle, IIconStyleOptions, TIconStyle} from './_interface/IIconStyle';
export {default as ICaption, ICaptionOptions} from './_interface/ICaption';
export {default as IIcon, IIconOptions} from './_interface/IIcon';
export {default as IIconSize, IIconSizeOptions, TIconSize} from './_interface/IIconSize';
export {default as IFontColorStyle, IFontColorStyleOptions, TFontColorStyle} from './_interface/IFontColorStyle';
export {default as IFontSize, IFontSizeOptions, TFontSize} from './_interface/IFontSize';
export {default as IFontWeight, IFontWeightOptions, TFontWeight} from './_interface/IFontWeight';
export {default as ITextTransform, ITextTransformOptions, TTextTransform} from './_interface/ITextTransform';
export {default as IHeight, IHeightOptions} from './_interface/IHeight';
export {default as ISingleSelectable, ISingleSelectableOptions, TSelectedKey} from './_interface/ISingleSelectable';
export {default as IMultiSelectable, IMultiSelectableOptions, TSelectedKeys} from './_interface/IMultiSelectable';
export {default as ISource, ISourceOptions, TSourceOption} from './_interface/ISource';
export {default as IHierarchy, IHierarchyOptions} from './_interface/IHierarchy';
export {default as INumberFormat, INumberFormatOptions} from './_interface/INumberFormat';
export {default as IExpandable, IExpandableOptions} from './_interface/IExpandable';
export {default as ISorting, ISortingOptions, TSortingOptionValue} from './_interface/ISorting';
export {default as ILookup, ILookupOptions} from './_interface/ILookup';
export {default as IDateMask, IDateMaskOptions} from './_interface/IDateMask';
export {default as IDateRangeValidators, IDateRangeValidatorsOptions, TDateRangeValidators} from './_interface/IDateRangeValidators';
export {default as IPropStorage, IPropStorageOptions} from './_interface/IPropStorage';
export {default as IBorderStyle, IBorderStyleOptions} from './_interface/IBorderStyle';
export {default as IBorderRadius, IBorderRadiusOptions} from './_interface/IBorderRadius';
export {default as IExpandedItems, IExpandedItemsOptions} from './_interface/IExpandedItems';
export {default as IValidationStatus, IValidationStatusOptions,
    TValidationStatus, TValidationStatus as ValidationStatus} from './_interface/IValidationStatus';
export {default as IDateConstructor, IDateConstructorOptions} from './_interface/IDateConstructor';
export {default as IUnderline, IUnderlineOptions} from './_interface/IUnderline';
export {
    default as ISelectionType,
    ISelectionTypeOptions,
    TSelectionType,
    TSelectionRecord,
    ISelectionObject,
    TKeySelection,
    TKeysSelection
} from './_interface/ISelectionType';
export { ISelectionCountModeOptions, TSelectionCountMode } from './_interface/ISelectionCountMode';
export {ITileRoundBorder, TTileRoundBorderSize} from './_interface/ITileRoundBorder';
export {default as IApplication, IApplicationOptions, IAttributes, HeadJson} from './_interface/IApplication';
export {default as IRUM, IRUMOptions} from './_interface/IRUM';
export {default as IFilter, IFilterOptions, TFilter} from './_interface/IFilter';
export {default as IFilterChanged} from './_interface/IFilterChanged';
export {default as IContrastBackground, IContrastBackgroundOptions} from './_interface/IContrastBackground';
export {
    default as INavigation,
    INavigationOptions,
    INavigationOptionValue,
    INavigationPositionSourceConfig,
    INavigationPageSourceConfig,
    INavigationSourceConfig,
    IBaseSourceConfig,
    IBasePositionSourceConfig,
    IBasePageSourceConfig,
    TNavigationPagingMode,
    TNavigationResetButtonMode,
    TNavigationSource,
    TNavigationDirection,
    INavigationViewConfig,
    INavigationButtonConfig,
    TNavigationButtonPosition,
    TNavigationButtonSize,
    TNavigationButtonView
} from './_interface/INavigation';
export {
    default as IDisplayedRanges,
    IDisplayedRangesOptions,
    TDisplayedRangesItem
} from './_interface/IDisplayedRanges';
export {default as IOpenPopup} from './_interface/IOpenPopup';
export {default as ISearch, ISearchOptions} from './_interface/ISearch';
export {default as ISearchValue, ISearchValueOptions} from './_interface/ISearchValue';
export {default as IFormOperation} from './_interface/IFormOperation';
export {default as ISelectorDialog, ISelectorDialogOptions} from './_interface/ISelectorDialog';
export {default as IItems, IItemsOptions, TKey} from './_interface/IItems';
export {default as IHref, IHrefOptions} from './_interface/IHref';
export {default as IBackgroundStyle, IBackgroundStyleOptions} from './_interface/IBackgroundStyle';
export {Direction, IQueryParamsMeta, IQueryParams} from './_interface/IQueryParams';
export {default as IGrouping, IGroupingOptions} from './_interface/IGrouping';
export {default as IPromiseSelectable, IPromiseSelectableOptions} from './_interface/IPromiseSelectable';
export {default as IResetValues} from './_interface/IResetValues';
export {default as IDraggable, IDraggableOptions} from './_interface/IDraggable';
export {IInputPlaceholder, IInputPlaceholderOptions} from './_interface/IInputPlaceholder';
export {IInputTag, IInputTagOptions} from './_interface/IInputTag';
export {default as ITextValue} from './_interface/ITextValue';
export {default as ISelectField, ISelectFieldsOptions} from './_interface/ISelectFields';
export {IRoundBorder, TRoundBorderSize} from 'Controls/_interface/IRoundBorder';
export {TPaddingSize} from 'Controls/_interface/TPaddingSize';
export {IItemPaddingOptions, default as IItemPadding} from 'Controls/_interface/IItemPadding';
export {default as IItemImage, TImagePosition, TImageEffect, TImageSize, TImageViewMode, TImageFit} from 'Controls/_interface/IItemImage';
export {default as IResetValue, IResetValueOptions} from 'Controls/_interface/IResetValue';
export {default as IItemsContainerPadding, IItemsContainerPaddingOption} from 'Controls/_interface/IItemsContainerPadding';
