
let metaDataArray = [];

function getMetaObject(categories){

  let arr = [];

  categories.forEach((category) => {
    let i = 0;
    let length = metaDataArray.length;
    while(i < length){
      if(metaDataArray[i].display_name === category){
        arr.push(metaDataArray[i]);
      }
      i++;
    }
  });

  return arr;
}

async function pullListInfo(category){

  let listData = await getBestSellerLists();
  let listIndex = 0;
  let length = listData.myList.length;
  let foundIndex = -1;


  while(listIndex < length){
    if(category === listData.myList[listIndex].name){
      foundIndex = listIndex;
      break;
    }
    listIndex++;
  }

  if(foundIndex === -1){
    console.log("Category not found");
    return []
  }

  return listData.myList[foundIndex];

}


async function getBestSellerLists(){

    //returns an object with myList, which is an array of objects that describe categories
    
    let returnValue = {
      myList: []
    }

    let arr = [
      {
        name: 'Combined Print & E-Book Fiction',
        encodedName: null,
        listIndex: -1,
        newestPublished: null,
        oldestPublished: null,
        lastRetrieve: null

      },
      {
        name: 'Combined Print & E-Book Nonfiction',
        encodedName: null,
        listIndex: -1,
        newestPublished: null,
        oldestPublished: null,
        lastRetrieve: null
      },
      {
        name: 'Hardcover Fiction',
        encodedName: null,
        listIndex: -1,
        newestPublished: null,
        oldestPublished: null,
        lastRetrieve: null
      },
      {
        name: 'Hardcover Nonfiction',
        encodedName: null,
        listIndex: -1,
        newestPublished: null,
        oldestPublished: null,
        lastRetrieve: null
      },
      {
        name: 'Paperback Trade Fiction',
        encodedName: null,
        listIndex: -1,
        newestPublished: null,
        oldestPublished: null,
        lastRetrieve: null
      },
      {
        name: 'Paperback Nonfiction',
        encodedName: null,
        listIndex: -1,
        newestPublished: null,
        oldestPublished: null,
        lastRetrieve: null
      },
      {
        name: 'Advice, How-To & Miscellaneous',
        encodedName: null,
        listIndex: -1,
        newestPublished: null,
        oldestPublished: null,
        lastRetrieve: null
      },
    ];

    let nytAPIKey = process.env.NYT_API_KEY || '';

    let url = `https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=${nytAPIKey}`;
    
    try{
      let response = await fetch(url);
      if(!response.ok){
        throw new Error(`${response.status}`);
      }
      let data = await response.json();
      let resultArray = data.results;

      arr.forEach((element, index) => {

        let i = 0;
        let length = resultArray.length;

        while(i < length){

          if(element.name === resultArray[i].display_name){
            arr[index].listIndex = i;
            arr[index].newestPublished = resultArray[i].newest_published_date;
            arr[index].oldestPublished = resultArray[i].oldest_published_date;
            arr[index].lastRetrieve = null;
            arr[index].encodedName = resultArray[i].list_name_encoded;
            metaDataArray.push(resultArray[i]);
            return;
          }

          i++;
        }

      });

      returnValue.myList = [...arr];
      return returnValue;
    }

    catch(error){
      console.log("Problem Fetching List Data");
    }

    return returnValue;

}


async function getBestSellers(name, date){

    
    let nytAPIKey = process.env.NYT_API_KEY || '';
    let url = `https://api.nytimes.com/svc/books/v3/lists/${date}/${name}.json?api-key=${nytAPIKey}`;

    try{

      let response = await fetch(url);
      if(!response.ok){
        throw new Error(`${response.status}`);
      }
      let data = await response.json();

      console.log(data.results);

      let arr = [];
      let start = 0;
      let end = data.results.books.length;
  
      while(start < end){

        let bookObject = {
          author: data.results.books[start].author,
          title: data.results.books[start].title,
          image: data.results.books[start].book_image,
          date: date,
          category: name
        };

        arr.push(bookObject);
        start++;
      }

      return arr;
    }

    catch(error){
      console.log(`Problem Fetching Bestseller List: ${name} for Date: ${date}`);
      console.log(url);
    }

    return [];
    

}


function calculateLastWeek(dateString){

  let weekSubtraction = (7 * 24 * 60 * 60 * 1000); 
  let start = Date.parse(`${dateString}T00:00:00`);
  let lastWeek = new Date(start - weekSubtraction);
  let year = lastWeek.getFullYear();
  let month = ((lastWeek.getMonth() + 1) < 10) ? '0' + (lastWeek.getMonth() + 1) : (lastWeek.getMonth() + 1);
  let day = (lastWeek.getDate() < 10) ? '0' + lastWeek.getDate() : lastWeek.getDate();
  return `${year}-${month}-${day}`;

}

module.exports = {
  getMetaObject,
  getBestSellerLists,
  pullListInfo,
  getBestSellers,
  calculateLastWeek
}
