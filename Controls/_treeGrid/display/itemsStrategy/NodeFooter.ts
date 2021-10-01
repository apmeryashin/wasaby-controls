import {itemsStrategy} from 'Controls/display';

export default class TreeGridNodeFooter extends itemsStrategy.NodeFooter {
    protected _hasNodeFooterViewConfig(options): boolean {
        return super._hasNodeFooterViewConfig(options) || (
            !!options.display.getNodeFooterColumns() && options.display.getNodeFooterColumns().reduce((acc, column) => acc || !!column.template, false)
        );
    }
}
