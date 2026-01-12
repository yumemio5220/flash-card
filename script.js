let allCards = [];
let currentCards = [];
let currentIndex = 0;
let isFlipped = false;

// DOM要素
const flashcard = document.getElementById('flashcard');
const wordDisplay = document.getElementById('wordDisplay');
const meaningDisplay = document.getElementById('meaningDisplay');
const wordSmall = document.getElementById('wordSmall');
const genreTag = document.getElementById('genreTag');
const genreTagBack = document.getElementById('genreTagBack');
const genreFilter = document.getElementById('genreFilter');
const shuffleBtn = document.getElementById('shuffleBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const cardCounter = document.getElementById('cardCounter');
const progressFill = document.getElementById('progressFill');

// JSONデータの読み込み
async function loadCards() {
    try {
        const response = await fetch('data.json');
        allCards = await response.json();
        currentCards = [...allCards];
        populateGenreFilter();
        displayCard();
    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
        wordDisplay.textContent = 'データを読み込めませんでした';
    }
}

// ジャンルフィルターの選択肢を作成
function populateGenreFilter() {
    const genres = [...new Set(allCards.map(card => card.genre))];
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
}

// カードの内容を更新
function updateCardContent() {
    const card = currentCards[currentIndex];
    wordDisplay.textContent = card.word;
    meaningDisplay.textContent = card.meaning;
    wordSmall.textContent = card.word;
    genreTag.textContent = card.genre;
    genreTagBack.textContent = card.genre;

    // カウンターと進捗バーを更新
    cardCounter.textContent = `${currentIndex + 1} / ${currentCards.length}`;
    progressFill.style.width = `${((currentIndex + 1) / currentCards.length) * 100}%`;

    // ボタンの有効/無効を設定
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === currentCards.length - 1;
}

// カードを表示
function displayCard() {
    if (currentCards.length === 0) {
        wordDisplay.textContent = 'カードがありません';
        meaningDisplay.textContent = '';
        genreTag.textContent = '';
        return;
    }

    // カードが裏返っている場合は、先に表に戻してから内容を更新
    if (isFlipped) {
        // 裏面の内容を先にクリア
        meaningDisplay.textContent = '';
        wordSmall.textContent = '';

        flashcard.classList.remove('flipped');
        isFlipped = false;
        // アニメーション完了を待ってから内容を更新（CSSのtransition 0.6秒）
        setTimeout(updateCardContent, 600);
    } else {
        updateCardContent();
    }
}

// カードをシャッフル
function shuffleCards() {
    for (let i = currentCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentCards[i], currentCards[j]] = [currentCards[j], currentCards[i]];
    }
    currentIndex = 0;
    displayCard();
}

// ジャンルでフィルタリング
function filterByGenre(genre) {
    if (genre === 'all') {
        currentCards = [...allCards];
    } else {
        currentCards = allCards.filter(card => card.genre === genre);
    }
    currentIndex = 0;
    displayCard();
}

// イベントリスナー
flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
    isFlipped = !isFlipped;
});

prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        displayCard();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentIndex < currentCards.length - 1) {
        currentIndex++;
        displayCard();
    }
});

shuffleBtn.addEventListener('click', shuffleCards);

genreFilter.addEventListener('change', (e) => {
    filterByGenre(e.target.value);
});

// キーボード操作
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
        currentIndex--;
        displayCard();
    } else if (e.key === 'ArrowRight' && currentIndex < currentCards.length - 1) {
        currentIndex++;
        displayCard();
    } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        flashcard.classList.toggle('flipped');
        isFlipped = !isFlipped;
    }
});

// iOSのスクロールを防止
document.body.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// 初期化
loadCards();
