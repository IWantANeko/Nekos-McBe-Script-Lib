export class Weight<T> {
    public readonly weight: number;
    public readonly content: T;

    public constructor(weight: number, content: T) {
        this.weight = weight;
        this.content = content;
    }

    public static sortWeights<T>(weights: Weight<T>[]): Weight<T>[] {
        return weights.sort((a, b) => b.weight - a.weight);
    }

    public static getHeaviest<T>(weights: Weight<T>[]): Weight<T> | null {
        let heaviest: Weight<any> | null = null;

        for (const weight of weights) {
            if (heaviest === null || weight.weight > heaviest.weight) {
                heaviest = weight;
            }
        }

        return heaviest;
    }

    public static randomWeight<T>(weights: Weight<T>[]): Weight<T> {
        const totalWeight: number = weights.reduce((total, weight) => total + weight.weight, 0);
        const randomWeight: number = Math.random() * totalWeight;
        let currentWeight: number = 0;

        for (const weight of weights) {
            currentWeight += weight.weight;

            if (randomWeight < currentWeight) {
                return weight;
            }
        }

        return weights[0];
    }
}