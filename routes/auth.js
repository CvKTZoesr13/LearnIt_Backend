const express = require('express')

const router = express.Router()

const User = require('../models/User.js')

const argon2 = require('argon2')

const jwt = require('jsonwebtoken')
const verifyToken = require('../middleware/auth.js')

// @route GET api/auth/
// @desc check if user is logged in 
// @access Public
router.get('/', verifyToken, async(req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password')
        if(!user) return res.status(400).json({success: false, message: 'User not found'})

        res.json({success: true, user: user})
    } catch (error) {
        console.log(error.message)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }
})










// @route POST api/auth/register
// @desc register user
// @access Public
router.post('/register', async(req, res) => {
    const {username, password} = req.body
    // simple validation
    if(!username || !password) {
        return res.status(400).json({success: false, message: 'Missing username and/or password'})
    }

    try {
        // check for existing user
        const user = await User.findOne({username})
        if(user) {
            return res.status(400).json({success: false, message: 'Username already exist!'})
        }


        const hashPassword = await argon2.hash(password)
        const newUser = new User({username, password: hashPassword})
        await newUser.save()


        // token 
        const accessToken = jwt.sign({userId: newUser._id }, process.env.ACCESS_TOKEN_SECRET)

        if(accessToken) {
            return res.json({success: true, message: 'User has been created successfully!', accessToken})
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }
})

router.post('/login', async(req, res) => {
    const {username, password} = req.body
    // simple validation
    if(!username || !password) {
        return res.status(400).json({success: false, message: 'Incorrect username and/or password'})
    }
    try {
        // check for existing user
        const user = await User.findOne({username})
        if(!user) {
            return res.status(400).json({success: false, message: 'Incorrect username and/or password'})
        }

        const passwordValid = await argon2.verify(user.password, password)
        if(!passwordValid) {
            return res.status(400).json({success: false, message: 'Incorrect username and/or password'})
        }

        const accessToken = jwt.sign({userId: user._id }, process.env.ACCESS_TOKEN_SECRET)
        return res.json({success: true, message: 'User has been logged in the website successfully!', accessToken})

    } catch (error) {
        console.log(error.message)
        res.status(500).json({success: false, message: 'Internal server error!'})
    }
})
module.exports = router