define("Controls/Application", ["require", "exports", "tslib", "UI/Base", "UI/State", "wml!Controls/Application/Page", "Application/Page", "Core/BodyClasses", "Core/helpers/getResourceUrl", "Env/Env", "Env/Touch", "Env/Event", "Vdom/Vdom", "UI/HotKeys", "Controls/Application/SettingsController", "Controls/popup", "Controls/Pending", "Controls/event", "Controls/dragnDrop", "Application/Env", "css!Controls/Application/oldCss", "css!Controls/application", "css!Controls/dragnDrop", "css!Controls/CommonClasses"], function (require, exports, tslib_1, Base_1, State_1, template, Page_1, cBodyClasses, getResourceUrl, Env_1, Touch_1, Event_1, Vdom_1, HotKeys_1, SettingsController_1, popup_1, Pending_1, event_1, dragnDrop_1, Env_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** Динамические классы для body */
    var BODY_CLASSES = {
        /* eslint-disable */
        /**
         * @type {String} Property controls whether or not touch devices use momentum-based scrolling for innerscrollable areas.
         * @private
         */
        /* eslint-enable */
        scrollingClass: Env_1.detection.isMobileIOS ? 'controls-Scroll_webkitOverflowScrollingTouch' : '',
        fromOptions: '',
        themeClass: '',
        bodyThemeClass: ''
    };
    var BODY_CLASSES_STATE = {
        touch: false,
        drag: false,
        hover: false,
        adaptive: false
    };
    var Application = /** @class */ (function (_super) {
        tslib_1.__extends(Application, _super);
        function Application() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._template = template;
            _this._bodyClasses = tslib_1.__assign({}, BODY_CLASSES);
            _this._bodyClassesState = tslib_1.__assign({}, BODY_CLASSES_STATE);
            return _this;
        }
        // start hooks
        Application.prototype._beforeMount = function (options) {
            var _this = this;
            this._checkDeprecatedOptions(options);
            var appData = State_1.AppData.getAppData();
            this.RUMEnabled = Env_2.getConfig('RUMEnabled') || false;
            this.pageName = options.pageName || appData.pageName || '';
            this.resourceRoot = options.resourceRoot || Env_1.constants.resourceRoot;
            // Чтобы при загрузке слоя совместимости, понять нужно ли грузить провайдеры(extensions, userInfo, rights),
            // положим опцию из Application в constants. Иначе придется использовать глобальную переменную.
            // TODO: Удалить этот код отсюда по задае:
            // https://online.sbis.ru/opendoc.html?guid=3ed5ebc1-0b55-41d5-a8fa-921ad24aeec3
            Env_1.constants.loadDataProviders = options.loadDataProviders;
            if (Env_1.constants.isBrowserPlatform) {
                /* eslint-disable */
                if (document.getElementsByClassName('head-custom-block').length > 0) {
                    this.head = undefined;
                }
                /* eslint-enable */
            }
            this._initBodyClasses(options);
            this._updateTouchClass();
            this._updateThemeClass(options);
            this._updateFromOptionsClass(options);
            SettingsController_1.setController(options.settingsController);
            this._createDragnDropController();
            this._createGlobalPopup();
            this._createPopupManager(options);
            this._createRegisters();
            this._createTouchDetector();
            var pendingOptions = {
                notifyHandler: function (eventName, args) {
                    return _this._notify(eventName, args, { bubbling: true });
                }
            };
            this._pendingController = new Pending_1.PendingClass(pendingOptions);
        };
        Application.prototype._afterMount = function (options) {
            // Подписка через viewPort дает полную информацию про ресайз страницы, на мобильных устройствах
            // сообщает так же про изменение экрана после показа клавиатуры и/или зуме страницы.
            // Подписка на body стреляет не всегда. в 2100 включаю только для 13ios, в перспективе можно включить
            // везде, где есть visualViewport
            var _this = this;
            if (Application._isIOS13()) {
                window.visualViewport.addEventListener('resize', this._resizePage.bind(this));
                window.addEventListener('orientationchange', this._orientationChange);
            }
            window.addEventListener('resize', this._resizePage.bind(this));
            window.document.addEventListener('scroll', this._scrollPage.bind(this));
            window.document.addEventListener('keydown', function (event) {
                _this._keyDownHandler(new Vdom_1.SyntheticEvent(event));
            });
            var channelPopupManager = Event_1.Bus.channel('popupManager');
            channelPopupManager.subscribe('managerPopupCreated', this._popupCreatedHandler, this);
            channelPopupManager.subscribe('managerPopupDestroyed', this._popupDestroyedHandler, this);
            channelPopupManager.subscribe('managerPopupBeforeDestroyed', this._popupBeforeDestroyedHandler, this);
            this._globalPopup.registerGlobalPopup();
            this._popupManager.init();
            if (this._options.isAdaptive) {
                this._fixIOSHtmlScrollBug();
            }
        };
        Application.prototype._beforeUpdate = function (options) {
            this._updateTouchClass();
            this._updateThemeClass(options);
            this._updateFromOptionsClass(options);
        };
        Application.prototype._afterUpdate = function (oldOptions) {
            /* eslint-disable */
            var elements = document.getElementsByClassName('head-title-tag');
            /* eslint-enable */
            if (elements.length === 1) {
                // Chrome на ios при вызове History.replaceState, устанавливает в title текущий http адрес.
                // Если после загрузки установить title, который уже был, то он не обновится, и в заголовке вкладки
                // останется http адрес. Поэтому сначала сбросим title, а затем положим туда нужное значение.
                if (Env_1.detection.isMobileIOS && Env_1.detection.chrome && oldOptions.title === this._options.title) {
                    elements[0].textContent = '';
                }
                elements[0].textContent = this._options.title;
            }
            this._popupManager.updateOptions(this._options.popupHeaderTheme);
        };
        Application.prototype._beforeUnmount = function () {
            for (var register in this._registers) {
                if (this._registers.hasOwnProperty(register)) {
                    this._registers[register].destroy();
                }
            }
            var channelPopupManager = Event_1.Bus.channel('popupManager');
            channelPopupManager.unsubscribe('managerPopupCreated', this._popupCreatedHandler, this);
            channelPopupManager.unsubscribe('managerPopupDestroyed', this._popupDestroyedHandler, this);
            channelPopupManager.unsubscribe('managerPopupBeforeDestroyed', this._popupBeforeDestroyedHandler, this);
            this._globalPopup.registerGlobalPopupEmpty();
            this._popupManager.destroy();
            this._dragnDropController.destroy();
        };
        // end hooks
        // start Handlers
        Application.prototype._scrollPage = function (e) {
            this._registers.scroll.start(e);
            this._popupManager.eventHandler('pageScrolled', []);
        };
        Application.prototype._resizeBody = function (e) {
            if (!Application._isIOS13()) {
                this._resizePage(e);
            }
        };
        Application.prototype._resizePage = function (e) {
            this._registers.controlResize.start(e);
            this._popupManager.eventHandler('popupResizeOuter', []);
        };
        Application.prototype._mousedownPage = function (e) {
            this._registers.mousedown.start(e);
            this._popupManager.mouseDownHandler(e);
        };
        Application.prototype._mousemovePage = function (e) {
            this._registers.mousemove.start(e);
            this._updateTouchClass();
        };
        Application.prototype._mouseupPage = function (e) {
            this._registers.mouseup.start(e);
        };
        Application.prototype._touchmovePage = function (e) {
            this._registers.touchmove.start(e);
        };
        Application.prototype._touchendPage = function (e) {
            this._registers.touchend.start(e);
        };
        Application.prototype._mouseleavePage = function (e) {
            /* eslint-disable */
            /**
             * Перемещение элементов на странице происходит по событию mousemove. Браузер генерирует его исходя из
             * доступных ресурсов, и с дополнительными оптимизациями, чтобы не перегружать систему. Поэтому событие не происходит
             * на каждое попиксельное смещение мыши. Между двумя соседними событиями, мышь проходит некоторое расстояние.
             * Чем быстрее перемещается мышь, тем больше оно будет.
             * Событие не происход, когда мышь покидает граници экрана. Из-за этого, элементы не могут быть перемещены в плотную к ней.
             * В качестве решения, генерируем событие mousemove, на момент ухода мыши за граници экрана.
             * Демо: https://jsfiddle.net/q7rez3v5/
             */
            /* eslint-enable */
            this._registers.mousemove.start(e);
        };
        Application.prototype._touchStartPage = function () {
            this._updateTouchClass();
        };
        Application.prototype._keyPressHandler = function (event) {
            if (this._isPopupShow) {
                if (Env_1.constants.browser.safari) {
                    // Need to prevent default behaviour if popup is opened
                    // because safari escapes fullscreen mode on 'ESC' pressed
                    // TODO https://online.sbis.ru/opendoc.html?guid=5d3fdab0-6a25-41a1-8018-a68a034e14d9
                    if (event.nativeEvent && event.nativeEvent.keyCode === 27) {
                        event.preventDefault();
                    }
                }
            }
        };
        Application.prototype._keyDownHandler = function (event) {
            HotKeys_1.dispatcherHandler(event);
        };
        Application.prototype._suggestStateChangedHandler = function (event, state) {
            this._isSuggestShow = state;
            this._updateScrollingClass();
        };
        Application.prototype._dragStartHandler = function () {
            this._bodyClassesState.drag = true;
            this._updateTouchClass();
        };
        Application.prototype._dragEndHandler = function () {
            this._bodyClassesState.drag = false;
            this._updateTouchClass();
        };
        /* end Handlers */
        /**
         * Метод добавит к информации для Body API данные о классах типа ws-is-touch | ws-is-no-touch
         * Тоесть, о взаимоисключающих классах. Их наличие регулируется логическим флагом в объекте this._bodyClassesState
         * @param classesToDelete
         * @param classesToAdd
         * @private
         */
        Application.prototype._prepareDataForBodyAPI = function (classesToDelete, classesToAdd) {
            var _this = this;
            if (classesToDelete === void 0) { classesToDelete = []; }
            if (classesToAdd === void 0) { classesToAdd = []; }
            var classToAdd;
            var classToDelete;
            Object.keys(this._bodyClassesState).forEach(function (key) {
                classToAdd = "ws-is-" + (_this._bodyClassesState[key] ? '' : 'no-') + key;
                classToDelete = "ws-is-" + (!_this._bodyClassesState[key] ? '' : 'no-') + key;
                if (!classesToAdd.includes(classToAdd)) {
                    classesToAdd.push(classToAdd);
                }
                if (!classesToDelete.includes(classToDelete)) {
                    classesToDelete.push(classToDelete);
                }
            });
        };
        /** Задаем классы для body, которые не будут меняться */
        Application.prototype._initBodyClasses = function (cfg) {
            this._initIsAdaptiveClass(cfg);
            var BodyAPI = Page_1.Body.getInstance();
            var classesToDelete = [];
            // Эти классы вешаются в двух местах. Разница в том, что BodyClasses всегда возвращает один и тот же класс,
            // а TouchDetector реагирует на изменение состояния.
            // Поэтому в Application оставим только класс от TouchDetector
            var classesToAdd = cBodyClasses()
                .replace('ws-is-touch', '')
                .replace('ws-is-no-touch', '')
                .split(' ')
                .concat(['zIndex-context'])
                .filter(Application._isExist);
            for (var key in this._bodyClasses) {
                if (this._bodyClasses.hasOwnProperty(key)) {
                    if (Application._isExist(this._bodyClasses[key])) {
                        this._bodyClasses[key]
                            .split(' ')
                            .forEach(function (_class) { return classesToAdd.push(_class); });
                    }
                }
            }
            this._prepareDataForBodyAPI(classesToDelete, classesToAdd);
            BodyAPI.replaceClasses(classesToDelete, classesToAdd);
        };
        Application.prototype._initIsAdaptiveClass = function (cfg) {
            if (cfg.isAdaptive) {
                Page_1.Head.getInstance().createTag('meta', {
                    name: 'viewport',
                    content: 'width=device-width, initial-scale=1.0, user-scalable=no'
                });
                this._bodyClassesState.adaptive = true;
                // Подписка на 'touchmove' необходима для отключения ресайза в адаптивном режиме.
                // https://stackoverflow.com/questions/37808180/disable-viewport-zooming-ios-10-safari
                if (Env_1.constants.isBrowserPlatform) {
                    document.addEventListener('touchmove', function (event) {
                        // event.scale === undefined в эмуляторе.
                        if (event.scale !== undefined && event.scale !== 1) {
                            event.preventDefault();
                        }
                    }, { passive: false });
                }
            }
            else {
                this._bodyClassesState.adaptive = false;
            }
        };
        Application.prototype._updateBodyClasses = function (updated) {
            var BodyAPI = Page_1.Body.getInstance();
            var bodyClassesToUpdate = updated || this._bodyClasses;
            var classesToDelete = [];
            var classesToAdd = [];
            for (var key in bodyClassesToUpdate) {
                if (bodyClassesToUpdate.hasOwnProperty(key)) {
                    if (bodyClassesToUpdate[key] === this._bodyClasses[key]) {
                        continue;
                    }
                    classesToAdd = classesToAdd.concat(bodyClassesToUpdate[key].split(' ').filter(Application._isExist));
                    classesToDelete = classesToDelete.concat(this._bodyClasses[key].split(' ').filter(Application._isExist));
                    this._bodyClasses[key] = bodyClassesToUpdate[key];
                }
            }
            classesToDelete = classesToDelete.filter(function (value) {
                return !classesToAdd.includes(value);
            });
            this._prepareDataForBodyAPI(classesToDelete, classesToAdd);
            if (classesToAdd.length || classesToDelete.length) {
                BodyAPI.replaceClasses(classesToDelete, classesToAdd);
            }
        };
        Application.prototype._updateFromOptionsClass = function (options) {
            this._updateBodyClasses({
                fromOptions: options.bodyClass || ''
            });
        };
        Application.prototype._updateScrollingClass = function () {
            var scrollingClass;
            if (Env_1.detection.isMobileIOS) {
                if (this._isPopupShow || this._isSuggestShow) {
                    scrollingClass = 'controls-Scroll_webkitOverflowScrollingAuto';
                }
                else {
                    scrollingClass = 'controls-Scroll_webkitOverflowScrollingTouch';
                }
            }
            else {
                scrollingClass = '';
            }
            this._updateBodyClasses({
                scrollingClass: scrollingClass
            });
        };
        Application.prototype._updateTouchClass = function (updated) {
            if (updated === void 0) { updated = {}; }
            // Данный метод вызывается до построения вёрстки, и при первой отрисовке еще нет _children (это нормально)
            // поэтому сами детектим touch с помощью compatibility
            if (this._touchController) {
                this._bodyClassesState.touch = this._touchController.isTouch();
            }
            else {
                this._bodyClassesState.touch = !!Env_1.compatibility.touch;
            }
            this._bodyClassesState.hover = this._isHover();
            this._updateBodyClasses(updated);
        };
        Application.prototype._updateThemeClass = function (options) {
            this._updateBodyClasses({
                themeClass: 'Application-body',
                bodyThemeClass: "controls_theme-" + options.theme
            });
        };
        /** ************************************************** */
        Application.prototype._checkDeprecatedOptions = function (opts) {
            /* eslint-disable */
            if (opts.compat) {
                Env_1.IoC.resolve('ILogger').warn('Опция compat является устаревшей. Для вставки старых контролов внутри VDOM-ного окружения ' +
                    'используйте один из способов, описанных в этой статье: https://wi.sbis.ru/doc/platform/developmentapl/ws3/compound-wasaby/');
            }
            /* eslint-enable */
        };
        // start Registrars
        Application.prototype._createRegisters = function () {
            var _this = this;
            var registers = ['scroll', 'controlResize', 'mousemove', 'mouseup', 'touchmove', 'touchend', 'mousedown'];
            this._registers = {};
            registers.forEach(function (register) {
                _this._registers[register] = new event_1.RegisterClass({ register: register });
            });
        };
        Application.prototype._registerHandler = function (event, registerType, component, callback, config) {
            if (this._registers[registerType]) {
                this._registers[registerType].register(event, registerType, component, callback, config);
                return;
            }
            this._dragnDropController.registerHandler(event, registerType, component, callback, config);
        };
        Application.prototype._unregisterHandler = function (event, registerType, component, config) {
            if (this._registers[registerType]) {
                this._registers[registerType].unregister(event, registerType, component, config);
                return;
            }
            this._dragnDropController.unregisterHandler(event, registerType, component, config);
        };
        // end Registrar
        // start create helpers
        Application.prototype._createGlobalPopup = function () {
            this._globalPopup = new popup_1.GlobalController();
        };
        Application.prototype._createPopupManager = function (cfg) {
            this._popupManager = new popup_1.ManagerClass(cfg);
        };
        Application.prototype._createDragnDropController = function () {
            this._dragnDropController = new dragnDrop_1.ControllerClass();
        };
        Application.prototype._createTouchDetector = function () {
            this._touchController = Touch_1.TouchDetect.getInstance();
        };
        // end create helpers
        // start dragHandlers
        Application.prototype._documentDragStart = function (event, dragObject) {
            this._dragnDropController.documentDragStart(dragObject);
            this._dragStartHandler();
        };
        Application.prototype._documentDragEnd = function (event, dragObject) {
            this._dragnDropController.documentDragEnd(dragObject);
            this._dragEndHandler();
        };
        Application.prototype._updateDraggingTemplate = function (event, draggingTemplateOptions, draggingTemplate) {
            this._dragnDropController.updateDraggingTemplate(draggingTemplateOptions, draggingTemplate);
        };
        Application.prototype._removeDraggingTemplate = function () {
            this._dragnDropController.removeDraggingTemplate();
        };
        // end dragHandlers
        // popupHandlers
        Application.prototype._popupCreatedHandler = function () {
            this._isPopupShow = true;
            this._updateScrollingClass();
        };
        Application.prototype._popupDestroyedHandler = function (event, element, popupItems) {
            if (popupItems.getCount() === 0) {
                this._isPopupShow = false;
            }
            this._updateScrollingClass();
        };
        Application.prototype._popupBeforeDestroyedHandler = function (event, popupCfg, popupList, popupContainer) {
            this._globalPopup.popupBeforeDestroyedHandler(event, popupCfg, popupList, popupContainer);
        };
        Application.prototype._openInfoBoxHandler = function (event, config, withDelay) {
            this._globalPopup.openInfoBoxHandler(event, config, withDelay);
        };
        Application.prototype._openDialogHandler = function (event, templ, templateOptions, opener) {
            return this._globalPopup.openDialogHandler(event, templ, templateOptions, opener);
        };
        Application.prototype._closeInfoBoxHandler = function (event, withDelay) {
            this._globalPopup.closeInfoBoxHandler(event, withDelay);
        };
        Application.prototype._forceCloseInfoBoxHandler = function () {
            this._globalPopup.forceCloseInfoBoxHandler();
        };
        Application.prototype._openPreviewerHandler = function (event, config, type) {
            return this._globalPopup.openPreviewerHandler(event, config, type);
        };
        Application.prototype._cancelPreviewerHandler = function (event, action) {
            this._globalPopup.cancelPreviewerHandler(event, action);
        };
        Application.prototype._isPreviewerOpenedHandler = function (event) {
            return this._globalPopup.isPreviewerOpenedHandler(event);
        };
        Application.prototype._closePreviewerHandler = function (event, type) {
            this._globalPopup.closePreviewerHandler(event, type);
        };
        Application.prototype._popupEventHandler = function (event, action) {
            var args = Array.prototype.slice.call(arguments, 2);
            this._popupManager.eventHandler.apply(this._popupManager, [action, args]);
        };
        Application.prototype._registerPendingHandler = function (event, promise, config) {
            event.stopPropagation();
            this._pendingController.registerPending(promise, config);
        };
        Application.prototype._finishPendingHandler = function (event, forceFinishValue, root) {
            event.stopPropagation();
            return this._pendingController.finishPendingOperations(forceFinishValue, root);
        };
        Application.prototype._cancelFinishingPendingHandler = function (event, root) {
            event.stopPropagation();
            this._pendingController.cancelFinishingPending(root);
        };
        /**
         * Решения взято отсюда
         * https://stackoverflow.com/questions/62717621/white-space-at-page-bottom-after-device-rotation-in-ios-safari
         * @protected
         */
        Application.prototype._orientationChange = function () {
            document.documentElement.style.height = 'initial';
            setTimeout(function () {
                document.documentElement.style.height = '100%';
            }, 500);
        };
        /**
         * TODO: experimental for fix safari bug with body scrolling
         * https://online.sbis.ru/opendoc.html?guid=8cf427e6-620c-4813-8935-d96f3c6452a8
         * @private
         */
        Application.prototype._fixIOSHtmlScrollBug = function () {
            if (Env_1.detection.isMobileSafari) {
                document.documentElement.style.overflow = 'hidden';
            }
        };
        Application.prototype._getResourceUrl = function (str) {
            return getResourceUrl(str);
        };
        Application.prototype._isHover = function () {
            return !this._bodyClassesState.touch && !this._bodyClassesState.drag;
        };
        Application._isIOS13 = function () {
            var oldIosVersion = 12;
            return Env_1.detection.isMobileIOS && Env_1.detection.IOSVersion > oldIosVersion;
        };
        Application._isExist = function (value) {
            return !!value;
        };
        Application.getDefaultOptions = function () {
            return {
                title: '',
                pagingVisible: false
            };
        };
        return Application;
    }(Base_1.Control));
    exports.default = Application;
    Object.defineProperty(Application, 'defaultProps', {
        enumerable: true,
        configurable: true,
        get: function () {
            return Application.getDefaultOptions();
        }
    });
});
