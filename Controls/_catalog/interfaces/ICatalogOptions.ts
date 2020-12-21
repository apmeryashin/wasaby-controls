import {ICrudPlus} from 'Types/source';
import {IControlOptions} from 'UI/Base';
import {ICatalogMasterOptions} from 'Controls/_catalog/interfaces/ICatalogMasterOptions';
import {CatalogDetailViewMode, ICatalogDetailOptions} from 'Controls/_catalog/interfaces/ICatalogDetailOptions';
import {ISourceOptions} from 'Controls/_catalog/interfaces/ISourceOptions';

/**
 * Интерфейс описывает структуру настроек компонента {@link Controls/catalog:View}
 * @interface Controls/catalog:ICatalogOptions
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface ICatalogOptions extends IControlOptions, ISourceOptions {
    /**
     * Базовый источник данных, который будет использован по умолчанию для списков, отображаемых в каталоге.
     * Может быть перекрыт на уровне конкретного блока каталога.
     *
     * @remark
     * Актуально использовать для уменьшения кол-ва задаваемых опций. Например, когда списки в обоих колонках используют
     * один и тот же источник данных
     *
     * @see ICatalogMasterOptions.source
     * @see ICatalogDetailOptions.source
     */
    source?: ICrudPlus;

    /**
     * Имя свойства, содержащего информацию об идентификаторе текущей строки в master и detail колонках.
     * Значение данной опции передается в одноименную опцию списков, отображаемых в колонках каталога.
     * Оно так же может быть перекрыто на уровне конкретной колонки каталога.
     *
     * @remark
     * Актуально использовать для уменьшения кол-ва задаваемых опций. Например, когда списки в обоих колонках
     * используют один и тот же источник данных или в качестве идентификации записей используют одно и тоже поле.
     *
     * @see ICatalogMasterOptions.keyProperty
     * @see ICatalogDetailOptions.keyProperty
     */
    keyProperty?: string;

    /**
     * Идентификатор папки, содержимое которой нужно отобразить в каталоге
     */
    root?: string;

    /**
     * Уникальный идентификатор контрола, по которому будет сохраняться конфигурация в хранилище данных.
     */
    propStorageId?: string;

    /**
     * Режим отображения списка
     * @default CatalogDetailViewMode.list
     */
    viewMode: CatalogDetailViewMode;

    /**
     * Конфигурация master-колонки. Если не задана, то мастер-колонка не отображается.
     * Также видимость мастер колонки можно регулировать опцией
     * {@link ICatalogMasterOptions.visibility}
     *
     * @see ICatalogMasterOptions.visibility
     */
    master?: ICatalogMasterOptions;

    /**
     * Конфигурация detail-колонки.
     */
    detail?: ICatalogDetailOptions;
}
