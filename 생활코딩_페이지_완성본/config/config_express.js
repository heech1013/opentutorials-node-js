module.exports = ()=>{

    const express = require('express'),
    bodyParser = require('body-parser');
    session = require('express-session'),
    MySQLStore = require('express-mysql-session')(session);

    const exp = express();

    exp.use(bodyParser.urlencoded({ extended: false }));

    exp.set('views', './templete');  // main.js 파일 위치 기준
    exp.set('view engine', 'jade');

    exp.use(session({  //MySQL 세션 설정
        secret: 'rprp5959@@',
        resave: false,
        saveUninitialized: true,
        store: new MySQLStore({
            host: 'localhost',
            port: '3306',  // MySQL 기본 포트 번호
            user: 'root',
            password: '111111',
            database: 'o2'
        })
    }));

    return exp;
};
