class EventListener {
    public readonly id: any;
    public readonly callback: Function;

    public constructor(id: any, callback: Function) {
        this.id = id;
        this.callback = callback;
    }

    public kill(): void {
        eventListener.off(this.id);        
    }
}

class EventHandler {
    private readonly eventListeners: Map<any, EventListener> = new Map<any, EventListener>();

    public constructor() {}

    public on(id: any, eventCallback: Function): this {
        if (this.eventListeners.has(id)) return this;

        const eventListener = new EventListener(id, eventCallback);
        this.eventListeners.set(id, eventListener);
        return this;
    }

    public once(id: any, eventCallback: Function): this {
        const eventListener = new EventListener(id, (...args: unknown[]) => {
            eventCallback(...args);
            this.off(id);
        });

        this.eventListeners.set(id, eventListener);
        return this;
    }

    public off(id: any): boolean {
        const eventListener = this.eventListeners.get(id);

        if (!eventListener) return false;
        this.eventListeners.delete(id);
        return true;
    }

    public emit(id: any, ...args: any[]): unknown | null {
        if (!this.eventListeners.has(id)) return null;
        return this.eventListeners.get(id)!.callback(...args);
    }

    public has(id: any): boolean {
        return this.eventListeners.has(id);
    }
}

const eventListener = new EventHandler();
export default eventListener;