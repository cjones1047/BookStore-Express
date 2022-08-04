const mongoose = require('mongoose')

const likeSchema = new mongoose.Schema(
    {
        owner:{
            type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
        },
        book: {
            type: mongoose.Schema.Types.ObjectId,
			ref: 'Book',
			required: true,
        }
    }
)

module.exports = mongoose.model('Like', likeSchema)