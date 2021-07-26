import ScrollState, {IScrollState} from './ScrollState';

export default class ScrollModel extends ScrollState {
    updateState(newState: IScrollState): boolean {
        let isScrollStateUpdated = false;
        Object.keys(newState).forEach((state) => {
            let protectedState;
            if (state.indexOf('_') === -1) {
                protectedState = '_' + state;
            }
            const protectedStateIsObject = typeof this[protectedState] === 'object';
            const newStateIsObject = typeof newState[state] === 'object';
            let newScrollState = newState[state];
            let oldScrollState = this[protectedState];
            if (protectedStateIsObject && newStateIsObject) {
                newScrollState = JSON.stringify(newState[state]);
                oldScrollState = JSON.stringify(this[protectedState]);
            }

            if (newScrollState !== oldScrollState) {
                this[protectedState] = newState[state];
                isScrollStateUpdated = true;
            }
        });
        if (isScrollStateUpdated) {
            this._updateCalculatedState();
        }
        return isScrollStateUpdated;
    }
}
