/**
 * @typedef {String} TTextTransform
 * @variant none Без изменения регистра символов.
 * @variant uppercase Все символы текста становятся прописными (верхний регистр).
 */
export type TTextTransform = 'none' | 'uppercase';

export interface ITextTransformOptions {
    /**
     * @name Controls/_interface/ITextTransform#textTransform
     * @cfg {TTextTransform} Управляет преобразованием текста элемента в заглавные или прописные символы
     * @default none
     */
    textTransform: TTextTransform;
}

/**
 * Интерфейс для контролов, которые поддерживают преобразование текста в заглавные или прописные символы
 * @interface Controls/_interface/ITextTransform
 * @public
 * @author Аверкиев П.А.
 */
export default interface ITextTransform {
    readonly '[Controls/_interface/IIconSize]': boolean;
}
