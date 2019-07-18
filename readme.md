# AI Clothes image analyzer

AIによって衣服の画像の特徴を解析し、以前いつ着たかを自動判定します。

https://aites.herokuapp.com/

セキュリティー上、いくつかのDB関係のファイルが削除されています。
以下を参考に、ご自分のDBを再構築してみてください。

```js
var mysql = require('mysql');


var dbConfig = {
  host: <host url>,
  user: <username>,
  password: <your db password>,
  database: <name>'
};

var connection = mysql.createConnection(dbConfig);

// for prevent heroku mysql from sleep
setInterval(function() {
  connection.query('SELECT 1');
}, 5000);

module.exports = connection;
```
