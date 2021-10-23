/**
 * @interface Controls/_interface/IRUM
 * @private
 */

/**
 * @name Controls/_interface/IRUM#RUMEnabled
 * @cfg {Boolean} Позволяет включить сбор RUM-статистики
*/

/**
 * @name Controls/_interface/IRUM#pageName
 * @cfg {string} Позволяет задать имя страницы при отображении RUM-статистики
 */

export default interface IRUM {
    readonly '[Controls/_interface/IRUM]': boolean;
}

export interface IRUMOptions {
    RUMEnabled?: boolean;
    pageName?: string;
}
