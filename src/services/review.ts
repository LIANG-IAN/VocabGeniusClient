import api from './axios'

export interface ReviewVocabCard {
    id: number
    word: string
    translation: string
    phonetic: string
    exampleSentence: string
    sentenceTranslation: string
    reviewCount: number
    lastProficiency: number
}

export const reviewService = {
    // 獲取待複習的單字
    async getDueReviews() {
        const response = await api.get<ReviewVocabCard[]>('/VocabCards/due')
        return response.data
    },

    // 提交複習結果
    async submitReview(cardId: number, proficiency: number) {
        const response = await api.post(`/VocabCards/${cardId}/review`, {proficiency})
        return response.data
    }
}