const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        author: {
            type: String,
            required: true
        },
        image: String,
        publisher: {
            type: String,
            required: true
        },
        description: String,
        comments:[commentSchema],
        likes: [likeSchema],
        
        owner:{
            type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
        }

    },
    {
		timestamps: true,
	}
)
module.exports = mongoose.model('Book', bookSchema)