require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.EXPRESS_PORT || 2001;

/**
 * Security related: 
 * https://helmetjs.github.io/ => Helmet applies many security policies to every request
 * https://www.npmjs.com/package/express-mongo-sanitize => expressMongoSanitize sanitizes all the req.body, req.params, req.query, req.headers from any kind of mongo-special characters
 */
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');

app.use(cors({
    origin: "*",
    // For dev purposes, origin will be set to *
    // origin: "http://maxpace.ns0.it:8425",
    optionsSuccessStatus: 200
}));

app.use(helmet());

const db = require('./mongodb/DBManager');

const userRoutes = require('./routes/user');
const projectRoutes = require('./routes/project');

// All I need for my cleanup code is to be required - it adds some methods to the NodeJS process object
const cleanup = require('./utils/cleanup');
const { errorLogging } = require('./middleware/logging');
const formatDateNow = require('./utils/formatDateNow');

// The following two lines are basically the new version of "body-parser" - they allow me to parse the req.body object as a JSON object in the controller methods.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Security sanitizer: req.body will not contain any "$" or similar special mongodb characters - when this happens, a log is created
app.use(mongoSanitize({
    onSanitize: ({ req, key }) => {
        errorLogging(`The request ${key} was sanitized at ${formatDateNow()}`, `${req}`);
    },
}));

app.use('/user', userRoutes);
app.use('/project', projectRoutes);

app.get('*', (req, res) => {

    console.log("*********");
    console.log(req.method);
    console.log(req.route.path);
    console.log("*********");

    res.send("API point not found, try again");
})

app.listen(port, () => {
    console.log(`APIs listening on port ${port}`)
})