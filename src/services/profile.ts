import api from './axios'

interface UserProfile {
    username: string
    email: string
    createdAt: string
    lastLoginAt: string
    learningStats: {
        totalWords: number
        masteredWords: number
        currentStreak: number
        longestStreak: number
        averageProficiency: number
        totalStudyDays: number
    }
    recentProgress: {
        date: string
        wordsReviewed: number
    }[]
}

export const profileService = {
    async getUserProfile(): Promise<UserProfile> {
        const response = await api.get('/user/profile')
        return response.data
    }
}