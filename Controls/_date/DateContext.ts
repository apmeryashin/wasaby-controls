import * as DataContext from 'Core/DataContext';

export default class DateContext extends DataContext {
    _moduleName: string;
    shiftPeriod: Function;
    constructor() {
        super();
        this.setShiftPeriod = this.setShiftPeriod.bind(this);
    }
    setShiftPeriod(shiftPeriod: Function): void {
        this.shiftPeriod = shiftPeriod;
        this.updateConsumers();
    }
}

DateContext.prototype._moduleName = 'Controls/_date/DateContext';
