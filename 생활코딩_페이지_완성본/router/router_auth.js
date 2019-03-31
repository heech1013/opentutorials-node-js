module.exports = (passport)=>{  // config_express 상속

    const route_auth = require('express').Router();

    const conn = require('../config/config_mysql')();

    const bkfd2Password = require('pbkdf2-password');
    const hasher = bkfd2Password();

    route_auth.get('/login', (req, res)=>{
        let sql = 'SELECT id, title FROM topic';
        conn.query(sql, (err, rowS)=>{
            res.render('login', {rowS:rowS});
        });
    });

    route_auth.post('/login',  // local 로그인
        passport.authenticate(
            'local',
            {
                successRedirect: '/home',
                failureRedirect: '/auth/login',
                failureFlash: false
            }
        )
    );

    route_auth.get('/facebook',  // facebook 간편 로그인
        passport.authenticate(
            'facebook',
            //{scope: 'email'}
        )
    );
    route_auth.get('/facebook/callback',
        passport.authenticate(
            'facebook',
            {
                successRedirect: '/home',
                failureRedirect: '/auth/login'
            }
        )    
    );

    route_auth.get('/register', (req, res)=>{  // 회원가입
        let sql = 'SELECT id, title FROM topic';
        conn.query(sql, (err, rowS)=>{
            res.render('register', {rowS:rowS});
        });
    });
    
    route_auth.post('/register', (req, res)=>{
        hasher({password: req.body.password}, (err, pass, salt, has)=>{
            let user_new = {
                auth_id : 'local:' + req.body.username,
                username: req.body.username,
                password: hasher,
                salt: salt,
                displayName: req.body.displayName
            };

            let sql = 'INSERT INTO users SET ?';
            conn.query(sql, user_new, (err, __)=>{
                if(err){
                    console.log(err);
                    res.status(500);
                } else{
                    req.login(user_new, (err)=>{
                        req.session.save(()=>{
                            res.redirect('/home');
                        });
                    });
                }
            });
        });
    });

    route_auth.get('/logout', (req, res)=>{
        req.logout();
        req.session.save(()=>{
            res.redirect('/home');
        });
    });
    
    return route_auth;
};