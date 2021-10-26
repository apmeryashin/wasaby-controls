import {IColumn} from 'Controls/grid';

export const Expand = {
    // 5 записей. У первой записи 100 детей.
    getData: (): Array<{
        key: number,
        title: string,
        parent: number | null,
        type: boolean | null
    }> => {
        const result = [];
        const itemsCount = 5;
        const childrenCount = 100;
        let counter = 1;
        result.push({
                key: counter,
                title: `Запись первого уровня с id = ${counter++}. Много дочерних элементов.`,
                parent: null,
                type: true
            });

        for (let i = 1; i < itemsCount; i++) {
            result.push({
                key: counter,
                title: `Запись первого уровня с id = ${counter++}. Без детей.`,
                parent: null,
                type: true
            });
        }
        for (let i = 1; i < childrenCount; i++) {
            result.push(
                {
                    key: counter,
                    title: `Запись второго уровня с id = ${counter++}`,
                    parent: 1,
                    type: true
                }
            );
        }

        return result.sort((a, b) => a.key > b.key ? 1 : -1);
    },
    getColumns: (): IColumn[] => ([{
        displayProperty: 'title',
        width: ''
    }])
};
