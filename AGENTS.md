# AGENTS.md

このファイルは、このリポジトリで作業する AI コーディングエージェント向けのガイドです。

## コーディングルール

- 関数はアロー関数で書く（`function` キーワードは使わない）
- 関数の引数はオブジェクト引数を使う（位置引数は使わない）

## プロジェクト構成

アプリケーションのコードはすべて `sandbox/` 配下にあります。以下のコマンドは `sandbox/` を作業ディレクトリとして想定しています。

Node.js のバージョンは `mise.toml` で管理しており、現在は Node.js 24.16.0 を使用します。

## コマンド

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動 (http://localhost:3000)
npm run dev

# 本番ビルド
npm run build

# 静的サイト生成
npm run generate

# 本番ビルドのローカルプレビュー
npm run preview

# テスト全件実行
npm test

# テストの watch 実行
npm run test:watch

# 特定のテストファイルのみ実行
npx vitest run test/unit/server/service/article/index.test.ts

# unit / nuxt プロジェクトのみ実行
npx vitest run --project unit
npx vitest run --project nuxt

# lint
npx eslint .

# フォーマット
npx prettier --write .

# DBマイグレーション（未適用のマイグレーションを適用）
npx drizzle-kit migrate

# スキーマ変更後にマイグレーションファイルを生成
npx drizzle-kit generate

# publisherのシードデータ投入
npx tsx server/db/seed/index.ts

# RSSフィードから記事を取得してupsert（CIで1日2回実行）
npx tsx server/batch/create-article.ts
```

## 環境変数

`default.env` を `.env` にコピーし、`DB_FILE_NAME` を設定してください。

```bash
cp default.env .env
```

- ローカル SQLite: `DB_FILE_NAME=file:sqlite.db`
- Turso: 認証情報を含む `libsql://` URL

`.env` や認証トークンなどの秘密情報はコミットしたり、ドキュメント・ログ・テストコードへ転記したりしないでください。

## アーキテクチャ

Nuxt 4 + Nitro アプリです。UI は Nuxt UI と Tailwind CSS v4 を使います。Vercel にデプロイされ、DB は SQLite（ローカル）/ Turso（本番）を Drizzle ORM 経由で利用します。

### データフロー

```text
RSSフィード -> batch/create-article.ts -> SQLite/Turso
                                              |
                                              v
フロントエンド (app/pages/) -> POST /api/article/fetch -> articleService -> articleRepository -> DB
```

### サーバー層 (`server/`)

- `db/index.ts`: `DB_FILE_NAME` を使って Drizzle の libSQL 接続を初期化する
- `db/schema/`: Drizzle のテーブル定義（`publisher`、`article`）とリレーション
- `repository/article/index.ts`: 生の DB クエリ。`generateArticleRepository({ db })` で生成するファクトリ関数パターン
- `service/article/index.ts`: 薄いオーケストレーション層。`generateArticleService({ repository })` で生成し、`ArticleRepository` インターフェースに依存するためテスト時に差し替え可能
- `service/article/query-builder.ts`: JSON のフィルター・ソート条件を Drizzle の `SQL` フラグメントに変換する。フィルターは `publisherName`、ソートは `publishedAt` / `title` / `author` のホワイトリストで制限する
- `api/article/schema/body-schema.ts`: `where` / `orderBy` / `limit` / `offset` を検証する Zod スキーマ
- `api/article/fetch.post.ts`: `readValidatedBody` でリクエストを検証し、記事・件数・publisher を並列取得して `{ articles, total, publishers }` を返す。サービス層の失敗は HTTP 500 に変換する
- `batch/create-article.ts`: 全 publisher の RSS フィードを取得して記事を upsert するスクリプト

### フロントエンド (`app/`)

`app/pages/index.vue` は `/article` へリダイレクトします。記事一覧は `app/pages/article/index.vue` で表示し、`app/composables/useArticles.ts` が `useFetch` で `POST /api/article/fetch` を呼び出します。publisher フィルターとページネーションは URL クエリストリングと同期します。

記事一覧の UI は `app/components/article/ArticleCard.vue` と `app/components/article/ArticlePublisherFilter.vue` に分割されています。ページサイズは VueUse の breakpoint で desktop 15 件、mobile 10 件に切り替えます。

## テスト

`test/unit/` と `test/nuxt/` 配下にあります。

- `test/unit/`: API、サービス、query-builder、日付フォーマットのテスト。サービス層はリポジトリをモックするため DB は不要
- `test/nuxt/`: Nuxt テスト環境でのコンポーネント・composable のテスト（`environment: "nuxt"`）
- `test/e2e/`: E2E スロットは定義済みだが現時点では未使用

## CI/CD

- CI は Node.js バージョン管理に mise を使い、依存関係を `npm clean-install` でインストールする
- テスト: `sandbox/**` または `.github/workflows/test-application.yml` への pull request / `main` push / 手動実行で `npm run test` を実行
- デプロイ: `sandbox/**` または `.github/workflows/deploy-application.yml` への `main` push / 手動実行で DB マイグレーション後に Vercel へデプロイ
- 本番デプロイ時のみ `.github/workflows/deploy-application.yml` の `vercel build --prod` で `NITRO_PRESET=vercel` を指定する。`nuxt.config.ts` には常時適用の `nitro.preset` を置かない
- 記事取得: GitHub Actions の cron が 1 日 2 回（JST 06:00 / 18:00）`create-article.ts` を本番 DB に対して実行
- DB シードと DB マイグレーションは手動実行用 workflow も用意されている

## 作業上の注意

- 既存の設計に合わせ、サーバー層では repository / service / query-builder の責務分離を維持してください。
- DB スキーマ変更時は Drizzle のマイグレーションを生成し、関連テストを更新してください。
- フロントエンドの状態は URL クエリと同期する既存方針に合わせてください。
- API の入力項目を変更する場合は Zod スキーマ、サービスの型、composable、関連テストを同時に更新してください。
- ユーザーや他エージェントの未コミット変更を勝手に戻さないでください。
- AI コーディングエージェントがコミットを作成する場合は、コミットメッセージを日本語で書いてください。
- AI コーディングエージェントがコミットを作成する場合は、コミットメッセージ末尾に利用したエージェント名とメールアドレスの `Co-authored-by` trailer を付けてください。
