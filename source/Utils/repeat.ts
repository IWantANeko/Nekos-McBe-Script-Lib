export function repeat(count: number, callback: (count: number) => void): void {
    for (let i = 0; i < count; i++) callback(count);
}