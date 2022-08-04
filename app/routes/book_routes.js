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

router.get("/book/:name", (req, res, next) => {
    const book = req.params.name
    const requestURL = api += book
    fetch(requestURL)
        .then((responseObjs) => {
            return responseObjs.json()
        })
        .then((responseObjs) => res.status(200).json({responseObjs: responseObjs}))
        .catch(next)
})
// router.post('/book/:id', requireToken, (req, res, next) => {
//     req.body.book.owner = req.user.id
//     Book.create(req.body.book)
//         .then((book) => {
//             res.status(201).json({book:book})
//         })
//     .catch(next)

// })
router.get('/books/:id', requireToken, (req, res, next) => {
	// req.params.id will be set based on the `:id` in the route
	Book.findById(req.params.id)
		.then(handle404)
		// if `findById` is succesful, respond with 200 and "example" JSON
		.then((book) => res.status(200).json({ book: book.toObject() }))
		// if an error occurs, pass it to the handler
		.catch(next)
})
router.post('/book', requireToken, (req, res, next) => {
	// set owner of new example to be current user
	req.body.book.owner = req.user.id

	Book.create(req.body.book)
		// respond to succesful `create` with status 201 and JSON of new "example"
		.then((book) => {
			res.status(201).json({ book: book.toObject() })
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})

router.delete('/examples/:id', requireToken, (req, res, next) => {
	Book.findById(req.params.id)
		.then(handle404)
		.then((book) => {
			// throw an error if current user doesn't own `example`
			requireOwnership(req, book)
			// delete the example ONLY IF the above didn't throw
			book.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})
module.exports = router