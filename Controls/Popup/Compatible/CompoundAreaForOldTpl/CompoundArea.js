define('Controls/Popup/Compatible/CompoundAreaForOldTpl/CompoundArea',
   [
      'Core/CompoundContainer',
      'tmpl!Controls/Popup/Compatible/CompoundAreaForOldTpl/CompoundArea',
      'Lib/Mixins/LikeWindowMixin',
      'Core/helpers/Array/findIndex',
      'Core/core-debug',
      'Core/Deferred',
      'Core/IoC',
      'Core/helpers/Function/runDelayed',
      'Core/constants',
      'Core/helpers/Hcontrol/doAutofocus',
      'optional!Deprecated/Controls/DialogRecord/DialogRecord',
      'Core/helpers/additional-helpers',
      'Core/EventBus',
      'Controls/Popup/Manager/ManagerController',
      'WS.Data/Entity/InstantiableMixin',
      'css!Controls/Popup/Compatible/CompoundAreaForOldTpl/CompoundArea'
   ],
   function(
      CompoundContainer,
      template,
      LikeWindowMixin,
      arrayFindIndex,
      coreDebug,
      cDeferred,
      IoC,
      runDelayed,
      CoreConstants,
      doAutofocus,
      DialogRecord,
      addHelpers,
      cEventBus,
      ManagerController,
      InstantiableMixin
   ) {
      function removeOperation(operation, array) {
         var idx = arrayFindIndex(array, function(op) {
            return op === operation;
         });
         array.splice(idx, 1);
      }

      function finishResultOk(result) {
         return !(result instanceof Error || result === false);
      }

      var logger = IoC.resolve('ILogger');
      var allProducedPendingOperations = [];

      /**
       * Слой совместимости для открытия старых шаблонов в новых попапах
      * */
      var CompoundArea = CompoundContainer.extend([
         InstantiableMixin,
         LikeWindowMixin
      ], {
         _template: template,
         _compoundId: undefined,

         _isClosing: false,

         _pending: null,
         _pendingTrace: null,
         _waiting: null,

         _childPendingOperations: [],
         _allChildrenPendingOperation: null,
         _finishPendingQueue: null,
         _isFinishingChildOperations: false,
         _producedPendingOperations: [],

         _isReadOnly: true,

         _beforeMount: function() {
            CompoundArea.superclass._beforeMount.apply(this, arguments);

            this._className = 'controls-CompoundArea';
            if (this._options.type !== 'base') {
               this._className += (this._options.type === 'stack') ? ' ws-float-area' : ' ws-window'; // Старые шаблоны завязаны селекторами на этот класс.
            }
            this._childControlName = this._options.template;

            /**
             * Поведение если вызвали через ENGINE/MiniCard.
             */
            var _this = this;

            if (this._options.hoverTarget) {
               this._options.hoverTarget.on('mouseenter', function() {
                  clearTimeout(_this._hoverTimer);
                  _this._hoverTimer = null;
               });
               this._options.hoverTarget.on('mouseleave', function() {
                  _this._hoverTimer = setTimeout(function() {
                     _this.hide();
                  }, 1000);
               });
            }
         },

         _shouldUpdate: function(popupOptions) {
            if (popupOptions._compoundId !== this._compoundId) {
               this._childConfig = this._options.templateOptions || {};
               this.rebuildChildControl();
               this._compoundId = popupOptions._compoundId;
            }
            return false;
         },

         rebuildChildControl: function() {
            var
               self = this,
               rebuildDeferred;

            self._childConfig._compoundArea = self;
            self.once('onAfterLoad', function() {
               self._setCustomHeader();
               cEventBus.globalChannel().notify('onWindowCreated', self); // StickyHeaderMediator listens for onWindowCreated
            });

            rebuildDeferred = CompoundArea.superclass.rebuildChildControl.apply(self, arguments);
            rebuildDeferred.addCallback(function() {
               if (self._container.length) {
                  self._childControl.setActive(true);
               }
               runDelayed(function() {
                  self._childControl._notifyOnSizeChanged();
                  self.setEnabled(self._options.enabled);
               });
            });

            if (self._options._initCompoundArea) {
               self._options._initCompoundArea(self);
            }

            return rebuildDeferred;
         },

         _afterMount: function(cfg) {
            this._options = cfg;

            // Нам нужно пометить контрол замаунченым для слоя совместимости,
            // чтобы не создавался еще один enviroment для той же ноды

            this.VDOMReady = true;
            this.deprecatedContr(this._options);

            var self = this;

            var container = self._container.length ? self._container[0] : self._container;
            container.wsControl = self;

            self._childConfig = self._options.templateOptions || {};
            self._compoundId = self._options._compoundId;

            if (self._options._initCompoundArea) {
               self._options._initCompoundArea(self);
            }

            self._pending = self._pending || [];
            self._pendingTrace = self._pendingTrace || [];
            self._waiting = self._waiting || [];

            self.__parentFromCfg = self._options.__parentFromCfg;
            self.__openerFromCfg = self._options.__openerFromCfg;
            self._parent = self._options.parent;
            self._logicParent = self._options.parent;
            self._options.parent = null;

            self._notifyVDOM = self._notify;
            self._notify = self._notifyCompound;

            self._logicParent.waitForPopupCreated = true;

            // Здесь нужно сделать явную асинхронность, потому что к этому моменту накопилась пачка стилей
            // далее floatArea начинает люто дергать recalculateStyle и нужно, чтобы там не было
            // лишних свойств, которые еще не применены к дому
            // панельки с этим начали вылезать плавненько
            runDelayed(function() {
               self.rebuildChildControl().addCallback(function() {
                  doAutofocus(self._childControl._container);
                  self._logicParent.callbackCreated && self._logicParent.callbackCreated();
                  runDelayed(function() {
                     self._notifyCompound('onResize');
                  });
               });
            });
         },

         isOpened: function() {
            return true;
         },

         _setCustomHeader: function() {
            var hasHeader = !!this._options.caption;
            var customHeaderContainer = this._childControl.getContainer().find('.ws-window-titlebar-custom');
            if (hasHeader) {
               if (customHeaderContainer.length) {
                  customHeaderContainer.prepend('<div class="ws-float-area-title">' + this._options.caption + '</div>');
                  this._prependCustomHeader(customHeaderContainer);
               } else {
                  this.getContainer().prepend($('<div class="ws-window-titlebar"><div class="ws-float-area-title ws-float-area-title-generated">' + this._options.caption + '</div></div>'));
                  this.getContainer().addClass('controls-CompoundArea-headerPadding');
               }
            } else if (customHeaderContainer.length && this._options.type === 'dialog') {
               this._prependCustomHeader(customHeaderContainer);
            } else {
               this.getContainer().removeClass('controls-CompoundArea-headerPadding');
            }
         },

         _prependCustomHeader: function(customHead) {
            var container = $('.controls-DialogTemplate', this.getContainer());
            container.prepend(customHead.addClass('controls-CompoundArea-custom-header'));
            this.getContainer().addClass('controls-CompoundArea-headerPadding');
            if (this._options.type === 'dialog') {
               var height = customHead.height();
               $('.controls-DialogTemplate', this.getContainer()).css('padding-top', height);
            }
         },

         handleCommand: function(commandName, args) {
            var arg = args[0];

            if (commandName === 'close') {
               return this._close(arg);
            } if (commandName === 'ok') {
               return this._close(true);
            } if (commandName === 'cancel') {
               return this._close(false);
            } if (this._options._mode === 'recordFloatArea' && commandName === 'save') {
               return this.save(arg);
            } if (commandName === 'delete') {
               return this.delRecord(arg);
            } if (commandName === 'print') {
               return this.print(arg);
            } if (commandName === 'printReport') {
               return this.printReport(arg);
            } if (commandName === 'resize' || commandName === 'resizeYourself') {
               this._notifyVDOM('resize', null, { bubbling: true });
            } else if (commandName === 'registerPendingOperation') {
               return this._registerChildPendingOperation(arg);
            } else if (commandName === 'unregisterPendingOperation') {
               return this._unregisterChildPendingOperation(arg);
            } else {
               return CompoundArea.superclass.handleCommand.apply(this, arguments);
            }
         },

         _resizeHandler: function() {
            if (this._childControl) {
               this._childControl._notifyOnSizeChanged();
            }
         },
         _close: function(arg) {
            if (this._isClosing) {
               return false;
            }
            this._isClosing = true;
            if (this._notifyCompound('onBeforeClose', arg) !== false) {
               this.close(arg);
               this._isClosing = false;
               return true;
            }
            this._isClosing = false;
         },
         closeHandler: function(e, arg) {
            e.stopPropagation();
            this._close(arg);
         },
         _mouseenterHandler: function() {
            if (this._options.hoverTarget) {
               clearTimeout(this._hoverTimer);
               this._hoverTimer = null;
            }
         },
         _mouseleaveHandler: function() {
            if (this._options.hoverTarget) {
               var _this = this;

               this._hoverTimer = setTimeout(function() {
                  _this.hide();
               }, 1000);
            }
         },
         _keyDown: function(event) {
            if (!event.nativeEvent.shiftKey && event.nativeEvent.keyCode === CoreConstants.key.esc) {
               this._close();
               event.stopPropagation();
            }
         },
         _keyUp: function(event) {
            if (!event.nativeEvent.shiftKey && event.nativeEvent.keyCode === CoreConstants.key.esc) {
               event.stopPropagation();
            }
         },

         _setCompoundAreaOptions: function(newOptions) {
            if (newOptions.record) { // recordFloatArea
               this._record = newOptions.record;
            }
            this._childConfig = newOptions.templateOptions || {};
         },

         reload: function() {
            this.rebuildChildControl();
         },
         setTemplate: function(template, templateOptions) {
            if (templateOptions) {
               this._childConfig = templateOptions.templateOptions;
            }
            this._childControlName = template;
            return this.rebuildChildControl();
         },
         getCurrentTemplateName: function() {
            return this._childControlName;
         },

         /* from api floatArea, window */

         getParent: function() {
            return this.__parentFromCfg || null;
         },
         getOpener: function() {
            return this.__openerFromCfg || null;
         },

         getTemplateName: function() {
            return this._template;
         },

         /* start RecordFloatArea */
         getRecord: function() {
            return this._record || this._options.record || this._options.templateOptions && this._options.templateOptions.record;
         },
         isNewRecord: function() {
            return this._options.newRecord;
         },

         setRecord: function(record, noConfirm) {
            var self = this;
            if (!noConfirm) {
               this.openConfirmDialog(true).addCallback(function(result) {
                  if (result) {
                     self._setRecord(record);
                  }
               });
            } else {
               this._setRecord(record);
            }
         },
         _setRecord: function(record) {
            var oldRecord = this.getRecord(),
               context = this.getLinkedContext(),
               self = this,
               setRecordFunc = function() {
                  if (self._options.clearContext) {
                     context.setContextData(record);
                  } else {
                     context.replaceRecord(record);
                  }
                  if (self.isNewRecord()) {
                     self._options.newRecord = record.getKey() === null;
                  }
                  self._record = record;
                  self._notify('onChangeRecord', record, oldRecord);// Отдаем запись, хотя здесь ее можно получить простым getRecord + старая запись
               },
               result;
            result = this._notify('onBeforeChangeRecord', record, oldRecord);
            addHelpers.callbackWrapper(result, setRecordFunc.bind(this));
         },
         openConfirmDialog: function(noHide) {
            var self = this,
               deferred = new cDeferred();
            this._displaysConfirmDialog = true;
            deferred.addCallback(function(result) {
               self._notify('onConfirmDialogSelect', result);
               self._displaysConfirmDialog = false;
               return result;
            });
            if ((self.getRecord().isChanged() && !self.isSaved()) || self._recordIsChanged) {
               this._openConfirmDialog(false, true).addCallback(function(result) {
                  switch (result) {
                     case 'yesButton': {
                        if (self._result === undefined) {
                           self._result = true;
                        }
                        self.updateRecord().addCallback(function() {
                           self._confirmDialogToCloseActions(deferred, noHide);
                        }).addErrback(function() {
                           deferred.callback(false);
                        });
                        break;
                     }
                     case 'noButton': {
                        if (self._result === undefined) {
                           self._result = false;
                        }

                        /**
                         * Если откатить изменения в записи, поля связи, которые с ней связанны, начнут обратно вычитываться, если были изменены, а это уже не нужно
                         * Положили rollback обратно, поля связи уже так себя вести не должны, а rollback реально нужен
                         * Оставляем возможность проводить сохранение записи в прикладном коде. По задаче Алены(см коммент вверху) ошибка не повторяется, т.к. там уже юзают formController
                         */
                        self._confirmDialogToCloseActions(deferred, noHide);
                        break;
                     }
                     default: {
                        deferred.callback(false);
                     }
                  }
               });
            } else {
               self._confirmDialogToCloseActions(deferred, noHide);
            }
            return deferred;
         },
         _confirmDialogToCloseActions: function(deferred, noHide) {
            // EventBus.channel('navigation').unsubscribe('onBeforeNavigate', this._onBeforeNavigate, this);
            deferred.callback(true);
            if (!noHide) {
               this.close.apply(this, arguments);
            }
         },


         setReadOnly: function(isReadOnly) {
            this._isReadOnly = isReadOnly;
            if (this._childControl) {
               this._setEnabledForChildControls(!isReadOnly);
            } else {
               this._childCreatedDfr.addCallback(function() {
                  this._setEnabledForChildControls(!isReadOnly);
               }.bind(this));
            }
         },
         isReadOnly: function() {
            return this._isReadOnly;
         },


         setSaveDiffOnly: function() {
            DialogRecord.prototype.setSaveDiffOnly.apply(this, arguments);
         },
         ok: function() {
            DialogRecord.prototype.ok.apply(this, arguments);
         },
         _setEnabledForChildControls: function() {
            DialogRecord.prototype._setEnabledForChildControls.apply(this, arguments);
         },
         _showLoadingIndicator: function() {
            DialogRecord.prototype._showLoadingIndicator.apply(this, arguments);
         },
         _hideLoadingIndicator: function() {
            DialogRecord.prototype._hideLoadingIndicator.apply(this, arguments);
         },
         isAllReady: function() {
            return DialogRecord.prototype.isAllReady.apply(this, arguments);
         },
         getChildControls: function() {
            return DialogRecord.prototype.getChildControls.apply(this, arguments);
         },
         getReports: function() {
            return DialogRecord.prototype.getReports.apply(this, arguments);
         },
         _printMenuItemsIsChanged: function() {
            return DialogRecord.prototype._printMenuItemsIsChanged.apply(this, arguments);
         },
         _createPrintMenu: function() {
            return DialogRecord.prototype._createPrintMenu.apply(this, arguments);
         },
         showReportList: function() {
            return DialogRecord.prototype.showReportList.apply(this, arguments);
         },
         printReport: function() {
            return DialogRecord.prototype.printReport.apply(this, arguments);
         },
         _showReport: function() {
            return DialogRecord.prototype._showReport.apply(this, arguments);
         },
         print: function() {
            return DialogRecord.prototype.print.apply(this, arguments);
         },
         _hideWindow: function() {
         },
         _getTitle: function() {
            return document.title;
         },

         _openConfirmDialog: function() {
            return DialogRecord.prototype._openConfirmDialog.apply(this, arguments);
         },
         isSaved: function() {
            return DialogRecord.prototype.isSaved.apply(this, []);
         },
         _unbindBeforeUnload: function() {
            DialogRecord.prototype._unbindBeforeUnload.apply(this);
         },
         _beforeUnloadHandler: function() {
            return DialogRecord.prototype._beforeUnloadHandler.apply(this);
         },
         unsubscribeOnBeforeUnload: function() {
            DialogRecord.prototype.unsubscribeOnBeforeUnload.apply(this);
         },
         updateRecord: function() {
            return DialogRecord.prototype.updateRecord.apply(this, arguments);
         },
         save: function() {
            return DialogRecord.prototype.save.apply(this, arguments);
         },
         delRecord: function() {
            return DialogRecord.prototype.delRecord.apply(this, arguments);
         },
         _processError: function(error) {
            DialogRecord.prototype._processError.apply(this, [error]);
         },

         /* end RecordFloatArea */

         isVisible: function() {
            if (this._options.autoShow === false) {
               return this._isVisible;
            }
            return true;
         },

         show: function() {
            this._toggleVisible(true);
         },

         hide: function() {
            this.close();
         },
         close: function(arg) {
            if (this._options.autoCloseOnHide === false) {
               this._toggleVisible(false);
            } else if (!this._childControl.isDestroyed()) {
               this._notifyVDOM('close', null, { bubbling: true });

               this._notifyCompound('onClose', arg);
               this._notifyCompound('onAfterClose', arg);
            }

            // Могут несколько раз позвать закрытие подряд
         },

         _toggleVisibleClass: function(className, visible) {
            className = className || '';
            if (visible) {
               className = className.replace(/ws-hidden/ig, '');
            } else if (className.indexOf('ws-hidden') === -1) {
               className += ' ws-hidden';
            }
            return className;
         },
         _toggleVisible: function(visible) {
            var
               popupContainer = this.getContainer().closest('.controls-Popup')[0],
               id = this._getPopupId(),
               popupConfig = this._getManagerConfig();

            if (popupConfig) {
               // Удалим или поставим ws-hidden в зависимости от переданного аргумента
               popupConfig.popupOptions.className = this._toggleVisibleClass(popupConfig.popupOptions.className, visible);

               // Сразу обновим список классов на контейнере, чтобы при пересинхронизации он не "прыгал"
               popupContainer.className = this._toggleVisibleClass(popupContainer.className, visible);

               // Если попап модальный, нужно чтобы Manager показал/скрыл/переместил оверлей
               // Из popupConfig.popupOptions.isModal узнаем, является ли попап модальным
               if (popupConfig.popupOptions.isModal) {
                  // Текущее состояние модальности задается в popupConfig
                  popupConfig.isModal = visible;

                  // Изменили конфигурацию попапа, нужно, чтобы менеджер увидел эти изменения
                  ManagerController.reindex();
                  ManagerController.update(id, popupConfig.popupOptions);
               }

               this._isVisible = visible;
            }
         },
         setOffset: function(newOffset) {
            var popupConfig = this._getManagerConfig();
            if (popupConfig) {
               popupConfig.popupOptions.horizontalAlign = popupConfig.popupOptions.horizontalAlign || {};
               popupConfig.popupOptions.horizontalAlign.offset = newOffset.x || 0;

               popupConfig.popupOptions.verticalAlign = popupConfig.popupOptions.verticalAlign || {};
               popupConfig.popupOptions.verticalAlign.offset = newOffset.y || 0;

               ManagerController.update(this._getPopupId(), popupConfig.popupOptions);
            }
         },
         _getManagerConfig: function() {
            var id = this._getPopupId();
            return id ? ManagerController.find(id) : undefined;
         },
         _getPopupId: function() {
            var popupContainer = this.getContainer().closest('.controls-Popup')[0];
            var controlNode = popupContainer && popupContainer.controlNodes && popupContainer.controlNodes[0];
            return controlNode && controlNode.control._options.id;
         },
         _getTemplateComponent: function() {
            return this._childControl;
         },
         destroy: function() {
            if (this.isDestroyed()) {
               return;
            }

            var ops = this._producedPendingOperations;
            while (ops.length > 0) {
               this._unregisterPendingOperation(ops[0]);
            }
            var
               operation = this._allChildrenPendingOperation,
               message;

            if (this._isFinishingChildOperations) {
               message = 'У контрола ' + this._moduleName + ' (name = ' + this.getName() + ', id = ' + this.getId() + ') вызывается метод destroy, ' +
                  'хотя у него ещё есть незавёршённые операции (свои или от дочерних контролов';
               logger.error('Lib/Mixins/PendingOperationParentMixin', message);
            }

            this._childPendingOperations = [];// cleanup им вызывать не надо - всё равно там destroy будет работать, у дочернего контрола
            if (this._allChildrenPendingOperation) {
               this._allChildrenPendingOperation = null;
               this._unregisterPendingOperation(operation);
            }

            CompoundArea.superclass.destroy.apply(this, arguments);
         },


         _removeOpFromCollections: function(operation) {
            removeOperation(operation, this._producedPendingOperations);
            removeOperation(operation, allProducedPendingOperations);
         },

         _registerPendingOperation: function(name, finishFunc, registerTarget) {
            var
               name = this._moduleName ? this._moduleName + '/' + name : name,
               operation = {
                  name: name,
                  finishFunc: finishFunc,
                  cleanup: null,
                  control: this,
                  registerTarget: registerTarget
               };

            operation.cleanup = this._removeOpFromCollections.bind(this, operation);
            if (operation.registerTarget) {
               operation.registerTarget.sendCommand('registerPendingOperation', operation);

               this._producedPendingOperations.push(operation);
               allProducedPendingOperations.push(operation);
            }
            return operation;
         },

         _unregisterPendingOperation: function(operation) {
            operation.cleanup();

            if (operation.registerTarget) {
               operation.registerTarget.sendCommand('unregisterPendingOperation', operation);
            }
         },

         getAllPendingOperations: function() {
            return allProducedPendingOperations;
         },

         getPendingOperations: function() {
            return this._producedPendingOperations;
         },

         _registerChildPendingOperation: function(operation) {
            var name, finishFunc;

            this._childPendingOperations.push(operation);

            if (!this._allChildrenPendingOperation) {
               name = (this._moduleName ? this._moduleName + '/' : '') + 'allChildrenPendingOperation';
               finishFunc = this.finishChildPendingOperations.bind(this);

               this._allChildrenPendingOperation = this._registerPendingOperation(name, finishFunc, this.getParent());
            }

            return true;
         },

         _unregisterChildPendingOperation: function(operation) {
            var
               childOps = this._childPendingOperations,
               allChildrenPendingOperation;

            if (childOps.length > 0) {
               removeOperation(operation, childOps);
               if (childOps.length === 0) {
                  allChildrenPendingOperation = this._allChildrenPendingOperation;
                  this._allChildrenPendingOperation = null;
                  coreDebug.checkAssertion(!!allChildrenPendingOperation);

                  this._unregisterPendingOperation(allChildrenPendingOperation);
               }
            }
            return true;
         },
         finishChildPendingOperations: function(needSavePendings) {
            var
               self = this,
               checkFn = function(prevResult) {
                  var
                     childOps = self._childPendingOperations,
                     result, allChildrenPendingOperation;

                  function cleanupFirst() {
                     if (childOps.length > 0) {
                        childOps.shift().cleanup();
                     }
                  }

                  if (finishResultOk(prevResult) && childOps.length > 0) {
                     result = childOps[0].finishFunc(needSavePendings);
                     if (result instanceof cDeferred) {
                        result.addCallback(function(res) {
                           if (finishResultOk(res)) {
                              cleanupFirst();
                           }
                           return checkFn(res);
                        }).addErrback(function(res) {
                           return checkFn(res);
                        });
                     } else {
                        if (finishResultOk(result)) {
                           cleanupFirst();
                        }
                        result = checkFn(result);
                     }
                  } else {
                     allChildrenPendingOperation = self._allChildrenPendingOperation;
                     if (childOps.length === 0 && allChildrenPendingOperation) {
                        self._allChildrenPendingOperation = null;
                        self._unregisterPendingOperation(allChildrenPendingOperation);
                     }
                     self._isFinishingChildOperations = false;
                     result = prevResult;
                  }
                  return result;
               };

            if (!this._isFinishingChildOperations) {
               this._finishPendingQueue = cDeferred.success(true);
               this._isFinishingChildOperations = true;

               this._finishPendingQueue.addCallback(checkFn);
            }

            return this._finishPendingQueue;
         },

         getChildPendingOperations: function() {
            return this._childPendingOperations;
         },

         /**
          *
          * Добавить отложенную асинхронную операцию в очередь ожидания окна.
          * @param {Core/Deferred} dOperation Отложенная операция.
          * @returns {Boolean} "true", если добавление операции в очередь успешно.
          * @see waitAllPendingOperations
          */
         addPendingOperation: function(dOperation) {
            var result = !!(dOperation && (dOperation instanceof cDeferred));
            if (result) {
               this._pending.push(dOperation);
               this._pendingTrace.push(coreDebug.getStackTrace());
               dOperation.addBoth(this._checkPendingOperations.bind(this));
            }
            return result;
         },
         _finishAllPendingsWithSave: function() {
            this._pending.forEach(function(pending) {
               pending.callback(true);
            });
         },

         /**
          * Получение информации о добавленных пендингах, включая информацию, откуда был добавлен пендинг
          * @returns {Array} Массив объектов, хранящих пендинг и информацию, откуда был добавлен пендинг
          */
         getAllPendingInfo: function() {
            var res = [],
               self = this;
            this._pending.forEach(function(pending, index) {
               res.push({
                  pending: pending,
                  trace: self._pendingTrace[index]
               });
            });
            return res;
         },

         /**
          *
          * Добавить асинхронное событие на завершение всех отложенных операций.
          * Добавить асинхронное событие, которое сработает в момент завершения всех отложенных операций,
          * добавленных с помощью {@link addPendingOperation}.
          * Если очередь пуста, то сработает сразу.
          * Если попытаться передать Deferred, находящийся в каком-либо состоянии (успех, ошибка), то метод вернет false и
          * ожидающий не будет добавлен в очередь.
          * @param {Core/Deferred} dNotify Deferred-объект, ожидающий завершения всех отложенных операций.
          * @returns {Boolean} "true", если добавление в очередь ожидающих успешно.
          * @see addPendingOperation
          */
         waitAllPendingOperations: function(dNotify) {
            if (dNotify && (dNotify instanceof cDeferred) && !dNotify.isReady()) {
               if (this._pending.length === 0) {
                  dNotify.callback();
               } else {
                  this._waiting.push(dNotify);
               }
               return true;
            }
            return false;
         },
         _checkPendingOperations: function(res) {
            var totalOps = this._pending.length, result;

            // Сперва отберем Deferred, которые завершились
            result = this._pending.filter(function(dfr) {
               return dfr.isReady();
            });

            // Затем получим их результаты
            result = result.map(function(dfr) {
               return dfr.getResult();
            });

            // If every waiting op is completed
            if (result.length == totalOps) {
               this._pending = [];
               this._pendingTrace = [];
               while (this._waiting.length > 0) {
                  this._waiting.pop().callback(result);
               }
            }

            // if res instanceof Error, return it as non-captured
            return res;
         }
      });
      return CompoundArea;
   });
