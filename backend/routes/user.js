const express = require('express');
const cors = require('cors');
const connection = require('../connection');
const router = express.Router();

const jwt = require('jsonwebtoken');
require('dotenv').config();

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

router.post('/login',(req,res)=>{
    const user = req.body;
    query = 'select * from user where email = ?';
    connection.query(query,[user.email],(err,result)=>{
        if(err){
            return res.status(500).json({ error: 'Database query failed', details: err });
        }else{
            if(result.length > 0 || (result[0].password == user.password)){
                if(result[0].status === 'active'){
                    const responce = {email: result[0].email, role: result[0].role};
                    const accessToken = jwt.sign(responce, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
                    res.status(200).json({
                        message: 'Login successful',
                        accessToken: accessToken,
                        role: result[0].role
                    });
                }else{
                    return res.status(403).json({ error: 'User is inactive' });
                }
            }else{
                return res.status(401).json({ error: 'Invalid email or password' });
            }
        }
    });
});

module.exports = router; 