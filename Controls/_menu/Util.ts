import {IMenuBaseOptions, TKey} from 'Controls/_menu/interface/IMenuBase';
import {Model} from 'Types/entity';

export function getItemParentKey({root, parentProperty}: IMenuBaseOptions, item: Model): TKey {
    const isStringType = typeof root === 'string';
    let parent: TKey = item.get(parentProperty);
    if (parent === undefined) {
        parent = null;
    }
    // Для исторических меню keyProperty всегда заменяется на строковый.
    // Если изначально был указан целочисленный ключ,
    // то в поле родителя будет лежать также целочисленное значение, а в root будет лежать строка.
    if (isStringType) {
        parent = String(parent);
    }
    return parent;
}
