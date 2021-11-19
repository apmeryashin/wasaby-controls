import {constants, detection} from 'Env/Env';

const _private = {

         /**
          * Расчитать функцию расчета значения для css свойства overflow.
          * @param container
          * @return {boolean}
          */
         calcHeightFixFn(container) {
            if (constants.isBrowserPlatform && container) {
                if (detection.firefox) {
                    /**
                     * В firefox при высоте дочерних элементав < высоты скролла(34px) и резиновой высоте контейнера
                     * через max-height, нативный скролл не пропадает.
                     * В такой ситуации content имеет высоту скролла, а должен быть равен высоте дочерних элементов.
                     */
                    return container.scrollHeight === container.offsetHeight && container.scrollHeight < 35;
                }
                if (detection.isIE) {
                    // Из-за дробных пикселей в IE может появится ненужный скролл в 1px
                    // Сами выключим скролл через overflow: hidden в таком случае
                    return container.scrollHeight - container.offsetHeight <= 1;
                }
            }
            return false;
         }
      };

export = {
         _private,

         calcHeightFix: _private.calcHeightFixFn
      };
