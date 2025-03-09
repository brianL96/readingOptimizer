import React, { useEffect, useRef, useState } from 'react';
import ListItem from './ListItem';
import LoaderCard from './LoaderCard';
import {FaArrowRightLong} from 'react-icons/fa6';

const ListContainer = ({bookInfoArray, listTitle, newestDate, oldestDate, loadNextBatch, addBookToCalculator, readingSpeed, dailyHours, addLoader, containerRef}) => {

    let [infoList, setInfoList] = useState([]);
    let [title, setTitle] = useState('');
    let [startDate, setStartDate] = useState('');
    let [endDate, setEndDate] = useState('');
    let [loader, setLoader] = useState(false);

    useEffect(() => {

        setInfoList([...bookInfoArray]);
        setTitle(listTitle);
        setStartDate(newestDate);
        setEndDate(oldestDate);
        setLoader(addLoader);
        
    }, [bookInfoArray, listTitle, newestDate, oldestDate, addLoader]);


    function loadBooks(){
    
      let arr = [];

      infoList.forEach((element, index) => {

        arr.push(
          <ListItem key={`ListItem-${element._id}`} bookID={element._id} image={element.image} audiobookLength={element.length} addBookToCalculator={addBookToCalculator} index={index} readingSpeed={readingSpeed} dailyHours={dailyHours} bookName={element.title} bookAuthor={element.author} bookAmazonLink={element.amazonLink}/>
        );
      });

      if(loader){
        arr.push([<LoaderCard key={`Loader-${title}`}/>]);
      }

      return arr;
      
    }

    function calculateLastWeek(){

      let weekSubtraction = (7 * 24 * 60 * 60 * 1000); 
      let start = Date.parse(`${endDate}T00:00:00.000Z`);
      let lastWeek = new Date(start - weekSubtraction).toISOString().substring(0, 10);
      return lastWeek;
      
    }

    let checkLastList = (e) => {
      
      e.preventDefault();
      let previousWeekDate = calculateLastWeek();
      loadNextBatch(title, previousWeekDate);

    }


  return (
    <div ref={containerRef} className='flex flex-col justify-start h-auto min-h-64 w-160 fullBoxScreen:w-200 border-black border bg-amber-900 mb-10 shadow-lg shadow-gray-400'>
      <div className='flex flex-row justify-start w-full h-20 border-b border-b-black'>
        <div className='flex flex-wrap flex-row items-center justify-start h-full w-2/5 m-0'>
          <h3 className='ml-3 text-xl text-white'>{title}</h3>
        </div>

        <div className='flex flex-row justify-center items-center h-full w-2/5'>
          <h3 className='text-white text-lg'>{`${startDate} to ${endDate}`}</h3>
        </div>

        <div className='flex flex-row justify-end items-center h-full w-1/5'>
          <FaArrowRightLong className='h-7 w-28 text-white cursor-pointer hover:h-9' onClick={(e) => checkLastList(e)}/>
        </div>
      </div>
      <div className='flex flex-row justify-start overflow-x-auto min-h-60 h-auto max-w-200 bg-blue-200 overscroll-x-none'>
        {loadBooks()}
      </div>
    </div>
  )
}

export default ListContainer