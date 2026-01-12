# フラッシュカードアプリ

HTMLベースのシンプルなフラッシュカードアプリです。単語をタップすると意味が表示されます。

## 機能

- **カードフリップ**: カードをタップ/クリックすると裏返って意味が表示
- **ナビゲーション**: 前へ/次へボタンで単語を切り替え
- **ジャンルフィルター**: ドロップダウンで特定ジャンルの単語のみ表示
- **シャッフル機能**: ランダムな順序で学習可能
- **キーボード操作**:
  - `←` / `→`: 前後のカードに移動
  - `Space` / `Enter`: カードをフリップ
- **進捗バー**: 現在の学習進捗を視覚的に表示
- **レスポンシブデザイン**: PC・スマートフォン両対応

## ファイル構成

```
flash-card/
├── index.html    # メインHTMLファイル
├── style.css     # スタイルシート
├── script.js     # JavaScript（カードロジック）
├── data.json     # 単語データ
└── README.md     # このファイル
```

## 使い方

### ローカルで実行

1. ローカルサーバを起動:
```bash
cd flash-card
python3 -m http.server 8000
```

2. ブラウザで開く:
```
http://localhost:8000
```

### GitHub Pagesで公開

1. GitHubリポジトリにプッシュ
2. リポジトリの `Settings` > `Pages` でソースブランチを選択
3. `https://username.github.io/repository-name/flash-card/` でアクセス可能

## 単語データのカスタマイズ

[data.json](data.json) を編集して、独自の単語セットを追加できます。

```json
[
  {
    "word": "apple",
    "meaning": "りんご",
    "genre": "果物"
  },
  {
    "word": "dog",
    "meaning": "犬",
    "genre": "動物"
  }
]
```

### データ形式

- `word`: 表示する単語（英語など）
- `meaning`: 単語の意味（日本語など）
- `genre`: ジャンル（フィルター機能で使用）

## 技術スタック

- HTML5
- CSS3（FlexboxとCSS Grid、アニメーション）
- Vanilla JavaScript（ES6+）
- 外部ライブラリなし

## ライセンス

MIT License
