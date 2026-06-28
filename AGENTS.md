# AGENTS.md

このリポジトリで作業するAIコーディングエージェント向けのガイド

## アーキテクチャ

Nuxt 4 + Nitro アプリ
Nuxt UI と Tailwind CSS v4 を使用
Vercel にデプロイされ、DB は SQLite/Turso を Drizzle ORM 経由で使用

## プロジェクト構成

```
/
├── .github/workflows/      # CI/CD(テスト・デプロイ・バッチ実行)
├── docs/                   # エージェント向けドキュメント
├── AGENTS.md
└── sandbox/                # アプリケーションコード
    ├── app/
    │   ├── app.vue        # ルートコンポーネント
    │   ├── assets/        # CSS・画像などの静的アセット
    │   ├── layouts/       # Nuxt.jsのレイアウト
    │   ├── pages/         # Nuxt.jsの画面
    │   ├── components/    # Nuxt.jsのコンポーネント
    │   ├── composables/   # Nuxt.jsのComposable
    │   └── utils/         # ユーティリティ関数
    ├── server/
    │   ├── api/           # コントローラー
    │   ├── repository/    # リポジトリ
    │   ├── service/       # サービス
    │   ├── db/            # DBスキーマ・DBシード
    │   └── batch/         # バッチ処理
    ├── test/
    │   ├── unit/          # 単体テスト
    │   ├── e2e/           # E2Eテスト
    │   └── nuxt/          # Nuxt.js環境での結合テスト
    ├── drizzle/            # マイグレーション
    ├── public/             # 静的ファイル(favicon等)
    ├── default.env         # 環境変数テンプレート
    ├── drizzle.config.ts   # Drizzleの設定
    ├── mise.toml           # バージョン管理
    ├── nuxt.config.ts      # Nuxt.jsの設定
    └── vitest.config.ts    # Vitestの設定
```

## コーディングルール

- 関数はアロー関数で書く(`function` キーワードは使わない)
- 関数の引数はオブジェクト引数を使う(位置引数は使わない)
- バックエンドでは コントローラー/サービス/リポジトリ に責務を分離する

## 作業ルール

- 秘密情報はドキュメント・ログ・コードに転記しない
- 秘密情報はコミットしない
- ユーザーや他エージェントの未コミット変更を勝手に戻さない
- コミットメッセージは日本語で書く
- コミットメッセージはプレフィックスを付与する
- コミットメッセージ末尾に利用したエージェント名とメールアドレスの `Co-authored-by` trailer を付ける
- コミット前にPrettierとESLintを実行して整形する
