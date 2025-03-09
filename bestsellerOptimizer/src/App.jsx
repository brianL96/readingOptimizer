import React, { useEffect, useRef, useState } from 'react';
import ListContainer from './components/ListContainer';
import BookCalculator from './components/BookCalculator';
import SiteHeader from './components/SiteHeader';
import Footer from './components/Footer';
import axios from "axios";

const App = () => {

  
  let [imageDetails, setImageDetails] = useState([]);
  let [booksInCalculator, setBooksInCalculator] = useState([]);
  let [readingSpeed, setReadingSpeed] = useState(200);
  let [dailyHours, setDailyHours] = useState(1);
  let [monthSize, setMonthSize] = useState(31);
 
  let ref1 = useRef(null);
  let ref2 = useRef(null);
  let ref3 = useRef(null);
  let ref4 = useRef(null);
  let ref5 = useRef(null);
  let ref6 = useRef(null);
  let ref7 = useRef(null);
 
  useEffect(() => {

    let fetchFunction = async () => {

      let allListsImages = [];

      let listData = await fetchGetMetaData(
        [
          'Combined Print & E-Book Fiction',
          'Combined Print & E-Book Nonfiction',
          'Hardcover Fiction',
          'Hardcover Nonfiction',
          'Paperback Trade Fiction',
          'Paperback Nonfiction',
          'Advice, How-To & Miscellaneous'
        ]
      );

      let i = 0;
      let length = listData.length;
      while(i < length){

        let data = await fetchPostMyAPI(listData[i].display_name, listData[i].newest_published_date);
        
        if(data.found){
          listData[i].newest_published_date = data.retrievalDate;
          listData[i].lastRetrieve = data.retrievalDate;
        }
        else if(data.found === false){
          listData[i].lastRetrieve = listData[i].newest_published_date;
        }
  
        let categoryObject = {
          metaData: listData[i],
          detailsArray: data.data,
          loaderOn: false
        };
  
        allListsImages.push(categoryObject);

        i++;
      }
     
      setImageDetails([...allListsImages]);

      fetchMyAPI();

    }

    fetchFunction();
  
  }, []);

  let fetchMyAPI = async() => {
    let response = await axios.get("http://localhost:8080/api");
  };

  let fetchGetMetaData = async(categories) => {
    
    let url = "http://localhost:8080/getMetaObject";
    let request = new Request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        categories: categories,
      })
    });

    let value = await fetch(request);
    let {data} = await value.json();
    return data;

  }

  let fetchPostMyAPI = async(category, date) => {
    let url = "http://localhost:8080/getCategory";
    let request = new Request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category: category,
        date: date
      })
    });

    let value = await fetch(request);
    let data = await value.json();
    return data;
  }

  async function loadNextBatch(categoryName, newDate){

    let temp = imageDetails;
    let i = 0;
    let length = imageDetails.length;
    let foundIndex = -1;

    while(i < length){
      if(temp[i].metaData.display_name === categoryName){
        foundIndex = i;
        break;
      }
      i++;
    }

    if(foundIndex === -1){
      console.log("No metadata match");
      return;
    }

    let currentBookImages = temp[foundIndex].detailsArray;
    temp[foundIndex].loaderOn = true;
    setImageDetails([...temp]);
    await loaderWait();
    let bookDetails = await fetchPostMyAPI(temp[foundIndex].metaData.display_name, newDate);
    
    if(bookDetails.data.length === 0){
      console.log("Couldn't find anything");
      temp[foundIndex].loaderOn = false;
      setImageDetails([...temp]);
      return;
    }

    temp[foundIndex].metaData.lastRetrieve = bookDetails.retrievalDate;

    temp[foundIndex].loaderOn = false;

    temp[foundIndex].detailsArray = [...currentBookImages, ...bookDetails.data];

    setImageDetails([...temp]);

  }

  function addBookToCalculator(bookObject){
    let temp = booksInCalculator;
    let i = 0;
    let length = temp.length;
    while(i < length){
      if(temp[i].author === bookObject.author && temp[i].title === bookObject.title){
        return;
      }
      i++;
    }
    setBooksInCalculator([...temp, bookObject]);
  }

  function deleteBookFromCalculator(author, title){
    
    let temp = booksInCalculator;
    let newList = [];

    temp.forEach((element) => {
      if(element.author !== author || element.title !== title){
        newList.push(element);
      }
    });

    setBooksInCalculator([...newList]);

  }

  function getContainerRef(id){

    if(id === 'Combined Print & E-Book Fiction'){
      return ref1;
    }
    if(id === 'Combined Print & E-Book Nonfiction'){
      return ref2;
    }
    if(id === 'Hardcover Fiction'){
      return ref3;
    }
    if(id === 'Hardcover Nonfiction'){
      return ref4;
    }
    if(id === 'Paperback Trade Fiction'){
      return ref5;
    }
    if(id === 'Paperback Nonfiction'){
      return ref6;
    }
    if(id === 'Advice, How-To & Miscellaneous'){
      return ref7;
    }

  }


  function loadLists(){
 
    let displayRows = [];

    imageDetails.forEach((categoryObject, categoryObjectIndex) => {
    
      let detailsArray = categoryObject.detailsArray;
      let metaData = categoryObject.metaData;

      let addLoader = (categoryObject.loaderOn) ? true : false;

      let containerRef = getContainerRef(metaData.display_name);

      displayRows.push(
        <ListContainer key={`ListContainer-${metaData.display_name}`} bookInfoArray={detailsArray} listTitle={metaData.display_name} newestDate={metaData.newest_published_date} oldestDate={metaData.lastRetrieve} loadNextBatch={loadNextBatch} addBookToCalculator={addBookToCalculator} readingSpeed={readingSpeed} dailyHours={dailyHours} addLoader={addLoader} containerRef={containerRef}/>
      );

      
    });

    return displayRows;
    
  }

  function loaderWait(){

    let promise = new Promise((resolve, reject) => {
  
      setTimeout( async () => {
        resolve(true);
      }, 2500);
  
    });
  
    return promise;
  
  }

  function moveToSpot(e, sectionid){
    e.preventDefault();
    let element = getContainerRef(sectionid).current;
    
    if(element !== undefined && element !== null){
      element.scrollIntoView({block:'start', behavior:'smooth'});
    }
    else{
      console.log("Problem finding section header to move to:");
      console.log(element);
    }

  }


  return (
    

      
    <div className='h-auto min-w-max bg-zinc-300'>

      <div className='w-full h-4 bg-blue-800'>

      </div>
      <div className='flex flex-row justify-center fullFeaturesScreen:justify-start h-auto w-full mt-4'>

        <div className='hidden fullFeaturesScreen:flex flex-col items-center h-screen w-72 fixed'>

          <div className='flex flex-col justify-start h-60 w-56 bg-white border border-black overflow-y-scroll overscroll-none'>
            <h2 onClick={(e) => {moveToSpot(e, 'Combined Print & E-Book Fiction')}} className='m-2 cursor-pointer text-blue-600 font-bold'>New York Times</h2>
            <h3 onClick={(e) => {moveToSpot(e, 'Combined Print & E-Book Fiction')}} className='m-2 ml-3 cursor-pointer text-blue-600 font-bold'>Combined Print & E-Book Fiction</h3>
            <h3 onClick={(e) => {moveToSpot(e, 'Combined Print & E-Book Nonfiction')}} className='m-2 ml-3 cursor-pointer text-blue-600 font-bold'>Combined Print & E-Book Nonfiction</h3>
            <h3 onClick={(e) => {moveToSpot(e, 'Hardcover Fiction')}} className='m-2 ml-3 cursor-pointer text-blue-600 font-bold'>Hardcover Fiction</h3>
            <h3 onClick={(e) => {moveToSpot(e, 'Hardcover Nonfiction')}} className='m-2 ml-3 cursor-pointer text-blue-600 font-bold'>Hardcover Nonfiction</h3>
            <h3 onClick={(e) => {moveToSpot(e, 'Paperback Trade Fiction')}} className='m-2 ml-3 cursor-pointer text-blue-600 font-bold'>Paperback Trade Fiction</h3>
            <h3 onClick={(e) => {moveToSpot(e, 'Paperback Nonfiction')}} className='m-2 ml-3 cursor-pointer text-blue-600 font-bold'>Paperback Nonfiction</h3>
            <h3 onClick={(e) => {moveToSpot(e, 'Advice, How-To & Miscellaneous')}} className='m-2 ml-3 cursor-pointer text-blue-600 font-bold'>Advice, How-To & Miscellaneous</h3>
          </div>

          <div className='flex flex-row justify-center items-center w-56 h-20 mt-5'>
            <h3 className='p-3 text-xl text-gray-600'>Books appear only once on each list.</h3>
          </div>

          <div className='flex flex-row justify-center items-center w-56 h-24 mt-5'>
            <h3 className='p-3 text-xl text-gray-600'>Wordcounts are based on audiobook length (provided by Spotify).</h3>
          </div>

        </div>

        <div className='flex flex-col justify-start items-center fullFeaturesScreen:items-start h-auto w-200 fullFeaturesScreen:ml-72'>

          <SiteHeader/>

          <div className='flex flex-row justify-center w-160 fullBoxScreen:w-full h-auto mb-10'>
            <BookCalculator booksInCalculator={booksInCalculator} setReadingSpeed={setReadingSpeed} setDailyHours={setDailyHours} setMonthSize={setMonthSize} deleteBookFromCalculator={deleteBookFromCalculator}/>
          </div>
          <div id={CSS.escape('Combined Print & E-Book Fiction')} className='flex flex-row justify-center w-160 fullBoxScreen:w-full h-auto'>
            <div className='flex flex-col items-center w-160 h-auto mt-5 mb-28'>
              {loadLists()}
            </div>
          </div>
        </div>

      </div>

      <Footer/>

    </div>
    
  )
  
}

export default App



