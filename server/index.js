const express = require("express");
require('dotenv').config();
const app = express();
const cors = require("cors");
const corsOptions = {
    origin: ["http://localhost:3000"],
};

const mongoose = require("mongoose");
const BookInfo = require('./BookInfo');

let mongodbConnection = process.env.MONGO_DB_ACCESS || null;

mongoose.connect(mongodbConnection);

let accessToken = process.env.SPOTIFY_ACCESS_TOKEN || '';
let bestsellerListName = 'Combined Print & E-Book Fiction';
let beginningDate = '2024-09-29';
let retrievals = 5;

let nytFunctions = require('./nytFunctions');

nytFunctions.getBestSellerLists();

//insertListIntoDatabase(accessToken, bestsellerListName, beginningDate, retrievals);

app.use(cors(corsOptions));

app.use(express.json());

app.get("/api", async (req, res) => { 
  //let value = getSpotifyAccessToken(); 
  res.json({"thank you": []});
});

app.post('/getMetaObject', async (req, res) => {
  let categories = req.body.categories;
  let metaObject = nytFunctions.getMetaObject(categories);
  console.log(metaObject);
  res.json({data: metaObject});
});

app.post("/getCategory", async (req, res) => {
  
  let category = req.body.category;
  let date = req.body.date;
  let collection = BookInfo.getCollection(category);
  console.log(category);
  console.log(date);

  //let value = await BookInfo.find({listDate: date, category: category}).exec();
  let value = await collection.find({listDate: date}).exec();

  let returnValue = {
    data: value
  };
  
  res.json(returnValue);
});

app.listen(8080, () => {
    console.log("Server started on port 8080");

});

async function insertListIntoDatabase(spotifyAccessToken, categoryName, startDate, amountOfLists){

  let iteration = 0;
  let limit = amountOfLists;
  let dateToCheck = startDate;
  let categoryObject = await nytFunctions.pullListInfo(categoryName);
  let pullDate = new Date();
  let bigBookList = [];
  let collection = BookInfo.getCollection(categoryName);

  
  let previousEntries = await collection.find().exec();
  previousEntries.forEach((previousEntry) => {
    bigBookList.push(previousEntry);
  });
  

  while(iteration < limit){
    
    let nowDate = new Date();
    let nytWait = 0;
    if((nowDate - pullDate) < 12000){
      nytWait = Math.round(12000 - (nowDate - pullDate));
    }

    let wait = await getNYTAPIWait(nytWait);
    let listData = await pullCategoryLists(spotifyAccessToken, categoryObject, dateToCheck, bigBookList);

    let list = listData.smallBookList;
    pullDate = listData.pullDate;

    bigBookList = [...bigBookList, ...list];

    let i = 0;
    let length = list.length;

    console.log("Starting To Insert");

    while(i < length){

      let info = await collection.create({
        author: list[i].author,
        title: list[i].title,
        image: list[i].image,
        listDate: list[i].date,
        category: list[i].category,
        length: list[i].duration
      });

      i++;
    }

    console.log(`Finished Insert For ${categoryName} ${dateToCheck}`);

    dateToCheck = nytFunctions.calculateLastWeek(dateToCheck);
    iteration++;

  }

  
}

async function pullCategoryLists(token, categoryObject, startDate, bigBookList){

  if(categoryObject === null){
    return []; 
  }

  let smallBookList = [];

  let considerList = await nytFunctions.getBestSellers(categoryObject.encodedName, startDate);

  considerList.forEach((element) => {

    let i = 0;
    let length = bigBookList.length;
    let found = false;

    while(i < length){
      if(element.author === bigBookList[i].author && element.title === bigBookList[i].title){
        found = true;
        break;
      }
      i++;
    }
    if(found === false){
      smallBookList.push(element);
    }

  });

  

  let pullDate = new Date();

  let arr = await appendAudioBookDuration(token, smallBookList);
  console.log("Finished getting durations");

  let i = 0;
  let length = smallBookList.length;
  while(i < length){
    smallBookList[i].duration = arr[i];
    i++;
  }

  console.log("Final Product:");
  console.log(smallBookList);

  let returnValue = {
    smallBookList: smallBookList,
    pullDate: pullDate
  };

  return returnValue;

}

async function appendAudioBookDuration(token, list){

  let arr = [];
  let i = 0;
  let length = list.length;

  while(i < length){
    let duration = await getSpotifyAudioBookIDWait(token, list[i].author, list[i].title);
    arr.push(duration);
    i++;
  }

  return arr;
}


async function getSpotifyAccessToken(){

  let clientID = process.env.SPOTIFY_CLIENT_ID || '';
  let clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';

  let request = new Request('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + (new Buffer.from(clientID + ":" + clientSecret).toString('base64')),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  try{
    let response = await fetch(request);
    if(!response.ok){
      throw new Error(`${response.status}`);
    }
    let data = await response.json();
    console.log("Here is the Spotify Access Token:");
    console.log(data);
  }
  catch(error){
    console.log("Problem Fetching Spotify API");
    console.log(error);
  }


}

async function getSpotifyAudioBookID(token, author, title){

  let request = new Request(`https://api.spotify.com/v1/search?q=${author.replaceAll(' ', '%2520')}%2520${title.replaceAll(' ', '%2520')}&type=audiobook`, {
      method: 'GET',
      headers: {'Authorization': 'Bearer ' + token},
  });

  try{
      let response = await fetch(request);
      if(!response.ok){
        throw new Error(`${response.status}`);
      }
      let data = await response.json();
      console.log("Here is the Spotify response:");
      let id = data.audiobooks.items[0].id
      console.log(id);
      console.log("Now want Book Length:");
      let audiobookLength = await getAudioBookLengthWait(token, id);
      console.log("Final Value:");
      console.log(audiobookLength);
      return audiobookLength;

    }
    catch(error){
      console.log("Problem Fetching Spotify API");
      console.log(error);
    }

}

async function getAudioBookChapters(token, audiobookID, offset){

  let request = new Request(`https://api.spotify.com/v1/audiobooks/${audiobookID}/chapters?limit=50&offset=${offset}`, {
    method: 'GET',
    headers: {'Authorization': 'Bearer ' + token},
  });

  try{
    let response = await fetch(request);
    if(!response.ok){
      throw new Error(`${response.status}`);
    }
    let data = await response.json();
    console.log("Here is the Spotify response:");
    let length = data.items.length;
    let i = 0;
    let totalMilli = 0;

    while(i < length){
      totalMilli = totalMilli + data.items[i].duration_ms;
      i++;
    }

    console.log(`I considered here : ${i} chapters`);

    console.log(totalMilli);

    return totalMilli;
    

  }
  catch(error){
    console.log("Problem Fetching Spotify API");
    console.log(error);
  }

}

async function getAudioBookLength(token, audiobookID){
  
  let request = new Request(`https://api.spotify.com/v1/audiobooks/${audiobookID}`, {
      method: 'GET',
      headers: {'Authorization': 'Bearer ' + token},
  });

  try{
    let response = await fetch(request);
    if(!response.ok){
      throw new Error(`${response.status}`);
    }
    let data = await response.json();
    console.log("Here is the Spotify response:");
    let i = 0;
    let totalChapters = data.total_chapters;
    console.log(`Here are the total amount of chapters: ${totalChapters}`);
    let length = data.chapters.items.length;
    let totalMilli = 0;
    while(i < length){
      totalMilli = totalMilli + data.chapters.items[i].duration_ms;
      i++;
    }

    console.log(`Milliseconds in first set of chapters: ${totalMilli}`);

    let offset = length;
    let restTotalMilli = 0;

    while(offset < totalChapters){
      console.log(`Request from ${offset} to ${offset + 50}`);
      let value = await getAudioBookChaptersWait(token, audiobookID, offset);
      restTotalMilli = restTotalMilli + value;
      offset = offset + 50;
    }

    totalMilli = totalMilli + restTotalMilli;

    console.log(`The total amount of milliseconds in this audiobook is: ${totalMilli}`);
    return totalMilli;
  }
  catch(error){
    console.log("Problem Fetching Spotify API");
    console.log(error);
  }

}

function getNYTAPIWait(time){

  let promise = new Promise((resolve, reject) => {

    if(time === 0){
      resolve(true);
    }
    else{
      console.log(`Need to wait: ${time}`);
    }

    setTimeout( async () => {
      resolve(true);
    }, time);

  });

  return promise;

}

function getSpotifyAudioBookIDWait(token, author, title){
  let promise = new Promise((resolve, reject) => {
    console.log("About to await");
    setTimeout( async () => {
      let value = await getSpotifyAudioBookID(token, author, title)
      console.log("Finished getting id and associated values");
      resolve(value);
    }, 1000);
  });
  return promise;

  
}

function getAudioBookLengthWait(token, audiobookID){
  let promise = new Promise((resolve, reject) => {
    console.log("About to await");
    setTimeout( async () => {
      let value = await getAudioBookLength(token, audiobookID);
      console.log("Finshed getting length");
      resolve(value);
    }, 1000);
  });
  return promise;
}

function getAudioBookChaptersWait(token, audiobookID, offset){
  let promise = new Promise((resolve, reject) => {
    console.log(`About to wait in getting chapters for offset: ${offset}`);
    setTimeout( async () => {
      let value = await getAudioBookChapters(token, audiobookID, offset);
      console.log(`Finshed getting chapters at offset: ${offset}`);
      resolve(value);
    }, 1000);
  });
  return promise;
}