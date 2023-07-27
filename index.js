var express = require('express')
var app = express()
const multer = require("multer")
const axios = require("axios")
// sql.connect()容易断链
// var sql = require('./connect').sql
// 使用sql连接池
var sql = require('./connect').pool
var host = require('./connect').data.host
var path = require("path")
var bodyParser = require('body-parser')
var fs = require('fs')

var upload = multer({
  dest: "upload/"
})
// 配置允许跨域请求；
app.all('*', function (req, res, next) {
  // console.log(req.headers.origin)
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Credentials', true)
  res.header('X-Powered-By', ' 3.2.1')
  next()
})
// nodejs获取客户端IP Address
function getClientIp(req) {
  return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
};
// 获取本机ip地址
function getIp() {
  var os = require('os'),
    iptable = {},
    ifaces = os.networkInterfaces()
  // console.log('log', ifaces);
  for (var dev in ifaces) {
    ifaces[dev].forEach(function (details, alias) {
      if ((details.family == 'IPv4') && (details.internal == false)) {
        // iptable[dev+(alias?':'+alias:'')]=details.address
        iptable['localIP'] = details.address
      }
    })
  }
  return 'https://' + host;
  return '119.45.212.92';
  return iptable.localIP
}
// 获取当月的天数
function getDaysInOneMonth(year, month) {
  month = parseInt(month, 10)
  var d = new Date(year, month, 0)
  return d.getDate()
}
// post请求需要
app.use(bodyParser.urlencoded({
  'limit': '100000kb',
  extended: true
}))
app.get('/', async (req, res) => {
  res.status(200).send('Hello World!')
})
// 文章接口
app.post('/set_note', function (req, res) {
  var data = req.body
  sql.query('insert into blog set ?', {
    id: data.id,
    name: data.title,
    type: data.tag,
    text: data.html,
    md: data.md,
    memo: data.memo,
    time: data.time,
    img: data.img
  }, function (err) {
    if (err) {
      console.log(err)
      res.send({
        code: 0
      })
    } else {
      let filename = `./md/${data.title}.md`
      let file = path.resolve(__dirname, filename)
      // 异步写入数据到文件
      fs.writeFile(file, data.md, { encoding: 'utf8' }, err => { })
      console.log('新建blog成功:  ' + data.title)
      res.send({
        code: 1
      })
    }
  })
})
// 获取地址
app.get('/get_address', function (req, res) {
  axios.get('https://pv.sohu.com/cityjson') //请求外部接口
    .then((response) => {
      const info = response.data.substring(19, response.data.length - 1)
      res.send({
        code: 1,
        data: JSON.parse(info)
      })
    })
    .catch((error) => {
      res.send({
        code: 0
      })
    })
})
// 模板创建接口
app.post('/set_muban', function (req, res) {
  var data = req.body
  sql.query('insert into muban set ?', {
    id: data.id,
    name: data.title,
    mubanUrl: data.mubanUrl,
    type: data.tag,
    text: data.html,
    md: data.md,
    time: data.time,
    img: data.img
  }, function (err) {
    if (err) {
      console.log(err)
      res.send({
        code: 0
      })
    } else {
      console.log('新建模板成功:  ' + data.title)
      res.send({
        code: 1
      })
    }
  })
})
app.post('/get_note', function (req, res) {
  var pageNo = req.body.pageNo || 1, pageSize = req.body.pageSize || 10, total = 0;
  sql.query('select * from blog where id = "' + req.body.id + '"', function (err, rows) {
    total = rows.length;
    // console.log('log', 'select * from blog where id = "' + req.body.id + '" order by blogId desc' + ' limit ' + (pageNo - 1) * pageSize + ',' + pageSize);
    sql.query('select * from blog where id = "' + req.body.id + '" order by blogId desc' + ' limit ' + (pageNo - 1) * pageSize + ',' + pageSize, function (err, rows) {
      // console.log(rows)
      if (err) {
        console.log(err)
        res.send({
          code: 0
        })
      } else {
        var data = {}
        // console.log(rows)
        for (var i = 0; i < rows.length; i++) {
          data[i] = {
            blogId: rows[i].blogId,
            id: rows[i].id,
            img: rows[i].img,
            title: rows[i].name,
            type: rows[i].type.split('-'),
            star: rows[i].star,
            text: rows[i].text,
            comment: rows[i].comment,
            md: rows[i].md,
            memo: rows[i].memo,
            time: rows[i].time ? rows[i].time : null
          }
        }
        // console.log(data)
        res.send({
          code: 1,
          total: total,
          pageNo: pageNo,
          pageSize: pageSize,
          data: data
        })
      }
    })
  })
})
app.post('/get_muban', function (req, res) {
  var pageNo = req.body.pageNo || 1, pageSize = req.body.pageSize || 10, total = 0;
  sql.query('select * from muban where id = "' + req.body.id + '"', function (err, rows) {
    total = rows.length;
    sql.query('select * from muban where id = "' + req.body.id + '" limit ' + (pageNo - 1) * pageSize + ',' + pageSize, function (err, rows) {
      // console.log(rows)
      if (err) {
        console.log(err)
        res.send({
          code: 0
        })
      } else {
        var data = {}
        // console.log(rows)
        for (var i = 0; i < rows.length; i++) {
          data[i] = {
            mubanId: rows[i].mubanId,
            id: rows[i].id,
            img: rows[i].img,
            title: rows[i].name,
            type: rows[i].type ? rows[i].type.split('-') : ['博客模板'],
            star: rows[i].star,
            text: rows[i].text,
            comment: rows[i].comment,
            mubanUrl: rows[i].mubanUrl,
            md: rows[i].md,
            time: rows[i].time ? rows[i].time : null
          }
        }
        // console.log(data)
        res.send({
          code: 1,
          total: total,
          pageNo: pageNo,
          pageSize: pageSize,
          data: data
        })
      }
    })
  })
})
app.post('/update_note', function (req, res) {
  sql.query('update blog set id = ?,name= ?,memo= ?,type=?,text=?,md=?,img=? where id=? and blogId=?', [req.body.id, req.body.title, req.body.memo, req.body.tag, req.body.html, req.body.md, req.body.img, req.body.id, req.body.blogId], function (err, result) {
    !err ? res.send({
      code: 1
    }) : res.send({
      code: 0
    })
  })
})
app.post('/update_muban', function (req, res) {
  sql.query('update muban set id = ?,name= ?,type=?,text=?,md=?,img=?,mubanUrl=? where id=? and mubanId=?', [req.body.id, req.body.title, req.body.tag, req.body.html, req.body.md, req.body.img, req.body.mubanUrl, req.body.id, req.body.mubanId], function (err, result) {
    console.log('log', err);
    !err ? res.send({
      code: 1
    }) : res.send({
      code: 0
    })
  })
})
app.post('/delete_note', function (req, res) {
  sql.query('delete from blog where name="' + req.body.name + '"and id = "' + req.body.id + '"', function (err, rows) {
    if (err) {
      console.log(err)
      res.send({
        code: 0
      })
    } else {
      res.send({
        code: 1
      })
    }
  })
})
app.post('/delete_muban', function (req, res) {
  sql.query('delete from muban where name="' + req.body.name + '"and id = "' + req.body.id + '"', function (err, rows) {
    if (err) {
      console.log(err)
      res.send({
        code: 0
      })
    } else {
      res.send({
        code: 1
      })
    }
  })
})
app.post('/login', function (req, res) {
  // console.log(req);
  sql.query('select * from person where user="' + req.body.username + '" and password="' + req.body.password + '"', function (err, rows) {
    if (err || rows.length == 0) {
      sql.query('select * from person where nickname="' + req.body.username + '" and password="' + req.body.password + '"', function (err, rows) {
        if (err || rows.length == 0) {
          console.log(err)
          res.send({
            code: 0
          });
        } else {
          var userInfo = rows[0];
          delete userInfo.password;
          res.send({
            code: 1,
            userInfo: userInfo
          });
        }
      });
    } else {
      var userInfo = rows[0];
      delete userInfo.password;
      res.send({
        code: 1,
        userInfo: userInfo
      });
    }
  });
});
app.get('/mytest', function (req, res) {
  // console.log(req);
  res.send({
    code: 1
  })
});
app.get('/getfiledata', function (req, res) {
  res.send({
    code: 1,
    data: allData
  })
});
app.post('/getdetailfile', function (req, res) {
  var cur = req.body.cur;
  sql.query('select * from filedata where cur="' + cur + '"', function (err, rows) {
    // console.log('rows', rows);
    if (err || rows.length == 0) {
      res.send({
        code: 0,
        ms: ' 服务器出错 ',
        err: err
      })
    } else {
      res.send({
        code: 1,
        data: rows[0]
      })
    }
  })
});
app.post('/register', function (req, res) {
  sql.query('select user from person where user="' + req.body.username + '"', function (err, rows) {
    // console.log(rows)
    if (err || rows.length == 0) {
      var timestamp = Date.parse(new Date()) / 1000;
      sql.query('insert  into person set ?', {
        user: req.body.username,
        password: req.body.password,
        email: req.body.email,
        robotname: "小懒",
        nickname: `小懒${timestamp}`
      }, function (err, rows) {
        if (err) {
          res.send({
            code: 0,
            ms: ' 服务器出错 '
          })
        } else {
          res.send({
            code: 1
          })
        }
      })
    } else {
      res.send({
        code: 0,
        ms: '账户已存在'
      })
    }
  })
})
app.post('/reset', function (req, res) {
  // 'select user from person where user="' + req.body.username + '" and password="' + req.body.password + '"'
  sql.query('select user from person where user="' + req.body.username + '" and email="' + req.body.email + '"', function (err, rows) {
    // console.log(rows)
    if (err || rows.length == 0) {
      res.send({
        code: 0,
        ms: '该账户,邮箱不匹配'
      })
    } else {
      sql.query('update person set password= ? where user = ?', [req.body.password, req.body.username], function (err, result) {
        err ? res.send({
          code: 0
        }) : res.send({
          code: 1,
          ms: '密码重置成功'
        })
      })
    }
  })
})
app.post('/update_password', function (req, res) {
  // 'select user from person where user="' + req.body.username + '" and password="' + req.body.password + '"'
  sql.query('select user from person where user="' + req.body.username + '" and password="' + req.body.old_password + '"', function (err, rows) {
    // console.log(rows)
    if (err || rows.length == 0) {
      res.send({
        code: 0,
        ms: '旧密码错误'
      })
    } else {
      sql.query('update person set password= ? where user = ?', [req.body.password, req.body.username], function (err, result) {
        err ? res.send({
          code: 0
        }) : res.send({
          code: 1,
          ms: '密码修改成功'
        })
      })
    }
  })
})
// 根据id获取文章信息
app.post('/get_detail_blog', function (req, res) {
  sql.query('select * from blog where blogId="' + req.body.blogId + '"and id = "' + req.body.id + '"', function (err, rows) {
    if (rows.length == 0) {
      res.send({
        code: 405,
        msg: '未找到内容!!!'
      })
      return;
    }
    var blog = rows[0]
    res.send({
      code: 1,
      blog: blog.text
    })
  })
})
app.post('/get_md_blog', function (req, res) {
  sql.query('select * from blog where name="' + req.body.name + '"and id = "' + req.body.id + '"', function (err, rows) {
    // console.log('err',err,rows);
    if (rows.length == 0) {
      res.send({
        code: 403,
        msg: '未找到内容!!!'
      })
    } else {
      var blog = rows[0]
      res.send({
        code: 1,
        blogId: blog.blogId,
        img: blog.img,
        memo: blog.memo,
        blog: blog.md,
        type: blog.type,
        title: blog.name,
        text: blog.text,
        time: blog.time
      })
    }
  })
})
app.post('/get_md_muban', function (req, res) {
  sql.query('select * from muban where name="' + req.body.name + '"and id = "' + req.body.id + '"', function (err, rows) {
    // console.log('err',err,rows);
    if (rows.length == 0) {
      res.send({
        code: 403,
        msg: '未找到内容!!!'
      })
    } else {
      var muban = rows[0]
      res.send({
        code: 1,
        mubanId: muban.mubanId,
        img: muban.img,
        blog: muban.md,
        type: muban.type,
        title: muban.name,
        text: muban.text,
        time: muban.time,
        mubanUrl: muban.mubanUrl
      })
    }
  })
})
// 获取访问数据
app.post('/get_visit', function (req, res) {
  var pageNo = req.body.pageNo || 1, pageSize = req.body.pageSize || 10, total = 0;
  sql.query('select * from visit where type = "' + req.body.type + '"', function (err, rows) {
    total = rows.length;
    sql.query('select * from visit where type = "' + req.body.type + '" order by id desc' + ' limit ' + (pageNo - 1) * pageSize + ',' + pageSize, function (err, rows) {
      // console.log('log', rows);
      var data = []
      for (var i = 0; i < rows.length; i++) {
        data[i] = {
          name: rows[i].name,
          ip: rows[i].ip,
          address: rows[i].address,
          time: rows[i].time
        }
      }
      res.send({
        code: 1,
        total: total,
        pageNo: pageNo,
        pageSize: pageSize,
        data: data
      })
    })
  })
})
// 获取首页信息接口
app.post('/get_msg', function (req, res) {
  var blogNum = 0
  var allComment = 0
  var visitNum = 0
  var leaveword = 0
  var totalVisit = 0
  var totalVisit_f = 0
  var todayVisit = 0
  var todayVisit_f = 0
  var visit_arr = []
  var visit_arr_f = []
  // 获取当日0点的时间戳
  var start = new Date()
  start.setHours(0)
  start.setMinutes(0)
  start.setSeconds(0)
  start.setMilliseconds(0)
  var todayStartTime = Date.parse(start) / 1000
  var todayEndTime = Date.parse(start) / 1000 + 86400
  var nowTime = new Date().getTime()
  var today_one = new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + '/01'
  var mouth_num = getDaysInOneMonth(new Date().getFullYear(), new Date().getMonth() + 1)
  sql.query('select * from visit  where name = "' + req.body.id + '"', function (err, rows) {
    var time = new Date(today_one).getTime() / 1000
    var time_value = 86400
    for (var j = 0, jlen = mouth_num; j < jlen; j++) {
      var time_num = 0
      for (var i = 0, len = rows.length; i < len; i++) {
        if (rows[i].time >= (time + time_value - 86400) && rows[i].time <= (time + time_value)) {
          time_num++
        }
      }
      time_value += 86400
      visit_arr.push(time_num)
    }
  })
  // 前台访问量
  var nameF = 'consumer';
  sql.query('select * from visit  where name = "' + nameF + '"', function (err, rows) {
    var time = new Date(today_one).getTime() / 1000
    var time_value = 86400
    for (var j = 0, jlen = mouth_num; j < jlen; j++) {
      var time_num = 0
      for (var i = 0, len = rows.length; i < len; i++) {
        if (rows[i].time >= (time + time_value - 86400) && rows[i].time <= (time + time_value)) {
          time_num++
        }
      }
      time_value += 86400
      visit_arr_f.push(time_num)
    }
    visit_arr_f.forEach((item) => {
      totalVisit_f += item
    })
    sql.query('select * from blog  where id = "' + req.body.id + '"', function (err, rows) {
      blogNum = rows ? rows.length : 0;
      for (var i = 0, len = rows.length; i < len; i++) {
        allComment = rows[i].comment ? allComment - 0 + (rows[i].comment - 0) : allComment
      }
      sql.query('select visitNum from person  where user = "' + req.body.id + '"', function (err, rows) {
        totalVisit = rows[0].visitNum ? rows[0].visitNum : 0;
        sql.query('select * from leaveword where id = "' + req.body.id + '"', function (err, rows) {
          leaveword = rows ? rows.length : 0;
          sql.query('select * from visit where  time <"' + todayEndTime + '"and time>"' + todayStartTime + '" and name = "' + req.body.id + '"', function (err, rows) {
            todayVisit = rows ? rows.length : 0;
            sql.query('select * from visit where  time <"' + todayEndTime + '"and time>"' + todayStartTime + '" and name = "' + nameF + '"', function (err, rows) {
              todayVisit_f = rows ? rows.length : 0;
              res.send({
                blogNum: blogNum,
                allComment: allComment,
                totalVisit: totalVisit,
                leaveword: leaveword,
                todayVisit: todayVisit,
                visit_arr: visit_arr,
                visit_arr_f: visit_arr_f,
                totalVisit_f: totalVisit_f,
                todayVisit_f: todayVisit_f
              })
            })
          })
        })
      })
    })
  })
})
// 获取blog访问量
app.post('/get_charts', function (req, res) {
  var blogNum = 0
  var allComment = 0
  var visitNum = 0
  var leaveword = 0
  var totalVisit = 0
  var totalVisit_f = 0
  var todayVisit = 0
  var todayVisit_f = 0
  var charts_data = []
  // 获取当日0点的时间戳
  var start = new Date()
  start.setHours(0)
  start.setMinutes(0)
  start.setSeconds(0)
  start.setMilliseconds(0)
  var todayStartTime = Date.parse(start) / 1000
  var todayEndTime = Date.parse(start) / 1000 + 86400
  var nowTime = new Date().getTime()
  var today_one = new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + '/01'
  var mouth_num = getDaysInOneMonth(new Date().getFullYear(), new Date().getMonth() + 1)
  // 前台访问量
  var nameF = 'blog-consumer';
  sql.query('select * from visit  where name = "' + nameF + '"', function (err, rows) {
    var time = new Date(today_one).getTime() / 1000
    var time_value = 86400
    for (var j = 0, jlen = mouth_num; j < jlen; j++) {
      var time_num = 0
      for (var i = 0, len = rows.length; i < len; i++) {
        if (rows[i].time >= (time + time_value - 86400) && rows[i].time <= (time + time_value)) {
          time_num++
        }
      }
      time_value += 86400
      charts_data.push(time_num)
    }
    charts_data.forEach((item) => {
      totalVisit_f += item
    })
    sql.query('select * from blog  where id = "' + req.body.id + '"', function (err, rows) {
      blogNum = rows ? rows.length : 0;
      for (var i = 0, len = rows.length; i < len; i++) {
        allComment = rows[i].comment ? allComment - 0 + (rows[i].comment - 0) : allComment
      }
      sql.query('select visitNum from person  where user = "' + req.body.id + '"', function (err, rows) {
        totalVisit = rows[0].visitNum ? rows[0].visitNum : 0;
        sql.query('select * from leaveword where id = "' + req.body.id + '"', function (err, rows) {
          leaveword = rows ? rows.length : 0;
          sql.query('select * from visit where  time <"' + todayEndTime + '"and time>"' + todayStartTime + '" and name = "' + req.body.id + '"', function (err, rows) {
            todayVisit = rows ? rows.length : 0;
            sql.query('select * from visit where  time <"' + todayEndTime + '"and time>"' + todayStartTime + '" and name = "' + nameF + '"', function (err, rows) {
              todayVisit_f = rows ? rows.length : 0;
              res.send({
                code: 1,
                data: {
                  blogNum: blogNum,
                  allComment: allComment,
                  totalVisit: totalVisit,
                  leaveword: leaveword,
                  todayVisit: todayVisit,
                  charts_data: charts_data,
                  totalVisit_f: totalVisit_f,
                  todayVisit_f: todayVisit_f
                }
              })
            })
          })
        })
      })
    })
  })
})
// 上传图片接口
app.post('/send_img', function (req, res) {
  // console.log('log',req,res);
  var imgData = req.body.img
  var type = req.body.type
  var user = req.body.user
  // 过滤data:URL
  var base64Data = imgData.replace(/^data:image\/\w+;base64,/, ' ')
  var dataBuffer = new Buffer(base64Data, 'base64')
  var time = new Date().getTime()
  if (!fs.existsSync(__dirname + '/images/')) {
    fs.mkdirSync(__dirname + '/images/');
  }
  if (!fs.existsSync(__dirname + '/images/upload/')) {
    fs.mkdirSync(__dirname + '/images/upload/');
  }
  fs.writeFile(__dirname + '/images/upload/' + time + '.png', dataBuffer, function (err) {
    if (err) {
      res.send(err)
    } else {
      var urlData = getIp() + ':3000/upload/' + time + '.png';
      if (type == 1) {
        console.log('1', type);
        sql.query('update person set img = ? where user=?', [urlData, req.body.user], function (err, result) {
          !err ? res.send({
            code: 1,
            ms: '保存成功',
            data: urlData
          }) : res.send({
            code: 0
          })
        })
      } else {
        console.log('2', type);
        res.send({
          code: 1,
          ms: '保存成功',
          data: urlData
        })
      }
    }
  })
})
// 上传文件接口
app.post('/send_file', upload.single("fileItem"), function (req, res) {
  let file = req.file, filePath = 'images/zip/', filename;
  let extName = path.extname(file.originalname);
  let n = path.basename(file.originalname).lastIndexOf(".");
  let nstr = file.originalname.substring(0, n);
  if (!fs.existsSync(__dirname + '/images/zip/')) {
    fs.mkdirSync(__dirname + '/images/zip/');
  }
  // if (!fs.existsSync(__dirname + '/zip/upload/')) {
  //   fs.mkdirSync(__dirname + '/zip/upload/');
  //   filePath = __dirname + '/zip/upload/';
  // }
  filename = filePath + nstr + extName;
  console.log('filename', filename);
  fs.exists(filename, (exists) => {
    if (!exists) {
      copyName(res);
      return;
    }
    console.log('log', '删除原来的文件');
    // 删除原来的文件
    // fs.unlinkSync(filename);
    copyName(res);
  })
  // 重命名
  function copyName(res) {
    try {
      fs.rename(file.path, filename, err => {
        console.log("重命名成功", filename);
        res.send({
          code: 1,
          ms: '保存成功',
          data: getIp() + ':3000/zip/' + nstr + extName
        })
        // if (extName === ".zip") {
        //   // 开始解压
        //   fs.createReadStream(filename).on("error", () => {
        //     console.log("解压失败");
        //   }).on("close", () => {
        //     console.log("关闭");
        //     // 删除zip文件
        //     fs.unlinkSync(filename);
        //   }).pipe(uzip.Extract({ path: "upload/" + nstr }));
        // }
      })
    } catch (e) {
      console.log("e is ", e);
    }
  }
})
// 获取当前服务器ip
app.post('/get_address', function (req, res) {
  res.send(getIp() + ':3000')
})
// 获取留言接口
app.post('/get_leaveword', function (req, res) {
  var id = req.body.id
  // console.log('log', 'select * from leaveword  where id = ?' + ' order by lwId desc');
  sql.query('select * from leaveword  where id = ?' + ' order by lwId desc', [id], function (err, rows) {
    if (err) {
      res.send(err)
    } else {
      res.send({
        code: 1,
        data: rows
      })
    }
  })
})
// update留言
app.post('/update_leaveword', function (req, res) {
  // console.log(req.body.id)
  var num = 1;
  sql.query('update leaveword set status= ? where id = ?', [num, req.body.id], function (err, result) {
    err ? res.send({
      code: 0
    }) : res.send({
      code: 1
    })
  })
})
// 添加留言接口
app.post('/add_leaveword', function (req, res) {
  var data = req.body
  sql.query('insert into leaveword set ?', {
    id: data.id,
    name: data.name,
    time: data.time,
    text: data.text
  }, function (err) {
    err ? res.send({
      code: 0,
      ms: err
    }) : res.send({
      code: 1,
      ms: '添加成功'
    })
  })
})
// 删除留言接口
app.post('/delete_leaveword', function (req, res) {
  var data = req.body

  // sql.query('delete from leaveword where id=? and name = ?', [data.id, data.name], function (err) {
  //   err ? res.send({ code: 0, ms: err }) : res.send({ code: 1, ms: '删除成功' })
  // })
  sql.query('delete from leaveword where id=? and lwId = ?', [data.id, data.lwId], function (err) {
    err ? res.send({
      code: 0,
      ms: err
    }) : res.send({
      code: 1,
      ms: '删除成功'
    })
  })
})
// 获取所有blog接口
app.post('/get_all_blog', function (req, res) {
  sql.query('select * from blog where id=?', [req.body.id], function (err, rows) {
    var data = []
    for (var i = 0, len = rows.length; i < len; i++) {
      data.push({
        blogId: rows[i].blogId,
        title: rows[i].name,
        type: rows[i].type,
        comment: rows[i].comment,
        star: rows[i].star
      })
    }
    err ? res.send({
      code: 0,
      ms: err
    }) : res.send({
      code: 1,
      ms: '获取成功',
      data: data
    })
  })
  var num
  sql.query('insert into visit set ?', {
    name: req.body.id,
    time: new Date().getTime() / 1000
  }, function (err, rows) { })
  sql.query('select visitNum from person where user = ?', [req.body.id], function (err, rows) {
    num = rows[0].visitNum != null ? rows[0].visitNum - 0 + 1 : 1
    sql.query('update person set visitNum = ? where user = ?', [num, req.body.id], function (err, rows) {
      console.log(err)
    })
  })
})
// 添加访问量接口
app.post('/user_visit', function (req, res) {
  var visitIp = getClientIp(req).replace('::ffff:', '');
  console.log('visitIp', visitIp);
  var num;
  sql.query('insert into visit set ?', {
    name: req.body.id,
    time: new Date().getTime() / 1000,
    type: req.body.type ? req.body.type : 0,
    ip: req.body.ip ? req.body.ip : visitIp,
    address: req.body.address || '后台登录'
  }, function (err, rows) {
    err ? res.send({
      code: 0,
      ms: err
    }) : res.send({
      code: 1,
      ms: '添加成功'
    })
  })
  sql.query('select visitNum from person where user = ?', [req.body.id], function (err, rows) {
    if (rows.length == 0) {
      return false;
    }
    num = rows[0].visitNum != null ? rows[0].visitNum - 0 + 1 : 1
    sql.query('update person set visitNum = ? where user = ?', [num, req.body.id], function (err, rows) {
      console.log(err)
    })
  })
})
// 获取blog评论接口
app.post('/get_blog_comment', function (req, res) {
  sql.query('select * from comment where  blogId=?', [req.body.blogId], function (err, rows) {
    err ? res.send({
      code: 0,
      ms: err
    }) : res.send({
      code: 1,
      ms: '获取成功',
      data: rows
    })
  })
})
// 获取user
app.post('/get_user', function (req, res) {
  // sql.query('select * from person', function (err, rows) {
  //   err ? res.send({
  //     code: 0,
  //     ms: err
  //   }) : res.send({
  //     code: 1,
  //     ms: '获取成功',
  //     data: rows
  //   })
  // })
  var pageNo = req.body.pageNo || 1, pageSize = req.body.pageSize || 10, total = 0, name = req.body.name;
  sql.query('select * from person', function (err, rows) {
    total = rows.length;
    sql.query('select * from person limit ' + (pageNo - 1) * pageSize + ',' + pageSize, function (err, rows) {
      if (err) {
        console.log(err)
        res.send({
          code: 0
        })
      } else {
        if (name != 'root') {
          rows.forEach((item) => {
            delete item.password;
          })
        }
        res.send({
          code: 1,
          total: total,
          pageNo: pageNo,
          pageSize: pageSize,
          data: rows
        })
      }
    })
  })
})
app.post('/get_user_info', function (req, res) {
  sql.query('select * from person where user=?', [req.body.user], function (err, rows) {
    if (rows.length > 0) {
      delete rows[0].password;
    }
    err ? res.send({
      code: 0,
      ms: err
    }) : res.send({
      code: 1,
      ms: '获取成功',
      data: rows
    })
  })
})
app.post('/update_user', function (req, res) {
  sql.query('update person set tel = ?,qq= ?,nickname= ?,robotname= ?,email=? where user=?', [req.body.tel, req.body.qq, req.body.nickname, req.body.robotname, req.body.email, req.body.user], function (err, result) {
    !err ? res.send({
      code: 1
    }) : res.send({
      code: 0
    })
  })
})
// 清空cmd数据
app.post('/clear_cmd', function (req, res) {
  sql.query('truncate table cmd', function (err) {
    res.send({
      code: 1,
      msg: 'CMD数据清空完成'
    })
  })
})
// 删除user
app.post('/delete_user', function (req, res) {
  var data = req.body
  sql.query('delete from person where userId=?', [data.userId], function (err) {
    err ? res.send({
      code: 0,
      ms: err
    }) : res.send({
      code: 1,
      msg: '删除成功'
    })
  })
})
// 添加blog评论接口
app.post('/add_blog_comment', function (req, res) {
  var timestamp = Date.parse(new Date());
  sql.query('insert into comment set?', {
    id: req.body.id,
    blogId: req.body.blogId,
    text: req.body.text,
    time: timestamp
  }, function (err, rows) {
    err ? res.send({
      code: 0,
      ms: err
    }) : res.send({
      code: 1,
      ms: '获取成功',
      data: rows
    })
  })
  var num
  sql.query('select comment from blog where  blogId = ?', [req.body.blogId], function (err, rows) {
    num = rows[0].comment != null ? rows[0].comment - 0 + 1 : 1
    sql.query('update blog set comment = ? where  blogId = ?', [num, req.body.blogId], function (err, rows) { })
  })
})
// 添加star接口
app.post('/add_blog_star', function (req, res) {
  var num
  sql.query('select star from blog where blogId = ?', [req.body.blogId], function (err, rows) {
    num = rows[0].star != null ? rows[0].star - 0 + 1 : 1
    sql.query('update blog set star = ? where blogId = ?', [num, req.body.blogId], function (err, rows) {
      res.send({
        code: 1,
        ms: 'star成功'
      })
    })
  })
})
app.post('/add_muban_star', function (req, res) {
  var num
  sql.query('select star from muban where mubanId = ?', [req.body.mubanId], function (err, rows) {
    num = rows[0].star != null ? rows[0].star - 0 + 1 : 1
    sql.query('update muban set star = ? where mubanId = ?', [num, req.body.mubanId], function (err, rows) {
      res.send({
        code: 1,
        ms: 'star成功'
      })
    })
  })
})
// api文件夹下以images文件为启动服务的根目录
app.use(express.static(__dirname + '/images'))

// api文件夹为启动服务的根目录
// app.use(express.static(__dirname))
// http
var server = app.listen(3000, function () {
  var port = server.address().port
  console.log(`应用实例，访问地址为 http://localhost:${port}`)
})

// https
// 创建https服务器实例
// const https = require('https')
// var key = fs.readFileSync(`${__dirname}/ssl/test.com.key`, 'utf-8')
// var cert = fs.readFileSync(`${__dirname}/ssl/test.com.pem`, 'utf-8')
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