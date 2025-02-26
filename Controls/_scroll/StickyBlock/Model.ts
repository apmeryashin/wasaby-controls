import {Logger} from 'UI/Utils';
import simpleExtend = require('Core/core-simpleExtend');

/**
 * @extends Core/core-simpleExtend
 * @class Controls/_scroll/Model
 * @private
 */

/**
 * @typedef {Object} Intersection
 * @property {Boolean} top Determines whether the upper boundary of content is crossed.
 * @property {Boolean} bottom Determines whether the lower boundary of content is crossed.
 */

/**
 * typedef {String} TrackedTarget
 * @variant top Top target.
 * @variant bottom Bottom target.
 */

export = simpleExtend.extend({

   /**
    * @type {Intersection|null} Determines whether the boundaries of content crossed.
    * @private
    */
   _intersection: null,

   /**
    * type {String} Determines whether the content is fixed.
    * @private
    */
   _fixedPosition: '',

   _intersectingBottomLeft: null,
   _intersectingBottomRight: null,

   get fixedPosition() {
      return this._fixedPosition;
   },

   set fixedPosition(value: string) {
      this._fixedPosition = value;
   },

   isFixed(): boolean {
      return !!this._fixedPosition;
   },

   /**
    * @param {Object} config
    * @param {Object} config.topTarget DOM element
    * @param {Object} config.bottomTarget DOM element
    * @param {String} config.position Sticky position
    */
   constructor(config) {
      this._intersection = {};
      this._topTarget = config.topTarget;
      // Необходимость двух нижних обсёрверов описана в методе _updateStateIntersection.
      this._bottomLeftTarget = config.bottomLeftTarget;
      this._bottomRightTarget = config.bottomRightTarget;
      this._rightTarget = config.rightTarget;
      this._leftTarget = config.leftTarget;

      this._position = config.position;
      this._updateStateIntersection = this._updateStateIntersection.bind(this);
   },

   update(entries: IntersectionObserverEntry[]) {
      entries.forEach((entry) => {
         if (entry.target === this._bottomLeftTarget) {
            this._intersectingBottomLeft = entry.isIntersecting;
         }
         if (entry.target === this._bottomRightTarget) {
            this._intersectingBottomRight = entry.isIntersecting;
         }
      });

      entries.forEach((entry) => {
         this._updateStateIntersection(entry);
      });

      this._fixedPosition = this._getFixedPosition();
   },

   destroy() {
      this._updateStateIntersection = undefined;
   },

   /**
    * @param {IntersectionObserverEntry} entry
    * @private
    */
   _updateStateIntersection(entry: IntersectionObserverEntry): void {
      const position = this._getTarget(entry);
      let isIntersecting = entry.isIntersecting;
      // Будем обновлять состояние зафиксированности для observerBottom по левому и правому обсёрверу.
      // Таким образом, исключим состояние зафиксированности сверху/снизу при горизонтальном скролле.
      if (position === 'bottom') {
         isIntersecting = this._intersectingBottomLeft || this._intersectingBottomRight;
      }
      this._intersection[position] =  isIntersecting;
   },

   /**
    * Get the name of the intersection target.
    * @param {IntersectionObserverEntry} entry The intersection between the target element and its root container at a specific moment of transition.
    * @returns {TrackedTarget} The name of the intersection target.
    * @private
    */
   _getTarget(entry) {
      switch (entry.target) {
         case this._topTarget:
            return 'top';
         case this._bottomLeftTarget:
         case this._bottomRightTarget:
            return 'bottom';
         case this._leftTarget:
            return 'left';
         case this._rightTarget:
            return 'right';
         default:
            Logger.error('Controls/_scroll/StickyBlock/Model: Unexpected target');
            return 'bottom';
      }
   },

   /**
    * Checks the content is fixed.
    * @returns {String} Determines whether the content is fixed.
    * @private
    */
   _getFixedPosition(): string {
       let result = '';
       let hasVertical = false;

       if (
           this._position.vertical &&
           this._position.vertical?.indexOf('top') !== -1 &&
           !this._intersection.top && this._intersection.bottom
       ) {
           result = 'top';
           hasVertical = true;
       } else if (
           this._position.vertical &&
           this._position.vertical?.toLowerCase().indexOf('bottom') !== -1 &&
           !this._intersection.bottom && this._intersection.top
       ) {
           result = 'bottom';
           hasVertical = true;
       }

       if (
           this._position.horizontal &&
           this._position.horizontal?.indexOf('left') !== -1 &&
           !this._intersection.left && this._intersection.right
       ) {
           result += hasVertical ? 'Left' : 'left';
       } else if (
           this._position.horizontal &&
           this._position.horizontal?.toLowerCase().indexOf('right') !== -1 &&
           !this._intersection.right && this._intersection.left
       ) {
           result += hasVertical ? 'Right' : 'right';
       }

       return result;
   }
});
