import api from './axios'

interface UserSettings {
    email: string;
    username: string;
}

interface StudyGoalSettings {
    dailyNewWordsGoal: number;
    dailyReviewWordsGoal: number;
    enableReminder: boolean;
}

export const settingsService = {
    async getUserSettings(): Promise<UserSettings> {
        const response = await api.get('/user/settings')
        return response.data
    },

    async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
        const response = await api.put('/user/settings', settings)
        return response.data
    },

    async getStudyGoalSettings(): Promise<StudyGoalSettings> {
        const response = await api.get('/study-goals')
        return response.data
    },

    async updateStudyGoalSettings(settings: StudyGoalSettings): Promise<StudyGoalSettings> {
        const response = await api.post('/study-goals', settings)
        return response.data
    }
}