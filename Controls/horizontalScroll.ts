export {
    Controller,
    IControllerOptions
} from './_horizontalScroll/Controller';

import { ItemsSizeController } from './_horizontalScroll/ItemsSizeController';
import { ObserversController } from './_horizontalScroll/ObserversController';
import ScrollBar from './_horizontalScroll/scrollBar/ScrollBar';
import ConnectorContextConsumer from './_horizontalScroll/contexts/controllerAndScrollBarConnector/Consumer';
import ConnectorContextProvider from './_horizontalScroll/contexts/controllerAndScrollBarConnector/Provider';

export {
    ItemsSizeController,
    ObserversController,
    ScrollBar,
    ConnectorContextConsumer as ControllerAndScrollBarConnectorContextConsumer,
    ConnectorContextProvider as ControllerAndScrollBarConnectorContextProvider
};
