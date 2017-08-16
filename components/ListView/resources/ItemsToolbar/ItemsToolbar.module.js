/**
 * Created by as.avramenko on 29.01.2016.
 */

define('js!SBIS3.CONTROLS.ItemsToolbar',
    [
       'js!SBIS3.CONTROLS.CompoundControl',
       'js!SBIS3.CONTROLS.IconButton',
       'js!SBIS3.CONTROLS.ItemActionsGroup',
       'tmpl!SBIS3.CONTROLS.ItemsToolbar',
       'tmpl!SBIS3.CONTROLS.ItemsToolbar/editActions',
       'Core/helpers/dom&controls-helpers',
       'i18n!SBIS3.CONTROLS.ItemsToolbar',
       'css!SBIS3.CONTROLS.ItemsToolbar'
    ],
    function(CompoundControl, IconButton, ItemActionsGroup, dotTplFn, editActionsTpl, dcHelpers) {

       'use strict';
       /**
        * @class SBIS3.CONTROLS.ItemsToolbar
        * @extends SBIS3.CONTROLS.CompoundControl
        * @author Авраменко Алексей Сергеевич
        *
        * @cssModifier controls-ItemsToolbar__small устанавливает размер элементов тулбара равным 16px
        *
        * @public
        */
       var ItemsToolbar = CompoundControl.extend( /** @lends SBIS3.CONTROLS.ItemsToolbar.prototype */ {
          _dotTplFn: dotTplFn,
          $protected: {
             _options: {
                /**
                 * @cfg {Boolean} Отображать тулбар для touсh устройств
                 */
                touchMode: false,
                /**
                 * @cfg {Boolean} Отображать кнопки для редактирования (Сохранить, Отменить)
                 */
                showEditActions: false,
                /**
                 * @cfg {Array} Набор действий над элементами, отображающийся в виде иконок
                 */
                itemsActions: []
             },
             _itemsActions: null,      // Инстанс опций записей
             _editActions: null,       // todo: Заменить на компонент "Toolbar" (когда тот будет)
             _target: null,            // Элемент - кандидат на отображение тулбара
             _currentTarget: null,     // Элемент, относительно которого сейчас отображается тулбар
             _lockingToolbar: false,    // Состояние заблокированности тулбара
             _isVisible: false,
             _cachedMargin: null
          },
          $constructor: function() {
             this._publish('onShowItemActionsMenu', 'onCloseItemActionsMenu', 'onItemActionActivated', 'onItemsToolbarHide');
          },
          /**
           * Создает или возвращает уже созданные кнопки редактирования
           * @returns {null|SBIS3.CONTROLS.ItemsToolbar.$protected._editActions|*|SBIS3.CONTROLS.ItemsToolbar._editActions}
           * @private
           */
          _getEditActions: function() {
             var toolbarContent;
             if (!this._editActions) {
                (toolbarContent = this._getToolbarContent()).append(editActionsTpl());
                this.reviveComponents();
                this._editActions = toolbarContent.find('.controls-ItemsToolbar__editActions');
             }
             return this._editActions;
          },
          /**
           * Отображает кнопки редактирования
           */
          showEditActions: function() {
             this._getEditActions().removeClass('ws-hidden');
             this.getContainer().toggleClass('controls-ItemsToolbar__withEditActions', true);
             this._toggleEditClass(true);
          },
          /**
           * Скрывает кнопки редактирования
           */
          hideEditActions: function() {
             if (this._editActions) {
                this._editActions.addClass('ws-hidden');
                this.getContainer().toggleClass('controls-ItemsToolbar__withEditActions', false);
                this._toggleEditClass(false);
             }
          },

          _toggleEditClass: function(isEdit) {
             this.getContainer().toggleClass('controls-ItemsToolbar__edit', isEdit);
          },
          /**
           * Проверяет, отображаются ли сейчас кнопки редактирования
           * @returns {boolean|*}
           * @private
           */
          _isEditActionsHidden: function() {
             return !this._editActions || this._editActions.hasClass('ws-hidden');
          },
          /**
           * Инициализирует опции записи
           * @private
           */
          _initItemsActions: function() {
             var self = this;

             this._bigIconsFix(this._options.itemsActions);

             this._itemsActions = new ItemActionsGroup({
                items: this._options.itemsActions,
                element: $('<div class="controls-ListView__itemActions-container"></div>').prependTo(this._getToolbarContent()),
                idProperty: 'name',
                parent: this,
                linkedControl: this.getParent(),
                touchMode: this._options.touchMode,
                handlers : {
                   onActionActivated: function(e, key) {
                      self._notify('onItemActionActivated', key);
                      //Если тулбар не заблокирован, то клик по любой операции над записью приводит к скрытию тулбара
                      if(!self.isToolbarLocking()) {
                         self._itemsActions.hide();
                      }
                      self.hide(false);
                   },
                   onShowMenu: function() {
                      self.getContainer().addClass('ws-invisible');
                      self.lockToolbar();
                      self._notify('onShowItemActionsMenu');
                   },
                   onHideMenu: function() {
                      self.getContainer().removeClass('ws-invisible');
                      if (self._isEditActionsHidden()) {
                         self.unlockToolbar();
                      }
                      if(self._target && !self._options.touchMode){
                          self.show(self._target);
                      }else {
                          self.hide();
                      }
                       self._notify('onCloseItemActionsMenu');
                   }
                }
             });
          },
          /**
           * Метод получения компонента операций над записью.
           * @returns {Object} Компонент "операции над записью".
           */
          getItemsActions: function() {
             return this.getItemsActionsGroup();
          },
          /**
           * Создает или возвращает уже созданные опции записи
           * @returns {null|SBIS3.CONTROLS.ItemsToolbar.$protected._itemsActions|ItemActionsGroup|SBIS3.CONTROLS.ItemsToolbar._itemsActions}
           */
          getItemsActionsGroup: function() {
             if (!this._itemsActions && this._options.itemsActions.length) {
                this._initItemsActions();
             }
             return this._itemsActions;
          },
          /**
           * Задаёт новые операции над записью
           * Как в меню, так и на строке
           * @param items Массив новых items
           */
          setItemsActions: function(itemsActions) {
             this._options.itemsActions = itemsActions;

             this._bigIconsFix(itemsActions);

             if(this._itemsActions) {
                this._itemsActions.setItems(this._options.itemsActions);
             }
          },
          /**
           * Отображает операции над записью
           * @param target
           */
          showItemsActions: function(target) {
             var itemsActions = this.getItemsActionsGroup();
             itemsActions.applyItemActions();
             itemsActions.show(target);
          },
          /**
           * Скрывает операции над записью
           */
          hideItemsActions: function() {
             if (this._itemsActions) {
                this._itemsActions.hide();
             }
          },

          /**
           * Убирает жестко заданный размер иконок, т.к. по новым стандартам они должны быть 24px
           * icon-size определен в стилях компонента и сам определяет правильный размер иконок
           * @param items
           * @private
           */
          _bigIconsFix: function(items) {
             if (items) {
                items.forEach(function(item){
                   if(item.hasOwnProperty('icon') && item.icon){
                      item.icon = item.icon.replace('icon-16', 'icon-size').replace('icon-24', 'icon-size').replace('icon-small', 'icon-size').replace('icon-medium', 'icon-size');
                   }
                });
             }
          },
          /**
           * Проверяет, отображаются ли сейчас опции записи
           * @returns {boolean}
           * @private
           */
          _isItemsActionsHidden: function() {
             return !this._options.itemsActions.length || (this._itemsActions && !this._itemsActions.hasVisibleActions());
          },
          /**
           * Блокирует тулбар и включает слежение за currentTarget
           */
          lockToolbar: function() {
             this._lockingToolbar = true;
             this._trackingTarget();
          },
          /**
           * Разблокирует тулбар и отключает слежение за currentTarget
           */
          unlockToolbar: function() {
             this._lockingToolbar = false;
             this._untrackingTarget();
          },
          /**
           * Позволяет получить состояние заблокированности тулбара
           */
          isToolbarLocking: function() {
             return this._lockingToolbar;
          },
          /**
           * Включает слежение за позицей currentTarget
           * @private
           */
          _trackingTarget: function() {
             dcHelpers.trackElement(this._currentTarget.container, true).subscribe('onMove', this.recalculatePosition, this);
          },
          /**
           * Меняет режим отображения тулбара, если touch - то тулбар отображается с анимацией
           * @param {Boolean} mode
           */
          setTouchMode: function(mode) {
             this._options.touchMode = mode;
             if(!mode) {
                // height='auto' win10 в режиме планшета растягивает контейнер и перекрывает строчку
                this.getContainer()[0].style.height = '';
             }else {
                this.setHeightInTouchMode();
             }
             if(this._itemsActions) {
                this._itemsActions.setTouchMode(mode);
             }
          },
          getTouchMode: function () {
            return this._options.touchMode;
          },

          setHeightInTouchMode: function(){
             var height, container, currentSize;
             if(this._currentTarget) {
                height = this._currentTarget.size.height;
                container = this.getContainer()[0];
                container.style.height = height + 'px';
                container.className = container.className.replace(/(^|\s)controls-ItemsToolbar-item-size__\S+/g, '');

                if(height < 40) {
                    currentSize = '1';
                }
                if(height >= 40 && height < 50){
                    currentSize = '2';
                }
                 if(height >= 50 && height < 60){
                     currentSize = '3';
                 }
                 if(height >= 60 && height < 70){
                     currentSize = '4';
                 }
                 if(height >= 70){
                     currentSize = '5';
                 }
                 this.getContainer().addClass('controls-ItemsToolbar-item-size__' + currentSize);
             }
          },
          /**
           * Отключает слежение за позицей currentTarget
           * @private
           */
          _untrackingTarget: function() {
             if(this._currentTarget) {
                dcHelpers.trackElement(this._currentTarget.container, false);
             }
          },
          /**
           * Пересчитывает позицию тулбара при изменении позиции currentTarget
           * @private
           */
          recalculatePosition: function() {
             var parentContainer = this.getParent().getContainer()[0],
                 targetContainer = this._currentTarget.container[0],
                 parentCords = parentContainer.getBoundingClientRect(),
                 targetCords;

             /* Событие onMove из трэкера стреляет и при удалении элемента из DOM'a,
                надо проверить на наличине элемента, а то получим неверные расчёты, а в худшем случае(ie) браузер падает */
             if(!dcHelpers.contains(parentContainer, targetContainer)) {
                this._untrackingTarget();
                return;
             }

             targetCords = targetContainer.getBoundingClientRect();
             this._currentTarget.position =  {
                top: Math.floor(targetCords.top - parentCords.top + parentContainer.scrollTop),
                left: targetCords.left - parentCords.left
             };
             this._currentTarget.size = {
                height: targetContainer.offsetHeight,
                width: targetContainer.offsetWidth
             };
             this._setPosition(this._getPosition(this._currentTarget));
          },
          /**
           * Устанавливает позицию тулбара
           * @param position
           * @private
           */
          _setPosition: function(position) {
             var container = this.getContainer()[0];

             for(var key in position) {
                if (position.hasOwnProperty(key)) {
                   container.style[key] = position[key] + (typeof position[key] === 'number' ? 'px' : '');
                }
             }
          },
          /**
           * Возвращает координаты для отображения тулбара
           * @param target
           * @returns {{}}
           * @private
           */
          _getPosition: function (target) {
             var position = target.position,
                 size = target.size,
                 $parentContainer = this.getParent().getContainer(),
                 isVertical = target.container.hasClass('js-controls-CompositeView__verticalItemActions'),
                 marginRight = $parentContainer[0].offsetWidth - (position.left + size.width),
                 marginBottom = $parentContainer[0].offsetHeight - (position.top + size.height),
                 $container = this.getContainer(),
                 containerHeight;

             if(marginRight < 0 && !isVertical) {
                marginRight = 0;
             }

             if(this._cachedMargin || $parentContainer.hasClass('controls-ListView__bottomStyle')) {
                if(!this._cachedMargin) {
                   containerHeight = $container.height();
                   if(containerHeight) {
                      this._cachedMargin = containerHeight + parseInt($container.css('bottom'), 10);
                   }
                }
                marginBottom -= this._cachedMargin;
             }

             this.getContainer()[isVertical ? 'addClass' : 'removeClass']('controls-ItemsToolbar__vertical');
             return {
                'marginRight' : marginRight,
                'marginTop' : position.top,
                'marginBottom': marginBottom
             };
          },
          /**
           * Показать тулбар, если он не зафиксирован у какого-нибудь элемента
           * @param {Object} target
           * @param {Boolean} animate
           */
          show: function(target, animate) {
             var container = this.getContainer()[0],
                 isActionsHidden = this._isItemsActionsHidden() && this._isEditActionsHidden(),
                 hasItemsActions = this._options.itemsActions.length,
                 itemsActions, toolbarContent;

             this._target = target;
             //Если тулбар зафиксирован или отсутствуют опции записи и кнопки редактирования по месту, то ничего не делаем
             if (this._lockingToolbar || isActionsHidden) {

                /* Если операций нет, то сроем тулбар */
                if(isActionsHidden) {
                   this.hide();
                } else if(hasItemsActions) {
                   itemsActions = this.getItemsActions();

                   /* Если показаны операции над записью и открыто меню, то надо обновить видимость */
                   if(itemsActions.isItemActionsMenuVisible()) {
                      this.getItemsActions().applyItemActions();
                   }
                }
                return;
             }
             /* Запоминаем таргет в качестве текущего */
             this._currentTarget = target;

             if(this._lockingToolbar) {
                this._trackingTarget();
             }
             if (hasItemsActions) {       // Если имеются опции записи, то создаем их и отображаем
                this.showItemsActions(target);
             }

             this.getContainer().removeClass('ws-hidden');
             this._setPosition(this._getPosition(target));
             
             this._isVisible = true;
             //Если режим touch, то отображаем тулбар с анимацией.
             if (this._options.touchMode) {
                this._trackingTarget();
                if (animate) {
                   toolbarContent = this._getToolbarContent();
                   toolbarContent[0].style.right = -container.offsetWidth + 'px';
                   this.setHeightInTouchMode();
                   toolbarContent.animate({right: 0}, 350);
                }
             }
          },
          /**
           * Возвращает контейнер тулбара
           * @returns {*|jQuery|HTMLElement}
           * @private
           */
          _getToolbarContent: function() {
             return $('.controls-ItemsToolbar__container', this._container[0]);
          },
          /**
           * Скрывает тубар, если он не зафиксирован
           * @param {boolean} animate Анимировать ли скрытие
           */
          hide: function(animate) {
             var self = this,
                 container, toolbarContent;

             this._target = null;
             if (!this._lockingToolbar && this._isVisible) {
                this._isVisible = false;
                container = this.getContainer();

                if (this._options.touchMode || animate) {
                   this._untrackingTarget();
                }

                if (this._options.touchMode && animate) {
                   this._itemsActions && this._itemsActions.applyItemActions();
                   toolbarContent = this._getToolbarContent();
                   toolbarContent.animate({right: -container.width()}, {
                      duration: 350,
                      complete: function() {
                         container.addClass('ws-hidden');
                         self.hideItemsActions();
                         self._notify('onItemsToolbarHide');
                      }
                   });
                } else {
                   container.addClass('ws-hidden');
                   this.hideItemsActions();
                   this._notify('onItemsToolbarHide');
                }
                this._currentTarget = null;
             }
          },
          /**
           * todo Костыль, ссылка на задание, по которому будет выпилен:
           * Задача в разработку от 26.01.2016 №1172557048
           * Необходимо сделать правки в AreaAbstract, которые позволят избавиться от костыля в ItemActionsGro...
           * https://inside.tensor.ru/opendoc.html?guid=612d3c83-2ea1-4f21-8e63-1947a30c12f4
           * @param event
           * @private
           */
          _onClickHandler: function(event) {
             event.stopPropagation();
             event.stopImmediatePropagation();
          },
          canAcceptFocus: function() {
             return false;
          },
          
          destroy: function () {
             this.unlockToolbar();
             this.hide();
             this._itemsActions = undefined;
             this._editActions = undefined;
             ItemsToolbar.superclass.destroy.apply(this, arguments);
          }
       });
       return ItemsToolbar;
    });
