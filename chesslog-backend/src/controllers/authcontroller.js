import pool from "../config/db.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken' 
import dotenv from 'dotenv'

dotenv.config()

const registerController = async (req, res) => {

    if(!req.body.email || !req.body.password){
        return res.status(400).json({'message' : 'blank input'})
    }
    
    const email  = req.body.email;
    const password_hash = await bcrypt.hash(req.body.password, 11);


    try {
        const queryString = 'INSERT INTO users (email, password_hash) VALUES($1, $2) RETURNING id'; 
        const values = [email, password_hash];
        const userData = await pool.query(queryString, values);

        const id = userData.rows[0].id
        const refreshToken = jwt.sign({email: email, id : id}, process.env.REFRESH_TOKEN, {expiresIn : '30d'})
        const accessToken = jwt.sign({email : email, id : id}, process.env.ACCESS_TOKEN, {expiresIn : '15m'})
        const addToken = "UPDATE users SET refreshtoken = $1 WHERE id = $2"
        pool.query(addToken, [refreshToken, id])
        

        res.status(200).json({ 
            message: 'Success', 
            accessToken: accessToken, 
            refreshToken: refreshToken 
        });
    }  catch (error) {
        res.status(500).json({'message' : error.message})
    }
}

const loginController = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if(!req.body.email || !req.body.password){
        return res.status(400).json({'message' : 'blank input'})
    }

    try{
        const queryString = 'SELECT * FROM users WHERE email = $1';
        const user = await pool.query(queryString, [email])


        if (user.rows.length > 0){
            const isMatch = await bcrypt.compare(password, user.rows[0].password_hash)

            if (isMatch) {
                const accessToken = jwt.sign({id : user.rows[0].id, email: email}, process.env.ACCESS_TOKEN, {expiresIn : '15m'})
                const refreshToken = jwt.sign({id : user.rows[0].id, email: email}, process.env.REFRESH_TOKEN, {expiresIn : '30d'})

                const updateString = 'UPDATE users SET refreshtoken = $1 WHERE email = $2';
                await pool.query(updateString, [refreshToken, email]);

                res.status(200).json({ 
                    message: 'Success', 
                    accessToken: accessToken, 
                    refreshToken: refreshToken ,
                    userId : user.rows[0].id
                });
            } else {
                res.status(401).json({'message' : 'Invalid Credential'})
            }
        } else {
            res.status(404).json({"message" : "Invalid Credential"})
        }
    } catch(error) {
        res.status(500).json({'message' : error.message})
    }
}


const refreshController = async (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "No token provided" });

    try {
        const userQuery = 'SELECT * FROM users WHERE refreshtoken = $1'
        const user = await pool.query(userQuery, [refreshToken])

        if(user.rows.length === 0) return res.status(401).json({'message' : 'User non existing'})
        
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, decodedUser) => {
            if (err) return res.status(403).json({'message' : 'Error'})
            const newAccessToken = jwt.sign({id : decodedUser.id , email : decodedUser.email}, process.env.ACCESS_TOKEN, {expiresIn: '15m'});
            res.status(200).json({ accessToken: newAccessToken });
        })
    } catch(error) {
        res.status(500).json({'message' : error.message})
    }
}


export {loginController, registerController, refreshController} ;