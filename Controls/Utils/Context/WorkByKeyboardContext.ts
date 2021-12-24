import * as DataContext from 'Core/DataContext';

export default class WorkByKeyboardContext extends DataContext {
    _moduleName: string = 'Controls/_form/WorkByKeyboardContext';
    status: boolean;
    constructor() {
        super();
        this.status = false;
    }

    setStatus(status: boolean = false): void {
        this.status = status;
        this.updateConsumers();
    }
}
