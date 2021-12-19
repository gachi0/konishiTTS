# KonishiTTS
voicevoxを使用したdiscordの読み上げBot

## セットアップ&実行

### 環境  
[node.js](https://nodejs.org/ja/) v16以上が必要です。  
[VOICEVOX](https://voicevox.hiroshiba.jp) を使用するので、VOICEVOXを起動しておいてください  

1. ディレクトリの移動  
```cmd
cd konishiTTS
```

2. 必要なパッケージのインストール  
```
npm i
```

3. configファイルの設定  
`config.toml.sample` を `config.toml` にリネーム  
tokenにはボットのtokenを設定  
サーバースコープでコマンドを登録する場合は、guildidを設定（任意）

4. コマンドの登録  
- アプリケーションスコープで登録する場合（推奨）
```
npm run cmdapp
```

- サーバースコープで登録する場合
```
npm run cmdguild
```

5. 実行！  
```
npm start
```

## リンク
- [VOICEVOX](https://voicevox.hiroshiba.jp)
- [node.js](https://nodejs.org/ja/)