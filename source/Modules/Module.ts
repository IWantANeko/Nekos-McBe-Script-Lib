import { world } from "@minecraft/server";

export type ModuleVersion = [number, number, number];
export type RelativePath = string;

export abstract class Module {
    readonly abstract name: string;
    readonly abstract displayName: string;
    readonly abstract version: ModuleVersion;
    private enabled: boolean;

    public constructor(initiallyEnabled: boolean = false) {        
        this.enabled = false;
        if (initiallyEnabled) this.enable();
    }

    public get isEnabled(): boolean {
        return this.enabled;
    }

    public enable(): void {
        if (!this.enabled) {
            this.enabled = true;
            this.onEnable();
        }
    }

    public disable(): void {
        if (this.enabled) {
            this.enabled = false;
            this.onDisable();
        }
    }

    protected abstract onEnable(): void
    protected abstract onDisable(): void
}

class ModuleManager {
    public modules: Map<string, Module>;

    public constructor() {
        this.modules = new Map()
    }

    public get size(): number {
        return this.modules.size;
    }

    public async load(paths: RelativePath[]): Promise<number> {
        const initDate = Date.now();

        for (const path of paths) {
            try {
                const file = await import(path);
    
                if (!file.default) {
                    world.sendMessage(`§cFailed to load module: ${path}`);
                    continue;
                }

                const module = new file.default() as Module;
                this.modules.set(module.name, module);
            } catch (error) {
                if (error instanceof Error) {
                    world.sendMessage(`§cError while loading module: ${path}\n§h[${error.name}] ${error.message} at ${error.stack || "anonymous"}`);
                } else {
                    world.sendMessage(`§cError while loading module: ${path}\n§h${error}`);
                }
            }
        }

        const deltaTime = Date.now() - initDate;
        world.sendMessage(`§eLoaded ${this.modules.size} modules in ${deltaTime}ms`);
        return Promise.resolve(deltaTime);
    }

    public enable(moduleName: string): void {
        if (this.modules.has(moduleName)) this.modules.get(moduleName)!.enable();
    }

    public disable(moduleName: string): void {
        if (this.modules.has(moduleName)) this.modules.get(moduleName)!.disable();
    }

    public enableAll(): void {
        for (const module of this.modules.values()) module.enable();
    }

    public disableAll(): void {
        for (const module of this.modules.values()) module.disable();
    }

    public isEnabled(moduleName: string): boolean {
        return this.modules.has(moduleName) && this.modules.get(moduleName)!.isEnabled;
    }

    public get(moduleName: string): Module | undefined {
        return this.modules.get(moduleName);
    }

    public has(moduleName: string): boolean {
        return this.modules.has(moduleName);
    }

    public entries(): IterableIterator<[string, Module]> {
        return this.modules.entries();
    }

    public keys(): IterableIterator<string> {
        return this.modules.keys();
    }

    public values(): IterableIterator<Module> {
        return this.modules.values();
    }
}

export const moduleManager = new ModuleManager()