/**
 * Created by kraynovdo on 25.01.2018.
 */
define('Controls/Tabs/Buttons', [
    'Core/Control',
    'Controls/Controllers/SourceController',
    'tmpl!Controls/Tabs/Buttons/Buttons',
    'tmpl!Controls/Tabs/Buttons/ItemTemplate',
    'css!Controls/Tabs/Buttons/Buttons'

], function (Control,
             SourceController,
             TabButtonsTpl,
             ItemTemplate
) {
    'use strict';

    var _private = {
        prepareOrder: function(order) {
            return '-webkit-box-ordinal-group:' +  order +
                '; -moz-box-ordinal-group:' + order +
                '; -ms-flex-order:' +  order +
                '; -webkit-order:' + order +
                '; order:' + order;
        },
        initSource: function(instance, options) {
            return instance._sourceController = new SourceController({
                source: options.source
            }).load().addCallback(function(items){
                var
                    leftOrder = 1,
                    rightOrder = 30;
                items.each(function (item) {
                    if (item.get('align') === 'left') {
                        item.set('_order', leftOrder++);
                    } else {
                        item.set('_order', rightOrder++);
                    }
                });
                //save last right order
                rightOrder--;
                instance._lastRightOrder = rightOrder;
                instance._items = items;
                return instance._items;
            });
        },
        prepareItemClass : function(item, options) {
            var
                classes =['controls-Tabs__item'];
            classes.push('controls-Tabs__item_align_' + ( item.get('align') ? item.get('align') : 'right' ));
            if (item.get('order') === 1 || item.get('order') === this._lastRightOrder ) {
                classes.push('controls-Tabs__item_extreme');
            }
            if (item.get(options.keyProperty) === options.selectedKey) {
                classes.push('controls-Tabs_style_' + options.style + '__item_state_selected');
                classes.push('controls-Tabs__item_state_selected');
            } else {
                classes.push('controls-Tabs__item_state_default');
            }
            return classes.join(' ');
        }
    };

    /**
     * Компонент - корешки закладок
     * @class Controls/Tabs/Buttons
     * @extends Controls/Control
     * @mixes Controls/interface/ISource
     * @mixes Controls/interface/ISingleSelectable
     * @control
     * @public
     * @category List
     */

    /**
     * @name Controls/Tabs/Buttons#tabSpaceTemplate
     * @cfg {Content} Шаблон содержимого области, находящейся на одном уровне с корешками закладок
     */

    var TabsButtons = Control.extend({
        _controlName: 'Controls/Tabs/Buttons',
        _template: TabButtonsTpl,
        items: [],
        constructor: function (cfg) {
            TabsButtons.superclass.constructor.apply(this, arguments);
            this._publish('selectedKeyChanged');
        },
        _beforeMount: function(options, context, receivedState) {
            if (receivedState) {
                this._items = receivedState;
            }
            if (options.source) {
                return _private.initSource(this, options);
            }
        },
        _beforeUpdate: function(newOptions) {
            var
                self = this;
            if (newOptions.source && !this._sourceController) {
                return _private.initSource(this, newOptions).addCallback(function(){
                    self._forceUpdate();
                })
            }
        },
        _onItemClick: function(event, key) {
            this._notify('selectedKeyChanged', key)
        },
        _prepareItemClass: function(item) {
            return _private.prepareItemClass(item, this._options);
        },
        _prepareOrder: function(order) {
          return _private.prepareOrder(order);
        }
    });

    TabsButtons.getDefaultOptions = function() {
        return {
            itemTemplate: ItemTemplate,
            style: 'default'
        };
    };
    //необходимо для тестов
    TabsButtons._private = _private;
    return TabsButtons;
});