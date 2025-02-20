export default class RejectForm<T> {
    private readonly onReject: (arg?: T) => void
    private responded: boolean = false;

    public constructor(onReject: (arg?: T) => void) {
        this.onReject = onReject;
    }

    public reject(arg?: T): void {
        if (this.responded) return;
        this.onReject(arg);
        this.responded = true;
    }
}