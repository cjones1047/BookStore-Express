const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema(
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