// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')
// const fetch = require("node-fetch")
// pull in Mongoose model for examples
const fetch = require('node-fetch')
const Book = require('../models/book')
// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()
let api = "https://www.googleapis.com/books/v1/volumes?q="

// router.get("/book/:name", (req, res, next) => {
//     const book = req.params.name
//     const requestURL = api += book
//     fetch(requestURL)
//         .then((responseObjs) => {
//             return responseObjs.json()
//         })
//         .then((responseObjs) => res.status(200).json({responseObjs: responseObjs}))
//         .catch(next)
// })
// router.post('/book/:id', requireToken, (req, res, next) => {
//     req.body.book.owner = req.user.id
//     Book.create(req.body.book)
//         .then((book) => {
//             res.status(201).json({book:book})
//         })
//     .catch(next)

// })
//show all book
router.get('/books', requireToken, (req, res, next) => {

	Book.find()
		.then(handle404)
		.then((book) => res.status(200).json({ book: book.toObject() }))
		.catch(next)
})
//creat book
router.post('/book', requireToken, (req, res, next) => {

	req.body.book.owner = req.user.id
	Book.create(req.body.book)
		.then((book) => {
			res.status(201).json({ book: book.toObject() })
		})
		.catch(next)
})
//find book
router.get('/book/:id', requireToken, (req, res, next) => {
	Example.findById(req.params.id)
		.then(handle404)
	
		.then((book) => res.status(200).json({ book: book.toObject() }))

		.catch(next)
})
//delete book
router.delete('/book/:id', requireToken, (req, res, next) => {
	Book.findById(req.params.id)
		.then(handle404)
		.then((book) => {
			requireOwnership(req, book)
			book.deleteOne()
		})
		.then(() => res.sendStatus(204))
		.catch(next)
})
router.patch('/book/:id', requireToken, removeBlanks, (req, res, next) => {
	// if the client attempts to change the `owner` property by including a new
	// owner, prevent that by deleting that key/value pair
	delete req.body.book.owner

	Book.findById(req.params.id)
		.then(handle404)
		.then((book) => {
			// pass the `req` object and the Mongoose record to `requireOwnership`
			// it will throw an error if the current user isn't the owner
			requireOwnership(req, book)

			// pass the result of Mongoose's `.update` to the next `.then`
			return book.updateOne(req.body.book)
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})
module.exports = router