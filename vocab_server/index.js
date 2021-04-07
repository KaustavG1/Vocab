var bodyParser = require('body-parser');
const express = require('express');
const app = express();
const axios = require('axios');
const mongoose = require('mongoose');

const PORT = 3000;

const BASEURL = "https://od-api.oxforddictionaries.com/api/v2";
const LEMMAS = "/lemmas/en";
const ENTRIES = "/entries/en";
const URL_PARAMS = "?fields=definitions&strictMatch=false"

const DB_STRING = "mongodb+srv://kaustav:kaustav@vocabcluster.pocns.mongodb.net/vocabDB?retryWrites=true&w=majority";

mongoose.connect(DB_STRING, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
        .then(() => console.log('Connected to DB'));

const wordSchema = new mongoose.Schema({}, { strict: false });
const WordModel = mongoose.model('words', wordSchema);        

const options = {
    headers: {
        'app_id': '68f6c140',
        'app_key': '9e6a1922c6d9c6119009b4e1635940d6'
    }
};

app.use(bodyParser.json());

app.get('/api', async (req, res) => {
    try {
        // Find all available words in the Database
        const cachedData = await WordModel.find();
    
        // Send the response back to the front-end
        res.status(200).json(cachedData);
        res.end();
    } catch(err) {
        res.status(400).json({
            status: 'fail',
            message: 'No words present'
        });
    }
});

async function getWordForm(searchTerm) {
    const apiResponse = await axios.get(`${BASEURL}${LEMMAS}/${searchTerm}`, options);
    const parsedResponse = await apiResponse.data.results[0].lexicalEntries[0].inflectionOf[0].id;
    return parsedResponse;
}

async function getMeaning(baseWord) {
    const apiResponse = await axios.get(`${BASEURL}${ENTRIES}/${baseWord}${URL_PARAMS}`, options);
    const parsedResponse = await apiResponse.data.results;
    return parsedResponse;
}

app.post('/api/search-term', async (req, res) => {
    try {
        let searchTerm, cachedData, baseWord, respObj, newWord;

        // Test the search term
        searchTerm = req.body.word.toLowerCase();

        // Search the Database for the search term
        cachedData = await WordModel.findOne({ wordName: searchTerm });
        
        if(cachedData) {
            respObj = cachedData;
            console.log('Got the data');
        } else {
            // Get the base form of the search term from the Dictionary API
            baseWord = await getWordForm(searchTerm);
            
            // Search the Database for the search term
            cachedData = await WordModel.findOne({ wordName: baseWord });
            
            if(cachedData) {
                respObj = cachedData;
                console.log('Got the data');
            } else {
                // Get the meaning of the base form from the API
                respObj = await getMeaning(baseWord);
            
                // Cache the response in the Database
                newWord = new WordModel({ wordName: searchTerm, [searchTerm]: respObj });
                newWord.save();
            }
        }        
        // Send the response back to the front-end
        res.status(200).json(respObj);
        res.end();
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: 'Word not found'
        });
    }
});

app.listen(PORT, () => {
    console.log("Listening on port " + PORT);
});