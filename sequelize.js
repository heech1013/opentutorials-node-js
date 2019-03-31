const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    'o2',  // 데이터베이스 이름
    'root',  // 유저 명
    '111111', // 비밀번호
    {
        'host': 'localhost',  // 데이터베이스 호스트
        'dialect': 'mysql'  // 사용할 데이터베이스 종류  
    }
);

sequelize.define('Model1', {  // 모델 정의(CREATE TABLE)
    id: {
        type: Sequelize.INTEGER,
        primarykey: true,
        autoIncrement: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: true
    },
    body: {
        type: Sequelize.TEXT,
        allowNull: true
    }
}, {}); // 세번째 인자로 config 옵션 삽입 가능

Model1.sequelize.sync().then( ()=>{  // ***sync(): 이미 만들어진 table에 model을 매핑하며, table이 없는 경우 정의한 model을 바탕으로 table을 생성
    console.log('DB Sync: Completed');
}).catch(err=>{
    console.log('DB Sync: Failed');
    console.log(err)
});

// Sequelize는 기본적으로 CRUD 오퍼레이션을 제공한다. 모든 오퍼레이션은 bluebird를 기반으로 한 Promise를 리턴한다(then/catch 사용 가능)
// models.Model1.create인지 Model1.create인지?
Model1.create({  // 레코드 생성
    title: 'test input in title',
    body: 'test input in body'
}).then(function(results){
    res.json(results);
}).catch(function(err){
    // error handling
});

Model1.findAll(
    {
        //where: {id: 1}  // SELECT * FROM Model1 WHERE id=1
    }
).then(function(results){ // 모든 데이터 조회
    res.json(results);
}).catch(function(err){
    // error handling
});

Model1.findOne({  // 특정 데이터 조회(?)
    where: { title: 'test input in title' }
    // attributes: ['title', 'body']  // 특정 column만 select할 때
})
    .then((memo)=>{  // memo?
        console.log(`Model1: ${memo.dataValues}`)  // 얻어온 레코드의 실제 값은 dataValues라는 프로퍼티 안에 있다.
    });

Model1.update( // 수정
    {
        title: 'Updated Model1'
    },
    {
        where: { id: 1 }
    }
).then(function(results){
    res.json(result[1][0]);
}).catch(function(err){
    // error handling
});
    

Model1.destroy({  // 삭제
    where: { title: 'Updated Model1' }
})
.then((result)=>{
    res.json({});
})
.catch((err)=>{
    // error handling
});

sequelize.query('SELECT * FROM Model1 limit 1').then((result)=>{  // Raw Query: 복잡한 쿼리나 ORM 형식으로 변환이 힘들다고 판단되는 경우
    console.log(result);
});

// 데이터 종속: hasMany, hasOne, belongsTo, belongsToMany
// Hooks: 어떤 작업을 수행하기 전, 후로 항상 수행해야 하는 일이 있을 때. trigger와 같은 개념
