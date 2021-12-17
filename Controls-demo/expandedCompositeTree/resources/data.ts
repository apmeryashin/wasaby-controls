import {
    IMAGE_ASHI, IMAGE_FISH_SET, IMAGE_ONIGIRADZU, IMAGE_SASIMI, IMAGE_TUNEC, IMAGE_CHEESES, IMAGE_HERBS, IMAGE_FRUITS,
    IMAGE_SALT_1, IMAGE_SALT_2, IMAGE_SALT_3, IMAGE_SALT_4,
    IMAGE_SOUP_F1, IMAGE_SOUP_F2, IMAGE_SOUP_F3,
    IMAGE_SOUP_1, IMAGE_SOUP_2, IMAGE_SOUP_3, IMAGE_SOUP_4,
    IMAGE_BL,
    IMAGE_BF_1, IMAGE_BF_2, IMAGE_BF_3
} from './images';

export const getData = () => [
    {
        key: 1,
        type: true,
        parent: null,
        image: '',
        caption: 'A la carte с 12:00',
        renderData: {
        }
    },
    {
        key: 11,
        type: true,
        parent: 1,
        image: '',
        caption: 'Закуски',
        renderData: {
        }
    },
    {
        key: 1101,
        type: null,
        parent: 11,
        image: IMAGE_ASHI,
        caption: 'Аши из морского гребешка и тунца',
        renderData: {
            weight: '165 г',
            price: '850.00'
        }
    },
    {
        key: 1102,
        type: null,
        parent: 11,
        image: IMAGE_ASHI,
        caption: 'Аши из морского гребешка и тунца',
        renderData: {
            weight: '165 г',
            price: '850.00'
        }
    },
    {
        key: 1103,
        type: null,
        parent: 11,
        image: IMAGE_SASIMI,
        caption: 'Сашими-бар',
        renderData: {
            weight: '190/15 г',
            price: '890.00'
        }
    },
    {
        key: 1104,
        type: null,
        parent: 11,
        image: IMAGE_SASIMI,
        caption: 'Сашими-бар',
        renderData: {
            weight: '190/15 г',
            price: '890.00'
        }
    },
    {
        key: 1105,
        type: null,
        parent: 11,
        image: IMAGE_FISH_SET,
        caption: 'Сет морских рыб',
        renderData: {
            weight: '190 г',
            price: '850.00'
        }
    },
    {
        key: 1106,
        type: null,
        parent: 11,
        image: IMAGE_FISH_SET,
        caption: 'Сет морских рыб',
        renderData: {
            weight: '190 г',
            price: '850.00'
        }
    },
    {
        key: 1107,
        type: null,
        parent: 11,
        image: IMAGE_ONIGIRADZU,
        caption: 'Онигирадзу с лососем в устричном соусе',
        renderData: {
            weight: '190/15 г',
            price: '890.00'
        }
    },
    {
        key: 1108,
        type: null,
        parent: 11,
        image: IMAGE_ONIGIRADZU,
        caption: 'Онигирадзу с лососем в устричном соусе',
        renderData: {
            weight: '190/15 г',
            price: '890.00'
        }
    },
    {
        key: 1109,
        type: null,
        parent: 11,
        image: IMAGE_TUNEC,
        caption: 'Тунец в "цитрусовом винегрете"',
        renderData: {
            weight: '170 г',
            price: '850.00'
        }
    },
    {
        key: 1110,
        type: null,
        parent: 11,
        image: IMAGE_TUNEC,
        caption: 'Тунец в "цитрусовом винегрете"',
        renderData: {
            weight: '170 г',
            price: '850.00'
        }
    },
    {
        key: 1111,
        type: null,
        parent: 11,
        image: IMAGE_CHEESES,
        caption: 'Сет европейских сыров',
        renderData: {
            weight: '200 г',
            price: '890.00'
        }
    },
    {
        key: 1112,
        type: null,
        parent: 11,
        image: IMAGE_CHEESES,
        caption: 'Сет европейских сыров',
        renderData: {
            weight: '200 г',
            price: '890.00'
        }
    },
    {
        key: 1113,
        type: null,
        parent: 11,
        image: IMAGE_HERBS,
        caption: 'Средиземноморские овощи BC',
        renderData: {
            weight: '250 г',
            price: '850.00'
        }
    },
    {
        key: 1114,
        type: null,
        parent: 11,
        image: IMAGE_HERBS,
        caption: 'Средиземноморские овощи BC',
        renderData: {
            weight: '250 г',
            price: '850.00'
        }
    },
    {
        key: 1115,
        type: null,
        parent: 11,
        image: IMAGE_FRUITS,
        caption: 'Фруктовый микс',
        renderData: {
            weight: '500 г',
            price: '890.00'
        }
    },
    {
        key: 1116,
        type: null,
        parent: 11,
        image: IMAGE_FRUITS,
        caption: 'Фруктовый микс',
        renderData: {
            weight: '500 г',
            price: '890.00'
        }
    },
    {
        key: 12,
        type: true,
        parent: 1,
        image: '',
        caption: 'Салаты',
        renderData: {
        }
    },
    {
        key: 1201,
        type: null,
        parent: 12,
        image: IMAGE_SALT_1,
        caption: 'Малагский салат с дорадо гриль',
        renderData: {
            weight: '190 г',
            price: '850.00'
        }
    },
    {
        key: 1202,
        type: null,
        parent: 12,
        image: IMAGE_SALT_1,
        caption: 'Малагский салат с дорадо гриль',
        renderData: {
            weight: '190 г',
            price: '850.00'
        }
    },
    {
        key: 1203,
        type: null,
        parent: 12,
        image: IMAGE_SALT_2,
        caption: 'Салат с лангустинами и угрем в соусе унаги',
        renderData: {
            weight: '190/15 г',
            price: '890.00'
        }
    },
    {
        key: 1204,
        type: null,
        parent: 12,
        image: IMAGE_SALT_2,
        caption: 'Салат с лангустинами и угрем в соусе унаги',
        renderData: {
            weight: '190/15 г',
            price: '890.00'
        }
    },
    {
        key: 1205,
        type: null,
        parent: 12,
        image: IMAGE_SALT_3,
        caption: 'Салат с томлёной телячьей голяшкой',
        renderData: {
            weight: '190 г',
            price: '890.00'
        }
    },
    {
        key: 1206,
        type: null,
        parent: 12,
        image: IMAGE_SALT_3,
        caption: 'Салат с томлёной телячьей голяшкой',
        renderData: {
            weight: '190 г',
            price: '890.00'
        }
    },
    {
        key: 1207,
        type: null,
        parent: 12,
        image: IMAGE_SALT_4,
        caption: 'Салат с копченым палтусом и картофелем',
        renderData: {
            weight: '190 г',
            price: '850.00'
        }
    },
    {
        key: 1208,
        type: null,
        parent: 12,
        image: IMAGE_SALT_4,
        caption: 'Салат с копченым палтусом и картофелем',
        renderData: {
            weight: '190 г',
            price: '850.00'
        }
    },
    {
        key: 13,
        type: true,
        parent: 1,
        image: '',
        caption: 'Супы',
        renderData: {}
    },
    {
        key: 1301,
        type: true,
        parent: 13,
        image: IMAGE_SOUP_F1,
        caption: 'Мясные',
        renderData: {}
    },
    {
        key: 1303,
        type: true,
        parent: 13,
        image: IMAGE_SOUP_F2,
        caption: 'Овощные',
        renderData: {}
    },
    {
        key: 1305,
        type: true,
        parent: 13,
        image: IMAGE_SOUP_F3,
        caption: 'Морепродукты',
        renderData: {}
    },
    {
        key: 1307,
        type: null,
        parent: 13,
        image: IMAGE_SOUP_1,
        caption: 'Крем-дуэт из тыквы и свеклы с тофу',
        renderData: {
            weight: '190 г',
            price: '850.00'
        }
    },
    {
        key: 1308,
        type: null,
        parent: 13,
        image: IMAGE_SOUP_2,
        caption: 'Велюте с мраморной говядиной',
        renderData: {
            weight: '320 г',
            price: '890.00'
        }
    },
    {
        key: 1309,
        type: null,
        parent: 13,
        image: IMAGE_SOUP_3,
        caption: 'Том-ям-кунг с креветками',
        renderData: {
            weight: '350 г',
            price: '890.00'
        }
    },
    {
        key: 1310,
        type: null,
        parent: 13,
        image: IMAGE_SOUP_4,
        caption: 'Рыбная похлёбка Уитсби',
        renderData: {
            weight: '190 г',
            price: '850.00'
        }
    },
    {
        key: 2,
        type: true,
        parent: null,
        image: '',
        caption: 'Бизнес-ланч 07.12 с 12 до 16',
        renderData: {}
    },
    {
        key: 21,
        type: null,
        parent: 2,
        image: IMAGE_BL,
        caption: 'Бинито-ланч',
        renderData: {
            weight: '565 г',
            price: '450.00'
        }
    },
    {
        key: 3,
        type: true,
        parent: null,
        image: '',
        caption: 'Завтраки',
        renderData: {}
    },
    {
        key: 31,
        type: true,
        parent: 3,
        image: '',
        caption: 'Салаты',
        renderData: {}
    },
    {
        key: 3101,
        type: null,
        parent: 31,
        image: IMAGE_BF_1,
        caption: 'Аши из морского гребешка и тунца',
        renderData: {
            weight: '165 г',
            price: '850.00'
        }
    },
    {
        key: 3102,
        type: null,
        parent: 31,
        image: IMAGE_BF_1,
        caption: 'Аши из морского гребешка и тунца',
        renderData: {
            weight: '165 г',
            price: '850.00'
        }
    },
    {
        key: 3103,
        type: null,
        parent: 31,
        image: IMAGE_BF_2,
        caption: 'Сашими-бар',
        renderData: {
            weight: '190/15 г',
            price: '890.00'
        }
    },
    {
        key: 3104,
        type: null,
        parent: 31,
        image: IMAGE_BF_2,
        caption: 'Сашими-бар',
        renderData: {
            weight: '190/15 г',
            price: '890.00'
        }
    },
    {
        key: 3105,
        type: null,
        parent: 31,
        image: IMAGE_BF_3,
        caption: 'Сет морских рыб',
        renderData: {
            weight: '190 г',
            price: '850.00'
        }
    },
    {
        key: 3106,
        type: null,
        parent: 31,
        image: IMAGE_BF_3,
        caption: 'Сет морских рыб',
        renderData: {
            weight: '190 г',
            price: '850.00'
        }
    }
];
