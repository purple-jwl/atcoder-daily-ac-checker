# AtCoder Daily AC Checker (a.k.a AC褒め太郎)

## これは何？

[AtCoder](https://atcoder.jp/)でACしてる人をSlack上で褒める（紹介する）ためのツールです。

以下のような機能があります。

- 前日にACした人を褒める
- _n_ AC達成した人を褒める

__※このツールは1日1回スクリプトを動かす想定で作られています__

## セットアップ

事前にGoogle Apps Scriptやclaspを使用できるようにしておいてください。

- デプロイします
  ```sh
  $ npm install
  $ npx clasp login
  $ npx clasp create --rootDir ./src
  $ npx clasp push
  ```
- スプレッドシートを作成します
  - ファイル名は何でも良いです
- シートを2枚作成します
  - 1枚目のシート名は __管理表__ としてください
    - シートは1列（A列）のみ使用します
    - 1行目はヘッダー行とし、2行目以降にAtCoder ID（ユーザー名）を入力してください
      - （例）[このアカウント](https://atcoder.jp/users/purple_jwl)を対象にする場合、`purple_jwl`を入力してください
  - 2枚目のシート名は __AC記録用__ としてください
    - _n_ ACした人を褒めるために使用します（ _n_ は複数設定可）
    - 1行目をヘッダー行として、1行2列目（B列）以降に通知したいAC数を入力してください
      - （例）10ACした人、50ACした人、100ACした人を褒める場合、2列目に `10` 、3列目に `50` 、4列目に `100` を入力してください
    - __2行目以降の入力は不要です__
      - スクリプト側でAtCoder IDや何AC達成したかを自動で入力するようになっています

  | （例）管理表 | （例）AC記録用 |
  | :-: | :-: |
  | ![管理表サンプル](img/sample1.png) | ![AC記録用サンプル](img/sample2.png) |
- Google Apps Scriptのエディタ画面で以下の環境変数を設定します（ファイル > プロジェクトのプロパティ > スクリプトのプロパティ）
  - WEBHOOK_URL : SlackのIncoming Webhook URL
  - SHEET_ID : 先ほど作成したスプレッドシートのシートID
- トリガーを設定します（編集 > 現在のプロジェクトのトリガー > トリガーを追加）
  - main関数を指定してください

## 各機能に関する補足

### 前日にACした人を褒める機能

- スクリプト実行日の前日にACしたものを取得しています
- 対象は先述したシート1枚目の __管理表__ に書かれたAtCoder IDです

### _n_ AC達成した人を褒める機能

- スクリプト実行時のAC数を取得しています
- 対象は先述したシート1枚目の __管理表__ に書かれたAtCoder IDです
- 初めて _n_ AC以上達成した場合のみ通知します
  - スクリプト実行時に先述したシート2枚目の __AC記録用__ に達成状況が記録されます
  - それの前回分と比較し、差分があれば通知する仕様です
  - AtCoder IDを __管理表__ に新規記入した直後の実行（初回実行）では、前回スクリプト実行時のログが存在しないため、そのAtCoder IDは通知対象外となります

## 注意

このツールでは @kenkoooo 氏の[API](https://github.com/kenkoooo/AtCoderProblems)を使用し、AtCoderに関する情報を取得しています。スクリプトの短時間での連続実行などはお控えくださいますようお願いいたします。
