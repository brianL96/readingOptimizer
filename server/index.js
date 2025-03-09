const express = require("express");
require('dotenv').config();
const app = express();
const cors = require("cors");
const corsOptions = {
    origin: ["http://localhost:3000"],
};

const PORT = (process.env.PORT || 8080);
const BookInfo = require('./BookInfo');
const retreivalFunctions = require('./retrievalFunctions');
const bookListRouter = require('./bookDataRoutes').router;
const updateFunctions = require('./updateFunctions');

app.use(cors(corsOptions));

app.use(express.json());

app.use(bookListRouter);

retreivalFunctions.start();

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
