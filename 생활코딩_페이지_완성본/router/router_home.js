module.exports = ()=>{
    
    const conn = require('../config/config_mysql')();

    const route_home = require('express').Router();

    route_home.get('/add', (req, res)=>{
        let sql = 'SELECT id, title FROM topic';
        conn.query(sql, (err, rowS)=>{
            if(err){
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else{
                res.render('add', {rowS:rowS, user:req.user});
            }
        });
    });

    route_home.post('/add', (req, res)=>{
        let title_input = req.body.title_input,
        description_input = req.body.description_input,
        author_input = req.body.author_input;

        let sql = 'INSERT INTO topic (title, description, author) VALUE (?, ?, ?)';
        conn.query(sql, [title_input, description_input, author_input], (err, row)=>{
            if(err){
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else{
                res.redirect('/home/'+row.insertId);  // row 참고
            }
        });
    });

    route_home.get('/:num/edit', (req, res)=>{
        let num = req.params.num;

        let sql = 'SELECT id, title FROM topic';  // 반복 제거할 수 없을까?
        conn.query(sql, (err, rowS)=>{  // 반복
            if(num){
                let sql = 'SELECT * FROM topic WHERE id = ?';
                conn.query(sql, [num], (err, row_input)=>{
                    if(err){
                        console.log(err);
                        res.status(500).send('Internal Server Error');
                    } else{
                        res.render('edit', {rowS:rowS, row_input:row_input[0], user:req.user});
                    }
                });
            } else{
                console.log(err);
                res.status(500).send('Internal Server Error');
            }
        })
    });

    route_home.post('/:num/edit', (req, res)=>{
        let num = req.params.num;
        
        let title_edit = req.body.title_edit,
        description_edit = req.body.description_edit,
        author_edit = req.body.author_edit;

        let sql = 'UPDATE topic SET title=?, description=?, author=? WHERE id=?';
        conn.query(sql, [title_edit, description_edit, author_edit, num], (err, row_edit)=>{
            if(err){
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else{
                res.redirect('/home/'+ num);
            }
        });
    });

    route_home.get('/:num/delete', (req, res)=>{
        let num = req.params.num;

        let sql = 'SELECT id, title FROM topic';
        conn.query(sql, (err, rowS)=>{
            let sql = 'SELECT * FROM topic WHERE id = ?';
            conn.query(sql, [num], (err, row_delete)=>{
                if(err){
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else{
                    if(row_delete.length === 0){
                        console.log('Can Not Delete: There is no data');
                        res.status(500).send('Internal Server Error');
                    } else{
                        res.render('delete', {rowS:rowS, row_delete:row_delete[0], user:req.user});
                    }
                }
            });
        });
    });

    route_home.post('/:num/delete', (req, res)=>{
        let num = req.params.num;

        let sql = 'DELETE FROM topic WHERE id = ?';
        conn.query(sql, [num], (err, row_delete)=>{
            res.redirect('/home');
        });
    });
 
    route_home.get(['/', '/:num'], (req, res)=>{
        let num = req.params.num;
        
        let sql = 'SELECT id, title FROM topic';
        conn.query(sql, (err, rowS)=>{
            if(num){  // num이 있을 시
                let sql = 'SELECT * FROM topic WHERE id = ?';
                conn.query(sql, [num], (err, row_in)=>{
                    if(err){
                        console.log(err);
                        res.status(500).send('Internal Server Error');
                    } else{
                        res.render('view', {rowS:rowS, row_in:row_in[0], user:req.user});
                    }
                });
            } else{  // num이 없을 시
                res.render('view', {rowS:rowS, user:req.user});
            }
        });
    });

    return route_home;
};