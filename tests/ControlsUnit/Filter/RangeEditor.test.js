define(['Controls/filter', 'Controls/dateRange'],
   function(filter, dateRange) {

      describe('Controls/filter:DateRange', function() {

         it('_beforeMount', () => {
            var rangeEditor = new filter.DateRangeEditor();
            rangeEditor._beforeMount({
               editorMode: 'Lite'
            });
            assert.equal(rangeEditor._datePopupType, 'shortDatePicker');

            rangeEditor._beforeMount({
               editorMode: 'Selector'
            });
            assert.equal(rangeEditor._datePopupType, 'datePicker');
         });

         describe('_beforeMount _emptyCaption', () => {
            let rangeEditor;
            const resetValue = [new Date('April 1, 1995'), new Date('April 30, 1995')];

            beforeEach(() => {
               rangeEditor = new filter.DateRangeEditor();
            });

            it('option emptyCaption', (done) => {
               rangeEditor._beforeMount({
                  emptyCaption: 'testCaption',
                  resetValue
               }).then(() => {
                  assert.equal(rangeEditor._emptyCaption, 'testCaption');
                  done();
               });
            });

            it('without option emptyCaption', () => {
               return rangeEditor._beforeMount({
                  resetValue
               }).then(() => {
                  assert.equal(rangeEditor._emptyCaption, "Апрель'95");
               });
            });
         });

         it ('_beforeUpdate', () => {
            let rangeEditor = new filter.DateRangeEditor();
            const resetValue = [new Date('April 17, 1995'), new Date('May 17, 1995')];
            rangeEditor._beforeMount({
               editorMode: 'Selector'
            }).then(() => {
               rangeEditor._beforeUpdate({value: resetValue, resetValue});

               rangeEditor._beforeUpdate({value: [new Date('April 17, 1998'), new Date('May 17, 1998')], resetValue});
            });
         });

         it('_rangeChanged', () => {
            let isStopped = false;
            const event = {stopPropagation: () => { isStopped = true; }};
            var rangeEditor = new filter.DateRangeEditor();
            var textValue;

            rangeEditor.saveOptions({
               emptyCaption: 'testEmptyCaption'
            });

            rangeEditor._notify = (event, eventValue) => {
               if (event === 'textValueChanged') {
                  textValue = eventValue[0];
               }
            };

            rangeEditor._dateRangeModule = dateRange;

            rangeEditor._rangeChanged(event, new Date('April 17, 1995 03:24:00'), new Date('May 17, 1995 03:24:00'));
            assert.equal(textValue, '17.04.95 - 17.05.95');
            assert.isTrue(isStopped);
         });

         it('textValueChanged with captionFormatter', () => {
            const rangeEditor = new filter.DateRangeEditor();
            const resetValue = [new Date('April 17, 1995 03:24:00'), new Date('May 17, 1995 03:24:00')];
            let textValue;

            rangeEditor.saveOptions({
               resetValue,
               value: resetValue,
               captionFormatter: () => 'testTextValue'
            });
            rangeEditor._dateRangeModule = dateRange;

            rangeEditor._notify = (event, eventValue) => {
               if (event === 'textValueChanged') {
                  textValue = eventValue[0];
               }
            };

            rangeEditor._rangeChanged({stopPropagation: () => {}}, null, null);
            assert.ok(textValue === 'testTextValue');
         });
      });
});
