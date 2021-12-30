import RatingViewModel from 'Controls/_progress/Rating/RatingViewModel';
import {assert} from 'chai';

describe('Controls/progress:Rating', () => {
    it('ViewModel constructor', () => {
        let vm: RatingViewModel;

        vm = new RatingViewModel({
            value: 3,
            precision: 0,
            iconColorMode: 'dynamic',
            emptyIconFill: 'none'
        });
        assert.deepEqual([
            {
                index: 1,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 2,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 3,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 4,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'readonly'
            },
            {
                index: 5,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'readonly'
            }
        ], vm.getItems());

        vm = new RatingViewModel({
            value: 1,
            precision: 0,
            iconColorMode: 'dynamic',
            emptyIconFill: 'none'
        });
        assert.deepEqual([
            {
                index: 1,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'danger'
            },
            {
                index: 2,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'readonly'
            },
            {
                index: 3,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'readonly'
            },
            {
                index: 4,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'readonly'
            },
            {
                index: 5,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'readonly'
            }
        ], vm.getItems());

        vm = new RatingViewModel({
            value: 5,
            precision: 0,
            iconColorMode: 'dynamic',
            emptyIconFill: 'none'
        });
        assert.deepEqual([
            {
                index: 1,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'success'
            },
            {
                index: 2,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'success'
            },
            {
                index: 3,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'success'
            },
            {
                index: 4,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'success'
            },
            {
                index: 5,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'success'
            }
        ], vm.getItems());

        vm = new RatingViewModel({
            value: 3,
            precision: 0.5,
            iconColorMode: 'static',
            emptyIconFill: 'none'
        });
        assert.deepEqual([
            {
                index: 1,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 2,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 3,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 4,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'readonly'
            },
            {
                index: 5,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'readonly'
            }
        ], vm.getItems());

        vm = new RatingViewModel({
            value: 3.2,
            precision: 0,
            iconColorMode: 'static',
            emptyIconFill: 'none'
        });
        assert.deepEqual([
            {
                index: 1,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 2,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 3,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 4,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'readonly'
            },
            {
                index: 5,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'readonly'
            }
        ], vm.getItems());

        vm = new RatingViewModel({
            value: 3.2,
            precision: 0.5,
            iconColorMode: 'static',
            emptyIconFill: 'none'
        });
        assert.deepEqual([
            {
                index: 1,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 2,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 3,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 4,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'readonly'
            },
            {
                index: 5,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'readonly'
            }
        ], vm.getItems());

        vm = new RatingViewModel({
            value: 3.6,
            precision: 0.5,
            iconColorMode: 'static',
            emptyIconFill: 'none'
        });
        assert.deepEqual([
            {
                index: 1,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 2,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 3,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 4,
                type: 'half',
                icon: 'icon-FavoriteHalf',
                iconStyle: 'rate'
            },
            {
                index: 5,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'readonly'
            }
        ], vm.getItems());

        vm = new RatingViewModel({
            value: 3,
            precision: 0,
            iconColorMode: 'static',
            emptyIconFill: 'full'
        });
        assert.deepEqual([
            {
                index: 1,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 2,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 3,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 4,
                type: 'empty',
                icon: 'icon-Favorite',
                iconStyle: 'readonly'
            },
            {
                index: 5,
                type: 'empty',
                icon: 'icon-Favorite',
                iconStyle: 'readonly'
            }
        ], vm.getItems());
    });

    it('ViewModel setValue', () => {
        let vm: RatingViewModel;

        vm = new RatingViewModel({
            value: 3.6,
            precision: 0.5,
            iconColorMode: 'dynamic',
            emptyIconFill: 'none'
        });

        vm.setValue(4);

        assert.deepEqual([
            {
                index: 1,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 2,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 3,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 4,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'rate'
            },
            {
                index: 5,
                type: 'empty',
                icon: 'icon-Unfavorite',
                iconStyle: 'readonly'
            }
        ], vm.getItems());
    });

    it('ViewModel setOptions', () => {
        let vm: RatingViewModel;

        vm = new RatingViewModel({
            value: 3.6,
            precision: 0.5,
            iconColorMode: 'static',
            emptyIconFill: 'none'
        });

        vm.setOptions({
            value: 2.8,
            precision: 0,
            iconColorMode: 'dynamic',
            emptyIconFill: 'full'
        });

        assert.deepEqual([
            {
                index: 1,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'danger'
            },
            {
                index: 2,
                type: 'full',
                icon: 'icon-Favorite',
                iconStyle: 'danger'
            },
            {
                index: 3,
                type: 'empty',
                icon: 'icon-Favorite',
                iconStyle: 'readonly'
            },
            {
                index: 4,
                type: 'empty',
                icon: 'icon-Favorite',
                iconStyle: 'readonly'
            },
            {
                index: 5,
                type: 'empty',
                icon: 'icon-Favorite',
                iconStyle: 'readonly'
            }
        ], vm.getItems());
    });
});
