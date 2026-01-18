let allCards = [];
let currentCards = [];
let currentIndex = 0;
let isFlipped = false;
let isReversed = false;
let isAnimating = false;

// DOM要素
const flashcard = document.getElementById('flashcard');
const wordDisplay = document.getElementById('wordDisplay');
const meaningDisplay = document.getElementById('meaningDisplay');
const wordSmall = document.getElementById('wordSmall');
const genreTag = document.getElementById('genreTag');
const genreTagBack = document.getElementById('genreTagBack');
const genreFilter = document.getElementById('genreFilter');
const reverseBtn = document.getElementById('reverseBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const cardCounter = document.getElementById('cardCounter');
const progressFill = document.getElementById('progressFill');

// JSONデータの読み込み
async function loadCards() {
    try {
        allCards = [];

        // manifestファイルからジャンルリストを取得
        let genres = [];
        try {
            const manifestResponse = await fetch('data/manifest.json');
            const manifest = await manifestResponse.json();
            genres = manifest.genres || [];
        } catch (error) {
            console.warn('manifest.jsonの読み込みに失敗:', error);
        }

        // 各ジャンルのデータを読み込む
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

        populateGenreFilter();

        // デフォルトで「家族」ジャンルを選択
        const defaultGenre = '家族';
        genreFilter.value = defaultGenre;
        currentCards = allCards.filter(card => card.genre === defaultGenre);

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

    if (isReversed && card.reading) {
        // 反転モード時（ふりがながある場合）: 意味を問題に、単語＋ふりがなを答えに
        wordDisplay.textContent = card.meaning;
        meaningDisplay.innerHTML = `<ruby>${card.word}<rt>${card.reading}</rt></ruby>`;
        wordSmall.textContent = card.meaning;
    } else if (isReversed) {
        // 反転モード時（ふりがながない場合）: 意味を問題に、単語を答えに
        wordDisplay.textContent = card.meaning;
        meaningDisplay.textContent = card.word;
        wordSmall.textContent = card.meaning;
    } else if (card.reading) {
        // 通常モード時（ふりがながある場合）: 単語＋ふりがなを問題に、意味を答えに
        wordDisplay.innerHTML = `<ruby>${card.word}<rt>${card.reading}</rt></ruby>`;
        meaningDisplay.textContent = card.meaning;
        wordSmall.innerHTML = `<ruby>${card.word}<rt>${card.reading}</rt></ruby>`;
    } else {
        // 通常モード時（ふりがながない場合）: 単語を問題に、意味を答えに
        wordDisplay.textContent = card.word;
        meaningDisplay.textContent = card.meaning;
        wordSmall.textContent = card.word;
    }

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

// カードを表示（方向指定可能）
function displayCard(direction = 'none') {
    if (currentCards.length === 0) {
        wordDisplay.textContent = 'カードがありません';
        meaningDisplay.textContent = '';
        genreTag.textContent = '';
        return;
    }

    // アニメーション中は操作を受け付けない
    if (isAnimating && direction !== 'none') {
        return;
    }

    // テキストを一時的に非表示にする
    wordDisplay.classList.add('hiding');
    meaningDisplay.classList.add('hiding');
    wordSmall.classList.add('hiding');

    // カードが裏返っている場合は、先に表に戻す
    if (isFlipped) {
        flashcard.classList.remove('flipped');
        isFlipped = false;
    }

    // スライドアニメーション
    if (direction === 'next') {
        isAnimating = true;
        // 現在のカードを左に移動
        flashcard.classList.add('slide-left');

        setTimeout(() => {
            // 新しいカードを右側に配置（transitionなし）
            flashcard.style.transition = 'none';
            flashcard.classList.remove('slide-left');
            flashcard.classList.add('slide-from-right');
            updateCardContent();

            // 少し待ってからtransitionを再開して中央に移動
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    flashcard.style.transition = '';
                    flashcard.classList.remove('slide-from-right');
                    setTimeout(() => {
                        isAnimating = false;
                    }, 300);
                });
            });
        }, 300);
    } else if (direction === 'prev') {
        isAnimating = true;
        // 現在のカードを右に移動
        flashcard.classList.add('slide-right');

        setTimeout(() => {
            // 新しいカードを左側に配置（transitionなし）
            flashcard.style.transition = 'none';
            flashcard.classList.remove('slide-right');
            flashcard.classList.add('slide-from-left');
            updateCardContent();

            // 少し待ってからtransitionを再開して中央に移動
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    flashcard.style.transition = '';
                    flashcard.classList.remove('slide-from-left');
                    setTimeout(() => {
                        isAnimating = false;
                    }, 300);
                });
            });
        }, 300);
    } else {
        // 方向指定なし（シャッフル、ジャンル変更など）
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
    if (currentIndex > 0 && !isAnimating) {
        currentIndex--;
        displayCard('prev');
    }
});

nextBtn.addEventListener('click', () => {
    if (currentIndex < currentCards.length - 1 && !isAnimating) {
        currentIndex++;
        displayCard('next');
    }
});

reverseBtn.addEventListener('click', () => {
    isReversed = !isReversed;
    reverseBtn.textContent = isReversed ? '✓ 反転中' : '⇄ 反転';
    reverseBtn.classList.toggle('active', isReversed);
    displayCard();
});

shuffleBtn.addEventListener('click', shuffleCards);

genreFilter.addEventListener('change', (e) => {
    filterByGenre(e.target.value);
});

// キーボード操作
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && currentIndex > 0 && !isAnimating) {
        currentIndex--;
        displayCard('prev');
    } else if (e.key === 'ArrowRight' && currentIndex < currentCards.length - 1 && !isAnimating) {
        currentIndex++;
        displayCard('next');
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

// スワイプ操作
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

flashcard.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

flashcard.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50; // スワイプと判定する最小距離
    const horizontalSwipe = Math.abs(touchEndX - touchStartX);
    const verticalSwipe = Math.abs(touchEndY - touchStartY);

    // 横方向のスワイプが縦方向より大きい場合のみ処理
    if (horizontalSwipe > verticalSwipe && horizontalSwipe > swipeThreshold && !isAnimating) {
        if (touchEndX < touchStartX) {
            // 左にスワイプ（次へ）
            if (currentIndex < currentCards.length - 1) {
                currentIndex++;
                displayCard('next');
            }
        } else {
            // 右にスワイプ（前へ）
            if (currentIndex > 0) {
                currentIndex--;
                displayCard('prev');
            }
        }
    }
}

// 初期化
loadCards();
