import React, { useEffect, useState } from 'react';
import BookCalculatorGrid from './BookCalculatorGrid';


const BookCalculator = ({booksInCalculator, setReadingSpeed, setDailyHours, deleteBookFromCalculator}) => {



    let [speed, setSpeed] = useState('200');
    let [hours, setHours] = useState('1');
    let [barPercent, setBarPercent] = useState('0%');
    let [bookList, setBookList] = useState([]);
    
    
    useEffect(() => {
      
      let tempList = booksInCalculator;

      if(tempList === undefined || tempList === null){
        return;
      }

      let totals = updateMinutesToRead(speed, hours, tempList);

      setBarPercent(getPercentageFilled(totals.totalMinutes, totals.totalAvailiable));

      setBookList([...tempList]);

    }, [booksInCalculator]);

    let changeSpeed = (value) => {
      if(value === ''){return;}
      setSpeed(`${value}`);
      setReadingSpeed(parseInt(value));
      let totals = updateMinutesToRead(value, hours, bookList);
      setBarPercent(getPercentageFilled(totals.totalMinutes, totals.totalAvailiable));
    }

    let changeHours = (value) => {
      if(value === ''){return;}
      setHours(`${value}`);
      setDailyHours(parseFloat(value));
      let totals = updateMinutesToRead(speed, value, bookList);
      setBarPercent(getPercentageFilled(totals.totalMinutes, totals.totalAvailiable));
    }

    function updateMinutesToRead(speedOfReading, hoursDedicated, listOfBooks){

      let returnValue = {
        totalMinutes : 0,
        totalAvailiable: parseFloat(hoursDedicated) * 31 * 60
      };

      listOfBooks.forEach((book) => {
        book.minutesToRead = Math.round(book.wordcount/parseInt(speedOfReading));
        book.percentage = getIndividualPercentage(book.wordcount, parseInt(speedOfReading), parseFloat(hoursDedicated));
        returnValue.totalMinutes = returnValue.totalMinutes + book.minutesToRead;
      });

      return returnValue;

    }

    function getIndividualPercentage(wordcount, speedOfReading, hoursDedicated){

      if(wordcount === 0){
        return '0%';
      }

      let totalMinutesAvailiable = 31 * hoursDedicated * 60;
      let minutes =  Math.round(wordcount/(speedOfReading));
      return Math.round((minutes/totalMinutesAvailiable) * 100) + '%';

    }

    function getPercentageFilled(totalMinutes, totalAvailiable){

      let percentage = Math.round((totalMinutes/totalAvailiable) * 100);

      if(percentage === 0){
        return '0%';
      }

      if(percentage > 100){
        return '100%';
      }

      let calculated = percentage + '%';

      return calculated;

    }
    
    
  return (

    <div className='flex flex-col w-200 min-h-120 h-auto mt-5 mb-5 bg-amber-900 border border-black'>

      <div className='flex flex-row w-full h-20 border-b border-black bg-blue-200'>

        <div className='flex flex-row items-center w-80 h-full'>
          <h3 className='ml-2'>Reading Speed: </h3>
          <select className='ml-1 w-48' value={speed} onChange={(e) => changeSpeed(e.target.value)}>
            <option value="">Select reading speed</option>
            <option value='100'>100 WPM</option>
            <option value='150'>150 WPM</option>
            <option value='200'>200 WPM</option>
            <option value='250'>250 WPM</option>
            <option value='300'>300 WPM</option>
            <option value='350'>350 WPM</option>
            <option value='400'>400 WPM</option>
          </select>
        </div>

        <div className='flex flex-row items-center w-80 h-full'>
          <h3 className='ml-2'>Reading Hours Per Day</h3>
          <select className='ml-1 w-48' value={hours} onChange={(e) => changeHours(e.target.value)}>
            <option value="">Select Hours Per Day</option>
            <option value="1">1 Hour</option>
            <option value="1.5">1 Hour 30 Minutes</option>
            <option value="2">2 Hours</option>
            <option value="2.5">2 Hours 30 Minutes</option>
            <option value="3">3 Hours</option>
            <option value="3.5">3 Hours 30 Minutes</option>
            <option value="4">4 Hours</option>
            <option value="4.5">4 Hours 30 Minutes</option>
            <option value="5">5 Hours</option>
            <option value="5.5">5 Hours 30 Minutes</option>
            <option value="6">6 Hours</option>
            <option value="6.5">6 Hours 30 Minutes</option>
            <option value="7">7 Hours</option>
            <option value="7.5">7 Hours 30 Minutes</option>
            <option value="8">8 Hours</option>
          </select>
        </div>

        <div className='flex flex-row justify-center items-center w-40 h-full'>
          <h3 className=''>31 Days</h3>
        </div>
      </div>

      <div className='flex flex-row justify-center items-center w-full h-20'>
        <div className='flex flex-row justify-start items-center w-160 h-12 bg-white rounded-2xl relative'>
          <div className='absolute left-78'>
            <h3>{`${barPercent}`}</h3>
          </div>
          <div className={`flex flex-row justify-center items-center h-full rounded-xl bg-blue-500`} style={{width: `${barPercent}`}}></div>
        </div>
      </div>

      <div className='flex flex-col justify-start w-full h-84'>

        <div className='flex flex-row justify-center w-full h-10'>
          <h2 className='pl-2 text-white text-lg'>Selected Reading List:</h2>
        </div>

        <div className='flex flex-row justify-center w-full h-72'>
          <div className='w-160 max-h-72 h-auto overflow-y-auto bg-gray-200 border border-black'>
            <BookCalculatorGrid bookList={bookList} deleteBookFromCalculator={deleteBookFromCalculator}/>
          </div>
        </div>

      </div>

      <div className='flex flex-row justify-center w-full h-16'>
        <button className='bg-green-700 text-white'>Export To CSV</button>
      </div>
      
    </div>
  )
}

export default BookCalculator