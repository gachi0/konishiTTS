# KonishiTTS
voicevoxを使用したdiscordの読み上げBot

## セットアップ&実行

### 環境  
[node.js](https://nodejs.org/ja/) v16以上が必要です。  


1. 必要なパッケージのインストール  
```
npm i
```
3. 実行！  
```
npm start
```

実行すると自動でアプリケーションコマンドが登録されます。反映には1時間ほどかかります。

## リンク
- [VOICEVOX](https://voicevox.hiroshiba.jp)
- [node.js](https://nodejs.org/ja/)

# memo
型定義生成 ヴォイヴォ鯖起動状態で
`npx openapi-typescript http://localhost:50021/openapi.json --output ./src/openapi/schema.ts`