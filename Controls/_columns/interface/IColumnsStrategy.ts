import Collection from 'Controls/_columns/display/Collection';
import { Model } from 'Types/entity';

/**
 * Интерфейс стратегии подсчета столбца
 */
export default interface IColumnsStrategy {
    calcColumn(collection: Collection<Model>, index: number, columnsCount?: number): number;
}
