import api from './axios'

export interface VocabCard {
    id: number
    word: string
    translation: string
    phonetic: string
    partOfSpeech: string
    exampleSentence: string
    sentenceTranslation: string
    proficiency: number
    lastReviewedAt: string | null
    nextReviewAt: string | null
    createdAt: string
}

// 分頁響應介面
export interface PaginatedResponse<T> {
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
        const response = await api.get<PaginatedResponse<VocabCard>>('/VocabCards/GetVocabCards', {
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
        const response = await api.post<VocabCard>('/VocabCards/CreateVocabCard', JSON.stringify(word), {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return response.data
    },

    // 刪除單字卡
    async deleteVocabCard(id: number) {
        await api.delete(`/VocabCards/${id}`)
    },

    // 獲取單字發音
    async getWordPronunciation(word: string) {
        const response = await api.get(`/VocabCards/pronunciation/${word}`, {
            responseType: 'blob'
        })
        return response.data
    }
}