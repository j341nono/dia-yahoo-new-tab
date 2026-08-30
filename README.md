# Dia Yahoo! JAPAN New Tab

Dia Browserで新しいタブを開いたときに、デフォルトの新規タブページではなく **Yahoo! JAPAN** を表示するためのChrome拡張です。

Yahoo! JAPANへ遷移するだけではDiaのデフォルト新規タブに表示されていたブックマークへアクセスしにくくなるため、Yahoo! JAPAN上にブックマークUIも表示します。

## Features

新しいタブを開くとYahoo! JAPANへ自動的に遷移します。また、Diaに保存されているブックマークバーのトップ階層をYahoo! JAPAN上に表示します。

ブックマークフォルダについては、クリックするとフォルダ内のブックマークを表示できます。

## How it works

Diaでは、新しいタブを開くと内部的に以下のページへ遷移します。

```text
chrome://start-page/
```

この遷移をService Workerで検出し、拡張機能内の `newtab.html` を経由してYahoo! JAPANへ遷移させています。

```text
New Tab
  ↓
chrome://start-page/
  ↓
background.js
  ↓
newtab.html
  ↓
Yahoo! JAPAN
  ↓
content.js
  ↓
Yahoo! JAPAN + Bookmark UI
```

## Installation

現在、Chrome Web Storeなどでは公開していません。

このリポジトリをcloneして、DiaのDeveloper modeから読み込んでください。

```bash
git clone https://github.com/j341nono/dia-yahoo-new-tab.git
```

Diaで以下を開きます。

```text
chrome://extensions/
```

`Developer mode` をONにし、`Load unpacked` を選択します。

その後、cloneした `dia-yahoo-new-tab` ディレクトリを指定してください。

インストール後、新しいタブを開くとYahoo! JAPANが表示されます。

## Files

```text
dia-yahoo-new-tab/
├── background.js
├── content.js
├── manifest.json
└── newtab.html
```

`background.js` はDiaの新規タブの検出とブックマークの取得、`newtab.html` はYahoo! JAPANへの遷移、`content.js` はYahoo! JAPAN上へのブックマークUIの追加を担当します。

## Permissions

この拡張では以下の権限を使用します。

```text
tabs
bookmarks
favicon
```

`tabs` はDiaの新規タブを検出するため、`bookmarks` はブックマーク情報を取得するため、`favicon` はブックマークのアイコンを表示するために使用します。

ブックマークの追加・変更・削除は行いません。

## Notes

この拡張はDiaの新規タブが `chrome://start-page/` を使用していることを前提としています。そのため、今後Dia側の仕様が変更された場合には動作しなくなる可能性があります。

また、現時点では個人利用を目的として作成したものであり、Chrome Web Storeなどへの正式な公開は行っていません。

## Related article

実装方法や仕組みについては[Qiita](https://qiita.com/j341nono/items/12379c41fd02ec813ac1)にもまとめています。

## Contributing

コントリビューションは歓迎です！

バグを見つけた場合や、改善案・追加したい機能がある場合は、気軽にIssueを立てたりPull Requestを送ってください。

## License

MIT License
