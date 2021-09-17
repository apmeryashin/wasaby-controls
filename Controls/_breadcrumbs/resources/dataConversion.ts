import {RecordSet} from 'Types/collection';
import {Record} from 'Types/entity';
import {Logger} from 'UI/Utils';

export function dataConversion(data: RecordSet | Record[], moduleName: string): Record[] {
    if (data instanceof RecordSet) {
        const modelArray: Record[] = [];
        data.each((item) => {
            modelArray.push(item);
        });
        return modelArray;
    } else if (Array.isArray(data)) {
        Logger.warn(`${moduleName}: В опцию items было передано неверное значение. Используйте RecordSet.`);
        return data;
    }
}
