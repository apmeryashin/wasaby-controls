import MassAction from 'Controls/_actions/MassActions/MassAction';
import {RecordSet} from 'Types/collection';
import {DataSet} from 'Types/source';

export default abstract class ListMenuAction extends MassAction {
    constructor(options) {
        super(options);
        this['parent@'] = true;
    }
    abstract load(): Promise<RecordSet | DataSet>;
}
