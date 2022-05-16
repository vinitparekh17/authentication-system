const app = require('express')()
require('dotenv').config()
require('./config/database').connect()
const userModel = require('./models/userModel')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const auth = require('./middleware/auth')
const cookieParser = require('cookie-parser')

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.send('Hello')
})

app.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body
        if (!(firstName && lastName && email && password)) {
            res.status(404).json({ message: "All fields must be required" })
        }

        const existUser = await userModel.findOne({ email })

        if (existUser) {
            res.status(401).send("This user has already registered!")
        }
        // securing password
        const encrypted = await bcrypt.hash(password, 10)

        const newUser = new userModel({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: encrypted
        })

        newUser.save()
        // generating jwt token

        // token is used to store data with encryption like: email or req id 
        // It should be expire in particular time
        // stored data in token is called payload
        const token = jwt.sign({ user_id: newUser._id, email },
            process.env.SECRET_KEY,
            {
                expiresIn: '2h'
            }
        )
        newUser.token = token
        // updated or not
        res.status(201).json(newUser)

    } catch (e) {
        console.log(e);
    }
})

app.post('/login', async (req, res) => {
    try {
        const { email , password } = req.body
        if (!(email && password)) {
            return res.status(400).send("All fields must be required!")
        }
        const existUser = await userModel.findOne({ email })
        if (existUser && bcrypt.compare(password, existUser.password)) {
            const token = jwt.sign({
                user_id: existUser._id,
                email
            }, process.env.SECRET_KEY,
                {
                    expiresIn: '2h'
                }
            )
            existUser.token = token

            // if you want to use cookie 
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };

            res.status(200).cookie("token", token, options).json({
                success: true,
                token,
                existUser,
            });

    } else {
        res.status(200).send("Incorrect credentials!")
    }

} catch (error) {
    console.log(error);
}
})

app.get('/dashboard', auth, (req, res) => {
    res.send("helllo")
})

module.exports = app
