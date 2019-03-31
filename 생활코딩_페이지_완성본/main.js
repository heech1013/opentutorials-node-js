const exp = require('./config/config_express')(),
passport = require('./config/config_passport')(exp),  // exp 상속

auth = require('./router/router_auth')(passport);  // exp, passport 상속
exp.use('/auth', auth);

const route_home = require('./router/router_home')();
exp.use('/home', route_home);

exp.listen(3000, ()=>{
    console.log('3000번 서버가 연결되었습니다.');
});