export class SetTimeoutMocker {
    private readonly _original: (handler: TimerHandler, timeout?: number, ...arguments: any[]) => number;
    private _isMocked: boolean;
    constructor() {
        this._original = SetTimeoutMocker.getGlobal().setTimeout.bind(window);
    }
    mock(originalTimeout: number, fakeTimeout: number): void {
        this._isMocked = true;
        const mock = function(callback: TimerHandler, timeout: number|undefined): number {
            if (timeout === originalTimeout) {
                return this._original(callback, fakeTimeout);
            }
            return this._original(callback, timeout);
        };
        SetTimeoutMocker.getGlobal().setTimeout = mock.bind(this);
    }
    recover(): void {
        this._isMocked = false;
        SetTimeoutMocker.getGlobal().setTimeout = this._original;
    }
    isMocked(): boolean {
        return this._isMocked;
    }
    static getGlobal(): any {
        return window || global;
    }
    static initialize(): void {
        const instance = new SetTimeoutMocker();
        this.getGlobal().mockSetTimeout = instance.mock.bind(instance);
        this.getGlobal().recoverSetTimeout = instance.recover.bind(instance);
    }
}
