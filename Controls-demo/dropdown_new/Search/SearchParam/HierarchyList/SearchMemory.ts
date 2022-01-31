import {Memory, DataSet} from 'Types/source';
import {RecordSet} from 'Types/collection';
import * as cClone from 'Core/core-clone';

function getById(items, id) {
    for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
            return cClone(items[i]);
        }
    }
}

function getFullPath(items, currentRoot, needRecordSet?) {
    const path = [];
    let currentNode = getById(items, currentRoot);
    path.unshift(getById(items, currentRoot));
    while (currentNode.parent !== null) {
        currentNode = getById(items, currentNode.parent);
        path.unshift(currentNode);
    }
    if (needRecordSet) {
        return new RecordSet({
            rawData: path,
            keyProperty: 'id'
        });
    }
    return path;
}

export default class TreeMemory extends Memory {
    query(query) {
        const rootData = [];
        const data = [];
        const items = {};
        const filter = query.getWhere();
        const parent = filter.parent instanceof Array ? filter.parent[0] : filter.parent;
        let parents;

        // if search mode
        if (filter.title) {
            this._$data.forEach((item) => {
                if (item.title.toUpperCase().indexOf(filter.title.toUpperCase()) !== -1) {
                    items[item.id] = item;
                }
            });
            for (const i in items) {
                if (items.hasOwnProperty(i)) {
                    if (items[i].parent !== null) {
                        parents = getFullPath(this._$data, items[i].parent);
                        parents.forEach((par) => {
                            if (par['@parent']) {
                                par['@parent'] = false;
                            }
                            data.push(par);
                        });
                        data.push(items[i]);
                    } else {
                        rootData.push(items[i]);
                    }
                }
            }
            return Promise.resolve(new DataSet({
                rawData: data.concat(rootData),
                adapter: this.getAdapter(),
                keyProperty: 'id'
            }));
        } else {
            query.where((item) => {
                if (filter.parent && filter.parent.forEach) {
                    for (let i = 0; i < filter.parent.length; i++) {
                        if (item.get('parent') === filter.parent[i]) {
                            return true;
                        }
                    }
                    return false;
                } else {
                    if (parent !== undefined) {
                        return item.get('parent') === parent;
                    }
                    return true;
                }
            });
            return super.query.apply(this, arguments).then((data) => {
                const originalGetAll = data.getAll.bind(data);

                data.getAll = () => {
                    const originResult = originalGetAll();
                    const meta = originResult.getMetaData();

                    if (parent !== undefined && parent !== null) {
                        meta.path = getFullPath(this._$data, parent, true);
                    }

                    originResult.setMetaData(meta);
                    return originResult;
                };

                return Promise.resolve(data);
            });
        }
    }
}
