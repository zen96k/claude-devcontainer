# AGENTS.md

このファイルは、このリポジトリで作業する AI コーディングエージェント向けのガイドです。

## コーディングルール

- 関数の引数はオブジェクト引数を使う（位置引数は使わない）

## プロジェクト構成

アプリケーションのコードはすべて `sandbox/` 配下にあります。以下のコマンドは `sandbox/` を作業ディレクトリとして想定しています。

## コマンド

```bash
# 開発サーバー起動 (http://localhost:3000)
npm run dev

# テスト全件実行
npm test

# 特定のテストファイルのみ実行
npx vitest run test/unit/server/article/article.service.test.ts

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

# RSSフィードから記事を取得してupsert（CIで1時間ごとに実行）
npx tsx server/batch/create-article.ts
```

## 環境変数

`default.env` を `.env` にコピーし、`DB_FILE_NAME` に SQLite ファイルのパスを設定してください。本番環境では Turso の `libsql://` URL を設定します。

## アーキテクチャ

Nuxt 4 + Nitro アプリです。Vercel にデプロイされ、DB は SQLite（ローカル）/ Turso（本番）を Drizzle ORM 経由で利用します。

### データフロー

```text
RSSフィード -> batch/create-article.ts -> SQLite/Turso
                                              |
                                              v
フロントエンド (app/pages/) -> POST /api/article/fetch -> articleService -> articleRepository -> DB
```

### サーバー層 (`server/`)

- `db/schema/`: Drizzle のテーブル定義（`publisher`、`article`）とリレーション
- `repository/article.repository.ts`: 生の DB クエリ。呼び出し元が組み立てた `SQL` フラグメントを受け取る
- `service/article/service.ts`: 薄いオーケストレーション層。`ArticleRepository` インターフェースに依存し、テスト時に差し替え可能
- `service/article/query-builder.ts`: フロントエンドの JSON フィルター・ソートオプション（`WhereCondition[]`、`orderBy[]`）を Drizzle の `SQL` フラグメントに変換する。カラム名はホワイトリストでガードする
- `api/article/fetch.post.ts`: 単一の POST エンドポイント。サービスを呼び出して `{ articles, total, publishers }` を返す
- `batch/create-article.ts`: 全 publisher の RSS フィードを取得して記事を upsert するスクリプト

### フロントエンド (`app/`)

`app/pages/article/index.vue` の 1 ページ構成です。`useFetch` で `POST /api/article/fetch` を呼び出し、publisher フィルターとページネーションをクエリストリングで管理します。

## テスト

`test/unit/` 配下にあります。サービス層はリポジトリをモックしてテストするため DB は不要です。`vitest.config.ts` には `e2e` と `nuxt` のプロジェクトスロットも定義済みですが、現時点では未使用です。

## CI/CD

- デプロイ: `main` への push -> DB マイグレーション -> Vercel へデプロイ
- 記事取得: GitHub Actions の cron が 1 時間ごとに `create-article.ts` を本番 DB に対して実行

## 作業上の注意

- 既存の設計に合わせ、サーバー層では repository / service / query-builder の責務分離を維持してください。
- DB スキーマ変更時は Drizzle のマイグレーションを生成し、関連テストを更新してください。
- フロントエンドの状態は URL クエリと同期する既存方針に合わせてください。
- ユーザーや他エージェントの未コミット変更を勝手に戻さないでください。
