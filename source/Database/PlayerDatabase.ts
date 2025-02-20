import { world } from "@minecraft/server";

export type DatabaseEditCallback<T> = { value: T, cancel: boolean };
type Cancel = boolean | void;

export class PlayerDatabase<T extends any> {
    private repair(playerId: string): void {
        const playerData = world.getDynamicProperty(`PDB:${playerId}`);

        if (typeof playerData === "string" || playerData === undefined) return;

        console.log(`[PlayerDatabase] Repairing player data for ${playerId}`);
        const repairedValue = JSON.stringify(playerData);

        world.setDynamicProperty(`PDB:${playerId}`, repairedValue);
    }

    public hasFrom(playerId: string): boolean {
        return world.getDynamicProperty(`PDB:${playerId}`) !== undefined;
    }

    public getFrom(playerId: string): T | undefined {
        const data = world.getDynamicProperty(`PDB:${playerId}`);

        if (typeof data !== "string" || data !== undefined) {
            this.repair(playerId);
            return this.getFrom(playerId);
        }

        return data === undefined ? undefined : JSON.parse(data) as T;
    }

    public setFrom(playerId: string, data: T): void {
        world.setDynamicProperty(`PDB:${playerId}`, JSON.stringify(data));
    }

    public editFrom(playerId: string, callback: (playerData: T) => Cancel): void {
        const playerData = this.getFrom(playerId);
        if (playerData === undefined) return;
        const cancel: Cancel = callback(playerData);
        if (cancel === true) return;
        this.setFrom(playerId, playerData);
    }

    public deleteFrom(playerId: string): boolean {
        if (this.hasFrom(playerId)) {
            world.setDynamicProperty(`PDB:${playerId}`);
            return true;
        }

        return false;
    }
}