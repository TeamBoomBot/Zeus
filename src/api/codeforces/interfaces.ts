export interface ContestResponseSchema {
    id: number;
    name: string;
    type: string;
    phase: string;
    frozen: boolean;
    durationSeconds: number;
    startTimeSeconds: number;
    relativeTimeSeconds: number;
}
export interface ContestResponse {
    result: Array<ContestResponseSchema>;
}
