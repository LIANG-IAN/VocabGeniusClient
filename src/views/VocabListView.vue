<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {type VocabCard, vocabService} from '../services/vocab'

const router = useRouter()
const loading = ref(true)
const cards = ref<VocabCard[]>([])
const searchText = ref('')
const showCardMenu = ref(false)
const selectedCard = ref<VocabCard | null>(null)
const expandedCardIds = ref<Set<number>>(new Set())
const cardMenuPosition = ref({top: 0, left: 0})
const activeCardMenu = ref<number | null>(null)

// 載入單字卡
const loadCards = async () => {
    try {
        loading.value = true
        const response = await vocabService.getVocabCards()
        cards.value = Array.isArray(response) ? response : response.items
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('載入單字卡失敗:', error)
            if ('response' in error && typeof error.response === 'object' && error.response && 'status' in error.response && error.response.status === 401) {
                await router.push('/login')
            }
        }
    } finally {
        loading.value = false
    }
}

// 切換卡片展開狀態
const toggleCard = (cardId: number) => {
    if (expandedCardIds.value.has(cardId)) {
        expandedCardIds.value.delete(cardId)
    } else {
        expandedCardIds.value.add(cardId)
    }
}

// 播放發音
const playPronunciation = async (text: string) => {
    try {
        const audioBlob = await vocabService.getWordPronunciation(text)
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        await audio.play()
        audio.onended = () => URL.revokeObjectURL(audioUrl)
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('播放發音失敗:', error)
        }
    }
}

// 打開卡片選單
const openCardMenu = (card: VocabCard, event: MouseEvent) => {
    event.stopPropagation()
    activeCardMenu.value = card.id
    
    // 計算選單位置
    const button = event.currentTarget as HTMLElement
    const rect = button.getBoundingClientRect()
    
    cardMenuPosition.value = {
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 120  // 120是選單寬度
    }
}

// 編輯卡片
const editCard = async () => {
    if (!selectedCard.value) return
    // TODO: 實作編輯功能
    showCardMenu.value = false
}

// 刪除卡片
const deleteCard = async () => {
    if (!selectedCard.value || !confirm('確定要刪除這張單字卡嗎？')) return
    
    try {
        await vocabService.deleteVocabCard(selectedCard.value.id)
        await loadCards()
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('刪除單字卡失敗:', error)
        }
    } finally {
        showCardMenu.value = false
    }
}

// 點擊其他地方關閉選單
const closeMenu = () => {
    activeCardMenu.value = null
}

onMounted(() => {
    loadCards()
    document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
    document.removeEventListener('click', closeMenu)
})
</script>

<template>
    <div class="vocab-list-container" @click="closeMenu">
        <!-- 頂部導航列 -->
        <nav class="navbar">
            <h1>單字列表</h1>
            <router-link to="/home" class="back-btn">返回主頁</router-link>
        </nav>
        
        <!-- 搜尋方塊 -->
        <div class="search-section">
            <input
                type="text"
                v-model="searchText"
                placeholder="搜尋單字..."
                class="search-input"
            >
        </div>
        
        <!-- 單字卡列表 -->
        <main class="cards-container">
            <!-- 載入中狀態 -->
            <div v-if="loading" class="loading-state">
                載入中...
            </div>
            
            <!-- 無資料狀態 -->
            <div v-else-if="cards.length === 0" class="empty-state">
                尚未新增任何單字卡
            </div>
            
            <!-- 卡片列表 -->
            <div v-else class="cards-grid">
                <div
                    v-for="card in cards"
                    :key="card.id"
                    class="vocab-card"
                    :class="{ 'expanded': expandedCardIds.has(card.id) }"
                    @click="toggleCard(card.id)"
                >
                    <!-- 卡片頂部 -->
                    <div class="card-header">
                        <div class="word-section">
                            <h3>{{ card.word }}</h3>
                            <button
                                @click.stop="playPronunciation(card.word)"
                                class="sound-btn"
                                title="播放發音"
                            >
                                🔊
                            </button>
                        </div>
                        
                        <!-- 更多選項按鈕 -->
                        <div class="menu-wrapper">
                            <button
                                @click.stop="openCardMenu(card, $event)"
                                class="more-btn"
                                aria-label="更多選項"
                            >
                                •••
                            </button>
                            
                            <!-- 下拉選單 -->
                            <div
                                v-if="activeCardMenu === card.id"
                                class="dropdown-menu"
                                :style="{
                  top: `${cardMenuPosition.top}px`,
                  left: `${cardMenuPosition.left}px`
                }"
                            >
                                <button @click.stop="editCard">編輯字卡</button>
                                <button @click.stop="deleteCard">刪除字卡</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 卡片內容 -->
                    <div
                        class="card-content"
                        :class="{ 'visible': expandedCardIds.has(card.id) }"
                    >
                        <!-- 詞性標籤 -->
                        <div class="part-of-speech">{{ card.partOfSpeech }}</div>
                        
                        <!-- 中文翻譯 -->
                        <div class="translation">{{ card.translation }}</div>
                        
                        <!-- 例句區塊 -->
                        <div class="example-section">
                            <div class="example-header">
                                <span>例句</span>
                                <button
                                    @click.stop="playPronunciation(card.exampleSentence)"
                                    class="sound-btn"
                                    title="播放例句發音"
                                >
                                    🔊
                                </button>
                            </div>
                            <p class="example">{{ card.exampleSentence }}</p>
                            <p class="example-translation">{{ card.sentenceTranslation }}</p>
                        </div>
                        
                        <!-- 熟練度指示器 -->
                        <div class="proficiency-section">
              <span
                  v-for="n in 5"
                  :key="n"
                  class="star"
                  :class="{ active: n <= card.proficiency }"
              >★</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
.vocab-list-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 2rem;
}

.navbar {
    background: white;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-btn {
    padding: 0.5rem 1rem;
    text-decoration: none;
    color: #666;
    border: 1px solid #ddd;
    border-radius: 4px;
    transition: all 0.3s;
}

.back-btn:hover {
    background: #f5f5f5;
}

.search-section {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.search-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

.cards-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    padding: 1rem;
}

.vocab-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    height: 160px; /* 未展開時的固定高度 */
    position: relative;
    overflow: hidden;
    transition: height 0.3s ease;
}

.vocab-card.expanded .card-content {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}


.card-header {
    position: absolute;
    top: 1.5rem;
    left: 1.5rem;
    right: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    z-index: 2;
}

.word-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.word-section h3 {
    margin: 0;
    font-size: 2rem;
    color: #2c3e50;
    font-weight: 600;
}

.sound-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    color: #666;
    padding: 0.5rem;
    border-radius: 50%;
    transition: background 0.2s;
}

.sound-btn:hover {
    background: rgba(0, 0, 0, 0.05);
}

.more-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0.5rem;
    border-radius: 4px;
    color: #666;
}

.more-btn:hover {
    background: #f5f5f5;
}

.card-content {
    position: absolute;
    top: 5rem; /* 給標題預留空間 */
    left: 1.5rem;
    right: 1.5rem;
    opacity: 0;
    transform: translateY(10px);
    pointer-events: none;
    transition: all 0.3s ease;
}

.part-of-speech {
    display: inline-block;
    padding: 0.25rem 1rem;
    background: #E3F2FD;
    color: #1976D2;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 1rem;
}

.translation {
    font-size: 1.2rem;
    color: #2c3e50;
    margin-bottom: 1.5rem;
}

.example-section {
    background: #F8F9FA;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
}

.example-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    color: #666;
}

.example {
    font-style: italic;
    color: #2c3e50;
    margin: 0.5rem 0;
}

.example-translation {
    color: #666;
    margin: 0;
}

.proficiency-section {
    text-align: right;
    margin-top: 1rem;
}

.star {
    color: #DDD;
    font-size: 1.2rem;
}

.star.active {
    color: #FFD700;
}

.card-menu button {
    display: block;
    width: 100%;
    padding: 0.5rem 1rem;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
}

.card-menu button:hover {
    background: #f5f5f5;
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 2rem;
    color: #666;
}

.vocab-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s;
    min-height: 300px; /* 設定最小高度 */
    position: relative; /* 為下拉選單定位 */
}

.card-content {
    max-height: 0;
    overflow: hidden;
}

.card-content.visible {
    max-height: 300px; /* 足夠大的值以容納內容 */
}

.menu-wrapper {
    position: relative;
}

.more-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #666;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 4px;
}

.more-btn:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    width: 140px;
    z-index: 10;
}

.dropdown-menu button {
    display: block;
    width: 100%;
    text-align: left;
    padding: 0.75rem 1rem;
    border: none;
    background: none;
    cursor: pointer;
    color: #333;
    font-size: 0.9rem;
    transition: background 0.2s;
}

.dropdown-menu button:hover {
    background: #f5f5f5;
}

/* 分隔線 */
.dropdown-menu button:not(:last-child) {
    border-bottom: 1px solid #eee;
}


@media (max-width: 768px) {
    .cards-grid {
        grid-template-columns: 1fr;
    }
    
    .navbar {
        padding: 1rem;
    }
}
</style>