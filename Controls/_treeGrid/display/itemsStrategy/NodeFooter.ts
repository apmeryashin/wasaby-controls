import {itemsStrategy} from 'Controls/display';

export default class TreeGridNodeFooter extends itemsStrategy.NodeFooter {
    protected _hasNodeFooterViewConfig(options): boolean {
        return super._hasNodeFooterViewConfig(options) || options.display.hasNodeFooterColumns();
    }
}
