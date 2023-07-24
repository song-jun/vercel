/*
 * @Description: 
 * @Version: 
 * @Autor: MrSong
 * @Date: 2020-05-20 09:38:30
 * @LastEditors: MrSong
 * @LastEditTime: 2023-07-24 16:17:03
 */
var mysql = require('mysql')
var fs = require('fs')
var path = require('path');
var data, sql,pool
var content = fs.readFileSync(path.join(__dirname, "./mysql.json"))
var env=process.env.NODE_ENV?process.env.NODE_ENV.trim():null;
console.log('env',env)
if (env == "development") {
  sql = mysql.createConnection(JSON.parse(content.toString()).development)
  data = JSON.parse(content.toString()).development
  pool = mysql.createPool(JSON.parse(content.toString()).development)
} else {
  sql = mysql.createConnection(JSON.parse(content.toString()).production)
  data = JSON.parse(content.toString()).production
  pool = mysql.createPool(JSON.parse(content.toString()).production)
}
var obj = {
  data: data,
  sql: sql,
  pool:pool,
  env: env
}
module.exports = obj
