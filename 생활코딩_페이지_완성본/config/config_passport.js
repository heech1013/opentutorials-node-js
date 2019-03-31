module.exports = (exp)=>{
    const passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , FacebookStrategy = require('passport-facebook').Strategy
    , bkfd2Password = require('pbkdf2-password')
    , conn = require('./config_mysql')();

    const hasher = bkfd2Password();

    exp.use(passport.initialize());
    exp.use(passport.session());

    passport.serializeUser((user, done)=>{  // user: 각 strategy들의 로그인 성공 시 done으로부터 전달
        done(null, user.auth_id);  // 사용자를 구분할 수 있는 식별자를 전달. 어디로?
    });
    passport.deserializeUser((id, done)=>{  // id: serializeUser의 done으로부터 전달
        let sql = 'SELECT * FROM users WHERE auth_id = ?'
        conn.query(sql, [id], (err, results)=>{
            if(err){
                done('There is no user');
            } else{
                done(null, results[0]);
            }
        });
    });

    passport.use(new LocalStrategy(
        (username, password, done)=>{
            let username_input = username
            , password_input = password;

            let sql = 'SELECT * FROM users WHERE auth_id = ?';
            conn.query(sql, ['local:'+ username_input], (err, results)=>{  // local: 이 여기서 생성이 되는 것인지? 있는 것을 확인하는 과정인지?
                if(err){
                    return done('There is no user.');
                }
                let user = results[0];
                return hasher({password:password_input, salt:user.salt}, (err, pass, salt, hash)=>{
                    if(hash === user.password){
                        done(null, user);
                    } else{
                        done(null, false);
                    }
                })
            });
        } 
    ));

    passport.use(new FacebookStrategy(
        {
            clientID: '205410380313515',  // facebook API 개발자 정보
            clientSecret: '87472082bc5a17c9f976f5ee10a6bf1f',
            callbackURL: "/auth/facebook/callback",
            profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName']
        },
        (accessToken, refreshToken, profile, done)=>{
            let auth_id = 'facebook:'+ profile.id;  // profile: facebook을 통해 인증된 사용자 정보

            let sql = 'SELECT * FROM users WHERE auth_id = ?';
            conn.query(sql, [auth_id], (err, results)=>{
                if(results.length>0){
                    done(null, results[0]);
                } else{
                    let new_user = {
                        'auth_id': auth_id,
                        'displayName': profile.displayName
                    };

                    let sql = 'INSERT INTO users SET ?';
                    conn.query(sql, new_user, (err, results)=>{
                        if(err){
                            console.log(err);
                            done('ERROR');
                        } else{
                            done(null, new_user);
                        }
                    });
                }
            });
        }
    ));

    return passport;
};