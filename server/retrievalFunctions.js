const nytFunctions = require('./nytFunctions');
const spotifyFunctions = require('./spotifyFunctions');
const BookInfo = require('./BookInfo');

let bestsellerListNames = [
  'Combined Print & E-Book Fiction',
  'Combined Print & E-Book Nonfiction',
  'Hardcover Fiction',
  'Hardcover Nonfiction',
  'Paperback Trade Fiction',
  'Paperback Nonfiction',
  'Advice, How-To & Miscellaneous'
];

let bestsellerListName = bestsellerListNames[0];
let beginningDate = '2025-03-16';
let retrievals = 26;

function start(){
    nytFunctions.getBestSellerLists();
    //insertListIntoDatabase(bestsellerListName, beginningDate, retrievals);
}

async function insertListIntoDatabase(categoryName, startDate, amountOfLists){

    let iteration = 0;
    let limit = amountOfLists;
    let dateToCheck = startDate;
    let spotifyAccessToken = await spotifyFunctions.getSpotifyAccessToken();
    if(spotifyAccessToken === null){
      return;
    }
    let categoryObject = await nytFunctions.pullListInfo(categoryName);
    if(categoryObject === null){
      console.log("Failed to retreive metadata: no inserts occured");
      return;
    }
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
      if(listData === null){
        console.log(`Failed to retrieve all data necessary for ${categoryName} ${dateToCheck}`);
        return;
      }
  
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
      return null; 
    }
  
    let smallBookList = [];
  
    let considerList = await nytFunctions.getBestSellers(categoryObject.encodedName, startDate);

    if(considerList === null){
      return null;
    }
  
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
    if(arr === null){
      return null;
    }
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