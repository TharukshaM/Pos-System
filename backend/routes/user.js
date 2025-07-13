const express = require('express');
const cors = require('cors');
const connection = require('../connection');
const router = express.Router();

router.get('/', cors(), async (req, res) => {
    const [rows] = await connection.query('SELECT * FROM user');
    res.json(rows);
});

router.post('/signup',(req, res) => {
    let user = req.body;
    query ='SELECT email,password,role,status from user where email = ?';
    connection.query(query,[user.email],(err,result)=>{
        if(err){
        return res.status(500).json({ error: 'Database query failed', details: err });
        }else{
            if(result.length > 0){
                return res.status(400).json({ error: 'Email already exists' });
            }else{
                query = 'INSERT INTO user (email, password, name, phone, role, status) VALUES (?, ?, ?, ? , ?, ?)';
                connection.query(query,[user.email,user.password,user.name,user.phone,user.role,user.status],(err,result)=>{
                    if(err){
                        return res.status(500).json({ error: 'Database query failed', details: err });
                    }else{
                        return res.status(201).json({ message: 'User created successfully' });
                    }
                });
            }
        }
    });
    
});

module.exports = router; 