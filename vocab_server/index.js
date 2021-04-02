var bodyParser = require('body-parser')
const express = require('express');
const app = express();
const port = 3000;

const BASEURL = "https://od-api.oxforddictionaries.com/api/v2";

// Instead of Mockdata access the MongoDB Collection and create a JSON object based on that. Use that Object as response to '/api'
// const mockdata = {
//     words: [
//         {word: "Kite", meaning: "a toy made of a light frame covered with paper, cloth, etc., that you fly in the air at the end of one or more long strings"},
//         {word: "bite", meaning: "to wound somebody by making a small hole or mark in their skin"},
//         {word: "fight", meaning: "to try hard to stop, deal with, or oppose something bad"},
//         {word: "might", meaning: "used when showing that something is or was possible"}
//     ]
// };

const mockdata = {
    words: {
        kite: "a toy made of a light frame covered with paper, cloth, etc., that you fly in the air at the end of one or more long strings",
        bite: "to wound somebody by making a small hole or mark in their skin",
        fight: "to try hard to stop, deal with, or oppose something bad",
        might: "used when showing that something is or was possible"
    }
};

app.use(bodyParser.json());

app.get('/api', (req, res) => {
    res.status(200);
    res.json(mockdata);
    res.end();
});

app.post('/api/search-term', (req, res) => {
    // Test the search term
    const searchTerm = req.body.word.toLowerCase();
    console.log(searchTerm);
    const meaning = mockdata.words[searchTerm];
    console.log(meaning);
    const respObj = {[searchTerm]: meaning};
    console.log(respObj);
    // res.sendStatus(200);
    res.json(respObj);
    res.end();
});

app.listen(port, () => {
    console.log("Listening on port " + port);
});