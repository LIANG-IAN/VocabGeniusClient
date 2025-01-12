<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import {useRouter} from 'vue-router'
import {type VocabCard, vocabService} from '../services/vocab'

const router = useRouter()
const searchQuery = ref('')
const vocabCards = ref<VocabCard[]>([])
const loading = ref(true)
const showAddModal = ref(false)
const newWord = ref('')
const errorMessage = ref('')

// 分頁相關狀態
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = ref(10)

// 載入單字卡列表
const loadVocabCards = async (page = 1) => {
    try {
        loading.value = true
        errorMessage.value = ''
        const response = await vocabService.getVocabCards({
            pageNumber: page,
            pageSize: pageSize.value,
            search: searchQuery.value
        })
        
        vocabCards.value = response.items
        totalPages.value = response.totalPages
        currentPage.value = response.currentPage
    } catch (error: any) {
        console.error('載入單字卡失敗：', error)
        errorMessage.value = '載入失敗，請重試'
        
        if (error.response?.status === 401) {
            await router.push('/login')
        }
    } finally {
        loading.value = false
    }
}

// 延遲搜尋
let searchTimeout: number
const handleSearch = () => {
    if (searchTimeout) {
        window.clearTimeout(searchTimeout)
    }
    searchTimeout = window.setTimeout(() => {
        currentPage.value = 1
        loadVocabCards(1)
    }, 500)
}

// 監聽搜尋輸入
watch(searchQuery, handleSearch)

// 處理新增單字
const handleAddWord = async () => {
    if (!newWord.value.trim()) {
        return
    }
    
    try {
        loading.value = true
        await vocabService.createVocabCard(newWord.value)
        showAddModal.value = false
        newWord.value = ''
        await loadVocabCards()
    } catch (error: any) {
        console.error('新增單字失敗：', error)
        errorMessage.value = error.response?.data || '新增失敗，請重試'
    } finally {
        loading.value = false
    }
}

// 處理分頁
const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        loadVocabCards(page)
    }
}

// 處理複習單字
const handleReview = async (wordId: number) => {
    await router.push(`/study?wordId=${wordId}`)
}

// 播放發音
const playPronunciation = async (word: string) => {
    try {
        const audioBlob = await vocabService.getWordPronunciation(word)
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        await audio.play()
        
        // 清理 URL
        audio.onended = () => {
            URL.revokeObjectURL(audioUrl)
        }
    } catch (error) {
        console.error('播放發音失敗：', error)
    }
}


// 頁面載入時獲取數據
onMounted(() => {
    loadVocabCards()
})
</script>

<template>
    <div class="vocab-list-container">
        <!-- 頂部導航列 -->
        <nav class="navbar">
            <h1>單字列表</h1>
            <button @click="showAddModal = true" class="add-btn">
                新增單字
            </button>
        </nav>
        
        <!-- 搜尋區塊 -->
        <div class="search-section">
            <input
                v-model="searchQuery"
                type="text"
                placeholder="搜尋單字..."
                @input="handleSearch"
                class="search-input"
            >
        </div>
        
        <!-- 單字列表 -->
        <div class="vocab-list">
            <div v-if="loading" class="loading">
                載入中...
            </div>
            
            <div v-else-if="vocabCards.length === 0" class="empty-state">
                還沒有任何單字卡，開始新增一些單字吧！
            </div>
            
            <div v-else class="cards-grid">
                <div
                    v-for="card in vocabCards"
                    :key="card.id"
                    class="vocab-card"
                >
                    <div class="card-header">
                        <h3>{{ card.word }}</h3>
                        <span class="phonetic">{{ card.phonetic }}</span>
                    </div>
                    
                    <div class="card-body">
                        <p class="translation">{{ card.translation }}</p>
                        <div class="proficiency-indicator">
                            熟練度：
                            <span
                                v-for="n in 5"
                                :key="n"
                                :class="['star', { active: n <= card.proficiency }]"
                            >★</span>
                        </div>
                    </div>
                    
                    <div class="card-footer">
                        <button
                            @click="handleReview(card.id)"
                            class="review-btn"
                        >
                            複習
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 新增單字的彈出視窗 -->
        <div v-if="showAddModal" class="modal-overlay">
            <div class="modal">
                <h2>新增單字</h2>
                <input
                    v-model="newWord"
                    type="text"
                    placeholder="請輸入英文單字"
                    class="modal-input"
                >
                <div class="modal-buttons">
                    <button @click="showAddModal = false" class="cancel-btn">
                        取消
                    </button>
                    <button @click="handleAddWord" class="confirm-btn">
                        新增
                    </button>
                </div>
            </div>
        </div>
        
        <div class="vocab-list">
            <div v-if="loading" class="loading">
                載入中...
            </div>
            
            <div v-else-if="errorMessage" class="error-message">
                {{ errorMessage }}
                <button @click="loadVocabCards()" class="retry-btn">
                    重試
                </button>
            </div>
            
            <template v-else>
                <!-- 卡片網格 -->
                <div class="cards-grid">
                    <div
                        v-for="card in vocabCards"
                        :key="card.id"
                        class="vocab-card"
                    >
                        <div class="card-header">
                            <div class="word-section">
                                <h3>{{ card.word }}</h3>
                                <button
                                    @click="playPronunciation(card.word)"
                                    class="sound-btn"
                                    title="播放發音"
                                >
                                    🔊
                                </button>
                            </div>
                            <span class="phonetic">{{ card.phonetic }}</span>
                        </div>
                        
                        <div class="card-body">
                            <p class="translation">{{ card.translation }}</p>
                            <p class="example">{{ card.exampleSentence }}</p>
                            <p class="example-translation">{{ card.sentenceTranslation }}</p>
                            
                            <div class="proficiency-indicator">
                                熟練度：
                                <span
                                    v-for="n in 5"
                                    :key="n"
                                    :class="['star', { active: n <= card.proficiency }]"
                                >★</span>
                            </div>
                        </div>
                        
                        <div class="card-footer">
                            <button
                                @click="handleReview(card.id)"
                                class="review-btn"
                            >
                                複習
                            </button>
                            <button
                                @click="handleDelete(card.id)"
                                class="delete-btn"
                            >
                                刪除
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- 分頁控制 -->
                <div v-if="totalPages > 1" class="pagination">
                    <button
                        :disabled="currentPage === 1"
                        @click="handlePageChange(currentPage - 1)"
                        class="page-btn"
                    >
                        上一頁
                    </button>
                    
                    <span class="page-info">
                        {{ currentPage }} / {{ totalPages }}
                    </span>
                    
                    <button
                        :disabled="currentPage === totalPages"
                        @click="handlePageChange(currentPage + 1)"
                        class="page-btn"
                    >
                        下一頁
                    </button>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.word-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.sound-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    font-size: 1.2rem;
}

.sound-btn:hover {
    transform: scale(1.1);
}

.example {
    font-style: italic;
    color: #666;
    margin: 0.5rem 0;
}

.example-translation {
    color: #666;
    margin-bottom: 0.5rem;
}

.delete-btn {
    padding: 0.5rem 1rem;
    background-color: #ff4444;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 0.5rem;
}

.delete-btn:hover {
    background-color: #cc0000;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    padding: 1rem;
}

.page-btn {
    padding: 0.5rem 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.page-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.page-info {
    font-size: 1rem;
    color: #666;
}

.vocab-list-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 2rem;
}

.navbar {
    background-color: white;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
}

.add-btn {
    padding: 0.5rem 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.add-btn:hover {
    background-color: #45a049;
}

.search-section {
    max-width: 1200px;
    margin: 0 auto 2rem;
    padding: 0 2rem;
}

.search-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

.vocab-list {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.loading, .empty-state {
    text-align: center;
    padding: 2rem;
    color: #666;
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.vocab-card {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
    margin-bottom: 1rem;
}

.card-header h3 {
    margin: 0;
    color: #2c3e50;
}

.phonetic {
    color: #666;
    font-size: 0.9rem;
}

.translation {
    font-size: 1.1rem;
    margin: 0.5rem 0;
}

.proficiency-indicator {
    margin: 1rem 0;
    color: #666;
}

.star {
    color: #ddd;
    margin-right: 2px;
}

.star.active {
    color: #ffd700;
}

.review-btn {
    padding: 0.5rem 1rem;
    background-color: #1e88e5;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.review-btn:hover {
    background-color: #1976d2;
}

/* 彈出視窗樣式 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
}

.modal-input {
    width: 100%;
    padding: 0.75rem;
    margin: 1rem 0;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
}

.cancel-btn {
    padding: 0.5rem 1rem;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
}

.confirm-btn {
    padding: 0.5rem 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

/* 響應式設計 */
@media (max-width: 768px) {
    .search-section,
    .vocab-list {
        padding: 0 1rem;
    }
    
    .cards-grid {
        grid-template-columns: 1fr;
    }
}
</style>