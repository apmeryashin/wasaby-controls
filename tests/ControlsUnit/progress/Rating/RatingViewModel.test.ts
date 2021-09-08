import RatingViewModel from 'Controls/_progress/Rating/RatingViewModel';
import {assert} from 'chai';

describe('Controls/progress:Rating', () => {
    it('ViewModel constructor', () => {
        let vm: RatingViewModel;

        vm = new RatingViewModel({
            value: 3,
            precision: 0,
            iconStyle: 'x',
            emptyIconStyle: 'y'
        });
        assert.deepEqual([
            {
                index: 1,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 2,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 3,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 4,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'y'
            },
            {
                index: 5,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'y'
            }
        ], vm.getItems());

        vm = new RatingViewModel({
            value: 1,
            precision: 0,
            iconStyle: 'x',
            emptyIconStyle: 'y'
        });
        assert.deepEqual([
            {
                index: 1,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 2,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'y'
            },
            {
                index: 3,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'y'
            },
            {
                index: 4,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'y'
            },
            {
                index: 5,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'y'
            }
        ], vm.getItems());

        vm = new RatingViewModel({
            value: 5,
            precision: 0,
            iconStyle: 'x',
            emptyIconStyle: 'y'
        });
        assert.deepEqual([
            {
                index: 1,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 2,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 3,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 4,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 5,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            }
        ], vm.getItems());

        vm = new RatingViewModel({
            value: 3,
            precision: 1,
            iconStyle: 'x',
            emptyIconStyle: 'y'
        });
        assert.deepEqual([
            {
                index: 1,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 2,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 3,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 4,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'y'
            },
            {
                index: 5,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'y'
            }
        ], vm.getItems());

        vm = new RatingViewModel({
            value: 3.2,
            precision: 0,
            iconStyle: 'x',
            emptyIconStyle: 'y'
        });
        assert.deepEqual([
            {
                index: 1,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 2,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 3,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 4,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'y'
            },
            {
                index: 5,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'y'
            }
        ], vm.getItems());

        vm = new RatingViewModel({
            value: 3.2,
            precision: 1,
            iconStyle: 'x',
            emptyIconStyle: 'y'
        });
        assert.deepEqual([
            {
                index: 1,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 2,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 3,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 4,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'y'
            },
            {
                index: 5,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'y'
            }
        ], vm.getItems());

        vm = new RatingViewModel({
            value: 3.6,
            precision: 1,
            iconStyle: 'x',
            emptyIconStyle: 'y'
        });
        assert.deepEqual([
            {
                index: 1,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 2,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 3,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 4,
                type: 'half',
                icon: 'icon-FavoriteHalf',
                iconStyle: 'x'
            },
            {
                index: 5,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'y'
            }
        ], vm.getItems());
    });

    it('ViewModel setValue', () => {
        let vm: RatingViewModel;

        vm = new RatingViewModel({
            value: 3.6,
            precision: 1,
            iconStyle: 'x',
            emptyIconStyle: 'y'
        });

        vm.setValue(4);

        assert.deepEqual([
            {
                index: 1,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 2,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 3,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 4,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'x'
            },
            {
                index: 5,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'y'
            }
        ], vm.getItems());
    });

    it('ViewModel setOptions', () => {
        let vm: RatingViewModel;

        vm = new RatingViewModel({
            value: 3.6,
            precision: 1,
            iconStyle: 'x',
            emptyIconStyle: 'y'
        });

        vm.setOptions({
            value: 2.8,
            precision: 0,
            iconStyle: 'a',
            emptyIconStyle: 'b'
        });

        assert.deepEqual([
            {
                index: 1,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'a'
            },
            {
                index: 2,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'b'
            },
            {
                index: 3,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'b'
            },
            {
                index: 4,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'b'
            },
            {
                index: 5,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'b'
            }
        ], vm.getItems());
    });
});
