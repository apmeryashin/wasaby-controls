import * as explorerImages from 'Controls-demo/Explorer/ExplorerImagesLayout';
import { CrudEntityKey } from 'Types/source';

interface IData {
    key: CrudEntityKey;
    type: string;
    title: string;
    description: string;
    gradientColor: string;
    image: string;
    isShadow: boolean;
    titleLines: number;
    imagePosition: string;
}

function template(key: number, image: string): IData {
    return {
        key,
        type: null,
        title: `Запись с ключом #${key}${image ? ' и картинкой': ''}`,
        description: 'Шаблон 5.1 или 5.3 в зависимости от набора записей в RecordSet',
        gradientColor: '#FFF',
        titleLines: 1,
        imagePosition: 'left',
        image,
        isShadow: true
    };
}

// images - набор индексов записей, для которых будет проставлена картинка
export function generateData(count: number, images: number[] = []): IData[] {
    const data: IData[] = [];
    for (let index = 0; index < count; index++) {
        data.push(template(index + 1, images.includes(index) ? explorerImages[8] : null));
    }
    return data;
}
