export const data = [
    {
        id: 1,
        node: true,
        parent: null,
        title: 'Все кухни'
    },
        {
            id: 11,
            node: true,
            parent: 1,
            title: 'Традиционные'
        },
            {
                id: 111,
                node: true,
                parent: 11,
                title: 'Европейская кухня'
            },
            {
                id: 112,
                node: true,
                parent: 11,
                title: 'Русская кухня'
            },
            {
                id: 113,
                node: true,
                parent: 11,
                title: 'Китайская кухня'
            },
            {
                id: 114,
                node: true,
                parent: 11,
                title: 'Японская кухня'
            },
        {
            id: 12,
            node: true,
            parent: 1,
            title: 'Авторская кухня'
        },
    {
        id: 2,
        node: true,
        parent: null,
        title: 'Кондитерские изделия'
    },
        {
            id: 21,
            node: true,
            parent: 2,
            title: 'Печеньки'
        },
        {
            id: 22,
            node: true,
            parent: 2,
            title: 'Булочки'
        },
        {
            id: 23,
            node: true,
            parent: 2,
            title: 'Пироги'
        },
            {
                id: 231,
                node: true,
                parent: 23,
                title: 'Сладкие пироги'
            },
                {
                    id: 2311,
                    node: true,
                    parent: 231,
                    title: 'Очень сладкие пироги'
                },
                    {
                        id: 23111,
                        node: true,
                        parent: 2311,
                        title: 'Невыносимо сладкие пироги'
                    },
                        {
                            id: 231111,
                            node: true,
                            parent: 23111,
                            title: 'Прям вообще жесть'
                        },
                            {
                                id: 2311111,
                                node: true,
                                parent: 231111,
                                title: 'Сахар'
                            },
                                {
                                    id: 23111111,
                                    node: true,
                                    parent: 2311111,
                                    title: 'Неотам'
                                },
    {
        id: 3,
        node: true,
        parent: null,
        title: 'Праздники'
    },
        {
            id: 31,
            node: true,
            parent: 3,
            title: 'Тортики'
        },
        {
            id: 32,
            node: true,
            parent: 3,
            title: 'Этот пункт растянет popup на максимально возможные 700 пикселей. Да да, Вы правильно прочитали 700 пикселей. Такие дела.'
        }
];
