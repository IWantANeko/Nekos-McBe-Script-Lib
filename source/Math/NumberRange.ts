export class NumberRange {
    public readonly min: number;
    public readonly max: number;

    public constructor(min: number, max: number) {
        this.min = min;
        this.max = max;
    }

    public toArray(): [number, number] {
        return [this.min, this.max];
    }

    public toString(separator: string = ", "): string {
        return `${this.min}${separator}${this.max}`;
    }

    public copy(): NumberRange {
        return new NumberRange(this.min, this.max);
    }

    public isInRange(value: number): boolean {
        return value >= this.min && value <= this.max;
    }

    public offset(value: number): number {
        return value < this.min ? this.min - value : value > this.max ? value - this.max : 0;
    }

    public cut(value: number): number {
        return value < this.min ? this.min : value > this.max ? this.max : value; 
    }
}