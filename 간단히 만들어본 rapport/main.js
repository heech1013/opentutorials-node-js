const express = require('express'),
      bodyParser = require('body-parser'),
      bkfd2Password = require('pbkdf2-password'),
      session = require('express-session'),
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy,
      mysql = require('mysql'),
      MySQLStore = require('express-mysql-session')(session);

const app = express();

app.set('views', './view');
app.set('view engine', 'pug');

const conn = mysql.createConnection(
      {
            host: 'localhost',
            user: 'root',
            password: '111111',
            database: 'rapport'
      }
);
conn.connect();

app.use(bodyParser.urlencoded({ extended:false }));

app.use(session(  // passport의 session 사용에 필요
      {
            secret: 'rapport5959!@#$',
            resave: false,
            saveUninitialized: true,
            store: new MySQLStore(
                  {
                        host: 'localhost',
                        port: '3306',
                        user: 'root',
                        password: '111111',
                        database: 'rapport'
                  }
            )
      }
))
app.use(passport.initialize());  // passport 초기화
app.use(passport.session());

const hasher = bkfd2Password();

passport.serializeUser((user, done)=>{
      console.log('serializeUser', user);
      done(null, user.auth_id);
});
passport.deserializeUser((auth_id, done)=>{
      console.log('deserializeUser', auth_id);
      let sql = 'SELECT * FROM users WHERE auth_id=?';
      conn.query(sql, [auth_id], (err, results)=>{
            if(err){
                  console.log(err);
                  done('There is no user');
            } else{
                  done(null, results[0]);  // 해당 결과가 req.user로 들어감(?)
            }
      })
});

passport.use(new LocalStrategy(  // 로그인 실패했을 때 오류남**
      (username, password, done)=>{  // passport 기본 변수(변수명 변경하지 말 것)
            let username_input = username,
                password_input = password;
            let sql = 'SELECT * FROM users WHERE auth_id=?';
            conn.query(sql, ['local:'+username_input], (err, results)=>{  // auth_id= 'local:아이디 입력값'
                  if(err){ 
                        return done('There is no user');
                  }
                  let user = results[0];
                  return hasher({password:password_input, salt:user.salt}, (err, pass, salt, hash)=>{
                        if(hash === user.password){
                              console.log('LocalStrategy', user);
                              done(null, user);      
                        } else{  // 비밀번호 불일치
                              done(null, false);
                        }
                  });
            });
      }
));

app.get('/rapport/login', (req, res)=>{
      res.render('login');
});

app.post('/rapport/login',
      passport.authenticate(
            'local',
            {
                  successRedirect: '/rapport/home',  // 로그인 성공 시
                  failureRedirect: '/rapport/login',
                  failureFlash: false  // 로그인에 실패했다는 메시지를 띄우는 기능(추후 추가)
            }
      )
);

app.get('/rapport/register', (req, res)=>{
      res.render('register');
});

app.post('/rapport/register', (req, res)=>{
      hasher({password:req.body.password}, (err, pass, salt, hash)=>{
            let user_new = {
                  auth_id: 'local:'+req.body.username,
                  username: req.body.username,
                  password: hash,
                  salt: salt,
                  displayName: req.body.displayName
            };

            let sql = 'INSERT INTO users SET ?';
            conn.query(sql, user_new, (err, results)=>{
                  if(err){
                        console.log(err);
                        res.status(500);
                  } else{
                        res.send(`
                              ${user_new.displayName}님, 환영합니다! 회원가입이 완료되었습니다.
                              <a href="/rapport/login">로그인</a>
                              `
                        );
                  }
            })
      });
});

app.get('/rapport/logout', (req, res)=>{
      req.logout();  // passport 내장함수 logout(): session의 로그인 정보 제거.
      req.session.save(()=>{
            res.redirect('/rapport/login');
      });
});

app.get('/rapport/home', (req, res)=>{
      if(req.user && req.user.displayName){
            res.render('home', {req:req});
      } else{
            res.redirect('/rapport/login');
      }
});

app.post('/rapport/result', (req, res)=>{
      let place_input = req.body.place,
          price_input = req.body.price,
          field_input = req.body.field;
      let sql = 'SELECT name, phoneNumber, page, certification, description FROM centers WHERE (place=? AND price=? AND field=?)';
      conn.query(sql, [place_input, price_input, field_input], (err, results)=>{
            if(err){
                  console.log(err);
                  res.status(500).send('Internal Server Error');
            } else{
                  res.render('result', {results:results});
            }
      })
});

app.get('/rapport/add', (req, res)=>{
      res.render('add');
});

app.post('/rapport/add', (req, res)=>{
      let id_input = req.body.id,
          name_input = req.body.name,
          phoneNumber_input = req.body.phoneNumber,
          page_input = req.body.page,
          certification_input=req.body.certification,
          description_input=req.body.description,
          place_input = req.body.place,
          price_input=req.body.price,
          field_input=req.body.field;
      
      let sql = 'INSERT INTO centers (id, name, phoneNumber, page, certification, description, place, price, field) VALUE (?, ?, ?, ?, ?, ?, ?, ?, ?)';
      conn.query(sql, [id_input, name_input, phoneNumber_input, page_input, certification_input, description_input, place_input, price_input, field_input], (err, __)=>{
            if(err){
                  console.log(err);
                  res.status(500).send('Internal Server Error');
            } else{
                  res.send(`
                        기관 등록이 완료되었습니다.
                        <a href="/rapport/add">추가 등록하기</a>
                  `)
            }
      });
});

app.listen(3000, ()=>{
      console.log('3000번 포트가 연결되었습니다.');
});