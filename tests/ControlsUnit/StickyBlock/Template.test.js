define(
    [
        'Controls/scroll',
        'Env/Env',
        'ControlsUnit/resources/TemplateUtil',
        'Controls/_scroll/StickyBlock/Utils',
        'Controls/_scroll/StickyBlock',
        'UI/Base'
    ],
    function (scroll, Env, TemplateUtil, StickyHeaderUtils, _StickyHeaderLib, UIBase) {

        'use strict';

        const _StickyHeader = _StickyHeaderLib.default;

        describe('Controls.StickyBlock.Template', function () {
            var ctrl, template, inst, compat;

            before(function () {
                compat = Env.constants.compat;
                Env.constants.compat = true;
            });

            beforeEach(function () {
                inst = new UIBase.Control();
                inst._stickyHeadersHeight = {
                    top: 0,
                    bottom: 0
                };
                inst._options = {
                    fixedZIndex: 2,
                    position: 'top'
                };
                inst._model = {};
                inst._restoreBottomShadowHiddenClass = () => {
                }
            });

            after(function () {
                Env.constants.compat = compat;
            });

            describe('StickyBlock', function () {
                beforeEach(function () {
                    ctrl = new scroll.StickyBlock({});
                    ctrl._container = {
                        offsetParent: true
                    };
                    ctrl._canShadowVisible = {top: true, bottom: true};
                    template = TemplateUtil.clearTemplate(ctrl._template);
                });

                it('The browser does not support sticky', function () {
                    inst._isStickySupport = false;
                    inst._isStickyEnabled = ctrl._isStickyEnabled;
                    inst._options.theme = 'default';
                    inst._options.content = TemplateUtil.content;

                    assert.equal(template(inst), '<div><div>testing the template</div></div>');
                });
            });

            describe('_StickyHeader', function () {
                beforeEach(function () {
                    ctrl = new _StickyHeader({});
                    inst._options = _StickyHeader.getDefaultOptions();
                    inst._container = {};
                    inst._isStickyEnabled = ctrl._isStickyEnabled;
                    inst._updateStyles = ctrl._updateStyles;
                    inst._getOppositePosition = ctrl._getOppositePosition;
                    inst._updateStyle = ctrl._updateStyle;
                    inst._updateShadowStyles = ctrl._updateShadowStyles;
                    inst._updateObserversStyles = ctrl._updateObserversStyles;
                    inst._getStyle = ctrl._getStyle;
                    inst._isShadowVisible = ctrl._isShadowVisible;
                    inst._isShadowVisibleByScrollState = ctrl._isShadowVisibleByScrollState;
                    inst._getObserverStyle = ctrl._getObserverStyle;
                    inst._getBackgroundClass = ctrl._getBackgroundClass;
                    inst._isBackgroundDefaultClass = ctrl._isBackgroundDefaultClass;
                    inst._options.shadowVisibility = 'visible';
                    inst._reverseOffsetStyle = ctrl._reverseOffsetStyle;
                    inst._getBottomShadowStyle = ctrl._getBottomShadowStyle;
                    inst._getNormalizedContainer = ctrl._getNormalizedContainer;
                    inst._updateCanShadowVisible = ctrl._updateCanShadowVisible;
                    inst._canShadowVisible = {top: true, bottom: true};
                    inst._getComputedStyle = () => {
                        return {};
                    };
                    inst._scrollState = {};
                    inst._isShadowVisibleByController = {
                        top: StickyHeaderUtils.SHADOW_VISIBILITY_BY_CONTROLLER.auto,
                        bottom: StickyHeaderUtils.SHADOW_VISIBILITY_BY_CONTROLLER.auto
                    };
                    template = TemplateUtil.clearTemplate(ctrl._template);
                });

                it('On the desktop platform', function () {
                    inst._isMobilePlatform = false;
                    inst._model.fixedPosition = 'top';
                    inst._options.theme = 'default';
                    inst._options.content = function () {
                        return '';
                    };
                    inst._scrollState = {
                        hasUnrenderedContent: {
                            top: false,
                            bottom: false
                        }
                    };
                    inst._isStickySupport = true;

                    inst._resetGapFixClass = sinon.fake();
                    inst._updateStyles(inst._options);
                    inst._getObserverStyle('right', 0, inst._options.shadowVisibility);

                    assert.equal(template(inst), '<div class="controls-StickyHeader controls_scroll_theme-default controls-StickyHeader__background_default controls-StickyHeader_position" style="top: 0px;z-index: 2;">' +
                        '<div data-qa="StickyHeader__shadow-top" class="controls-Scroll__shadow controls-StickyHeader__shadow-top controls-Scroll__shadow_horizontal ws-invisible"></div>' +
                        '<div class="controls-StickyHeader__observationTargetTop" style="top: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetLeft" style="left: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetRight" style="right: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetBottomLeft" style="bottom: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetBottomRight" style="right: -2px;"></div>' +
                        '<div data-qa="StickyHeader__shadow-bottom" class="controls-Scroll__shadow controls-StickyHeader__shadow-bottom controls-Scroll__shadow_horizontal ws-hidden"></div>' +
                        '</div>');
                });

                it('On the mobile platform', function () {
                    var sandbox = sinon.createSandbox();

                    inst._model.fixedPosition = 'top';
                    sandbox.replace(inst, '_getComputedStyle', function () {
                        return {'padding-top': '0px'};
                    });
                    inst._isMobileIOS = true;
                    inst._container = {style: {paddingTop: ''}};
                    inst._options.theme = 'default';
                    inst._options.content = function () {
                        return ''
                    };
                    inst._scrollState = {
                        hasUnrenderedContent: {
                            top: false,
                            bottom: false
                        }
                    };
                    inst._isStickySupport = true;

                    inst._updateStyles(inst._options);

                    assert.equal(template(inst), '<div class="controls-StickyHeader controls_scroll_theme-default controls-StickyHeader__background_default controls-StickyHeader_position" style="top: 0px;z-index: 2;">' +
                        '<div data-qa="StickyHeader__shadow-top" class="controls-Scroll__shadow controls-StickyHeader__shadow-top controls-Scroll__shadow_horizontal ws-invisible"></div>' +
                        '<div class="controls-StickyHeader__observationTargetTop" style="top: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetLeft" style="left: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetRight" style="right: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetBottomLeft" style="bottom: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetBottomRight" style="right: -2px;"></div>' +
                        '<div data-qa="StickyHeader__shadow-bottom" class="controls-Scroll__shadow controls-StickyHeader__shadow-bottom controls-Scroll__shadow_horizontal ws-invisible"></div>' +
                        '</div>');
                    sandbox.restore();
                });

                it('Move the header', function () {
                    inst._options.theme = 'default';
                    inst._options.content = function () {
                        return '';
                    };
                    inst._scrollState = {
                        hasUnrenderedContent: {
                            top: false,
                            bottom: false
                        }
                    };
                    inst._isStickySupport = true;

                    inst._updateStyles(inst._options);

                    assert.equal(template(inst), '<div class="controls-StickyHeader controls_scroll_theme-default controls-StickyHeader__background_default controls-StickyHeader_position" style="top: 0px;">' +
                        '<div data-qa="StickyHeader__shadow-top" class="controls-Scroll__shadow controls-StickyHeader__shadow-top controls-Scroll__shadow_horizontal ws-invisible"></div>' +
                        '<div class="controls-StickyHeader__observationTargetTop" style="top: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetLeft" style="left: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetRight" style="right: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetBottomLeft" style="bottom: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetBottomRight" style="right: -2px;"></div>' +
                        '<div data-qa="StickyHeader__shadow-bottom" class="controls-Scroll__shadow controls-StickyHeader__shadow-bottom controls-Scroll__shadow_horizontal ws-hidden"></div>' +
                        '</div>');
                });

                it('Move the bottom', function () {
                    inst._options.position = {vertical: 'bottom'};
                    inst._options.theme = 'default';
                    inst._options.content = function () {
                        return ''
                    };
                    inst._scrollState = {
                        hasUnrenderedContent: {
                            top: false,
                            bottom: false
                        }
                    };
                    inst._isStickySupport = true;

                    inst._updateStyles(inst._options);

                    assert.equal(template(inst), '<div class="controls-StickyHeader controls_scroll_theme-default controls-StickyHeader__background_default controls-StickyHeader_position" style="bottom: 0px;">' +
                        '<div data-qa="StickyHeader__shadow-top" class="controls-Scroll__shadow controls-StickyHeader__shadow-top controls-Scroll__shadow_horizontal ws-invisible"></div>' +
                        '<div class="controls-StickyHeader__observationTargetTop" style="top: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetLeft" style="left: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetRight" style="right: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetBottomLeft" style="bottom: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetBottomRight" style="right: -2px;"></div>' +
                        '<div data-qa="StickyHeader__shadow-bottom" class="controls-Scroll__shadow controls-StickyHeader__shadow-bottom controls-Scroll__shadow_horizontal ws-hidden"></div>' +
                        '</div>');
                });

                it('Added content', function () {
                    inst._options.content = TemplateUtil.content;
                    inst._options.theme = 'default';
                    inst._scrollState = {
                        hasUnrenderedContent: {
                            top: false,
                            bottom: false
                        }
                    };
                    inst._isStickySupport = true;

                    inst._updateStyles(inst._options);

                    assert.equal(template(inst), '<div class="controls-StickyHeader controls_scroll_theme-default controls-StickyHeader__background_default controls-StickyHeader_position" style="top: 0px;">' +
                        '<div data-qa="StickyHeader__shadow-top" class="controls-Scroll__shadow controls-StickyHeader__shadow-top controls-Scroll__shadow_horizontal ws-invisible"></div>' +
                        '<div class="controls-StickyHeader__observationTargetTop" style="top: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetLeft" style="left: -2px;"></div>' +
                        '<div class="controls-StickyHeader__content">testing the template</div>' +
                        '<div class="controls-StickyHeader__observationTargetRight" style="right: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetBottomLeft" style="bottom: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetBottomRight" style="right: -2px;"></div>' +
                        '<div data-qa="StickyHeader__shadow-bottom" class="controls-Scroll__shadow controls-StickyHeader__shadow-bottom controls-Scroll__shadow_horizontal ws-hidden"></div>' +
                        '</div>');
                });

                it('The header is fixed, but there should be no shadow', function () {
                    inst._scrollState.verticalPosition = 'end';
                    inst._isStickyShadowVisible = true;
                    inst._isShadowVisibleByController = {
                        top: StickyHeaderUtils.SHADOW_VISIBILITY_BY_CONTROLLER.auto,
                        bottom: StickyHeaderUtils.SHADOW_VISIBILITY_BY_CONTROLLER.auto
                    };
                    inst._model.fixedPosition = 'top';
                    inst._options.fixedZIndex = 1;
                    inst._options.content = TemplateUtil.content;
                    inst._options.theme = 'default';
                    inst._scrollState.hasUnrenderedContent = {
                        top: true,
                        bottom: true
                    };
                    inst._isStickySupport = true;
                    inst._resetGapFixClass = sinon.fake();
                    inst._updateStyles(inst._options);

                    assert.equal(template(inst), '<div class="controls-StickyHeader controls_scroll_theme-default controls-StickyHeader__background_default controls-StickyHeader_position" style="top: 0px;z-index: 1;">' +
                        '<div data-qa="StickyHeader__shadow-top" class="controls-Scroll__shadow controls-StickyHeader__shadow-top controls-Scroll__shadow_horizontal ws-invisible"></div>' +
                        '<div class="controls-StickyHeader__observationTargetTop" style="top: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetLeft" style="left: -2px;"></div>' +
                        '<div class="controls-StickyHeader__content">testing the template</div>' +
                        '<div class="controls-StickyHeader__observationTargetRight" style="right: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetBottomLeft" style="bottom: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetBottomRight" style="right: -2px;"></div>' +
                        '<div data-qa="StickyHeader__shadow-bottom" class="controls-Scroll__shadow controls-StickyHeader__shadow-bottom controls-Scroll__shadow_horizontal"></div>' +
                        '</div>');
                });

                it('The header is fixed, the shadow should be', function () {
                    inst._scrollState.verticalPosition = 'start';
                    inst._isStickyShadowVisible = true;
                    inst._isShadowVisibleByController = {
                        top: StickyHeaderUtils.SHADOW_VISIBILITY_BY_CONTROLLER.auto,
                        bottom: StickyHeaderUtils.SHADOW_VISIBILITY_BY_CONTROLLER.auto
                    };
                    inst._scrollState.hasUnrenderedContent = {
                        top: true,
                        bottom: true
                    };
                    inst._isStickySupport = true;
                    inst._model.fixedPosition = 'bottom';
                    inst._options.fixedZIndex = 2;
                    inst._options.position = {vertical: 'bottom'};
                    inst._options.content = TemplateUtil.content;
                    inst._options.theme = 'default';
                    inst._resetGapFixClass = sinon.fake();
                    inst._updateStyles(inst._options);

                    assert.equal(template(inst), '<div class="controls-StickyHeader controls_scroll_theme-default controls-StickyHeader__background_default controls-StickyHeader_position" style="bottom: 0px;z-index: 2;">' +
                        '<div data-qa="StickyHeader__shadow-top" class="controls-Scroll__shadow controls-StickyHeader__shadow-top controls-Scroll__shadow_horizontal"></div>' +
                        '<div class="controls-StickyHeader__observationTargetTop" style="top: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetLeft" style="left: -2px;"></div>' +
                        '<div class="controls-StickyHeader__content">testing the template</div>' +
                        '<div class="controls-StickyHeader__observationTargetRight" style="right: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetBottomLeft" style="bottom: -2px;"></div>' +
                        '<div class="controls-StickyHeader__observationTargetBottomRight" style="right: -2px;"></div>' +
                        '<div data-qa="StickyHeader__shadow-bottom" class="controls-Scroll__shadow controls-StickyHeader__shadow-bottom controls-Scroll__shadow_horizontal ws-hidden"></div>' +
                        '</div>');
                });
            });
        });
    }
);
