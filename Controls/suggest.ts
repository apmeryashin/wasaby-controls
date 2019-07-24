/**
 * Библиотека автодополнения.
 * @library Controls/suggest
 * @includes Input Controls/_suggest/Input
 * @includes InputStyles Controls/_suggest/Input/Styles
 * @includes _InputController Controls/_suggest/_InputController
 * @includes SearchInput Controls/_suggest/Input/Search/Suggest
 * @includes ContentLayerStyles Controls/_suggest/Layer/ContentLayer/Styles
 * @includes Selector Controls/_suggest/Selector
 *
 * @public
 * @author Крайнов Д.О.
 */

/*
 * suggest library
 * @library Controls/suggest
 * @includes Input Controls/_suggest/Input
 * @includes InputStyles Controls/_suggest/Input/Styles
 * @includes _InputController Controls/_suggest/_InputController
 * @includes SearchInput Controls/_suggest/Input/Search/Suggest
 * @includes ContentLayerStyles Controls/_suggest/Layer/ContentLayer/Styles
 * @includes Selector Controls/_suggest/Selector
 *
 * @public
 * @author Крайнов Д.О.
 */

import Input = require('Controls/_suggest/Input');
import _InputController = require('Controls/_suggest/_InputController');
import _InputControllerEmptyTemplate = require('wml!Controls/_suggest/_InputController/empty');
import SearchInput from 'Controls/_suggest/Input/Search/Suggest';
import InputRender = require('Controls/_suggest/Input/Render');
import LoadService from 'Controls/_suggest/LoadService';

export {default as Selector} from './_suggest/Selector';

export {
   Input,
   _InputController,
   _InputControllerEmptyTemplate,
   SearchInput,
   InputRender,
   LoadService
};
