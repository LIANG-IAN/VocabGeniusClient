import api from './axios'

export interface VocabCard {
    id: number
    word: string
    translation: string
    phonetic: string
    partOfSpeech: string
    exampleSentence: string
    sentenceTranslation: string
    lastReviewedAt: string | null
    nextReviewAt: string | null
    proficiency: number
    createdAt: string
}

// 分頁響應介面
interface PaginatedResponse<T> {
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
    items: T[]
}

// 查詢參數介面
interface VocabQueryParams {
    pageNumber?: number
    pageSize?: number
    sortBy?: string
    ascending?: boolean
    search?: string
}

export interface StudyProgress {
    vocabCardId: number
    proficiency: number
    reviewCount: number
    lastReviewedAt: string
    nextReviewAt: string
}

export const vocabService = {
    // 獲取單字卡列表
    async getVocabCards(params: VocabQueryParams = {}) {
        const response = await api.get<PaginatedResponse<VocabCard>>('/vocab-cards/GetVocabCards', {
            params: {
                pageNumber: params.pageNumber || 1,
                pageSize: params.pageSize || 10,
                sortBy: params.sortBy,
                ascending: params.ascending,
                search: params.search
            }
        })
        return response.data
    },

    // 添加新單字
    async createVocabCard(word: string) {
        const response = await api.post<VocabCard>('/vocab-cards/CreateVocabCard', JSON.stringify(word), {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return response.data
    },

    // 刪除單字卡
    async deleteVocabCard(id: number) {
        await api.delete(`/vocab-cards/${id}`)
    },

    // 獲取單字發音
    async getWordPronunciation(word: string) {
        const response = await api.get(`/vocab-cards/pronunciation/${word}`, {
            responseType: 'blob'
        })
        return response.data
    }
}