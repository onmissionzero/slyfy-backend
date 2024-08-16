require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const logger = require('./middlewares/logger');
const lyrics_route = require("./routes/lyrics");
const oauth_route = require("./routes/oauth");
const user_route = require("./routes/user");

const app = express();  

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    methods: ['GET'],
    allowedHeaders: ['Content-Type'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(logger);

app.use(lyrics_route);
app.use(oauth_route);
app.use(user_route);

app.get('/', (req, res) => {
    res.json({message: "Backend is working."});
})

const port = process.env.PORT || 3000;

app.listen(port,'0.0.0.0', () => {
    console.log(`listening on port ${process.env.PORT}`);
});