import MassAction from 'Controls/_actions/MassActions/MassAction';
import {RecordSet} from 'Types/collection';
import {DataSet} from 'Types/source';

export default abstract class ListMenuAction extends MassAction {
    constructor(options) {
        super(options);
    }
    abstract load(root: string | number): Promise<RecordSet | DataSet>;
}

Object.assign(ListMenuAction.prototype, {
    'parent@': true
});
