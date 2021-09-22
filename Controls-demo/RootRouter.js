define("Controls-demo/RootRouter", ["require", "exports", "tslib", "UI/Base", "Application/Env", "wml!Controls-demo/RootRouter"], function (require, exports, tslib_1, Base_1, Env_1, template) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var default_1 = /** @class */ (function (_super) {
        tslib_1.__extends(default_1, _super);
        function default_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._template = template;
            _this.isReloading = false;
            _this.pathName = 'Controls-demo/app/Controls-demo%2FIndexOld';
            _this.sourceUrl = null;
            return _this;
        }
        default_1.prototype._beforeMount = function (options, _, receivedState) {
            var _state = {
                sourceUrl: (receivedState && receivedState.sourceUrl) || options.sourceUrl
            };
            this.sourceUrl = _state.sourceUrl;
            return _state;
        };
        default_1.prototype._afterMount = function () {
            window.reloadDemo = this.reloadDemo.bind(this);
        };
        default_1.prototype._afterUpdate = function () {
            this.isReloading = false;
        };
        default_1.prototype.reload = function () {
            this.isReloading = true;
        };
        default_1.prototype.reloadDemo = function () {
            this.reload();
            if (window.clearSettinngStorage !== false) {
                // При обновлении демки сбрасываем все что лежит в settingsController (задается на application);
                window.localStorage.setItem('controlSettingsStorage', '{}');
            }
        };
        default_1.prototype._isMenuButtonVisible = function () {
            return Env_1.location.pathname !== this._options.appRoot + this.pathName;
        };
        default_1.prototype.backClickHdl = function () {
            window.history.back();
        };
        default_1.prototype.goHomeHandler = function () {
            window.location = this._options.appRoot + this.pathName;
        };
        default_1._styles = ['Controls-demo/RootRouter'];
        return default_1;
    }(Base_1.Control));
    exports.default = default_1;
});
