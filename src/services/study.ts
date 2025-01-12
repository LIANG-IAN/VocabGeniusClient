import api from './axios'

// 學習目標介面
export interface StudyGoal {
    dailyNewWordsGoal: number
    dailyReviewWordsGoal: number
    enableReminder: boolean
}

// 學習進度介面
export interface StudyProgress {
    date: string
    newWordsCompleted: number
    reviewWordsCompleted: number
    newWordsGoal: number
    reviewWordsGoal: number
    newWordsProgress: number
    reviewWordsProgress: number
}

// 學習統計介面
export interface StudyStats {
    currentStreak: number
    longestStreak: number
    totalDays: number
}

export const studyService = {
    // 獲取學習目標
    async getStudyGoal() {
        const response = await api.get<StudyGoal>('/study-goals')
        return response.data
    },

    // 獲取今日進度
    async getTodayProgress() {
        const response = await api.get<StudyProgress>('/study-goals/progress')
        return response.data
    },

    // 獲取學習統計
    async getStudyStats() {
        const response = await api.get<StudyStats>('/study-progress/statistics')
        return response.data
    }
}