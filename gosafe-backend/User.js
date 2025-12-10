// User.js (CORRECTED CODE)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: { // Store only the hash, never the raw password
        type: String,
        required: true
    }
});

// Pre-save hook: Hash the password before saving a new user
// CORRECTED: Removed 'next' callback and the call to next() because the function is async.
userSchema.pre('save', async function() { 
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    // No need to call next()
});

// Method to compare passwords
userSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;