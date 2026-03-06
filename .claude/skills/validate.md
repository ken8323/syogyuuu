# validate

lint + test + build を一括で検証するスキル。

---
disable-model-invocation: true
---

## 実行コマンド

以下を順番に実行する。いずれかが失敗した時点で停止し FAIL を報告する。

```bash
npm run lint
```

```bash
npm run test:run
```

```bash
npm run build
```

## 結果判定

- 全て exit 0 → PASS
- いずれか失敗 → FAIL（失敗したコマンドとエラー内容を表示）

## 失敗時の対応

- エラー内容を確認し修正を試みる
- 2回修正しても解消しない場合はユーザーに報告し、方針を相談する
