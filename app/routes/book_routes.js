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

router.get('/books', (req, res, next) => {
	Book.find()
		.then((books) => {
			// `books` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return books.map((book) => book.toObject())
		})
		// respond with status 200 and JSON of the books
		.then((books) => res.status(200).json({ books: books }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

router.get('/books/:id', requireToken, (req, res, next) => {

	Book.findById(req.params.id)
		.then(handle404)
		.then((book) => res.status(200).json({ book: book.toObject() }))
		.catch(next)
})
router.post('/book', requireToken, (req, res, next) => {

	req.body.book.owner = req.user.id
	Book.create(req.body.book)
		.then((book) => {
			res.status(201).json({ book: book.toObject() })
		})
		.catch(next)
})

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
module.exports = router