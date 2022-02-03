import * as DataContext from 'Core/DataContext';
import {Controller} from './../../Controller';
import ScrollBar from './../../scrollBar/ScrollBar';

export interface IContextOptions {
    doScrollUtil: (position: number) => void;
    controller: Controller;
    contentWidth: number;
    viewportWidth: number;
    fixedColumnsWidth: number;
}

export default class Context extends DataContext {
    _moduleName: string = 'Controls/_horizontalScroll/ControllerAndScrollBarConnectorContext';

    scrollPositionChangedCallback: (position: number) => void;
    scrollBarReadyCallback: (scrollBar: ScrollBar) => void;
    contentWidth: number;
    viewportWidth: number;
    fixedColumnsWidth: number;

    constructor(options: IContextOptions) {
        super();
        this.scrollPositionChangedCallback = (position: number) => {
            options.doScrollUtil(position);
        };
        this.scrollBarReadyCallback = (scrollBar: ScrollBar) => {
            options.controller.setScrollBar(scrollBar);
        };
        this.contentWidth = options.contentWidth;
        this.viewportWidth = options.viewportWidth;
        this.fixedColumnsWidth = options.fixedColumnsWidth;
    }

    setOptions(options: Partial<IContextOptions>): void {
        let needUpdate = false;

        ['contentWidth', 'viewportWidth', 'fixedColumnsWidth'].forEach((optionName) => {
            if (optionName in options && options[optionName] !== this[optionName]) {
                this[optionName] = options[optionName];
                needUpdate = true;
            }
        });

        if (needUpdate) {
            // Core/DataContext написан на js, в итоге с него не цепляются типы
            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            this.updateConsumers();
        }
    }
}

export interface IContext {
    horizontalScrollControllerAndScrollBarConnectorContext?: Context;
}
