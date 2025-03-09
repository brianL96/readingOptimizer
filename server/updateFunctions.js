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


let updateType = 1;

let periodicUpdate = setTimeout(() => {
  console.log("First Call");
  manageUpdates();
}, 1800000);


async function manageUpdates(){

  console.log("Manage Updates Called");

  if(periodicUpdate !== null){
    clearTimeout(periodicUpdate);
  }

  if(updateType === 1){
    await updateCategories();
    updateType = 2;
  }
  else if(updateType === 2){
    await updateImages();
    updateType = 1;
  }

  periodicUpdate = setTimeout(() => {
    manageUpdates();
  }, 1800000);

  console.log("Manage Updates End");

}

async function updateImages(){

  console.log("Starting updateImages");

  let updateLimit = 50;
  let totalCategories = bestsellerListNames.length;
  let categoriesIndex = 0;
  let booksToUpdate = [];

  while(categoriesIndex < totalCategories){

    let category = bestsellerListNames[categoriesIndex];
    let categoryMeta = nytFunctions.getMetaObject([category]);
    let startYear = parseInt(categoryMeta[0].newest_published_date.substring(0, 4));
    let endYear = parseInt(categoryMeta[0].oldest_published_date.substring(0, 4));
    let checkYear = startYear;
  
    while(checkYear >= endYear){
      let collection = BookInfo.getCollection(category);
      let booksInYear = await collection.find({listDate: {$regex: checkYear.toString()}}, 'author title image').exec();
      let totalBooksInYear = booksInYear.length;
      if(totalBooksInYear <= 0){
        break;
      }
      checkForNullLinks(booksInYear, booksToUpdate);
      if(booksToUpdate.length >= updateLimit){
        break;
      }
      checkYear--;
    }

    await updateNullLinks(booksToUpdate, category, categoryMeta[0].list_name_encoded, categoryMeta[0].newest_published_date, checkYear);
    booksToUpdate.splice(0, booksToUpdate.length);
    categoriesIndex++;
  }


}

function checkForNullLinks(bookList, booksToUpdate){
  bookList.forEach((book) => {
    if(book.image === null || book.amazonLink === null){
      booksToUpdate.push(book);
    }
  });
}

async function updateNullLinks(booksToUpdate, category, categoryEncoded, startDate, lastYear){

  let checkDate = startDate;
  let checkYear = parseInt(checkDate.substring(0, 4));
  let collection = BookInfo.getCollection(category);

  while(booksToUpdate.length > 0 && checkYear >= lastYear){
    await getWait(13000);
    let freshBooks = await nytFunctions.getBestSellers(categoryEncoded, checkDate);
    checkDate = nytFunctions.calculateLastWeek(checkDate);
    checkYear = parseInt(checkDate.substring(0, 4));
    let freshBooksSize = (freshBooks === null) ? 0 : freshBooks.length;
    console.log(freshBooksSize);
    let freshBooksIndex = 0;
    while(freshBooksIndex < freshBooksSize){

      let booksToUpdateSize = booksToUpdate.length;
      let booksToUpdateIndex = 0;
      let foundIndex = -1;

      while(booksToUpdateIndex < booksToUpdateSize){
        if(freshBooks[freshBooksIndex].title === booksToUpdate[booksToUpdateIndex].title && freshBooks[freshBooksIndex].author === booksToUpdate[booksToUpdateIndex].author){
          console.log(`Updating: ${freshBooks[freshBooksIndex].title} by ${freshBooks[freshBooksIndex].author}`);
          console.log(freshBooks[freshBooksIndex]);
          await collection.findOneAndUpdate({_id: booksToUpdate[booksToUpdateIndex]._id}, {$set:{image: freshBooks[freshBooksIndex].image, amazonLink: freshBooks[freshBooksIndex].amazonLink}}).exec();
          foundIndex = booksToUpdateIndex;
          break;
        }
        booksToUpdateIndex++;
      }

      if(foundIndex !== -1){
        booksToUpdate.splice(foundIndex, 1);
      }
      
      freshBooksIndex++;
    }

  }
  
  console.log("Books Not Found:");
  console.log(booksToUpdate);
  

}


async function updateCategories(){

  console.log("Starting Update Categories");

  let bestSellerLists = await nytFunctions.getBestSellerLists();
  if(bestSellerLists === null){
    return;
  }
  
  let metaObjects = nytFunctions.getMetaObject(bestsellerListNames);
  let listIndex = 0;
  let listLength = bestsellerListNames.length;
  while(listIndex < listLength){

    let category = bestsellerListNames[listIndex];
    let collection = BookInfo.getCollection(category);
    let listOfDates = await collection.distinct('listDate');
    let latestDate = null;
  
    if(listOfDates.length > 0){
      latestDate = listOfDates[listOfDates.length - 1];
    }

    let length = metaObjects.length;
    let index = 0;
    while(index < length){
      if(metaObjects[index].display_name === category){
        if(metaObjects[index].newest_published_date === latestDate){
          console.log("yes");
        }
        else{
          console.log("no");
          
          let bridge = getBridgingDates(metaObjects[index].newest_published_date, latestDate);
          
          
          let recentBooks = await retrieveBooksWithDateList(metaObjects[index].list_name_encoded, bridge);
          if(recentBooks === null){
            console.log(`Unable to update ${metaObjects[index].list_name_encoded}`);
            break;
          }

          let updateObj = await updateDatabase(metaObjects[index].display_name, recentBooks);
          if(updateObj === null){
            console.log(`Unable to update ${metaObjects[index].list_name_encoded}`);
            break;
          }
          
          let result = await finishDatabaseUpdate(collection, updateObj)
          
        }
        break;
      }
      index++;
    }
    listIndex++;
  }
    
}


function getBridgingDates(recentDate, oldDate){

  let limit = 100;
  let iteration = 0;
  let newerDate = Date.parse(`${recentDate}T00:00:00.000Z`);
  let olderDate = Date.parse(`${oldDate}T00:00:00.000Z`);
  let arr = [];
  let dateString = recentDate;

  while(newerDate > olderDate && iteration < limit){
    arr.push(dateString);
    dateString = nytFunctions.calculateLastWeek(dateString);
    newerDate = Date.parse(`${dateString}T00:00:00.000Z`);
    iteration++
  }

  return arr;

}


async function retrieveBooksWithDateList(category, listOfDates){
  let loadedBooks = [];
  let i = 0;
  let length = listOfDates.length;
  while(i < length){

    let uniqueList = [];
    await getWait(13000);
    let tempList = await nytFunctions.getBestSellers(category, listOfDates[i]);
    if(tempList === null){
      return null;
    }
    tempList.forEach((book) => {
      let loadedLength = loadedBooks.length;
      let loadedI = 0;
      let found = false;
      while(loadedI < loadedLength){
        if(book.author === loadedBooks[loadedI].author && book.title === loadedBooks[loadedI].title){
          found = true;
          break;
        }
        loadedI++;
      }
      if(found === false){
        uniqueList.push(book);
      }
    });

    uniqueList.forEach((book) => {
      loadedBooks.push(book);
    })

    i++;


  }

  return loadedBooks;
  
}


async function updateDatabase(category, incomingBooks){

  let deletionIds = [];
  let needDurations = [];
  let collection = BookInfo.getCollection(category);
  let i = 0;
  let length = incomingBooks.length;
  while(i < length){
    let value = await collection.find({author: incomingBooks[i].author, title: incomingBooks[i].title}).exec();
    if(value.length > 0){
      console.log("Book is already in database");
      console.log(value);
      incomingBooks[i].duration = value[0].length;
      deletionIds.push({id: value[0]._id.toString()});
    }
    else{
      console.log(`Book is not in database: ${incomingBooks[i].title} by ${incomingBooks[i].author}`);
      needDurations.push(incomingBooks[i]);
    }
    i++
  }

  let newAccessToken = await spotifyFunctions.getSpotifyAccessToken();
  if(newAccessToken === null){
    return null;
  }
  let durationArray = await spotifyFunctions.appendAudioBookDuration(newAccessToken, needDurations);
  if(durationArray === null){
    return null;
  }

  //console.log("All the durations I need to pick up:");
  //console.log(durationArray);

  let index = 0;
  let needDurationsLength = needDurations.length;
  while(index < needDurationsLength){
    needDurations[index].duration = durationArray[index];
    index++;
  } 

  return {
    incomingBooks: incomingBooks,
    deletionIds: deletionIds
  };


  //return true;
}

async function finishDatabaseUpdate(collection, updateObject){

  let idStrings = [];
  let updateBooks = [];
  console.log("About to print database updates:");

  updateObject.deletionIds.forEach((element) => {
    idStrings.push(element.id);
  });

  updateObject.incomingBooks.forEach((book) => {
    updateBooks.push({
      author: book.author,
      title: book.title,
      image: book.image,
      listDate: book.date,
      category: book.category,
      length: book.duration,
      amazonLink: book.amazonLink
    })
  });


  console.log(idStrings);
  console.log(updateBooks);

  console.log("Finished Printing");

  let db = BookInfo.getDB();
  
  let session = await db.startSession();

  try{

  await session.withTransaction(async () => {

    let deleteResult = await collection.deleteMany({_id:{$in: idStrings}}, {session: session});
    console.log(deleteResult);
    console.log("Finished Deletes");
  
    //let insertResult = await collection.insertMany(updateBooks);
    let insertResult = await collection.insertMany(updateBooks, {session: session});
    console.log(insertResult);
    console.log("Finished Insert");

  });

}
catch(error){
  console.log("Ran into error during transaction");
}

await session.endSession();



  /*

  let deleteResult = await collection.deleteMany({_id:{$in: idStrings}});
  console.log("Finished Deletes");

  let insertResult = await collection.insertMany(updateBooks);
  console.log("Finished Insert");

  */



  return true;


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
  updateCategories,
  updateImages
}
