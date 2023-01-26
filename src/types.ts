interface ITypingTest {
    triggerUpdate: () => void
}

interface ILeaderboard {
    state: boolean
}

interface IWordState {
    key: string
    status: "correct" | "incorrect" | ""
}

interface ITypingStats {
    speed: number
    accuracy: number
    correctWords: number
    totalWords: number
}

interface IResult {
    date: string,
    speed: number,
    accuracy: number
}

export type {
    IResult,
    IWordState,
    ITypingStats,
    ILeaderboard,
    ITypingTest
}