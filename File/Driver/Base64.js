define("File/Driver/Base64", ["require", "exports", "File/utils/b64toBlob", "File/Driver/Blob"], function (require, exports, base64toblob, BlobDriver) {
    "use strict";
    /**
     * @public
     * @class File/Driver/Base64
     * @author Ибрагимов А.А
     * @description Файловый драйвер для скачивания файлов в кодировке base64
     * <pre>
     * require(['File/Driver/Base64'], function(Base64Driver) {
     *    var base64_text = "wqtXZWVrcyBvZiBjb2RpbmcgY2FuIHNhdmUgeW91IGhvdXJzIG9mIHBsYW5uaW5nwrssDQogdW5rbm93biBhcnRpc3Qu";
     *    new Base64Driver(base64_text).download({
     *       name: 'phrase.txt',
     *       contentType: 'text/plain'
     *     });
     * });
     * </pre>
     */
    var Base64 = /** @class */ (function () {
        /**
         * @constructor
         * @param {String} data Строка в формате base64
         */
        function Base64(data) {
            if (data.indexOf('data:') === -1) {
                this.base64Data = data;
                return;
            }
            this.contentType = data.substring(data.indexOf(':') + 1, data.indexOf(';'));
            this.base64Data = data.substring(data.indexOf(',') + 1);
        }
        /**
         * @public
         * @method
         * @param {DownloadOptions} oprions Параметры загрузки
         * @description Начинает загрузку файла
         */
        /**
         * @typedef {Object} DownloadOptions
         * @property {String} name имя файла
         * @property {String} contentType тип файла
         * @remark Игнорируется при загрузке URL
         */
        Base64.prototype.download = function (options) {
            var type = (options && options['contentType']) ? options['contentType'] : this.contentType;
            var blob = base64toblob(this.base64Data, type);
            new BlobDriver(blob).download(options);
        };
        return Base64;
    }());
    return Base64;
});
