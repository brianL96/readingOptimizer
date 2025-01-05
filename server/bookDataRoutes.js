const express = require("express");
const router = express.Router();
let nytFunctions = require('./nytFunctions');
let spotifyFunctions = require('./spotifyFunctions');
const BookInfo = require('./BookInfo');

router.get("/api", async (req, res) => { 
    //let value = spotifyFunctions.getSpotifyAccessToken(); 
    res.json({"thank you": []});
});
  
router.post('/getMetaObject', async (req, res) => {
    let categories = req.body.categories;
    let metaObject = nytFunctions.getMetaObject(categories);
    console.log("Is there an issue here?");
    console.log(metaObject);
    res.json({data: metaObject});
});
  
router.post("/getCategory", async (req, res) => {
    
    let category = req.body.category;
    let date = req.body.date;
    let collection = BookInfo.getCollection(category);
    console.log(category);
    console.log(date);
  
    let value = await collection.find({listDate: date}).exec();
    let retrievalDate = date;
    let found = true;
  
    if(value.length === 0){
  
      console.log("Nothing found for that date");
      found = false;
      
      let backUpValue = await collection.distinct('listDate');
      let reversedDates = backUpValue.reverse();
      
      let lastListDate = getNextBestDate(date, reversedDates);
        
      if(lastListDate !== null){
        value = await collection.find({listDate: lastListDate}).exec();
        retrievalDate = lastListDate;
        found = true;
      }
      
    }
  
    let returnValue = {
      data: value,
      retrievalDate: retrievalDate,
      found: found
    };
    
    res.json(returnValue);
});

function getNextBestDate(date, datesList){
  
  let i = 0;
  let length = datesList.length;

  while(i < length){
    let date1 = new Date(datesList[i]);
    let date2 = new Date(date);
    if(date1 < date2){
      console.log(`Here is the good date: ${datesList[i]} for originally searching for ${date}`)
      return datesList[i];
    }
    i++;
  }

  return null;
}

module.exports = {
    router
};