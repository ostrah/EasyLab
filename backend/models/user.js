const userSchema = new mongoose.Schema({
    login: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher'], default: 'student' },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
});

module.exports = mongoose.model('User', userSchema);