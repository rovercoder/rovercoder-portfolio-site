export abstract class SiteAbstractionBase {
    private _initialized = false;

    async initialize() {
        if (!this._initialized) {
            await this.onInit();
            this._initialized = true;
        }
        return this;
    }

    async destroy() {
        if (this._initialized) {
            await this.onDestroy();
        }
        return this;
    }
    
    protected abstract onInit(): Promise<void> | void;
    protected abstract onDestroy(): Promise<void> | void;
}
