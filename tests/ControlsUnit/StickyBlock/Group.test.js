define([
   'Controls/scroll',
   'Core/core-merge',
   'Controls/_scroll/StickyBlock/Utils'
], function(
   scroll,
   coreMerge,
   Utils
) {

   'use strict';

   const
      createComponent = function(Component, cfg) {
         let mv;
         if (Component.getDefaultOptions) {
            cfg = coreMerge(cfg, Component.getDefaultOptions(), {preferSource: true});
         }
         mv = new Component(cfg);
         mv.saveOptions(cfg);
         mv._beforeMount(cfg);
         return mv;
      },
      options = {
         calculateHeadersOffsets: false
      };

   describe('Controls/_scroll/StickyBlock/Group', function() {
      describe('Initialisation', function() {
         it('should set correct header id', function() {
            const component = createComponent(scroll.Group, options);
            const component2 = createComponent(scroll.Group, options);
            assert.strictEqual(component._index, component2._index - 1);
         });
      });

      describe('_fixedHandler', function() {
         const
            event = {stopImmediatePropagation: sinon.fake()};

         // beforeEach(() => {
         //    sinon.stub(Utils, 'getOffset').returns(0);
         // });
         //
         // afterEach(() => {
         //    sinon.restore();
         // });

         it('should add fixed header to list of fixed headers', function() {
            const
               component = createComponent(scroll.Group, options),
               headerIdTop = scroll.getNextStickyId(),
               headerIdBottom = scroll.getNextStickyId();

            component._fixedHandler(event, {fixedPosition: 'top', id: headerIdTop});
            assert.lengthOf(component._stickyHeadersIds.top, 1);
            assert.lengthOf(component._stickyHeadersIds.bottom, 0);
            assert.include(component._stickyHeadersIds.top, headerIdTop);

            component._fixedHandler(event, {fixedPosition: 'bottom', id: headerIdBottom});
            assert.lengthOf(component._stickyHeadersIds.top, 1);
            assert.lengthOf(component._stickyHeadersIds.bottom, 1);
            assert.include(component._stickyHeadersIds.bottom, headerIdBottom);
         });

         it('should remove fixed header from list of fixed headers on header unfixed', function() {
            const
               component = createComponent(scroll.Group, options),
               headerIdTop = scroll.getNextStickyId(),
               headerIdBottom = scroll.getNextStickyId();

            component._stickyHeadersIds.top.push(headerIdTop);
            component._stickyHeadersIds.bottom.push(headerIdBottom);

            component._fixedHandler(event, {fixedPosition: '', prevPosition: 'top', id: headerIdTop});
            assert.lengthOf(component._stickyHeadersIds.top, 0);
            assert.notInclude(component._stickyHeadersIds.top, headerIdTop);

            component._fixedHandler(event, {fixedPosition: '', prevPosition: 'bottom', id: headerIdBottom});
            assert.lengthOf(component._stickyHeadersIds.bottom, 0);
            assert.notInclude(component._stickyHeadersIds.bottom, headerIdBottom);
         });

         it('should generate event on first header fixed', function() {
            const
               component = createComponent(scroll.Group, options),
               headerId = scroll.getNextStickyId();

            sinon.stub(component, '_notify');
            component._fixedHandler(event,
               {fixedPosition: 'top', prevPosition: '', id: headerId, mode: 'replaceable', offsetHeight: 10});

            assert.isTrue(component._isShadowVisible);
            assert.isTrue(component._fixed);

            sinon.assert.calledWith(
               component._notify,
               'fixed',
               [{
                  fixedPosition: 'top',
                  id: component._index,
                  mode: 'replaceable',
                  offsetHeight: 10,
                  prevPosition: ''
               }], {
                  bubbling: true
               }
            );
            sinon.restore();
         });

         it('should not generate event on second header fixed', function() {
            const
               component = createComponent(scroll.Group, options),
               headerId = scroll.getNextStickyId();

            component._fixedHandler(event,
               {
                  fixedPosition: 'top',
                  prevPosition: '',
                  id: scroll.getNextStickyId(),
                  mode: 'replaceable',
                  offsetHeight: 10
               });

            sinon.stub(component, '_notify');
            component._headers = {};
            component._headers[headerId] = {
              inst: { updateShadowVisible: () => undefined }
            };
            component._fixedHandler(event,
               {
                  fixedPosition: 'top',
                  prevPosition: '',
                  id: headerId,
                  mode: 'replaceable',
                  offsetHeight: 10
               });

            sinon.assert.notCalled(component._notify);
            sinon.restore();
         });

         it('should generate event on last header unfixed', function() {
            const
               component = createComponent(scroll.Group, options),
               headerId = scroll.getNextStickyId();

            component._fixedHandler(event,
               {fixedPosition: 'top', prevPosition: '', id: headerId, mode: 'replaceable', offsetHeight: 10});

            sinon.stub(component, '_notify');
            component._fixedHandler(event,
               {fixedPosition: '', prevPosition: 'top', id: headerId, mode: 'replaceable', offsetHeight: 10});

            sinon.assert.calledWith(
               component._notify,
               'fixed',
               [{
                  fixedPosition: '',
                  id: component._index,
                  mode: 'replaceable',
                  offsetHeight: 10,
                  prevPosition: 'top'
               }], {
                  bubbling: true
               }
            );
            sinon.restore();
         });

         it('should not generate event on not last header unfixed', function() {
            const
               component = createComponent(scroll.Group, options),
               headerId = scroll.getNextStickyId();

            component._fixedHandler(event,
               {
                  fixedPosition: 'top',
                  prevPosition: '',
                  id: scroll.getNextStickyId(),
                  mode: 'replaceable',
                  offsetHeight: 10
               });

            component._headers = {};
            component._headers[headerId] = {
              inst: { updateShadowVisible: () => undefined }
            };

            component._fixedHandler(event,
               {fixedPosition: 'top', prevPosition: '', id: headerId, mode: 'replaceable', offsetHeight: 10});

            sinon.stub(component, '_notify');
            component._fixedHandler(event,
               {fixedPosition: '', prevPosition: 'top', id: headerId, mode: 'replaceable', offsetHeight: 10});

            sinon.assert.notCalled(component._notify);
            sinon.restore();
         });

         it('should update shadow state on second header fixed', function() {
            const
               component = createComponent(scroll.Group, options),
               firstHeaderId = scroll.getNextStickyId(),
               secondHeaderId = scroll.getNextStickyId(),
                updateShadowVisible = sinon.fake();

            component._headers = {};
            component._headers[secondHeaderId] = {
              inst: { updateShadowVisible: updateShadowVisible }
            };

            component._fixedHandler(event,
               {fixedPosition: 'top', prevPosition: '', id: firstHeaderId, mode: 'replaceable', offsetHeight: 10});

            component._fixedHandler(event,
               {fixedPosition: 'top', prevPosition: '', id: secondHeaderId, mode: 'replaceable', offsetHeight: 10});

            sinon.assert.called(updateShadowVisible);
            sinon.restore();
         });
      });

      describe('updateShadowVisible', function() {
         it('should update children headers if the header identifier is equal to the current one', function() {
            const
               component = createComponent(scroll.Group, options);

            sinon.stub(component, '_updateShadowVisible');

            component.updateShadowVisible([component._index]);
            sinon.assert.called(component._updateShadowVisible);
            sinon.restore();
         });

         it('should not update children headers if the header identifier is not equal to the current one', function() {
            const
               component = createComponent(scroll.Group, options);

            sinon.stub(component, '_updateShadowVisible');

            component.updateShadowVisible([component._index + 1]);
            sinon.assert.notCalled(component._updateShadowVisible);
            sinon.restore();
         });
      });

      describe('set top', function() {
         it('should\'t update top on internal headers if headers does not initialized', function() {
            const component = createComponent(scroll.Group, {});
            component._headers[0] = {
               inst: {
                  top: 0
               },
               top: 0
            };
            component.top = 20;
            assert.strictEqual(component._headers[0].inst.top, 0);
         });
         it('should update top on internal headers', function() {
            const component = createComponent(scroll.Group, {});
            component._headers[0] = {
               inst: {
                  top: 0
               },
               top: 0
            };
            component._initialized = true;
            component.top = 20;
            assert.strictEqual(component._headers[0].inst.top, 20);
         });
      });

      describe('set bottom', function() {
         it('should\'t update top on internal headers if headers does not initialized', function() {
            const component = createComponent(scroll.Group, {});
            component._headers[0] = {
               inst: {
                  bottom: 0
               },
               bottom: 0
            };
            component.bottom = 20;
            assert.strictEqual(component._headers[0].inst.bottom, 0);
         });
         it('should update bottom on internal headers', function() {
            const component = createComponent(scroll.Group, {});
            component._headers[0] = {
               inst: {
                  bottom: 0
               },
               bottom: 0
            };
            component._initialized = true;
            component.bottom = 20;
            assert.strictEqual(component._headers[0].inst.bottom, 20);
         });
      });

      describe('get height', function() {
         it('should return the height of one of the headers', function() {
            const
               component = createComponent(scroll.Group, {}),
               height = 10;
            component._headers = {
               'header1': {
                  inst: {
                     height: height
                  }
               }
            };
            assert.strictEqual(component.height, height);
         });
         it('should return 0 if there are no fixed headers', function() {
            const
               component = createComponent(scroll.Group, {});
            component._headers = {};
            assert.strictEqual(component.height, 0);
         });
      });

      describe('_stickyRegisterHandler', function() {
         const event = {
            stopImmediatePropagation: sinon.fake()
         }
         const data = {
            id: 2,
            inst: {
               _container: {},
               setSyncDomOptimization: () => {},
               updateShadowVisible: () => {},
               updateShadowVisibility: () => {}
            },
            position: 'top'
         };

         beforeEach(() => {
            sinon.stub(Utils, 'getOffset').returns(0);
         });

         afterEach(() => {
            sinon.restore();
         });

         it('should stopImmediatePropagation event', function() {
            const component = createComponent(scroll.Group, options);
            component._stickyRegisterHandler(event, data, true);
            sinon.assert.calledOnce(event.stopImmediatePropagation);
         });
         it('should register new header', function() {
            const
               component = createComponent(scroll.Group, options);
            let
               event = {
                  blockUpdate: false,
                  stopImmediatePropagation: sinon.fake()
               };
            component._stickyRegisterHandler(event, data, true);
            assert.property(component._headers, data.id);
         });
         it('should unregister deleted header', function() {
            const component = createComponent(scroll.Group, options);
            component._headers[data.id] = {id: data.id};
            component._stickyRegisterHandler(event, data, false);
            assert.isUndefined(component._headers[data.id]);
         });

         it('should\'t update top/bottom if calculateHeadersOffsets option is equals false', function() {
            const component = createComponent(scroll.Group, {...options, calculateHeadersOffsets: false});
            sinon.stub(component, '_updateTopBottom');
            component._stickyRegisterHandler(event, data, true);
            sinon.assert.notCalled(component._updateTopBottom);
         });

         it('should generate event on first header registered', function() {
            const component = createComponent(scroll.Group, options);

            sinon.stub(component, '_notify');
            component._stickyRegisterHandler(event, data, true);

            sinon.assert.calledWith(component._notify, 'stickyRegister');
            sinon.restore();
         });

         it('should update fixed property on sticky header if group is fixed and isShadowVisibleByController !== hidden', function() {
            const component = createComponent(scroll.Group, options);
            component._isShadowVisible = true;
            sinon.stub(component, '_notify');
            const stubUpdateFixed = sinon.stub(data.inst, 'updateShadowVisible');

            component._stickyRegisterHandler(event, data, true);

            sinon.assert.calledWith(component._notify, 'stickyRegister');
            sinon.assert.calledOnce(stubUpdateFixed);
            sinon.restore();
         });

         it('should not generate event on second header registered', function() {
            const component = createComponent(scroll.Group, options);
            component._stickyRegisterHandler(event, data, true);
            sinon.stub(component, '_notify');
            const position = { vertical: null, horizontal: null };
            component._stickyRegisterHandler(event, {id: 3, inst: data.inst, position}, true);

            sinon.assert.notCalled(component._notify);
         });

         it('should generate event on last header unregistered', function() {
            const component = createComponent(scroll.Group, options);
            component._stickyRegisterHandler(event, data, true);
            sinon.stub(component, '_notify');
            component._stickyRegisterHandler(event, data, false);

            sinon.assert.calledWith(component._notify, 'stickyRegister');
         });

         it('should not generate event on not last header unregistered', function() {
            const component = createComponent(scroll.Group, options);
            const position = { vertical: null, horizontal: null };
            component._stickyRegisterHandler(event, data, true);
            component._stickyRegisterHandler(event, {id: 3, inst: data.inst, position}, true);
            sinon.stub(component, '_notify');
            component._stickyRegisterHandler(event, {id: 3, inst: data.inst, position}, false);

            sinon.assert.notCalled(component._notify);
            sinon.restore();
         });
      });
      describe('_stickyModeChanged', () => {
         it('should notify stickyModeChanged only once', () => {
            const component = createComponent(scroll.Group, options);
            sinon.stub(component, '_notify');
            const event = {
               stopPropagation: () => 0
            };
            const stickyHeadersInGroup = [{
               id: 0,
               mode: 'stackable'
            }, {
               id: 1,
               mode: 'stackable'
            }, {
               id: 2,
               mode: 'stackable'
            }];
            for (const stickyHeader of stickyHeadersInGroup) {
               component._stickyModeChanged(event, stickyHeader.id, stickyHeader.mode);
            }
            sinon.assert.calledOnce(component._notify);
            sinon.restore();
         });
      });
   });

});
