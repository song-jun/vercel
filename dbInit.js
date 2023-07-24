/*
 * @Description: 
 * @Version: 
 * @Autor: MrSong
 * @Date: 2020-09-02 11:44:35
 * @LastEditors: MrSong
 * @LastEditTime: 2021-10-21 12:56:04
 */
var sql = require('./connect').sql
// 创建登录用户
const NAME = 'root'
const PASSWORD = '123456'
var dbInit = function () {
  sql.connect(function (err) {
    if (err) {
      console.log('数据库连接失败')
    }else {
      console.log('成功连接数据库,正在初始化数据库')
      sql.query('CREATE TABLE person(userId smallint(6) unsigned NOT NULL auto_increment,user varchar(255),password varchar(255),tel varchar(255),email varchar(255),nickname varchar(255),robotname varchar(255),qq varchar(255),name img(255),name varchar(255),visitNum int(10),PRIMARY KEY (`userId`)) ENGINE=InnoDB DEFAULT CHARSET=gbk', function (err) {
        !err ? console.log('person表创建成功') : console.log(err)
      })
      sql.query('CREATE TABLE blog(blogId smallint(6) unsigned NOT NULL auto_increment,id varchar(255),name varchar(255),memo varchar(255),type varchar(255),time varchar(255),text longtext,md longtext,comment varchar(255),star int(10),PRIMARY KEY (`blogId`) ) ENGINE=InnoDB DEFAULT CHARSET=gbk', function (err) {
        !err ? console.log('blog表创建成功') : console.log(err)
      })
      sql.query('CREATE TABLE muban(mubanId smallint(6) unsigned NOT NULL auto_increment,id varchar(255),name varchar(255),mubanUrl varchar(255),type varchar(255),time varchar(255),text longtext,md longtext,comment varchar(255),star int(10),PRIMARY KEY (`blogId`) ) ENGINE=InnoDB DEFAULT CHARSET=gbk', function (err) {
        !err ? console.log('muban表创建成功') : console.log(err)
      })
      sql.query('CREATE TABLE comment(commentId smallint(6) unsigned NOT NULL auto_increment,id varchar(255) ,blogId varchar(255),text varchar(255),PRIMARY KEY (`commentId`)) ENGINE=InnoDB DEFAULT CHARSET=gbk', function (err) {
        !err ? console.log('comment表创建成功') : console.log(err)
      })
      sql.query('insert into person set ?', {user: NAME,password: PASSWORD}, function (err) {
        !err ? console.log('person初始化成功') : console.log(err)
      })
      sql.query('CREATE TABLE leaveword(lwId smallint(6) unsigned NOT NULL auto_increment,id varchar(255),name varchar(255),time varchar(255),text varchar(255),PRIMARY KEY(`lwId`)) ENGINE=InnoDB DEFAULT CHARSET=gbk', function (err) {
        !err ? console.log('leaveword表创建成功') : console.log(err)
      })
      sql.query('CREATE TABLE visit(id smallint(6) unsigned NOT NULL auto_increment,name varchar(255),type varchar(255),ip varchar(255),address varchar(255),time int(100),PRIMARY KEY(`id`)) ENGINE=InnoDB DEFAULT CHARSET=gbk', function (err) {
        !err ? console.log('visit表创建成功') : console.log(err)
      })
      sql.end()
    }
  })
}
dbInit()
