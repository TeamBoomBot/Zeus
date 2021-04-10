export interface ContestResponseSchema {
    name: string;
    code: string;
    startDate: number;
    endDate: number;
}
export interface UpcomingRunningSchema {
    error: boolean;
    response: object;
}

export interface UpcomingContestResponse {
    result: Array<ContestResponseSchema>;
}
