define('js!WSControls/Lists/VirtualScroll',
   [
      'Core/Abstract'
   ],
   function (Abstract) {

      var VirtualScroll = Abstract.extend({
         $protected: {
            _options: {
               itemsLength: 0,
               pageSize: 5,
               maxItems: 15
            }
         },

         // First and last indices of items in projection
         _projectionLength: 0,

         // Range of indices of items that are shown in virtual window
         _virtualWindow: {
            start: 0,
            end: 0
         },

         init: function() {
            this._projectionLength = this._options.itemsLength;

            if (this._options.maxItems < this._projectionLength) {
               this._virtualWindow.end = this._options.maxItems;
            }
            else {
               this._virtualWindow.end = this._projectionLength;
            }
         },

         /************************************************
          *
          *    Event handlers
          *
          ***********************************************/

         /**
          * Change window bounds after reaching the top trigger.
          */
         updateWindowOnReachTop: function() {
            var bottomChange = 0,
               topChange = 0;

            // Add items to the beginning of the list
            if (this._virtualWindow.start < this._options.pageSize) {
               // Not enough items for a page => remove remaining items
               topChange += this._virtualWindow.start;
               this._virtualWindow.start = 0;
            } else {
               // Remove the first page
               topChange += this._options.pageSize;
               this._virtualWindow.start -= this._options.pageSize;
            }

            // Remove items from the end of the list
            if (this._virtualWindow.end - this._virtualWindow.start > this._options.maxItems) {
               this._virtualWindow.end -= this._options.pageSize;
               bottomChange -= this._options.pageSize;
            }

            return {
               'window': this.getVirtualWindow(),
               'topChange': topChange,
               'bottomChange': bottomChange
            };
         },

         /**
          * Change window bounds after reaching the bottom trigger.
          */
         updateWindowOnReachBottom: function() {
            var bottomChange = 0,
               topChange = 0;

            // Load more data
            if (this._projectionLength - this._virtualWindow.end < this._options.pageSize) {
               bottomChange = this._projectionLength - this._virtualWindow.end;
            } else {
               bottomChange = this._options.pageSize;
            }
            this._virtualWindow.end += bottomChange;

            // Remove items from opposite end
            if (this._virtualWindow.end - this._virtualWindow.start > this._options.maxItems) {
               // remove page from bottom
               this._virtualWindow.start += this._options.pageSize;
               topChange = -this._options.pageSize;
            }

            // Load more data
            if (this._virtualWindow.end === this._projectionLength) {
               this._notify('needLoadPageEnd');
            }

            return {
               'window': this.getVirtualWindow(),
               'topChange': topChange,
               'bottomChange': bottomChange
            };
         },


         // onNewDataLoad: function(bottom, numItems) {
         //    // Add to the end
         //    if (bottom) {
         //       this._displayRange[1] += numItems;
         //    }
         //    // Added to the beginning
         //    else {
         //       this._displayRange[0] -= numItems;
         //    }
         // },

         /**
          * Recalculates virtual page after item was removed from the dataset.
          * TODO: resize window if becomes too small
          *
          * @param idx - index of removed item
          */
         onItemRemoved: function(idx) {
            this._projectionLength -= 1;

            if (idx < this._virtualWindow.start) {
               // Item was removed before the beginning of virtual window =>
               // shift window bounds to the left
               this._virtualWindow.start -= 1;
               this._virtualWindow.end -= 1;
            } else if (idx <= this._virtualWindow.end) {
               // Item was added inside virtual window =>
               // decrease window size by 1
               this._virtualWindow.end -= 1;
            }
         },

         /**
          * Recalculates virtual page after item was added to the dataset.
          * TODO: resize window if becomes too large
          *
          * @param idx - index of added item
          */
         onItemAdded: function(idx) {
            this._projectionLength += 1;

            if (idx <= this._virtualWindow.start) {
               // Item was added before the beginning of virtual window =>
               // shift window bounds to the right
               this._virtualWindow.start += 1;
               this._virtualWindow.end += 1;
            } else if (idx <= this._virtualWindow.end) {
               // Item was added inside virtual window =>
               // increase window size by 1
               this._virtualWindow.end += 1;
            }
         },


         /************************************************
          *
          *    Getters and setters
          *
          ***********************************************/

         /**
          * Return virtual window bounds.
          *
          * @returns {{start: number, end: number}}
          */
         getVirtualWindow: function() {
            return {
               'start': this._virtualWindow.start,
               'end': this._virtualWindow.end
            };
         },

         /**
          * Set the state of dataset and virtual window.
          *
          * @param projectionLength - number of items in projection
          * @param windowStart - index of the first item from virtual window
          * @param windowEnd - index of the last item from virtual window
          */
         setState: function(projectionLength, windowStart, windowEnd) {
            this._projectionLength = projectionLength;
            this._virtualWindow.start = windowStart;
            this._virtualWindow.end = windowEnd;
         },

         /**
          * Get current state of virtual scroll.
          *
          * @returns {{projectionLength: number, virtualWindow: {start: number, end: number}}}
          */
         getState: function() {
            return {
               'projectionLength': this._projectionLength,
               'virtualWindow': this.getVirtualWindow()
            };
         }
      });

      return VirtualScroll;
   });
