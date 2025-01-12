<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {reviewService, type ReviewVocabCard} from '../services/review'
import {vocabService} from '../services/vocab'

const router = useRouter()
const currentCard = ref<ReviewVocabCard | null>(null)
const reviewCards = ref<ReviewVocabCard[]>([])
const showAnswer = ref(false)
const loading = ref(true)
const studyComplete = ref(false)
const errorMessage = ref('')

// 載入待複習單字列表
const loadReviewCards = async () => {
    try {
        loading.value = true
        errorMessage.value = ''
        const cards = await reviewService.getDueReviews()
        reviewCards.value = cards
        
        if (cards.length > 0) {
            currentCard.value = cards[0]
        } else {
            studyComplete.value = true
        }
    } catch (error) {
        console.error('載入複習卡片失敗：', error)
        errorMessage.value = '載入失敗，請稍後再試'
    } finally {
        loading.value = false
    }
}

// 返回主頁
const handleReturn = async () => {
    await router.push('/home')
}

// 播放單字發音功能
const playPronunciation = async () => {
    if (!currentCard.value) return
    
    try {
        const audioBlob = await vocabService.getWordPronunciation(currentCard.value.word)
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        
        await audio.play()
        
        // 播放完成後清理資源
        audio.onended = () => {
            URL.revokeObjectURL(audioUrl)
        }
    } catch (error) {
        console.error('播放發音失敗：', error)
        errorMessage.value = '無法播放發音，請稍後再試'
    }
}

// 處理評分提交
const handleRating = async (rating: number) => {
    if (!currentCard.value) return
    
    try {
        loading.value = true
        await reviewService.submitReview(currentCard.value.id, rating)
        
        // 從列表中移除已評分的單字
        reviewCards.value = reviewCards.value.filter(
            card => card.id !== currentCard.value?.id
        )
        
        // 如果還有待複習的單字，顯示下一個
        if (reviewCards.value.length > 0) {
            currentCard.value = reviewCards.value[0]
            showAnswer.value = false
        } else {
            studyComplete.value = true
        }
    } catch (error) {
        console.error('提交評分失敗：', error)
        errorMessage.value = '評分提交失敗，請重試'
    } finally {
        loading.value = false
    }
}

// 頁面載入時獲取第一個單字
onMounted(() => {
    loadReviewCards()
})
</script>

<template>
    <div class="study-container">
        <!-- 頂部導航 -->
        <nav class="navbar">
            <button @click="handleReturn" class="return-btn">
                返回主頁
            </button>
            <h1>學習模式</h1>
            <div class="placeholder"></div>
        </nav>
        
        <main class="main-content">
            <!-- 載入中狀態 -->
            <div v-if="loading" class="loading-state">
                載入中...
            </div>
            
            <!-- 學習完成狀態 -->
            <div v-else-if="studyComplete" class="complete-state">
                <h2>太棒了！</h2>
                <p>今天的學習任務已經完成</p>
                <button @click="handleReturn" class="return-home-btn">
                    返回主頁
                </button>
            </div>
            
            <!-- 單字卡片主要內容區域 -->
            <div v-if="currentCard" class="study-card">
                <div class="card-content" @click="showAnswer = !showAnswer">
                    <div class="word-display">
                        <div class="word-header">
                            <h2>{{ currentCard.word }}</h2>
                            <button
                                @click.stop="playPronunciation"
                                class="sound-btn"
                                title="播放發音"
                            >
                                🔊
                            </button>
                        </div>
                        <p class="phonetic">{{ currentCard.phonetic }}</p>
                    </div>
                    
                    <div v-if="showAnswer" class="answer-details">
                        <div class="translation">
                            {{ currentCard.translation }}
                        </div>
                        
                        <div class="example-section">
                            <p class="example">{{ currentCard.exampleSentence }}</p>
                            <p class="translation">{{ currentCard.sentenceTranslation }}</p>
                        </div>
                    </div>
                    
                    <div v-else class="hint-text">
                        點擊卡片查看答案
                    </div>
                </div>
                
                <!-- 評分按鈕區域 -->
                <div v-if="showAnswer" class="rating-section">
                    <div class="rating-buttons">
                        <button
                            v-for="rating in 5"
                            :key="rating"
                            @click="handleRating(rating)"
                            :class="['rating-btn', `rating-${rating}`]"
                            :disabled="loading"
                        >
                            {{ rating }}
                        </button>
                    </div>
                    
                    <div class="rating-guide">
                        1：完全不會 | 2：有點印象 | 3：大致了解 | 4：記得清楚 | 5：完全掌握
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
.word-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}

.sound-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: background-color 0.2s;
}

.sound-btn:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.translation {
    font-size: 1.5rem;
    color: #2c3e50;
    margin: 1.5rem 0;
}

.example-section {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #eee;
}

.rating-section {
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-top: 1px solid #eee;
}

.rating-guide {
    margin-top: 1rem;
    text-align: center;
    color: #666;
    font-size: 0.9rem;
}

/* 使評分按鈕在載入過程中顯示禁用狀態 */
.rating-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.study-container {
    min-height: 100vh;
    background-color: #f5f5f5;
}

.navbar {
    background-color: white;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar h1 {
    margin: 0;
}

.return-btn {
    padding: 0.5rem 1rem;
    background-color: transparent;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
}

.placeholder {
    width: 80px; /* 與返回按鈕寬度相同，保持標題居中 */
}

.main-content {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.loading-state,
.complete-state {
    text-align: center;
    padding: 2rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.return-home-btn {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.study-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.card-content {
    padding: 2rem;
    min-height: 300px;
    cursor: pointer;
    text-align: center;
}

.word-display {
    margin-bottom: 2rem;
}

.word-display h2 {
    font-size: 2.5rem;
    margin: 0 0 0.5rem;
    color: #2c3e50;
}

.word-display p {
    color: #666;
    font-size: 1.2rem;
    margin: 0;
}

.answer-details {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #eee;
}

.part-of-speech {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background-color: #e3f2fd;
    color: #1976d2;
    border-radius: 4px;
    font-size: 0.9rem;
    margin-bottom: 1rem;
}

.example-section {
    color: #666;
    line-height: 1.6;
}

.example {
    font-style: italic;
    margin-bottom: 0.5rem;
}

.hint-text {
    margin-top: 2rem;
    color: #999;
    font-size: 0.9rem;
}

.rating-buttons {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    background-color: #f8f9fa;
}

.rating-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: transform 0.1s;
}

.rating-btn:hover {
    transform: translateY(-2px);
}

.rating-1 {
    background-color: #ff4444;
    color: white;
}

.rating-2 {
    background-color: #ff8800;
    color: white;
}

.rating-3 {
    background-color: #ffbb33;
    color: white;
}

.rating-4 {
    background-color: #00C851;
    color: white;
}

.rating-5 {
    background-color: #007E33;
    color: white;
}

.rating-guide {
    padding: 1rem;
    text-align: center;
    color: #666;
    font-size: 0.9rem;
    background-color: #f8f9fa;
    border-top: 1px solid #eee;
}

/* 響應式設計 */
@media (max-width: 768px) {
    .word-display h2 {
        font-size: 2rem;
    }
    
    .rating-buttons {
        flex-wrap: wrap;
    }
    
    .rating-btn {
        flex: 1 1 calc(33.333% - 0.5rem);
    }
}
</style>