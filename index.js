let express = require("express");
let app = express();

app.get("/mytest", function (req, res) {
  res.send({
    code: 1,
  });
});

// http
let server = app.listen(1314, function () {
  let port = server.address().port;
  console.log(`应用实例，访问地址为 http://localhost:${port}`);
});

// https
// 创建https服务器实例
// const https = require('https')
// let key = fs.readFileSync(`${__dirname}/ssl/test.com.key`, 'utf-8')
// let cert = fs.readFileSync(`${__dirname}/ssl/test.com.pem`, 'utf-8')
// // console.log('log',key,cert);
// const credentials = {
//   key: key,
//   cert: cert
// }
// const httpsServer = https.createServer(credentials, app)

// // 设置https的访问端口号
// const SSLPORT = 3000

// // 启动服务器，监听对应的端口
// httpsServer.listen(SSLPORT, () => {
//   console.log(`HTTPS Server is running on: https://localhost:${SSLPORT}`)
// })
