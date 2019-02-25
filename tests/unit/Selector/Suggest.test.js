define(
   [
      'Controls/Selector/Suggest',
      'Core/core-clone',
      'Types/source',
      'Controls/Input/resources/InputRender/BaseViewModel',
      'Types/collection'
   ],
   (Suggest, Clone, sourceLib, BaseViewModel, collection) => {
      describe('Selector.Suggest', () => {
         let items = [
            {
               id: '1',
               title: 'Запись 1'
            },
            {
               id: '2',
               title: 'Запись 2'
            },
            {
               id: '3',
               title: 'Запись 3'
            }
         ];

         let config = {
            selectedKey: '2',
            displayProperty: 'title',
            keyProperty: 'id',
            value: 'New text',
            placeholder: 'This is placeholder',
            source: new sourceLib.Memory({
               idProperty: 'id',
               data: items
            })
         };


         let getSuggest = function(config) {
            let suggest = new Suggest(config);
            suggest.saveOptions(config);
            suggest._simpleViewModel = new BaseViewModel();
            return suggest;
         };

         it('_beforeMount', function(done) {
            let suggest = getSuggest(config);
            suggest._beforeMount(config).addCallback(function(items) {
               assert.equal(suggest._value, 'Запись 2');
               done();
            });
         });

         it('_beforeMount selectedKey not set', function() {
            let newConfig = Clone(config);
            newConfig.selectedKey = undefined;
            let suggest = getSuggest(newConfig);
            suggest._beforeMount(newConfig);
            assert.equal(suggest._options.value, 'New text');
         });

         it('_beforeUpdate new suggestState', function() {
            let newConfig = Clone(config);
            newConfig.suggestState = true;
            let suggest = getSuggest(config);
            suggest._beforeUpdate(newConfig);
            assert.isTrue(suggest._suggestState);
         });

         it('_beforeUpdate new value', function() {
            let newConfig = Clone(config);
            newConfig.value = 'Test text';
            let suggest = getSuggest(config);
            suggest._beforeUpdate(newConfig);
            assert.equal(suggest._simpleViewModel.getDisplayValue(), newConfig.value);
         });

         it('_beforeUpdate new selectedKey', function(done) {
            let newConfig = Clone(config);
            newConfig.selectedKey = '3';
            let suggest = getSuggest(config);
            suggest._beforeUpdate(newConfig).addCallback(function(items) {
               assert.equal(suggest._simpleViewModel.getDisplayValue(), 'Запись 3');
               done();
            });
         });

         it('_changeValueHandler', function() {
            let suggest = getSuggest(config),
               newValue = '';
            suggest._notify = function(e, d) {
               if (e === 'valueChanged') {
                  newValue = d[0];
               }
            };
            suggest._changeValueHandler('valueChanged', 'New Text');
            assert.equal(suggest._simpleViewModel.getDisplayValue(), 'New Text');
            assert.equal(newValue, 'New Text');

         });

         it('_open autoDropDown=false', function() {
            let suggest = getSuggest(config);
            suggest.activate = () => {};

            suggest._suggestState = true;
            suggest._open();
            assert.isFalse(suggest._suggestState);

            suggest._suggestState = false;
            suggest._open();
            assert.isTrue(suggest._suggestState);
         });

         it('_open autoDropDown=true', function() {
            let newConfig = Clone(config);
            newConfig.autoDropDown = true;
            let suggest = getSuggest(newConfig);
            suggest.activate = () => {};

            suggest._suggestState = true;
            suggest._open();
            assert.isFalse(suggest._suggestState);

            suggest._suggestState = false;
            suggest._open();
            assert.isFalse(suggest._suggestState);
         });
      });
   }
);
