# ios9-safari-image-viewer

iOS9のSafariで使用可能な画像ビューア（新しめのJavaScriptを使ってない）

ただのindexが出るHTTPサーバとの違いは以下の機能があること

- indexページでサムネイルが出る
- 大きな画像を縮小して表示

# セットアップ

```
git clone https://github.com/milhidaka/ios9-safari-image-viewer
npm install
npm run build
```

# 実行

```
npm start [directory]
```

`[directory]`: 画像ファイルがあるディレクトリ。指定しない場合カレントディレクトリ。

※ディレクトリ内に`.imgcache`というディレクトリが作られてサムネイル等が保存されることに注意

[http://localhost:3000](http://localhost:3000) を開く(localhostをIPアドレスに置換)
