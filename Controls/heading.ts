/**
 * Библиотека заголовков.
 * Заголовки поддерживают различные стили отображения и могут состоять из нескольких частей.
 * Типы заголовков и примеры их конфигурации доступны в <a href='/doc/platform/developmentapl/interface-development/controls/heading/'>руководстве разработчика</a>.
 * @library Controls/heading
 * @includes Title Controls/_heading/Heading
 * @includes Back Controls/_heading/Back
 * @includes Separator Controls/_heading/Separator
 * @includes Counter Controls/_heading/Counter
 * @includes BackStyles Controls/_heading/Back/BackStyles
 * @includes HeadingCounterStyles Controls/_heading/Counter/HeadingCounterStyles
 * @includes HeadingStyles Controls/_heading/Heading/HeadingStyles
 * @includes SeparatorStyles Controls/_heading/Separator/SeparatorStyles
 * @public
 * @author Крайнов Д.О.
 */

/*
 * heading library
 * @library Controls/heading
 * @includes Title Controls/_heading/Heading
 * @includes Back Controls/_heading/Back
 * @includes Separator Controls/_heading/Separator
 * @includes Counter Controls/_heading/Counter
 * @includes BackStyles Controls/_heading/Back/BackStyles
 * @includes HeadingCounterStyles Controls/_heading/Counter/HeadingCounterStyles
 * @includes HeadingStyles Controls/_heading/Heading/HeadingStyles
 * @includes SeparatorStyles Controls/_heading/Separator/SeparatorStyles
 * @public
 * @author Крайнов Д.О.
 */

import {default as Title} from './_heading/Heading';
import Back = require('Controls/_heading/Back');
import {default as Separator} from './_heading/Separator';
import Counter = require('Controls/_heading/Counter');

export {
    Title,
    Back,
    Separator,
    Counter
};
