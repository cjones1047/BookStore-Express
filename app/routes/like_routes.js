const express = require('express')
const passport = require('passport')
const Book = require('../models/book')
const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()


// Create 
// POST /likes/<book_id>
router.post('/likes/:bookId', (req, res, next) => {
  
    const like = req.body.like
    
    const bookId = req.params.bookId
   
    Book.findById(bookId)
        .then(handle404)
        .then(book => {
            // console.log('this is the book', book)
            // console.log('this is the like', like)
            book.likes.push(like)
            
            return book.save()

        })
        
        .then(book => res.status(201).json({ book: book }))
        .catch(next)
})

// DELETE 
// DELETE /likes/<book_id>/<like_id>
router.delete('/likes/:bookId/:likeId', requireToken, (req, res, next) => {
    // get the like and the book ids saved to variables
    const bookId = req.params.bookId
    const likeId = req.params.likeId
    // find the book
    Book.findById(bookId)

        .then(handle404)

        .then(book => {

            const theLike = book.likes.id(likeId)
            // user deleting this like is the book's owner
            requireOwnership(req, book)
            // call remove on the subdoc
            theLike.remove()
            // return the saved book
            return book.save()
        })

        .then(() => res.sendStatus(204))

        .catch(next)
})


module.exports = router