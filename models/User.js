const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken:String,
    resetPasswordExpires:Date,
});

userSchema.pre('save', async function(next){
    if (this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});


userSchema.methods.comparePassword = async function(candidatePassword){
    return bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model('User', userSchema);