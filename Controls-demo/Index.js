define("Controls-demo/Index", ["require", "exports", "tslib", "UI/Base", "Application/Env", "Core/Deferred", "Env/Env", "Router/router", "UICommon/Deps", "WasabyLoader/ModulesLoader", "wml!Controls-demo/Index"], function (require, exports, tslib_1, Base_1, Env_1, Deferred, Env_2, router_1, Deps_1, ModulesLoader_1, template) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDataToRender = void 0;
    var default_1 = /** @class */ (function (_super) {
        tslib_1.__extends(default_1, _super);
        function default_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._template = template;
            return _this;
        }
        default_1.prototype._beforeMount = function (options) {
            var _this = this;
            this._links = this._prepareLinks(options);
            this._title = this._getTitle();
            this._settigsController = {
                getSettings: function (ids) {
                    var storage = window && JSON.parse(window.localStorage.getItem('controlSettingsStorage')) || {};
                    var controlId = ids[0];
                    if (!storage[controlId]) {
                        storage[controlId] = 1000;
                        if (controlId.indexOf('master') > -1) {
                            storage[controlId] = undefined;
                        }
                        if (controlId.indexOf('scrollContainerWheelEventHappened') > -1) {
                            // Уберем скроллбар с демок
                            storage[controlId] = true;
                        }
                    }
                    return (new Deferred()).callback(storage);
                },
                setSettings: function (settings) {
                    window.localStorage.setItem('controlSettingsStorage', JSON.stringify(settings));
                    // 'Сохранили панель с шириной ' + settings['123']
                    // 'Сохранили masterDetail с шириной ' + settings['master111']
                }
            };
            if (Env_1.cookie.get('compatibleMode')) {
                return new Promise(function (resolve, reject) {
                    require([
                        'Core/helpers/Hcontrol/makeInstanceCompatible',
                        'Lib/Control/LayerCompatible/LayerCompatible'
                    ], function (makeInstanceCompatible, LayerCompatible) {
                        makeInstanceCompatible(_this);
                        LayerCompatible.load([], true, false);
                        resolve();
                    }, reject);
                });
            }
        };
        default_1.prototype._afterMount = function () {
            if (window.clearSettinngStorage !== false) {
                window.localStorage.setItem('controlSettingsStorage', JSON.stringify({}));
            }
            // активация системы фокусов
            if (!Env_2.detection.isMobilePlatform) {
                this.activate();
            }
        };
        default_1.prototype._prepareLinks = function (options) {
            var fontsArray = [
                Env_2.constants.tensorFont,
                Env_2.constants.tensorFontBold,
                Env_2.constants.cbucIcons,
                Env_2.constants.cbucIcons24
            ];
            var links = [];
            for (var i = 0; i < fontsArray.length; i++) {
                links.push({
                    rel: 'preload', as: 'font', href: fontsArray[i],
                    type: 'font/woff2', crossorigin: 'anonymous'
                });
            }
            links.push({
                rel: 'shortcut icon',
                href: options.resourceRoot + 'Controls-demo/wasaby.ico?v=1',
                type: 'image/x-icon'
            });
            return links;
        };
        default_1.prototype._getPopupHeaderTheme = function (theme) {
            var retailHead = 'retail__';
            if (theme.indexOf(retailHead) !== -1) {
                return retailHead + 'header-' + theme.slice(retailHead.length);
            }
            return theme;
        };
        default_1.prototype._getTitle = function () {
            var splitter = '%2F';
            var index = Env_1.location.pathname.lastIndexOf(splitter);
            if (index > -1) {
                var splittedName = Env_1.location.pathname.slice(index + splitter.length)
                    .split('/');
                var controlName = splittedName[0];
                return this._replaceLastChar(controlName);
            }
            return 'Wasaby';
        };
        default_1.prototype._replaceLastChar = function (controlName) {
            if (controlName[controlName.length - 1] === '/') {
                return controlName.slice(0, -1);
            }
            return controlName;
        };
        return default_1;
    }(Base_1.Control));
    exports.default = default_1;
    // в этом методе сделаем предзагрузку модуля демки,
    // чтобы исключить асинхронный _beforeMount в Controls-demo/RootTemplateWrapper
    function getDataToRender(url) {
        var data = router_1.MaskResolver.calculateUrlParams('app/:app', url);
        if (data.app) {
            return ModulesLoader_1.loadAsync(data.app)
                .then(function () { return Deps_1.addPageDeps([data.app]); });
        }
    }
    exports.getDataToRender = getDataToRender;
});
