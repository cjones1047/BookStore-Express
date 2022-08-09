const express = require('express')
const passport = require('passport')

// pull in Mongoose model for books
const Book = require('../models/book')

const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()

// ROUTES 

// Get all comments
router.get('/comments/:bookId', (req, res, next) => {

    // get id of book from parameters
    const bookId = req.params.bookId

	Book.findById(bookId)
		.then((book) => {
			// `book.comments` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return book.comments.map((comment) => comment.toObject())
		})
		// respond with status 200 and JSON of the books
		.then((comments) => res.status(200).json({ comments: comments }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// Create 
// POST /comments/<book_id>
router.post('/comments/:bookId', (req, res, next) => {
    // get comment from req.body
    const comment = req.body.note
    // get book's id from req.params.bookId
    const bookId = req.params.bookId
    // find the book
    Book.findById(bookId)
        .then(handle404)
        .then(book => {
            // console.log('this is the book BEFORE commenting: ', book)
            // console.log('this is the comment: ', comment)

            // push the comment into the book's comments array
            book.comments.push(req.body)

            // console.log('this is the book AFTER commenting: ', book)

            return book.save()

        })
        // send the newly updated book as json
        .then(book => res.status(201).json({ book: book }))
        .catch(next)
})

// UPDATE 
// PATCH /comments/<book_id>/<comment_id>
router.patch('/comments/:bookId/:commentId', requireToken, removeBlanks, (req, res, next) => {

    const bookId = req.params.bookId
    const commentId = req.params.commentId

    // console.log('Heres the new note: ', req.body.note)

    // find our book
    Book.findById(bookId)
        .then(handle404)
        .then(book => {
            // single out the comment 
            const theComment = book.comments.id(commentId)
            // make sure the user sending the request is the owner
            requireOwnership(req, book)
            // update the comment with a subdocument method
            theComment.set(req.body)
            // return the saved book
            // console.log('Heres the book AFTER updating note: ', book)
            return book.save()

            
            
        })
        .then(() => res.sendStatus(204))
        .catch(next)
})

// DELETE 
// DELETE /comments/<book_id>/<comment_id>
router.delete('/comments/:bookId/:commentId', requireToken, (req, res, next) => {
    // get the comment and the book ids saved to variables
    const bookId = req.params.bookId
    const commentId = req.params.commentId
    // find the book
    Book.findById(bookId)

        .then(handle404)

        .then(book => {

            const theComment = book.comments.id(commentId)
            // user deleting this comment is the book's owner
            requireOwnership(req, book)
            // call remove on the subdoc
            theComment.remove()
            // return the saved book
            return book.save()
        })

        .then(() => res.sendStatus(204))

        .catch(next)
})


module.exports = router