import {IData} from "Controls-demo/treeGridNew/DemoHelpers/Interface";

export const Gadgets = {
    getData(): IData[] {
        return [
            {
                key: 1, title: 'Node', Раздел: null, 'Раздел@': false, Раздел$: null
            },
            {
                key: 11, title: 'Node', Раздел: null, 'Раздел@': false, Раздел$: null
            },
            {
                key: 111, title: 'Leaf', Раздел: null, 'Раздел@': false, Раздел$: null
            },
            {
                key: 12, title: 'Hidden node', Раздел: null, 'Раздел@': false, Раздел$: null
            },
            {
                key: 13, title: 'Leaf', Раздел: null, 'Раздел@': false, Раздел$: null
            },
            {
                key: 2, title: 'Node 2', Раздел: null, 'Раздел@': false, Раздел$: null
            },
            {
                key: 21, title: 'Leaf 21', Раздел: null, 'Раздел@': false, Раздел$: null
            },
            {
                key: 3, title: 'Node 3', Раздел: null, 'Раздел@': false, Раздел$: null
            }
        ];
    },
};
