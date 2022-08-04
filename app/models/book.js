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
        comments:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        },
        likes:[likeSchema]

    },
    {
		timestamps: true,
	}
)
module.exports = mongoose.model('Book', bookSchema)