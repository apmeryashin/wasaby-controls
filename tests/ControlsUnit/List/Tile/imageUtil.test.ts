import {assert} from 'chai';
import {getItemSize, getImageClasses, getImageUrl, getImageSize, IMAGE_FIT, getImageRestrictions} from 'Controls/_tile/utils/imageUtil';

function mockHTMLElement(width, height) {
    return {
        classList: {
            _classList: [],
            add(className) {
                this._classList.push(className);
            },
            remove(className) {
                this._classList.splice(this._classList.indexOf(className), 1);
            },
            contains(className) {
                return this._classList.indexOf(className) >= 0;
            }
        },
        style: {},
        getBoundingClientRect() {
            return {
                width,
                height
            };
        }
    };
}

describe('tileImageUtil', () => {
    describe('getImageClasses', () => {
        assert.strictEqual(getImageClasses(IMAGE_FIT.CONTAIN), ' controls-TileView__image-contain');
        assert.strictEqual(getImageClasses(IMAGE_FIT.COVER), ' controls-TileView__image-cover');
    });
    describe('getImageUrl', () => {
        it ('get url', () => {
            const imageUrlResolver = () => 'resolvedUrl';
            const baseUrl = '/online.sbis.ru/doc';
            const defaultPrefix = '/previewer/c';
            let defaultUrl = getImageUrl(0, 100, baseUrl, null);
            assert.strictEqual(defaultUrl, `${defaultPrefix}/100${baseUrl}`);

            defaultUrl = getImageUrl(100, 0, baseUrl, null);
            assert.strictEqual(defaultUrl, `${defaultPrefix}/100${baseUrl}`);

            defaultUrl = getImageUrl(100, 100, baseUrl, null);
            assert.strictEqual(defaultUrl, `${defaultPrefix}/100/100${baseUrl}`);

            defaultUrl = getImageUrl(100, 0, baseUrl, null, imageUrlResolver);
            assert.strictEqual(defaultUrl, 'resolvedUrl');
        });
    });
    describe('getImageSize', () => {
        describe('cover image fit', () => {
            it('Если широкая картинка (imageDeltaW > tileDeltaW), и шире увеличенной плитки', () => {
                const wideImage = getImageSize(200, 200, 'static', 100, 300, 'cover');
                assert.isTrue(wideImage.height === 0);
                assert.isTrue(wideImage.width === 300);
            });

            it('Если широкая картинка (imageDeltaW > tileDeltaW), и не шире увеличенной плитки', () => {
                const wideImage = getImageSize(200, 200, 'static', 100, 120, 'cover');
                assert.isTrue(wideImage.height === 300);
                assert.isTrue(wideImage.width === 0);
            });

            it('Если картинка высокая (imageDeltaW < tileDeltaW), но не выше увеличенной плитки', () => {
                const tallImage = getImageSize(100, 400, 'static', 300, 100, 'cover');
                assert.isTrue(tallImage.height === 600);
                assert.isTrue(tallImage.width === 0);
            });
            it('Пропорциональная картинка ограничивается по ширине', () => {
                const proportionalImage = getImageSize(100, 100, 'static', 300, 300, 'cover');
                assert.isTrue(proportionalImage.width === 150);
                assert.isTrue(proportionalImage.height === 0);
            });
        });
        describe('none and contain image fit', () => {
            it('returns image original sizes', () => {
                const imageSizes = getImageSize(200, 300, 'static', 1, 1, 'contain');
                assert.isTrue(imageSizes.width === 1);
                assert.isTrue(imageSizes.height === 1);

                const imageSizes = getImageSize(200, 300, 'static', 1, 1, 'none');
                assert.isTrue(imageSizes.width === 1);
                assert.isTrue(imageSizes.height === 1);
            });
        });

        describe('getImageRestrictions', () => {
            it('image without sizes', () => {
                const restrictions = getImageRestrictions(0, null, 200, 300);
                assert.isTrue(restrictions.width && restrictions.height);
            });
            it('Картинка пропорциоально шире плитки', () => {
                const restrictions = getImageRestrictions(100, 300, 400, 400);
                assert.isTrue(restrictions.height);
            });
            it('Картинка пропорционально ниже плитки', () => {
                const restrictions = getImageRestrictions(300, 100, 400, 400);
                assert.isTrue(restrictions.width);
            });
            it('Картинка пропорционально равна по ширине плитке, но выше', () => {
                const restrictions = getImageRestrictions(5760, 3840, 196, 142);
                assert.isTrue(restrictions.height);
            });
            it('Картинка пропорционально выше плитки', () => {
                const restrictions = getImageRestrictions(300, 100, 200, 100);
                assert.isTrue(restrictions.width);
            });
            it('Картинка полностью пропорциональна плитке', () => {
                const restrictions = getImageRestrictions(300, 300, 500, 500);
                assert.isTrue(restrictions.height);
            });
        });

        describe('getItemSize', () => {
            let items;
            let item;

            beforeEach(() => {
                items = {
                    '.controls-TileView__itemContent': mockHTMLElement(100, 100),
                    '.controls-TileView__imageWrapper': mockHTMLElement(100, 75)
                };
                item = {
                    querySelector: (selector) => {
                        return items[selector];
                    }
                } as HTMLElement;
            });

            it('without imageWrapper', () => {
                let hasError = false;

                delete items['.controls-TileView__imageWrapper'];

                try {
                    getItemSize(item, 1, 'static');
                } catch (e) {
                    hasError = true;
                }

                assert.isFalse(hasError);
            });
            it('do not change final classes', () => {

                items['.controls-TileView__itemContent'].classList.add('controls-TileView__item_hovered');
                getItemSize(item, 1, 'static');
                assert.isTrue(items['.controls-TileView__itemContent'].classList.contains('controls-TileView__item_hovered'));
                assert.isFalse(items['.controls-TileView__itemContent'].classList.contains('controls-TileView__item_unfixed'));
            });
        });
    });
});
