import { system, WatchdogTerminateBeforeEvent } from "@minecraft/server";

export class Watchdog {
    private static watchdogTerminateCallback: ((arg: WatchdogTerminateBeforeEvent) => void) | null = null;

    public static enableTerminate(): void {
        if (this.watchdogTerminateCallback === null) return;
        system.beforeEvents.watchdogTerminate.unsubscribe(this.watchdogTerminateCallback);
        this.watchdogTerminateCallback = null;
    }

    public static disableTerminate(): void {
        if (this.watchdogTerminateCallback !== null) return;
        
        this.watchdogTerminateCallback = system.beforeEvents.watchdogTerminate.subscribe((event) =>
            event.cancel = true
        );
    }
}