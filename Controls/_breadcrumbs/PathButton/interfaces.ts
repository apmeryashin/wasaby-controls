import {IControlOptions} from 'UI/Base';
import {CrudEntityKey, ICrud, QueryWhereExpression} from 'Types/source';
import {Path} from 'Controls/dataSource';

/**
 * Структура объекта конфигурации компонента {@link Controls/breadcrumbs:PathButton}
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface IPathButton extends IControlOptions {
    /**
     * @cfg {Types/source:ICrud} Источник данных через который будет запрошен список всех доступных узлов.
     */
    source: ICrud;

    /**
     * @cfg {Types/source:QueryWhereExpression} Источник данных через который будет запрошен список всех доступных узлов.
     */
    filter?: QueryWhereExpression<unknown>;

    /**
     * @cfg {Types/source:CrudEntityKey}
     */
    markedKey?: CrudEntityKey;

    /**
     * @cfg {String} Имя свойства, содержащего информацию об идентификаторе записи каталога.
     */
    keyProperty?: string;

    /**
     * @cfg {string}
     */
    nodeProperty?: string;

    /**
     * @cfg {string}
     */
    parentProperty?: string;

    /**
     * @cfg {string}
     */
    displayProperty?: string;

    /**
     * @cfg {Controls/breadcrumbs#Path}
     */
    path?: Path;
}
