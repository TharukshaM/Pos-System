const express = require('express');
const cors = require('cors');
const connection = require('../connection');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendResetEmail } = require('../utils/mailer');
require('dotenv').config();


router.post('/signup',(req, res) => {
    let user = req.body;
    query ='SELECT email,password,role,status from user where email = ?';
    connection.query(query,[user.email],async (err,result)=>{
        if(err){
        return res.status(500).json({ error: 'Database query failed', details: err });
        }else{
            if(result.length > 0){
                return res.status(400).json({ error: 'Email already exists' });
            }else{
                query = 'INSERT INTO user (email, password, name, phone, role, status) VALUES (?, ?, ?, ? , ?, ?)';
                const hashedPassword = await bcrypt.hash(user.password, 12);
                connection.query(query,[user.email,hashedPassword,user.name,user.phone,user.role,user.status],(err,result)=>{
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
    connection.query(query,[user.email], async (err,result)=>{
        if(err){
            return res.status(500).json({ error: 'Database query failed', details: err });
        }else{
            const isMatch = await bcrypt.compare(user.password, result[0].password);
            if(result.length > 0 || isMatch){
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

//Forgot password  Route
router.post('/forget-password', async (req,res)=>{
    const {email} = req.body;
    try{
        const user = await connection.promise().query('SELECT * FROM user WHERE email = ?',[email]);
        if(user.length === 0){
            return res.status(404).json({error: 'User not found'});
        }
        const userId = user[0].id;
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiry = new Date(Date.now() + 15 * 60 * 1000);

        await connection.promise().query(
            'UPDATE user SET reset_token_hash = ?, reset_token_expires = ? WHERE id = ?',
            [hashedToken, expiry, userId]
        );

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;
        await sendResetEmail(email, resetLink);

        res.json({ message: 'If that email exists, a reset link was sent.' });
        
    }catch(error){
        console.error(error);
        res.status(500).json({ error: error.message });
    }
})

//Reset password Route
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    try {
        const [rows] = await connection.promise().query(
            'SELECT id FROM user WHERE reset_token_hash = ? AND reset_token_expires > NOW()',
            [hashedToken]
        );

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        const userId = rows[0].id;
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await connection.promise().query(
            'UPDATE user SET password = ?, reset_token_hash = NULL, reset_token_expires = NULL WHERE id = ?',
            [hashedPassword, userId]
        );

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router; 