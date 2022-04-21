require('dotenv').config();

const express = require('express');
const app = express();

const port = process.env.EXPRESS_PORT || 2001;

const cors = require('cors');

const db = require('./mongodb/DBManager');

const userRoutes = require('./routes/user');
const projectRoutes = require('./routes/project');
const cleanup = require('./utils/cleanup');

app.use(cors({
    origin: true,
    optionsSuccessStatus: 200
}));
// The following is basically body-parser - it allows me to parse the req.body object as a JSON object in the controller methods.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
})

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