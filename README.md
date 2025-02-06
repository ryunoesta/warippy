# Warippy - 割り勘アプリ

Warippyは、グループでの支出を簡単に記録・精算できるWebアプリケーションです。

## 機能

- グループの作成と管理
- メンバーの追加
- 支出の記録
- 自動精算計算
- 精算方法の表示

## 技術スタック

- Frontend
  - React
  - TypeScript
  - Tailwind CSS
  - Vite
  - Zustand (状態管理)

- Backend
  - Supabase
    - データベース
    - 認証
    - APIサービス

## 開発環境のセットアップ

1. リポジトリのクローン
```bash
git clone https://github.com/yourusername/warippy.git
cd warippy
```

2. 依存パッケージのインストール
```bash
npm install
```

3. 環境変数の設定
`.env`ファイルを作成し、必要な環境変数を設定:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. 開発サーバーの起動
```bash
npm run dev
```