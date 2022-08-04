const mongoose = require('mongoose')


const commentSchema = new mongoose.Schema({
    
    note: {
        type: String,
        required: true
    
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
}
}, {
    timestamps: true
})



module.exports = commentSchema