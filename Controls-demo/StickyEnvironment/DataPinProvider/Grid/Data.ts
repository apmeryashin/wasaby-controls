export interface IRowData {
    id: Number;
    date: Date;
    name: String;
    count: Number;
    price: Number;
    total: Number;

    type: Boolean;
    parent: Number;
    nodeType: null | 'group';
    hasChild: Boolean;
}

export const data: IRowData[] = [
    {
        id: 1,
        date: new Date(2021, 0, 1),
        name: 'it\'s node 1',
        count: 0,
        price: 0,
        total: 11111,

        type: true,
        parent: null,
        hasChild: true,
        nodeType: 'group'
    },
        {
            id: 11,
            date: new Date(),
            name: 'object 1',
            count: 11,
            price: 100,
            total: 1100,

            type: null,
            parent: 1,
            hasChild: false,
            nodeType: null
        },
        {
            id: 12,
            date: new Date(),
            name: 'object 2',
            count: 12,
            price: 100,
            total: 1200,

            type: null,
            parent: 1,
            hasChild: false,
            nodeType: null
        },
        {
            id: 13,
            date: new Date(),
            name: 'object 3',
            count: 13,
            price: 100,
            total: 1300,

            type: null,
            parent: 1,
            hasChild: false,
            nodeType: null
        },
        {
            id: 14,
            date: new Date(),
            name: 'object 4',
            count: 14,
            price: 100,
            total: 1400,

            type: null,
            parent: 1,
            hasChild: false,
            nodeType: null
        },
        {
            id: 15,
            date: new Date(),
            name: 'object 5',
            count: 15,
            price: 100,
            total: 1500,

            type: null,
            parent: 1,
            hasChild: false,
            nodeType: null
        },
    {
        id: 2,
        date: new Date(2021, 1, 1),
        name: 'it\'s node 2',
        count: 0,
        price: 0,
        total: 22222,

        type: true,
        parent: null,
        hasChild: true,
        nodeType: 'group'
    },
        {
            id: 21,
            date: new Date(),
            name: 'object 1',
            count: 11,
            price: 100,
            total: 1100,

            type: null,
            parent: 2,
            hasChild: false,
            nodeType: null
        },
        {
            id: 22,
            date: new Date(),
            name: 'object 2',
            count: 12,
            price: 100,
            total: 1200,

            type: null,
            parent: 2,
            hasChild: false,
            nodeType: null
        },
        {
            id: 23,
            date: new Date(),
            name: 'object 3',
            count: 13,
            price: 100,
            total: 1300,

            type: null,
            parent: 2,
            hasChild: false,
            nodeType: null
        },
        {
            id: 24,
            date: new Date(),
            name: 'object 4',
            count: 14,
            price: 100,
            total: 1400,

            type: null,
            parent: 2,
            hasChild: false,
            nodeType: null
        },
        {
            id: 25,
            date: new Date(),
            name: 'object 5',
            count: 15,
            price: 100,
            total: 1500,

            type: null,
            parent: 2,
            hasChild: false,
            nodeType: null
        },
    {
        id: 3,
        date: new Date(2021, 2, 1),
        name: 'it\'s node 3',
        count: 0,
        price: 0,
        total: 33333,

        type: true,
        parent: null,
        hasChild: true,
        nodeType: 'group'
    },
        {
            id: 31,
            date: new Date(),
            name: 'object 1',
            count: 11,
            price: 100,
            total: 1100,

            type: null,
            parent: 3,
            hasChild: false,
            nodeType: null
        },
        {
            id: 32,
            date: new Date(),
            name: 'object 2',
            count: 12,
            price: 100,
            total: 1200,

            type: null,
            parent: 3,
            hasChild: false,
            nodeType: null
        },
        {
            id: 33,
            date: new Date(),
            name: 'object 3',
            count: 13,
            price: 100,
            total: 1300,

            type: null,
            parent: 3,
            hasChild: false,
            nodeType: null
        },
        {
            id: 34,
            date: new Date(),
            name: 'object 4',
            count: 14,
            price: 100,
            total: 1400,

            type: null,
            parent: 3,
            hasChild: false,
            nodeType: null
        },
        {
            id: 35,
            date: new Date(),
            name: 'object 5',
            count: 15,
            price: 100,
            total: 1500,

            type: null,
            parent: 3,
            hasChild: false,
            nodeType: null
        },
    {
        id: 4,
        date: new Date(2021, 3, 1),
        name: 'it\'s node 4',
        count: 0,
        price: 0,
        total: 44444,

        type: true,
        parent: null,
        hasChild: true,
        nodeType: 'group'
    },
        {
            id: 41,
            date: new Date(),
            name: 'object 1',
            count: 11,
            price: 100,
            total: 1100,

            type: null,
            parent: 4,
            hasChild: false,
            nodeType: null
        },
        {
            id: 42,
            date: new Date(),
            name: 'object 2',
            count: 12,
            price: 100,
            total: 1200,

            type: null,
            parent: 4,
            hasChild: false,
            nodeType: null
        },
        {
            id: 43,
            date: new Date(),
            name: 'object 3',
            count: 13,
            price: 100,
            total: 1300,

            type: null,
            parent: 4,
            hasChild: false,
            nodeType: null
        },
        {
            id: 44,
            date: new Date(),
            name: 'object 4',
            count: 14,
            price: 100,
            total: 1400,

            type: null,
            parent: 4,
            hasChild: false,
            nodeType: null
        },
        {
            id: 45,
            date: new Date(),
            name: 'object 5',
            count: 15,
            price: 100,
            total: 1500,

            type: null,
            parent: 4,
            hasChild: false,
            nodeType: null
        }
];
