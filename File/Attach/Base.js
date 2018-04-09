define("File/Attach/Base", ["require", "exports", "Core/Abstract", "Core/core-simpleExtend", "Core/Deferred", "Core/ParallelDeferred", "File/Attach/Container/Getter", "File/Attach/Container/Source", "Core/moduleStubs"], function (require, exports, Abstract, CoreExtend, Deferred, ParallelDeferred, GetterContainer, SourceContainer, moduleStubs) {
    "use strict";
    var UPLOADER_LINK = "File/Attach/Uploader";
    var EMPTY_SELECTED_ERROR = rk("Нет выбранных ресурсов для загрузки");
    /**
     * Класс, реализующий выбор и загрузку файлов через разные источники данных
     * <br/>
     * Выбор и загрузка ресурсов:
     * <pre>
     *   var attach = new Base({
     *      multiSelect: false,
     *      fileProperty: "Файл"
     *   });
     *
     *   var scanner = new ScannerGetter();
     *   var fs = new FileSystem();
     *   attach.registerGetter(scanner);
     *   attach.registerGetter(fs);
     *
     *   var sourceOption = {
     *      endpoint: {
     *          contract: "simple"
     *      },
     *      binding: {
     *          create: "ЗагрузитьВНикуда"
     *      },
     *      idProperty: "link"
     *   };
     *   attach.registerSource(new BL_SbisPluginSource(sourceOption));
     *   attach.registerSource(new SbisFileSource(sourceOption));
     *
     *   self.getChildControlByName("fsBtn").subscribe("onActivated", function(){
     *      attach.choose(fs.getType());
     *   });
     *   self.getChildControlByName("scanBtn").subscribe("onActivated", function(){
     *      attach.choose(scanner.getType());
     *   });
     *   self.getChildControlByName("uploadBtn").subscribe("onActivated", function(){
     *      attach.upload({
     *          // Дополнительные мета-данные для отправки
     *      }).addCallback(function(results){
     *          // вывод результатов загрузки
     *      });
     *   });
     * </pre>
     * @public
     * @class
     * @name File/Attach/Base
     * @extends Core/Abstract
     * @author Заляев А.В.
     */
    var Base = CoreExtend.extend(Abstract, {
        _selectedResources: [],
        _getterContainer: null,
        _sourceContainer: null,
        _uploadHandlers: null,
        _$options: {
            /**
             * @cfg {Boolean} Множественный выбор.
             * * true - результат выбора ресурсов .choose попаддёт во внутренее состояние для загрузки вместе
             * с результатом предыдущих выборок
             * * false - внутренее состояние для загрузки будет содержать только результат последней выборки
             * @name File/Attach/Base#multiSelect
             */
            multiSelect: true,
            /**
             * @cfg {String} Имя параметра, содержащее файл при отправке на сервер
             * @name File/Attach/Base#fileProperty
             */
            fileProperty: "File"
        },
        constructor: function (opt) {
            Base.superclass.constructor.apply(this, arguments);
            this._$options = Object.assign({}, this._$options, opt);
            this._getterContainer = new GetterContainer();
            this._sourceContainer = new SourceContainer();
            this._uploadHandlers = {};
            this._publish('onProgress', 'onWarning', 'onLoadedFolder', 'onChosen', 'onChooseError', 'onLoaded', 'onLoadError', 'onLoadResourceError', 'onLoadedResource');
        },
        /// region IAttacher
        /**
         * Регестрация IResourceGetter, для получения файлов
         * @param {File/IResourceGetter} ResourceGetter
         * @example
         * Регестрация сканера:
         * <pre>
         *    require([
         *    'File/Attach/Base'
         *    'SBIS3.Plugin/File/Extensions/Integration/FileGetter/ScannerGetter'
         *    ], function (Base, ScannerGetter) {
         *       var attach = new Base();
         *       var getter = new ScannerGetter();
         *       attach.registerGetter(getter);
         *       // теперь доступно прикрепление сканов
         *       attach.choose(getter.getType()).addCallback(function(links){ // links: Array<File/LocalFileLink>
         *          ...
         *       });
         *    });
         * </pre>
         * @method
         * @name File/Attach/Base#registerGetter
         * @see File/ResourceGetter/Base
         */
        registerGetter: function (ResourceGetter) {
            this._getterContainer.push(ResourceGetter);
        },
        /**
         * Регистрация источников данных для загрузки определённого типа файла
         * @param {Function} type конструктор обёртки над файлом
         * @param {WS.Data/Source/ISource} source источник данных
         * @example
         * Регестрация источника, умеющего загружать LocalFileLink:
         * <pre>
         *    require([
         *      'File/Attach/Base',
         *      'SBIS3.Plugin/File/Extensions/Integration/Source/BL_SbisPluginSource'
         *    ], function (Base, BL_SbisPluginSource) {
         *       var attach = new Base();
         *       attach.registerSource(new BL_SbisPluginSource({
         *          endpoint: {
         *              contract: "simple"
         *          },
         *          binding: {
         *              create: "ЗагрузитьВНикуда"
         *          },
         *          idProperty: "link"
         *       }));
         *       ...
         *    });
         * </pre>
         * @method
         * @name File/Attach/Base#registerSource
         * @see File/LocalFile
         * @see File/LocalFileLink
         * @see File/HttpFileLink
         * @see WS.Data/Source/ISource
         */
        registerSource: function (type, source) {
            return this._sourceContainer.push(source, type);
        },
        /// endregion
        /// region IDirectInsertFile
        /**
         * Устанавливает ресурсы в список выбранных
         * @param {Array<File/IResource> | File/IResource} files файл или набор устанавливаемых файлов
         * @example
         * Привязка файлов, полученных путём Drag&Drop к Attach для последующей загрузки
         * <pre>
         *    myArea.subscribe("onDrop", function(event, data) {
         *      if (data.file instanceof Blob) {
         *          attach.setSelectedResource(new LocalFile(data.file))
         *      }
         *    });
         * </pre>
         * @method
         * @name File/Attach/Base#setSelectedResource
         * @see File/LocalFile
         * @see File/LocalFileLink
         * @see File/HttpFileLink
         */
        setSelectedResource: function (files) {
            this._selectedResources = Array.isArray(files) ? files : [files];
        },
        /**
         * Очищает набор выбраных ресурсов
         * @void
         * @method
         * @name File/Attach/Base#clearSelectedResource
         */
        clearSelectedResource: function () {
            this._selectedResources = [];
        },
        /**
         * Возвращает набор выбраных ресурсов
         * @return {Array<File/IResource>}
         * @method
         * @name File/Attach/Base#getSelectedResource
         * @see File/LocalFile
         * @see File/LocalFileLink
         * @see File/HttpFileLink
         */
        getSelectedResource: function () {
            return this._selectedResources || [];
        },
        /**
         * Добавляет ресурсы к списку выбранных
         * @return {Array<File/IResource>}
         * @method
         * @name File/Attach/Base#addSelectedResource
         * @see File/LocalFile
         * @see File/LocalFileLink
         * @see File/HttpFileLink
         */
        addSelectedResource: function (files) {
            var fileArray = [];
            if (this._$options.multiSelect) {
                fileArray = this.getSelectedResource();
            }
            this.setSelectedResource(fileArray.concat(files));
        },
        /// endregion
        /// region IUpload
        /**
         * Загрузка выбранных ресурсов.
         * При отсутствии ресурсов во внутреннем состоянии, возвращаеммый Deferred будет завершен ошибкой.
         * @param {*} [meta] Дополнительные мета-данные для отправки. Сигнатура зависит от конечного сервиса загрузки
         * @return {Core/Deferred<Array<WS.Data/Entity/Model | Error>>} Набор, содержащий модели с результатами,
         * либо ошибками загрузки
         * @example
         * Загрузка выбранных сканов:
         * <pre>
         *    require([
         *      'File/Attach/Base',
         *      'SBIS3.Plugin/File/Extensions/Integration/FileGetter/ScannerGetter',
         *      'SBIS3.Plugin/File/Extensions/Integration/Source/BL_SbisPluginSource'
         *    ], function (Base, ScannerGetter, BL_SbisPluginSource) {
         *       var attach = new Base();
         *       attach.registerGetter(new ScannerGetter());
         *       attach.registerSource(new BL_SbisPluginSource({
         *          endpoint: {
         *              contract: "simple"
         *          },
         *          binding: {
         *              create: "ЗагрузитьВНикуда"
         *          },
         *          idProperty: "link"
         *       }));
         *       attach.choose(getter.getType()).addCallback(function(links){ // links: Array<File/LocalFileLink>
         *          attach.upload({
         *              "ИдО": 12345
         *          }).addCallback(function(results){
         *              // вывод результатов загрузки
         *          });;
         *       });
         *    });
         * </pre>
         * @method
         * @name File/Attach/Base#upload
         * @see File/Attach/Base#getSelectedResource
         * @see WS.Data/Entity/Model
         */
        upload: function (meta) {
            /*
             * забираем выбранные файлы себе, очищая набор,
             * чтобы файлы, выбранные после начала upload, не попали в текущую пачку загрузки
             */
            var files = this.getSelectedResource();
            if (!files.length) {
                return Deferred.fail(EMPTY_SELECTED_ERROR);
            }
            this.clearSelectedResource();
            return this._getUploader().addCallback(function (loader) {
                return loader.upload(files, meta);
            });
        },
        /**
         * Асинхронное получение сущности загрузчика ресурсов
         * @return {Core/Deferred<File/Attach/Uploader>}
         * @private
         * @method
         * @name File/Attach/Base#_getUploader
         */
        _getUploader: function () {
            var _this = this;
            if (this._loader) {
                return Deferred.success(this._loader);
            }
            return moduleStubs.require([UPLOADER_LINK]).addCallback(function (modules) {
                var Uploader = modules[0];
                _this._loader = new Uploader(_this._sourceContainer, _this._$options.fileProperty, function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    _this._notify.apply(_this, args);
                });
                return _this._loader;
            });
        },
        /// endregion IUpload,
        /**
         * Метод вызова выбора ресурсов
         * @param {String} getterName Имя модуля {@link File/IResourceGetter}
         * @return {Core/Deferred<Array<File/IResource | Error>>}
         * @example
         * Выбор и загрузка ресурсов:
         * <pre>
         *   var attach = new Base();
         *
         *   var scanner = new ScannerGetter();
         *   var fs = new FileSystem();
         *   attach.registerGetter(scanner);
         *   attach.registerGetter(fs);
         *
         *   var sourceOption = {
         *      endpoint: {
         *          contract: "simple"
         *      },
         *      binding: {
         *          create: "ЗагрузитьВНикуда"
         *      },
         *      idProperty: "link"
         *   };
         *   attach.registerSource(new BL_SbisPluginSource(sourceOption));
         *   attach.registerSource(new SbisFileSource(sourceOption));
         *
         *   self.getChildControlByName("fsBtn").subscribe("onActivated", function(){});
         *      attach.choose(fs.getType());
         *   }
         *   self.getChildControlByName("scanBtn").subscribe("onActivated", function(){});
         *      attach.choose(scanner.getType());
         *   }
         *   self.getChildControlByName("uploadBtn").subscribe("onActivated", function(){});
         *      attach.upload({
         *          // Дополнительные мета-данные для отправки
         *      }).addCallback(function(results){
         *          // вывод результатов загрузки
         *      });;
         *   }
         * </pre>
         * @method
         * @name File/Attach/Base#choose
         * @see File/IResourceGetter#getType
         * @see File/LocalFile
         * @see File/LocalFileLink
         * @see File/HttpFileLink
         */
        choose: function (getterName) {
            var _this = this;
            return this._getterContainer.get(getterName).addCallback(function (getter) {
                return _this._chooseNotify(getter.getFiles());
            }).addCallback(function (files) {
                /* добавляем к ранее сохранёным ресурсам отфильтрованные от ошибок при выборе
                 * они не нужны нам во внутренем состоянии, а пользователь о них будет уведомлен,
                 * т.к. возвращаем что было выбрано в текущей операции
                 */
                _this.addSelectedResource(files.filter(function (f) { return !(f instanceof Error); }));
                return files;
            });
        },
        /**
         * Стреляет событием выбора ресурса и обрабатывает результат от обработчикво
         * @param {Core/Deferred<Array<File/IResource | Error>>} chooseDef
         * @return {Core/Deferred<Array<File/IResource | Error>>}
         * @private
         */
        _chooseNotify: function (chooseDef) {
            var _this = this;
            var length;
            return chooseDef.addCallbacks(function (files) {
                length = files.length;
                var eventResults = files.map(function (file) {
                    var event = file instanceof Error ? 'onChooseError' : "onChosen";
                    return Deferred.callbackWrapper(_this._notify(event, file), function (result) { return Deferred.success(typeof result !== 'undefined' ? result : file); });
                });
                return new ParallelDeferred({
                    steps: eventResults,
                    stopOnFirstError: false
                }).done().getResult();
            }, function (error) {
                _this._notify('onChooseError', error);
                return error;
            }).addCallback(function (results) {
                // ParallelDeferred принимает на вход объект или массив, но возвращает всегда объект
                // поэтому соберём обратно в массив
                results.length = length;
                return Array.prototype.slice.call(results).filter(function (res) { return !!res; });
            });
        },
        /**
         * Возвращает список конструкторов над ресурсами, для которыйх зарегестрирован ISource
         * @return {Array<File/IResourceConstructor>}
         * @see File/LocalFile
         * @see File/LocalFileLink
         * @see File/HttpFileLink
         */
        getRegisteredResource: function () {
            return this._sourceContainer.getRegisteredResource();
        },
        destroy: function () {
            this._getterContainer.destroy();
            this._sourceContainer.destroy();
            this._getterContainer = null;
            this._sourceContainer = null;
            this._loader = null;
            Base.superclass.destroy.apply(this, arguments);
        }
    });
    return Base;
});
/**
 * @event onProgress
 * @name File/Attach/Base#onProgress
 * @param {Core/EventObject} eventObject Дескриптор события.
 * @param {Object} data
 * @param {File/IResource} file
 */
/**
 * @event onWarning
 * @name File/Attach/Base#onWarning
 * @param {Core/EventObject} eventObject Дескриптор события.
 * @param {Object} data
 * @param {File/IResource} file
 */
/**
 * @event onLoadedFolder
 * @name File/Attach/Base#onLoadedFolder
 * @param {Core/EventObject} eventObject Дескриптор события.
 * @param {Object} data
 * @param {File/IResource} file
 */
/**
 * @event onLoaded
 * Событые окончания загрузки ресурсов
 *
 * @name File/Attach/Base#onLoaded
 * @param {Core/EventObject} eventObject Дескриптор события.
 * @param {Array<Error | WS.Data/Entity/Model>} results Массив, содержащий результаты загрузки выбранных ресурсов.
 * Эквивалентно рузультату Deferred'а .upload
 *
 * @see WS.Data/Entity/Model
 */
/**
 * @event onLoadError
 * Событые ошибки начала загрузки.
 *
 * @name File/Attach/Base#onLoadError
 * @param {Core/EventObject} eventObject Дескриптор события.
 * @param {Error} error
 */
/**
 * @event onLoadResourceError
 * Событые ошибки загрузки отдельного ресурса
 *
 * @name File/Attach/Base#onLoadResourceError
 * @param {Core/EventObject} eventObject Дескриптор события.
 * @param {File/IResource} resource загружаемый ресурс
 * @param {Error} error
 *
 * @see File/LocalFile
 * @see File/LocalFileLink
 * @see File/HttpFileLink
 */
/**
 * @event onLoadedResource
 * Событые загрузки отдельного ресурса
 *
 * @name File/Attach/Base#onLoadedResource
 * @param {Core/EventObject} eventObject Дескриптор события.
 * @param {File/IResource} resource загружаемый ресурс
 * @param {Model} model Результат загрузки
 *
 * @see File/LocalFile
 * @see File/LocalFileLink
 * @see File/HttpFileLink
 * @see WS.Data/Entity/Model
 */
/**
 * @event onChosen
 * Событые выбора ресурса
 * <wiTag group="Управление">
 * Обработка результата:
 * При передаче в результат события заначений, приводимых к логическому false, указанный ресурс не попадёт
 * в результат Deferred'a метода choose. При передаче любого другого значения текщуий ресурс будет заменён им
 *
 * @name File/Attach/Base#onChosen
 * @param {Core/EventObject} eventObject Дескриптор события.
 * @param {File/IResource} resource загружаемый ресурс
 * @example
 * Фильтрация файлов по размеру
 * <pre>
 *    attach.subscribe('onChosen', function(event, fileData) {
 *       if (getSize(fileData) > 100 * MB) {
 *          event.setResult(new Error(rk('Превышен допустимый размер загружаемого файла')))
 *       }
 *    });
 * </pre>
 * Предобработка перед загрузкой
 * <pre>
 *    attach.subscribe('onChosen', function(event, fileData) {
 *       var blurImage = addFilter(fileData, "blur", 0.5);
 *       event.setResult(blurImage);
 *    });
 * </pre>
 *
 * @see File/LocalFile
 * @see File/LocalFileLink
 * @see File/HttpFileLink
 */
/**
 * @event onChooseError
 * Событые ошибки выбора ресурса
 *
 * @name File/Attach/Base#onChooseError
 * @param {Core/EventObject} eventObject Дескриптор события.
 * @param {Error} error объект ошибки
 * @example
 * <pre>
 *    attach.subscribe('onChooseError', function(event, error) {
 *        alert(error);
 *    });
 * </pre>
 */
