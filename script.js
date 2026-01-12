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
        // 複数のジャンル別ファイルを読み込む
        const genres = ['四字熟語']; // 読み込むジャンルのリスト
        allCards = [];

        for (const genre of genres) {
            try {
                const response = await fetch(`data/${genre}.json`);
                const cards = await response.json();
                // ファイル名からジャンルを自動設定
                const cardsWithGenre = cards.map(card => ({
                    ...card,
                    genre: genre
                }));
                allCards = allCards.concat(cardsWithGenre);
            } catch (error) {
                console.warn(`${genre}のデータ読み込みに失敗:`, error);
            }
        }

        // 旧data.jsonも読み込む（後方互換性のため）
        try {
            const response = await fetch('data.json');
            const legacyCards = await response.json();
            allCards = allCards.concat(legacyCards);
        } catch (error) {
            console.warn('data.jsonの読み込みをスキップ');
        }

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

    // テキストを再表示
    setTimeout(() => {
        wordDisplay.classList.remove('hiding');
        meaningDisplay.classList.remove('hiding');
        wordSmall.classList.remove('hiding');
    }, 10);
}

// カードを表示
function displayCard() {
    if (currentCards.length === 0) {
        wordDisplay.textContent = 'カードがありません';
        meaningDisplay.textContent = '';
        genreTag.textContent = '';
        return;
    }

    // テキストを一時的に非表示にする
    wordDisplay.classList.add('hiding');
    meaningDisplay.classList.add('hiding');
    wordSmall.classList.add('hiding');

    // カードが裏返っている場合は、先に表に戻してから内容を更新
    if (isFlipped) {
        flashcard.classList.remove('flipped');
        isFlipped = false;
        // アニメーション途中で内容を更新
        setTimeout(updateCardContent, 300);
    } else {
        // 少し待ってから内容を更新
        setTimeout(updateCardContent, 150);
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
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter') {
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
