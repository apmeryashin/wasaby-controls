define([
   'Env/Env',
   'Controls/scroll',
   'Core/core-merge',
    'Controls/_scroll/StickyBlock/Utils'
], function(
   Env,
   scroll,
   coreMerge,
   StickyHeaderUtils
) {
   'use strict';

   const SHADOW_VISIBILITY_BY_CONTROLLER = StickyHeaderUtils.SHADOW_VISIBILITY_BY_CONTROLLER;

   const
      getRegisterObject = function(cfg) {
         const container = {
            offsetParent: {},
            getBoundingClientRect() {
               return {height: 500};
            }
         };
         return {
            id: scroll.getNextStickyId(),
            position: (cfg && cfg.position) || 'top',
            container,
            inst: {
               getOffset: function() {
                  return 0;
               },
               getHeaderContainer: function() {
                  return container;
               },
               height: 10,
               resetSticky: sinon.fake(),
               restoreSticky: sinon.fake(),
               updateShadowVisibility: sinon.fake(),
               offsetTop: 0
            }
         };
      },
      options = {
      },
      data = {
            id: 2,
            position: {
                vertical: 'top'
            },
            mode: 'stackable',
            inst: {
               getOffset: function() {
                  return 0;
               },
               getHeaderContainer: function(){
                  return {
                     getBoundingClientRect() {
                        return {
                           height: 500
                        };
                     }
                  };
               },
               setSyncDomOptimization: function () {},
               height: 10,
               resetSticky: sinon.fake(),
               restoreSticky: sinon.fake(),
               updateShadowVisibility: sinon.fake(),
               offsetTop: 0
            },
            container: {
               getBoundingClientRect() {
                  return {height: 500};
               }
            }
         };

   describe('Controls/_scroll/StickyBlock/Controller', function() {
      let component, container, result;

      beforeEach(function() {
         global.document = {
            body: {}
         };
         component = new scroll._stickyHeaderController({
            _notify: () => undefined

         });
         container = {
            scrollTop: 0,
            scrollHeight: 100,
            clientHeight: 100,
            children: [{}]
         };
         component._canScroll = true;
         sinon.stub(StickyHeaderUtils, 'isHidden').returns(false);
         // sinon.stub(scroll._stickyHeaderController, '_isVisible').returns(true);
      });

      afterEach(function() {
         sinon.restore();
         global.document = undefined;
      });


      describe('setCanScroll', function() {
         it('should update value from true to false and should not register waiting headers', function() {
            sinon.stub(component, '_registerDelayed');
            component.setCanScroll(false);
            component._initialized = true;
            assert.isFalse(component._canScroll);
            sinon.assert.notCalled(component._registerDelayed);
         });
         it('should update value from false to true and register waiting headers', function() {
            sinon.stub(component, '_registerDelayed');
            component._canScroll = false;
            component._initialized = true;
            component.setCanScroll(true);
            assert.isTrue(component._canScroll);
            sinon.assert.called(component._registerDelayed);
         });
      });

      describe('registerHandler', function() {
         const event = {
            stopImmediatePropagation: function() {}
         };

         it('should stopImmediatePropagation event', function() {
            let event = {
               blockUpdate: false,
               stopImmediatePropagation: sinon.fake()
            };
            component.init(container);
            sinon.stub(component, '_updateTopBottom');

            return component.registerHandler(event, data, true).then(function() {
               sinon.assert.calledOnce(event.stopImmediatePropagation);
            });
         });

         it('should call setSyncDomOptimization on header on registration', function() {
            let event = {
               blockUpdate: false,
               stopImmediatePropagation: sinon.fake()
            };
            component.init(container);
            sinon.stub(data.inst, 'setSyncDomOptimization');

            return component.registerHandler(event, data, true, false, false).then(function() {
               sinon.assert.calledOnce(data.inst.setSyncDomOptimization);
            });
         });

         it('should not call setSyncDomOptimization on header on unregistration', function() {
            let event = {
               blockUpdate: false,
               stopImmediatePropagation: sinon.fake()
            };
            component.init(container);
            component._headers[data.id] = data;
            sinon.stub(data.inst, 'setSyncDomOptimization');
            // sinon.stub(component, '_unobserveStickyHeader');

            return component.registerHandler(event, data, false, false, false).then(function() {
               sinon.assert.notCalled(data.inst.setSyncDomOptimization);
            });
         });

         [{
            position: {
                vertical: 'top'
            }
         }, {
            position: {
                vertical: 'bottom'
            }
         }, {
            position: {
                vertical: 'topBottom'
            }
         }].forEach(function(test) {
            it(`should register new header on position ${test.position.vertical}`, function() {
               let
                  event = {
                     stopImmediatePropagation: sinon.fake()
                  },
                  data = getRegisterObject(test);
               component.init(container);
               sinon.stub(component, '_updateTopBottom');
               return component.registerHandler(event, data, true).then(function() {
                  assert.deepOwnInclude(component._headers[data.id], data);
                  if (test.position.vertical === 'topBottom') {
                     assert.include(component._headersStack['top'], data.id);
                     assert.include(component._headersStack['bottom'], data.id);
                  } else {
                     assert.include(component._headersStack[test.position.vertical], data.id);
                  }
               });
            });
         });

         [{
            position: {
                vertical: 'top'
            }
         }, {
            position: {
                vertical: 'bottom'
            }
         }, {
            position: {
                vertical: 'topBottom'
            }
         }].forEach(function(test) {
            it(`should put headers in delayedHeaders collection, after afterMount register on position ${test.position.vertical}`, function() {
               let
                  event = {
                     stopImmediatePropagation: sinon.fake()
                  },
                  data = getRegisterObject(test);

               return new Promise((resolve) => {
                  Promise.all([
                     component.registerHandler(event, data, true),
                     component.registerHandler(event, data, true)
                  ]).then(function() {
                     sinon.stub(component, '_updateTopBottom');
                     assert.equal(component._delayedHeaders.length, 2);
                     component.init(container);
                     Promise.resolve().then(() => {
                        assert.equal(component._delayedHeaders.length, 0);
                        if (test.position.vertical === 'topBottom'){
                           assert.equal(component._headersStack['top'].length, 2);
                           assert.equal(component._headersStack['bottom'].length, 2);
                        } else{
                           assert.equal(component._headersStack[test.position.vertical].length, 2);
                        }
                        resolve();
                     });

                  });
               });
            });
         });

         [{
            position: {
                vertical: 'top'
            },
            result: true,
         }, {
            position: {
                vertical: 'bottom'
            },
            result: true,
         }, {
            position: {
                vertical: 'topBottom'
            },
            result: true,
         }, {
            position: 'top',
            offset: 10,
            result: false,
         }, {
            position: {
                vertical: 'bottom'
            },
            offset: 10,
            result: false,
         }].forEach(function(test) {
            it(`should set correct fixedInitially. position: ${test.position.vertical}`, function() {
               let
                  event = {
                     stopImmediatePropagation: sinon.fake()
                  },
                  data = getRegisterObject(test);

               component.init(container);
               sinon.stub(data.inst, 'getOffset').returns(test.offset || 0);
               return component.registerHandler(event, data, true).then(function() {
                  if (test.result) {
                     assert.isTrue(component._headers[data.id].fixedInitially);
                  } else {
                     assert.isFalse(component._headers[data.id].fixedInitially);
                  }
               });
            });
         });

         [{
            position: {
               vertical: 'top'
            }
         }, {
            position: {
               vertical: 'bottom'
            },
         }, {
            position: {
               vertical: 'topBottom'
            }
         }].forEach(function(test) {
            it(`should unregister deleted header on position ${test.position.vertical}`, function() {
               let event = {
                     blockUpdate: false,
                     stopImmediatePropagation: sinon.fake()
                  },
                  data = getRegisterObject(test);
               component._headers[data.id] = data;
               if (test.position.vertical === 'topBottom') {
                  component._headersStack['top'].push(data.id);
                  component._headersStack['bottom'].push(data.id);
                  component._fixedHeadersStack['bottom'].push(data.id);
               } else {
                  component._headersStack[test.position.vertical].push(data.id);
                  component._fixedHeadersStack[test.position.vertical].push(data.id);
               }
               return component.registerHandler(event, data, false).then(function() {
                  assert.isUndefined(component._headers[data.id]);
                  if (test.position.vertical === 'topBottom') {
                     assert.notInclude(component._headersStack['top'], data.id);
                     assert.notInclude(component._headersStack['bottom'], data.id);
                     assert.notInclude(component._fixedHeadersStack['bottom'], data.id);
                  } else {
                     assert.notInclude(component._headersStack[test.position.vertical], data.id);
                     assert.notInclude(component._fixedHeadersStack[test.position.vertical], data.id);
                  }
               });
            });
         });

         it('should remove header from delayedHeaders when its unregister', function () {
            let event = {
                   blockUpdate: false,
                   stopImmediatePropagation: sinon.fake()
                },
                data = getRegisterObject({position: { vertical: 'top' }});

            component._headers[data.id] = data;
            component._delayedHeaders[0] = data;
            return component.registerHandler(event, data, false).then(function() {
               assert.equal(component._delayedHeaders.length, 0);
            });
         });

         it('should insert header in proper position', function() {
            component.init(container);
            return Promise.all([0, 20, 10].map(function(offset, index) {
               const container = {
                  parentElement: 1,
                  getBoundingClientRect() {
                     return {height: 500};
                  }
               };
               const header = {
                  container,
                  id: index,
                  position: {
                      vertical:  'top'
                  },
                  mode: 'stackable',
                  inst: {
                     getOffset: function() {
                        return offset;
                     },
                     getHeaderContainer: function() {
                        return container;
                     },
                     resetSticky: sinon.fake(),
                     restoreSticky: sinon.fake(),
                     updateShadowVisibility: sinon.fake()
                  }
               };
               component.registerHandler(event, header, true);
            })).then(function() {
               assert.deepEqual(component._headersStack.top, [0, 2, 1]);
            });
         });
      });

      describe('StickyBlock', function() {
         var event = {
            stopImmediatePropagation: function() {}
         };

         describe('_fixedHandler', function() {
            beforeEach(function() {
               component._headers = {
                  sticky1: {
                     mode: 'stackable',
                     inst: {
                        height: 10,
                        updateShadowVisible: sinon.fake(),
                        updateShadowVisibility: sinon.fake()
                     }
                  },
                  sticky2: {
                     mode: 'stackable',
                     inst: {
                        height: 10,
                        updateShadowVisible: sinon.fake(),
                        updateShadowVisibility: sinon.fake()
                     }
                  },
                  sticky3: {
                     mode: 'stackable',
                     inst: {
                        height: 10,
                        updateShadowVisible: sinon.fake(),
                        updateShadowVisibility: sinon.fake()
                     }
                  }
               };
            });

            it('should not called fakeFixedNotifier if prev header in headersStack mode=stackable', () => {
               let fakeFixedNotifierStb = sinon.fake();
               sinon.stub(component, '_updateShadowsVisibility');
               sinon.stub(component, '_callFixedCallback');
               component._headersStack.top = [0, 1];
               component._headers = [{
                  mode: 'stackable',
                  inst: {
                     fakeFixedNotifier: fakeFixedNotifierStb
                  }
               }, {
                  mode: 'replaceable'
               }];
               component.fixedHandler(event, coreMerge({
                  id: 1,
                  fixedPosition: 'top'
               }, data, {preferSource: true}));
               sinon.assert.notCalled(fakeFixedNotifierStb);
               sinon.restore();
            });

            it('should called fakeFixedNotifier with correct arg (isFixed = true)', () => {
               let updateFixedStub = sinon.fake();
               sinon.stub(component, '_updateShadowsVisibility');
               sinon.stub(component, '_callFixedCallback');
               sinon.stub(component, '_updateFixationState').returns(true);
               component._headersStack.top = [0, 1];
               component._headers = [{
                  mode: 'replaceable',
                  inst: {
                     fakeFixedNotifier: updateFixedStub,
                     updateShadowVisible: sinon.fake(),
                     updateShadowVisibility: sinon.fake()
                  }
               }, {
                  mode: 'replaceable',
                  inst: {
                     updateShadowVisible: sinon.fake(),
                     updateShadowVisibility: sinon.fake()
                  }
               }];
               component.fixedHandler(event, coreMerge({
                  id: 1,
                  fixedPosition: '',
                  prevPosition: 'top'
               }, data, {preferSource: true}));
               sinon.assert.calledWith(updateFixedStub, true);
               sinon.restore();
            });

            it('should called fakeFixedNotifier with correct arg (isFixed = false)', () => {
               let updateFixedStub = sinon.fake();
               sinon.stub(component, '_updateShadowsVisibility');
               sinon.stub(component, '_callFixedCallback');
               component._headersStack.top = [0, 1];
               component._headers = [{
                  mode: 'replaceable',
                  inst: {
                     fakeFixedNotifier: updateFixedStub
                  }
               }, {
                  mode: 'replaceable'
               }];
               component.fixedHandler(event, coreMerge({
                  id: 1,
                  fixedPosition: 'top'
               }, data, {preferSource: true}));
               sinon.assert.calledWith(updateFixedStub, false);
               sinon.restore();
            });

            it('Header with id equal to "sticky" stops being fixed', function() {
               component.fixedHandler(event, coreMerge({
                  id: 'sticky1',
                  fixedPosition: '',
                  shadowVisible: true
               }, data, {preferSource: true}));

               assert.isEmpty(component._fixedHeadersStack.top);
               assert.isEmpty(component._fixedHeadersStack.bottom);
            });
            it('Header with id equal to "sticky" fixed', function() {
               component.fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top',
                  shadowVisible: true
               });
               assert.include(component._fixedHeadersStack.top, 'sticky1');

               component.fixedHandler(event, {
                  id: 'sticky2',
                  fixedPosition: 'bottom',
                  shadowVisible: true
               });
               assert.include(component._fixedHeadersStack.bottom, 'sticky2');
            });
            it('Header with id equal to "sticky" fixed and then stop being fixed', function() {
               component.fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top',
                  shadowVisible: true
               });
               component.fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: '',
                  prevPosition: 'top',
                  shadowVisible: true
               });

               assert.isEmpty(component._fixedHeadersStack.top);
               assert.isEmpty(component._fixedHeadersStack.bottom);
            });
            it('Header with id equal to "sticky" fixed to another position', function() {
               component.fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top',
                  prevPosition: '',
                  shadowVisible: true,
                  isFakeFixed: false
               });
               component.fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'bottom',
                  prevPosition: 'top',
                  shadowVisible: true,
                  isFakeFixed: false
               });

               assert.isEmpty(component._fixedHeadersStack.top);
               assert.include(component._fixedHeadersStack.bottom, 'sticky1');
            });
            it('Header with id equal to "sticky1" fixed, Header with id equal to "sticky2" stop being fixed', function() {
               component.fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top',
                  shadowVisible: true
               });
               component.fixedHandler(event, {
                  id: 'sticky2',
                  fixedPosition: '',
                  prevPosition: 'top',
                  shadowVisible: true
               });

               assert.include(component._fixedHeadersStack.top, 'sticky1');
               assert.notInclude(component._fixedHeadersStack.top, 'sticky2');
            });
            it('Header with id equal to "sticky1" stop being fixed, Header with id equal to "sticky2" fixed', function() {
               component.fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: '',
                  prevPosition: 'top'
               });
               component.fixedHandler(event, {
                  id: 'sticky2',
                  fixedPosition: 'top'
               });

               assert.include(component._fixedHeadersStack.top, 'sticky2');
               assert.notInclude(component._fixedHeadersStack.top, 'sticky1');
            });
            it('Shadow Optimization Check', function() {
               component._fixedHeadersStack.top = [];
               component.fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top',
                  prevPosition: '',
                  mode: 'stackable',
                  height: 10,
                  shadowVisible: true
               });
               sinon.assert.notCalled(component._headers['sticky1'].inst.updateShadowVisible);
               component.fixedHandler(event, {
                  id: 'sticky2',
                  fixedPosition: 'top',
                  prevPosition: '',
                  mode: 'stackable',
                  height: 10,
                  shadowVisible: true
               });
               sinon.assert.called(component._headers['sticky1'].inst.updateShadowVisible);
               component.fixedHandler(event, {
                  id: 'sticky3',
                  fixedPosition: 'top',
                  prevPosition: '',
                  mode: 'stackable',
                  height: 10,
                  shadowVisible: true
               });
               sinon.assert.called(component._headers['sticky1'].inst.updateShadowVisible);
            });
            it('Should not notify new state if one header registered', function() {
               component.fixedHandler(event, {
                  id: 'sticky1',
                  fixedPosition: 'top',
                  mode: 'stackable',
                  height: 10,
                  shadowVisible: true
               });
               sinon.assert.notCalled(component._headers['sticky1'].inst.updateShadowVisible);
            });
         });
      });

      describe('getHeadersHeight', function() {
         var event = {
            stopImmediatePropagation: function() {}
         };
         it('should return the correct height without registred headers.', function () {
            assert.equal(component.getHeadersHeight('top'), 0);
            assert.equal(component.getHeadersHeight('bottom'), 0);
            assert.equal(component.getHeadersHeight('top', 'allFixed'), 0);
            assert.equal(component.getHeadersHeight('bottom', 'allFixed'), 0);
            assert.equal(component.getHeadersHeight('top', 'fixed'), 0);
            assert.equal(component.getHeadersHeight('bottom', 'fixed'), 0);
         });
         it('should return the correct height after a new header has been registered.', function () {

            component.init(container);
            return component.registerHandler(event, data, true).then(function() {
               assert.equal(component.getHeadersHeight('top'), 0);
               assert.equal(component.getHeadersHeight('bottom'), 0);
               assert.equal(component.getHeadersHeight('top', 'allFixed'), 10);
               assert.equal(component.getHeadersHeight('bottom', 'allFixed'), 0);
               assert.equal(component.getHeadersHeight('top', 'fixed'), 0);
               assert.equal(component.getHeadersHeight('bottom', 'fixed'), 0);
            });
         });
         it('should return the correct height after a new replaceable header has been registered and fixed.', function () {
            component.init(container);
            return component.registerHandler(event, data, true).then(function() {
               component.fixedHandler(event, {
                  container: {parentElement: 1},
                  id: data.id,
                  fixedPosition: 'top',
                  prevPosition: '',
                  height: 10,
                  shadowVisible: true
               });
               assert.equal(component.getHeadersHeight('top'), 10);
               assert.equal(component.getHeadersHeight('bottom'), 0);
               assert.equal(component.getHeadersHeight('top', 'allFixed'), 10);
               assert.equal(component.getHeadersHeight('bottom', 'allFixed'), 0);
               assert.equal(component.getHeadersHeight('top', 'fixed'), 10);
               assert.equal(component.getHeadersHeight('bottom', 'fixed'), 0);
            });
         });

         it('should return the correct height after a new header is not at the very top has been registered and fixed.', function () {
            const data = {
               id: 2,
               position: {
                   vertical: 'top'
               },
               mode: 'stackable',
               inst: {
                  getOffset: function() {
                     return 10;
                  },
                  getHeaderContainer: function() {
                     return {
                        getBoundingClientRect() {
                           return {height: 500};
                        }
                     };
                  },
                  height: 10,
                  resetSticky: sinon.fake(),
                  restoreSticky: sinon.fake(),
                  updateShadowVisibility: sinon.fake(),
                  offsetTop: 0
               },
               container: {
                  getBoundingClientRect() {
                     return {height: 500};
                  }
               }
            };
            component.init(container);
            return component.registerHandler(event, data, true).then(function() {
               component.fixedHandler(event, {
                  id: data.id,
                  fixedPosition: 'top',
                  prevPosition: '',
                  height: 10,
                  shadowVisible: true,
                  inst: {
                     updateShadowVisibility: sinon.fake()
                  }
               });
               assert.equal(component.getHeadersHeight('top'), 0);
               assert.equal(component.getHeadersHeight('bottom'), 0);
               assert.equal(component.getHeadersHeight('top', 'allFixed'), 10);
               assert.equal(component.getHeadersHeight('bottom', 'allFixed'), 0);
               assert.equal(component.getHeadersHeight('top', 'fixed'), 10);
               assert.equal(component.getHeadersHeight('bottom', 'fixed'), 0);
            });
         });

         it('should return the correct height after a new stackable header has been registered and fixed.', function () {
            component.init(container);
            return component.registerHandler(event, coreMerge({ mode: 'stackable' }, data, { preferSource: true }), true).then(function() {
               component.fixedHandler(event, {
                  id: data.id,
                  fixedPosition: 'top',
                  prevPosition: '',
                  height: 10,
                  shadowVisible: true
               });
               assert.equal(component.getHeadersHeight('top'), 10);
               assert.equal(component.getHeadersHeight('bottom'), 0);
               assert.equal(component.getHeadersHeight('top', 'allFixed'), 10);
               assert.equal(component.getHeadersHeight('bottom', 'allFixed'), 0);
               assert.equal(component.getHeadersHeight('top', 'fixed'), 10);
               assert.equal(component.getHeadersHeight('bottom', 'fixed'), 0);
            });
         });

         it('should return the correct height after a new header with offsetTop has been registered and fixed.', function () {
            component.init(container);
            const data = {
               id: 2,
               position: {
                   vertical: 'top'
               },
               mode: 'stackable',
               inst: {
                  getOffset: function() {
                     return 10;
                  },
                  getHeaderContainer: function() {
                     return {
                        getBoundingClientRect() {
                           return { height: 300 };
                        }
                     };
                  },
                  offsetTop: -130,
                  height: 300,
                  resetSticky: sinon.fake(),
                  restoreSticky: sinon.fake(),
                  updateShadowVisibility: sinon.fake()
               },
               container: {
                  getBoundingClientRect() {
                     return { height: 300 };
                  }
               }
            };
            return component.registerHandler(event, coreMerge({ mode: 'stackable' }, data, { preferSource: true }), true).then(function() {
               component.fixedHandler(event, {
                  id: data.id,
                  fixedPosition: 'top',
                  prevPosition: '',
                  height: 10,
                  shadowVisible: true
               });
               assert.equal(component.getHeadersHeight('top'), 170, 'top');
               assert.equal(component.getHeadersHeight('bottom'), 0, 'bottom');
               assert.equal(component.getHeadersHeight('top', 'allFixed'), 170, 'top allFixed');
               assert.equal(component.getHeadersHeight('bottom', 'allFixed'), 0, 'bottom allFixed');
               assert.equal(component.getHeadersHeight('top', 'fixed'), 170, 'top fixed');
               assert.equal(component.getHeadersHeight('bottom', 'fixed'), 0, 'bottom fixed');
            });
         });
      });

      describe('_changeHeadersStackByHeader', () => {
         let sandbox;
         beforeEach(function() {
            sandbox = sinon.createSandbox();
         });

         afterEach(function() {
            sandbox.restore();
            sandbox = null;
         });

         it('should remove header from headersStack', () => {
            const stb = sandbox.stub(component, '_removeFromStack');
            const header = {
               id: 0
            };
            component._headers[0] = {
               offset: {}
            };
            component._changeHeadersStackByHeader(header, 'remove');
            sinon.assert.calledOnce(stb);
         });

         it('should add header to headersStack', () => {
            const stb = sandbox.stub(component, '_addToHeadersStack');
            const header = {
               id: 0
            };
            component._headers[0] = {
               position: {
                  vertical: 'top'
               }
            };
            component._changeHeadersStackByHeader(header, 'add');
            sinon.assert.calledOnce(stb);
            sinon.assert.calledWith(stb, header.id, component._headers[0].position, true);
         });
      });

      describe('hasShadowVisible', () => {
         beforeEach(() => {
            component._headers = {
               header1: {
                  inst: {
                     shadowVisibility: 'hidden'
                  }
               },
               header2: {
                  inst: {
                     shadowVisibility: 'lastVisible'
                  }
               }
            };
         });

         [{
            fixedHeaders: {
               top: ['header1']
            },
            position: {
               vertical: 'top'
            },
            resp: false
         }, {
            fixedHeaders: {
               top: ['header2']
            },
            position: {
               vertical: 'top'
            },
            resp: true
         }].forEach((test) => {
            it('should push new elements to array of heights', () => {
               component._fixedHeadersStack = test.fixedHeaders;
               assert.strictEqual(component.hasShadowVisible(test.position.vertical), test.resp);
            });
         });
      });

      describe('_getLastFixedHeaderWithShadowId', () => {
         it('should ignore hidden header when getting header with the last shadow', function() {
            sinon.restore();
            let position = 'top';
            component._headersStack[position] = ['header0', 'header1'];
            component._fixedHeadersStack[position] = ['header0', 'header1'];

            component._headers = {
               header0: {
                  inst: {
                     shadowVisibility: 'auto',
                     getHeaderContainer: () => 'visible'
                  }
               },
               header1: {
                  inst: {
                     shadowVisibility: 'auto',
                     getHeaderContainer: () => 'hidden'
                  }
               }
            };

            sinon.replace(StickyHeaderUtils, 'isHidden', (container) => {
               if (container === 'hidden') {
                  return true;
               }
               return false;
            });

            let headerWithShadow = component._getLastFixedHeaderWithShadowId(position);

            assert.equal(headerWithShadow, 'header0');
            sinon.restore();
         });
      });

      describe('_updateShadowsVisibility', () => {
         beforeEach(() => {
            component._headers = {
               header0: {
                  inst: {
                     shadowVisibility: 'visible',
                     updateShadowVisibility: sinon.stub(),
                     getHeaderContainer: sinon.stub()
                  }
               },
               header1: {
                  inst: {
                     shadowVisibility: 'lastVisible',
                     updateShadowVisibility: sinon.stub(),
                     getHeaderContainer: sinon.stub()
                  }
               },
               header2: {
                  inst: {
                     shadowVisibility: 'visible',
                     updateShadowVisibility: sinon.stub(),
                     getHeaderContainer: sinon.stub()
                  }
               },
               header3: {
                  inst: {
                     shadowVisibility: 'hidden',
                     updateShadowVisibility: sinon.stub(),
                     getHeaderContainer: sinon.stub()
                  }
               },
               header4: {
                  inst: {
                     shadowVisibility: 'visible',
                     updateShadowVisibility: sinon.stub(),
                     getHeaderContainer: sinon.stub()
                  },
                  mode: StickyHeaderUtils.MODE.replaceable
               },
               header5: {
                  inst: {
                     shadowVisibility: 'visible',
                     updateShadowVisibility: sinon.stub(),
                     getHeaderContainer: sinon.stub()
                  },
                  mode: StickyHeaderUtils.MODE.replaceable
               },
               header6: {
                  inst: {
                     shadowVisibility: 'visible',
                     updateShadowVisibility: sinon.stub(),
                     getHeaderContainer: sinon.stub(),
                     container: {
                        closest: () => true
                     }
                  },
                  mode: StickyHeaderUtils.MODE.replaceable
               }
            };
            component._fixedHeadersStack.top = ['header0', 'header1', 'header2'];
         });

         [{
            _headersStack: ['header0', 'header1', 'header2'],
            resp: [
               SHADOW_VISIBILITY_BY_CONTROLLER.auto,
               SHADOW_VISIBILITY_BY_CONTROLLER.hidden,
               SHADOW_VISIBILITY_BY_CONTROLLER.auto
            ]
         }, {
            _headersStack: ['header1', 'header2', 'header0'],
            resp: [
               SHADOW_VISIBILITY_BY_CONTROLLER.hidden,
               SHADOW_VISIBILITY_BY_CONTROLLER.auto,
               SHADOW_VISIBILITY_BY_CONTROLLER.auto
            ]
         }, {
            _headersStack: ['header2', 'header0', 'header1'],
            resp: [
               SHADOW_VISIBILITY_BY_CONTROLLER.auto,
               SHADOW_VISIBILITY_BY_CONTROLLER.auto,
               SHADOW_VISIBILITY_BY_CONTROLLER.auto
            ]
         }, {
            _headersStack: ['header0', 'header1', 'header2', 'header3'],
            fixedHeadersStack: ['header0', 'header1', 'header2', 'header3'],
            resp: [
               SHADOW_VISIBILITY_BY_CONTROLLER.auto,
               SHADOW_VISIBILITY_BY_CONTROLLER.hidden,
               SHADOW_VISIBILITY_BY_CONTROLLER.auto,
               SHADOW_VISIBILITY_BY_CONTROLLER.auto
            ]
         }, {
            _headersStack: ['header0', 'header4', 'header5'],
            fixedHeadersStack: ['header0', 'header4', 'header5'],
            resp: [
               SHADOW_VISIBILITY_BY_CONTROLLER.visible,
               SHADOW_VISIBILITY_BY_CONTROLLER.visible,
               SHADOW_VISIBILITY_BY_CONTROLLER.hidden
            ],
            scrollShadowVisibility: 'visible'
         }, {
            _headersStack: ['header0', 'header5', 'header6'],
            fixedHeadersStack: ['header0', 'header5', 'header6'],
            resp: [
               SHADOW_VISIBILITY_BY_CONTROLLER.visible,
               SHADOW_VISIBILITY_BY_CONTROLLER.visible,
               SHADOW_VISIBILITY_BY_CONTROLLER.hidden
            ],
            scrollShadowVisibility: 'visible'
         }].forEach((test, index) => {
            it('test ' + index, () => {
               component._shadowVisibility = {
                  top: test.scrollShadowVisibility || 'auto',
                  bottom: true
               };
               component._headersStack.top = test._headersStack;
               if (test.fixedHeadersStack) {
                  component._fixedHeadersStack.top = test.fixedHeadersStack;
               }
               component._updateShadowsVisibility();
               for (let i = 0; i < component._headersStack.top.length; i++) {
                  sinon.assert.calledWith(
                     component._headers[component._headersStack.top[i]].inst.updateShadowVisibility, test.resp[i]);
               }
            });
         });
      });

      describe('_updateTopBottomDelayed', () => {
         it('should update height cache', () => {
            component._headers = {
               header0: {
                  mode: 'stackable',
                  position: {
                    vertical: 'top'
                  },
                  container: {
                     id: 0,
                     closest: () => false
                  },
                  inst: {
                     height: 20,
                     offsetTop: 0,
                     resetSticky: () => undefined,
                     getHeaderContainer: function() {
                        return {
                           id: 0,
                           closest: () => false
                        };
                     }
                  }
               },
               header1: {
                  mode: 'stackable',
                  position: {
                      vertical: 'top'
                  },
                  container: {
                     id: 1,
                     closest: () => false
                  },
                  inst: {
                     height: 30,
                     offsetTop: 0,
                     resetSticky: () => undefined,
                     getHeaderContainer: function() {
                        return {
                           id: 1,
                           closest: () => false
                        };
                     }
                  }
               },
               header2: {
                  mode: 'stackable',
                  position: {
                      vertical: 'top'
                  },
                  container: {
                     id: 2,
                     closest: () => false
                  },
                  inst: {
                     height: 40,
                     offsetTop: 0,
                     resetSticky: () => undefined,
                     getHeaderContainer: function() {
                        return {
                           id: 2,
                           closest: () => false
                        };
                     }
                  }
               }
            };
            component._headersStack.top = ['header0', 'header1', 'header2'];
            component._fixedHeadersStack.top = ['header0', 'header1', 'header2'];
            return component._updateTopBottomDelayed().then(() => {
               for (let headerId of ['header0', 'header1']) {
                  const heightItem = component._sizeObserver._elementsHeight.find((item) => {
                     return item.key.id === component._headers[headerId].inst.getHeaderContainer().id;
                  });
                  assert.strictEqual(heightItem.value, component._headers[headerId].inst.height);
               }
            });

            // heightItem = component._elementsHeight.find((item) => {
            //    return item.key === component._headers.header0.element;
            // });
            // assert.isEqual(component)
            // sinon.assert.calledWith(component._headers['header' + i].inst.updateShadowVisibility, test.resp[i]);

         });
      });

      describe('_updateHeadersFixedPositions', () => {
         it('Header with id equal to "sticky" stops being fixed', function() {
            const setFixedPosition = sinon.fake();
            component._headers = {
               sticky1: {
                  mode: 'stackable',
                  inst: {
                     height: 10,
                     offsetTop: 0,
                     getHeaderContainer: sinon.fake()
                  }
               },
               sticky2: {
                  mode: 'stackable',
                  inst: {
                     height: 10,
                     setFixedPosition: setFixedPosition,
                     offsetTop: 0,
                     getHeaderContainer: sinon.fake()
                  },
                  offset: { top: 5 }
               },
               sticky3: {
                  mode: 'stackable',
                  inst: {
                     height: 10,
                     offsetTop: 0,
                     getHeaderContainer: sinon.fake()
                  }
               }
            };
            component._headersStack = {
               top: ['sticky1', 'sticky2', 'sticky3']
            };
            component._updateHeadersFixedPositions(['sticky2']);

            sinon.assert.calledWith(setFixedPosition, 'top');
         });

         it('Second header should be unfixed (first header have offsetTop)', function() {
            const setFixedPosition = sinon.fake();
            component._headers = {
               sticky1: {
                  mode: 'stackable',
                  inst: {
                     height: 10,
                     offsetTop: -5,
                     getHeaderContainer: sinon.fake()
                  }
               },
               sticky2: {
                  mode: 'replaceable',
                  inst: {
                     height: 10,
                     setFixedPosition: setFixedPosition,
                     getHeaderContainer: sinon.fake()
                  },
                  offset: { top: 5 }
               }
            };
            component._headersStack = {
               top: ['sticky1', 'sticky2']
            };
            component._updateHeadersFixedPositions(['sticky2']);

            sinon.assert.notCalled(setFixedPosition);
         });

         it('Header with id equal to "sticky2" should not be unfixed', function() {
            const setFixedPosition = sinon.fake();
            component._headers = {
               sticky1: {
                  mode: 'stackable',
                  inst: {
                     height: 10,
                     getHeaderContainer: sinon.fake()
                  }
               },
               sticky2: {
                  mode: 'stackable',
                  inst: {
                     height: 10,
                     setFixedPosition: setFixedPosition,
                     getHeaderContainer: sinon.fake()
                  },
                  offset: { top: 10 }
               }
            };
            component._headersStack = {
               top: ['sticky1', 'sticky2']
            };
            component._updateHeadersFixedPositions(['sticky2']);

            sinon.assert.notCalled(setFixedPosition);
         });
      });

      describe('_headersResizeHandler', () => {
         it('should call _callResizeCallback if StickyBlock resized', () => {
            sinon.stub(component, 'resizeHandler');
            sinon.stub(component, '_callResizeCallback');
            component._headersResizeHandler([]);
            sinon.assert.calledOnce(component._callResizeCallback);
         });
      });

      describe('setShadowVisibility', () => {
         it('should sync update sticky state if there are registered headers ', function() {
            sinon.stub(component, '_updateShadowsVisibility');
            component._delayedHeaders = [{}, {}];
            component.setShadowVisibility(true, false);

            assert.isTrue(component._syncUpdate);
         });

         it('should sync update sticky state if there are not registered headers ', function() {
            sinon.stub(component, '_updateShadowsVisibility');
            component._delayedHeaders = [];
            component.setShadowVisibility(true, false);

            assert.isFalse(component._syncUpdate);
         });
      });
   });
});
