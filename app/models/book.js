const mongoose = require('mongoose')
const commentSchema = require('./comment')
const likeSchema = require('./like')
const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        authors: {
            type: Array,
            required: true
        },
        image: String,
        isbn: String,
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