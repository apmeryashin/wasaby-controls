define([
   'Controls/scroll',
   'UI/NodeCollector',
   'Core/core-instance',
], function(
   scroll,
   NodeCollector,
   cInstance
) {
   describe('Controls/scroll:scrollToElement', function() {

      var documentElement = {};
      function mockDOM(bodyScrollTop, bodyClientHeight) {
         document = {
            body: {
               overflowY: 'scroll',
               scrollTop: bodyScrollTop || 0,
               clientHeight: bodyClientHeight || 0,
               className: '',
               closest: () => [],
               getBoundingClientRect: () => { return { height: 100 }; }
            },
            documentElement: documentElement
         };
         document.body.scrollHeight = document.body.clientHeight + 10;
         window = {
            pageYOffset: 0,
            getComputedStyle: function(element) {
               return {
                  overflowY: element.overflowY,
                  scrollHeight: element.scrollHeight,
                  clientHeight: element.clientHeight
               };
            }
         };
      }

      afterEach(function() {
         document = undefined;
         window = undefined;
         sinon.restore();
      });

      it('waitInitialization = true', function() {
         mockDOM();
         let isInited = false;
         sinon.stub(NodeCollector, 'goUpByControlTree').returns([{
            containerLoaded: true,
            initHeaderController: () => {
               let resp;
               if (!isInited) {
                  resp = Promise.resolve();
                  isInited = true;
               }
               return resp;
            },
            getHeadersHeight: () => 4
         }]);
         sinon.stub(cInstance, 'instanceOfModule').returns(true);
         var element = {
            classList: {
               contains: () => false
            },
            querySelector: () => null,
            parentElement: {
               overflowY: 'scroll',
               scrollHeight: 110,
               clientHeight: 100,
               top: 10,
               getBoundingClientRect: function() {
                  return {
                     top: this.top,
                     height: this.clientHeight
                  };
               },
               scrollTop: 0,
               className: '',
               closest: () => []
            },
            getBoundingClientRect: function() {
               return {
                  top: 15,
                  height: 150
               };
            },
            closest: () => {}
         };
         const resp = scroll.scrollToElement(element, 'top', false, true).then(() => {
            assert.equal(element.parentElement.scrollTop, 1);
            console.log(resp);
         });
         assert.equal(element.parentElement.scrollTop, 0);
         return resp;
      });

      describe('scroll down', function() {
         it('to top', function() {
            mockDOM();
            var element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 110,
                  clientHeight: 100,
                  top: 10,
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 0,
                  className: '',
                  closest: () => []
               },
               getBoundingClientRect: function() {
                  return {
                     top: 15,
                     height: 150
                  };
               },
               closest: () => {}
            };
            scroll.scrollToElement(element);
            assert.equal(element.parentElement.scrollTop, 5);
         });

         it('to top force', function() {
            mockDOM();
            var element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 110,
                  clientHeight: 100,
                  top: 10,
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 0,
                  className: '',
                  closest: () => []
               },
               getBoundingClientRect: function() {
                  return {
                     top: 15,
                     height: 150
                  };
               },
               closest: () => {}
            };
            scroll.scrollToElement(element, false, true);
            assert.equal(element.parentElement.scrollTop, 5);
         });

         it('to center', function() {
            mockDOM();
            var element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 1000,
                  clientHeight: 100,
                  top: 10,
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 300,
                  className: '',
                  closest: () => []
               },
               getBoundingClientRect: function() {
                  return {
                     top: 200,
                     height: 10
                  };
               },
               closest: () => {}
            };
            scroll.scrollToElement(element, 'center');
            assert.equal(element.parentElement.scrollTop, 445);
         });

         it('to bottom', function() {
            mockDOM();
            var element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 110,
                  clientHeight: 100,
                  top: 10,
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 0,
                  className: '',
                  closest: () => []
               },
               getBoundingClientRect: function() {
                  return {
                     top: 15,
                     height: 150
                  };
               },
               closest: () => {}
            };
            scroll.scrollToElement(element, true);
            assert.equal(element.parentElement.scrollTop, 55);
         });

         it('should scroll only first parentElement', function () {
            mockDOM();
            let element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 110,
                  clientHeight: 100,
                  top: 15,
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 0,
                  className: '',
                  parentElement: {
                     overflowY: 'scroll',
                     scrollHeight: 110,
                     clientHeight: 100,
                     top: 5,
                     getBoundingClientRect: function() {
                        return {
                           top: this.top,
                           height: this.clientHeight
                        };
                     },
                     scrollTop: 0,
                     className: '',
                     closest: () => []
                  },
                  closest: () => []
               },
               getBoundingClientRect: function() {
                  return {
                     top: 25,
                     height: 20
                  };
               },
               closest: () => []
            };
            scroll.scrollToElement(element, false, true);
            assert.equal(element.parentElement.parentElement.scrollTop, 0);
            assert.equal(element.parentElement.scrollTop, 10);
         });

         it('to bottom with fractional coords', function() {
            mockDOM();
            var element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 110,
                  clientHeight: 100,
                  top: 10.6,
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 0,
                  className: '',
                  closest: () => []
               },
               getBoundingClientRect: function() {
                  return {
                     top: 15,
                     height: 150
                  };
               },
               closest: () => {}
            };
            scroll.scrollToElement(element, true);
            assert.equal(element.parentElement.scrollTop, 54);
         });

         it('with sticky header', () => {
            mockDOM();
            sinon.stub(NodeCollector, 'goUpByControlTree').returns([{ getHeadersHeight: () => 10 }]);
            sinon.stub(cInstance, 'instanceOfModule').returns(true);
            var element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 110,
                  clientHeight: 100,
                  top: 10.6,
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 0,
                  className: '',
                  closest: () => {
                     return { };
                  }
               },
               getBoundingClientRect: function() {
                  return {
                     top: 15,
                     height: 150
                  };
               },
               closest: () => {}
            };
            scroll.scrollToElement(element, true);
            assert.equal(element.parentElement.scrollTop, 64);
         })

         describe('scroll body', function() {
            it('to top', function() {
               mockDOM(10, 100);
               var element = {
                  classList: {
                     contains: () => false
                  },
                  querySelector: () => null,
                  parentElement: document.body,
                  className: '',
                  getBoundingClientRect: function() {
                     return {
                        top: 15,
                        height: 150
                     };
                  },
                  closest: () => {}
               };
               scroll.scrollToElement(element);
               assert.equal(element.parentElement.scrollTop, 15);
            });

            it('to bottom', function() {
               mockDOM(10, 100);
               var element = {
                  classList: {
                     contains: () => false
                  },
                  querySelector: () => null,
                  parentElement: document.body,
                  getBoundingClientRect: function() {
                     return {
                        top: 15,
                        height: 150
                     };
                  },
                  className: '',
                  closest: () => {}
               };
               scroll.scrollToElement(element, true);
               assert.equal(element.parentElement.scrollTop, 75);
            });

            it('to bottom with fractional coords', function() {
               mockDOM(10, 100);
               var element = {
                  classList: {
                     contains: () => false
                  },
                  querySelector: () => null,
                  parentElement: document.body,
                  getBoundingClientRect: function() {
                     return {
                        top: 14.6,
                        height: 150
                     };
                  },
                  className: '',
                  closest: () => {}
               };
               scroll.scrollToElement(element, true);
               assert.equal(element.parentElement.scrollTop, 75);
            });
         });
      });

      describe('content in sticky block', function () {
         it('should scroll only in sticky block container', function () {
            mockDOM(15, 150);
            var element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 160,
                  clientHeight: 150,
                  top: 15,
                  className: '',
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 0,
                  closest: () => [],
                  parentElement: {
                     overflowY: 'scroll',
                     scrollHeight: 160,
                     clientHeight: 150,
                     top: 15,
                     className: '',
                     getBoundingClientRect: function() {
                        assert.isFalse(true);
                     },
                     scrollTop: 0,
                     closest: () => {}
                  }
               },
               getBoundingClientRect: function() {
                  return {
                     top: 10,
                     height: 100
                  };
               },
               closest: () => true
            };
            scroll.scrollToElement(element);
            assert.equal(element.parentElement.scrollTop, -5);
         });
      });

      describe('scroll up', function() {
         it('to top', function() {
            mockDOM();
            var element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 160,
                  clientHeight: 150,
                  top: 15,
                  className: '',
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 0,
                  closest: () => []
               },
               getBoundingClientRect: function() {
                  return {
                     top: 10,
                     height: 100
                  };
               },
               closest: () => {}
            };
            scroll.scrollToElement(element);
            assert.equal(element.parentElement.scrollTop, -5);
         });

         it('to top force', function() {
            mockDOM();
            var element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 160,
                  clientHeight: 150,
                  top: 15,
                  className: '',
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 0,
                  closest: () => []
               },
               getBoundingClientRect: function() {
                  return {
                     top: 10,
                     height: 100
                  };
               },
               closest: () => {}
            };
            scroll.scrollToElement(element, false, true);
            assert.equal(element.parentElement.scrollTop, -5);
         });

         it('to top force and inner sticky block', function() {
            mockDOM();
            const element = {
               offsetHeight: 10,
               classList: {
                  contains: () => true
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 160,
                  clientHeight: 150,
                  top: 10,
                  className: '',
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 15,
                  closest: () => []
               },
               getBoundingClientRect: function() {
                  return {
                     top: 20,
                     height: 100
                  };
               },
               closest: () => {}
            };
            scroll.scrollToElement(element, false, true);
            assert.equal(element.parentElement.scrollTop, 25);
         });

         it('to top force and sticky block with offsetTop', function() {
            mockDOM();
            sinon.stub(NodeCollector, 'goUpByControlTree').returns([{ getHeadersHeight: () => 10 }]);
            sinon.stub(cInstance, 'instanceOfModule').returns(true);
            var element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 160,
                  clientHeight: 150,
                  top: 10,
                  className: '',
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 15,
                  closest: () => []
               },
               getBoundingClientRect: function() {
                  return {
                     top: 20,
                     height: 100
                  };
               },
               closest: () => {}
            };
            scroll.scrollToElement(element, false, true);
            assert.equal(element.parentElement.scrollTop, 15);
         });

         it('to bottom', function() {
            mockDOM();
            var element = {
               classList: {
                  contains: () => false
               },
               querySelector: () => null,
               parentElement: {
                  overflowY: 'scroll',
                  scrollHeight: 160,
                  clientHeight: 150,
                  top: 15,
                  className: '',
                  getBoundingClientRect: function() {
                     return {
                        top: this.top,
                        height: this.clientHeight
                     };
                  },
                  scrollTop: 0,
                  closest: () => []
               },
               getBoundingClientRect: function() {
                  return {
                     top: 10,
                     height: 100
                  };
               },
               closest: () => {}
            };
            scroll.scrollToElement(element, true);
            assert.equal(element.parentElement.scrollTop, -55);
         });

         describe('scroll body', function() {
            it('to top', function() {
               mockDOM(15, 150);
               var element = {
                  classList: {
                     contains: () => false
                  },
                  querySelector: () => null,
                  parentElement: document.body,
                  className: '',
                  getBoundingClientRect: function() {
                     return {
                        top: 10,
                        height: 100
                     };
                  },
                  closest: () => {}
               };
               scroll.scrollToElement(element);
               assert.equal(element.parentElement.scrollTop, 10);
            });

            it('to bottom', function() {
               mockDOM(15, 150);
               var element = {
                  classList: {
                     contains: () => false
                  },
                  querySelector: () => null,
                  parentElement: document.body,
                  className: '',
                  getBoundingClientRect: function() {
                     return {
                        top: 10,
                        height: 100
                     };
                  },
                  closest: () => {}
               };
               scroll.scrollToElement(element, true);
               assert.equal(element.parentElement.scrollTop, -25);
            });
         });
      });
   });
});
