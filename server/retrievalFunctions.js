const nytFunctions = require('./nytFunctions');
const spotifyFunctions = require('./spotifyFunctions');
const BookInfo = require('./BookInfo');

let accessToken = process.env.SPOTIFY_ACCESS_TOKEN || '';
let bestsellerListName = 'Combined Print & E-Book Fiction';
let beginningDate = '2024-12-15';
let retrievals = 3;

function start(){
    nytFunctions.getBestSellerLists();
    //insertListIntoDatabase(accessToken, bestsellerListName, beginningDate, retrievals);
}

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
  
      let absoluteStartDate = new Date(dateToCheck);
      let absoluteOldestDate = new Date(categoryObject.oldestPublished);
      console.log(`Absolute start date: ${absoluteStartDate}`);
      console.log(`Absolute oldest date: ${absoluteOldestDate}`);
      if(absoluteStartDate < absoluteOldestDate){
        console.log(`${dateToCheck} is past oldest date for ${categoryName}`);
        return;
      }
      
      let nowDate = new Date();
      let nytWait = 0;
      if((nowDate - pullDate) < 12000){
        nytWait = Math.round(12000 - (nowDate - pullDate));
      }
  
      //let wait = await getNYTAPIWait(nytWait);
      let wait = await getWait(nytWait);
      let listData = await pullCategoryLists(spotifyAccessToken, categoryObject, dateToCheck, bigBookList);
  
      let list = listData.smallBookList;
      pullDate = listData.pullDate;
  
      bigBookList = [...bigBookList, ...list];
  
      let i = 0;
      let length = list.length;
  
      console.log("Starting To Insert");
  
      while(i < length){
  
        console.log(list[i]);
  
        let info = await collection.create({
          author: list[i].author,
          title: list[i].title,
          image: list[i].image,
          listDate: list[i].date,
          category: list[i].category,
          length: list[i].duration,
          amazonLink: list[i].amazonLink
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
  
    let arr = await spotifyFunctions.appendAudioBookDuration(token, smallBookList);
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
  
  
function getWait(time){
  
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

module.exports = {
    start
}