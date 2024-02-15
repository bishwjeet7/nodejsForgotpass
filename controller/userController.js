const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});

exports.registerUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: "User already exists" });
        }

        const newuser = new User({ email, password });
        await newuser.save();
        res.status(201).json({ msg: "User registered successfully" });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user || !await user.comparePassword(password)) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    }catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        let user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ msg: "User not found" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        user.resetPasswordToken = token;
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour

        await user.save();


        const resetURl = `http://localhost:3000/resetpassword/${token}`;

        // sending mail
        const mailOption = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset',
            html: `<p>Your requested a passowrd reset. Click <a href="${resetURl} ">here</a> to set new password.</p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ msg: "Server error" });
                console.log(error);
            } 
            res.status(200).json({ msg: "Email sent" });
        });
    }catch(error){
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
};


exports.resetPassword = async (req, res) => {
    const {token} = req.params;
    const {password} = req.body;
    try{
        const user = await User.findOne({
            resetPasswordToken:token,
            resetPasswordExpire: { $gt: Date.now() }
        });
        if (!user){
            return res.status(400).json({ msg: "Password reset taoken is invalid or has expired." });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.status(200).json({ msg: "Password reset successfully" });
    }catch(error){
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
};