/**
 * Библиотека контролов-оберток, устанавливающих значения css-переменных на вложенный контент.
 * @library
 * @includes Wrapper Controls/_themes/Wrapper
 * @includes ZenWrapper Controls/_themes/ZenWrapper
 * @public
 * @author Клепиков И.А.
 */

export {IHSLColor, IColorDescriptor} from 'Controls/_themes/interface/IColor';
export {calculateControlsTheme, processColorVariables} from 'Controls/_themes/Helpers';
export {default as Wrapper, IWrapperOptions} from 'Controls/_themes/Wrapper';
export {default as ZenWrapper, IZenWrapperOptions} from 'Controls/_themes/ZenWrapper';
