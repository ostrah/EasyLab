const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});