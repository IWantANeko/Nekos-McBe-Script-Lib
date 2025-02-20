export class Random {
    public static int(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public static float(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    public static range(range: number): number {
        return Math.random() * 2 * range - range;
    }

    public static chance(chance: number): boolean {
        return Math.random() <= chance;
    }

    public static get<T>(...args: T[]): T {
        return args[this.int(0, args.length - 1)];
    }

    public static weighted<T>(...chances: { weight: number, value: T }[]): T {
        if (chances.length === 1) return chances[0].value;
        const totalWeight = chances.reduce((sum, chance) => sum + chance.weight, 0);
        for (const chance of chances) {
            if (this.chance(chance.weight / totalWeight)) {
                return chance.value;
            }
        }
        return chances[0].value;
    }
}