require('dotenv').config();

const express = require('express');
const app = express();

const port = process.env.EXPRESS_PORT || 2001;

const cors = require('cors');
app.use(cors({
    origin: "*"
}));

// The following is basically body-parser - it allows me to parse the req.body object as a JSON object in the controller methods.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db = require('./mongodb/DBManager');

const userRoutes = require('./routes/user');
const projectRoutes = require('./routes/project');

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.use('/user', userRoutes);
app.use('/project', projectRoutes);

app.get('/*', (req, res) => {
    console.log(req.statusMessage);
    console.log(req.url);
    console.log(req.ip);
    res.send("API point not found, try again");
})

app.listen(port, () => {
    console.log(`APIs listening on port ${port}`)
})