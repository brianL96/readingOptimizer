import React, { useEffect, useState } from 'react';
import {IoIosAddCircle} from 'react-icons/io';

const ListItem = ({image, audiobookLength, addBookToCalculator, index, readingSpeed, dailyHours, bookName, bookAuthor, bookAmazonLink}) => {

  let [bookCover, setBookCover] = useState('#');
  let [audioLength, setAudioLength] = useState('0');
  let [wordcount, setWordCount] = useState(0);
  let [listIndex, setListIndex] = useState(-1);
  let [speed, setSpeed] = useState(200);
  let [hoursReading, setHoursReading] = useState(1);
  let [author, setAuthor] = useState('');
  let [name, setName] = useState('');
  let [amazonLink, setAmazonLink] = useState('');
  

  useEffect(() => {

    setBookCover(image);
    let minutes = Math.round(audiobookLength/60000);
    let count = minutes * 131;
    let hours = 0;
    while(minutes >= 60){
      hours++;
      minutes = minutes - 60;
    }
    
    setAudioLength(`${hours} Hours ${minutes} minutes`);
    setWordCount(count);
    setListIndex(index);
    setSpeed(readingSpeed);
    setHoursReading(dailyHours);
    setName(bookName);
    setAuthor(bookAuthor);
    setAmazonLink(bookAmazonLink);


  }, [image, audiobookLength, index, readingSpeed, dailyHours, bookName, bookAuthor, bookAmazonLink]);

  let addBook = (e) => {

    console.log(amazonLink);

    e.preventDefault();

    let bookObject = {
      author: author,
      title: name,
      bookCover: bookCover,
      minutesToRead: 0,
      wordcount: wordcount,
      percentage: '0%',
      amazonLink: amazonLink
    };
    
    addBookToCalculator(bookObject);
  }

  function getTimeToRead(){

    if(wordcount === 0){
      return null;
    }

    let minutes =  Math.round(wordcount/(speed));

    let hours = 0;

    while(minutes >= 60){
      hours++;
      minutes = minutes - 60;
    }

    return `${speed} WPM: ${hours} hrs ${minutes} mins`

  }

  

  function getDaysToRead(){

    if(wordcount === 0){
      return null;
    }

    //let totalMinutesAvailiable = 31 * hoursReading * speed;
    let minutes =  Math.round(wordcount/(speed));
    //let percentage = Math.round((minutes/totalMinutesAvailiable) * 100);
    let daily = hoursReading * 60;
    
    let hourlySpeed = 60;
    let days = 0;
    let hours = 0;

    while(minutes >= daily){
      minutes = minutes - daily;
      days++;
      if(daily > minutes){
        break;
      }
    }

    while(minutes >= hourlySpeed){
      hours++;
      minutes = minutes - hourlySpeed;
      if(hourlySpeed > minutes){
        break;
      }
    }

    return `${days} Days ${hours} hrs ${minutes} mins`;


  } 



  return (
    <div className={`flex flex-col justify-start h-auto min-h-60 w-60 mr-2 bg-gray-100 ${(listIndex === 0) ? 'border-r' : 'border-x'} border-black`}>

      <div className='flex flex-row justify-start h-20 border-b border-r border-black bg-gray-200 w-60'>
        <div className='flex flex-row justify-center w-4/5 p-1 max-h-20 overflow-y-auto'>
          {`${name} by ${author}`}
        </div>
        <div className='flex flex-row justify-center items-center w-1/5'>
          <IoIosAddCircle onClick={(e) => addBook(e)} className='w-5/6 h-3/4 text-green-700 rounded-lg cursor-pointer'/>
        </div>
      </div>

      <div className='flex flex-row justify-center items-center h-62 w-60 bg-sky-700 border-r border-black'>
        <div className='h-60 w-40'>
          <img className='h-full w-full' src={bookCover} alt="Nothing Found"></img>
        </div>
      </div>

      <div className='flex flex-col justify-start w-60 h-32 text-sm border-t border-r border-black bg-gray-200'>
        <div className='flex flex-row justify-start w-full h-auto'>
          <h3 className='px-1 pb-1 pt-2'>{`Audiobook: ${audioLength}`}</h3>
        </div>
        <div className='flex flex-row justify-start w-full h-auto'>
          <h3 className='p-1'>{`Est. ${wordcount} words`}</h3>
        </div>
        <div className='flex flex-row justify-start w-full h-auto'>
          <h3 className='p-1'>{`${(getTimeToRead() === null) ? '' : getTimeToRead()}`}</h3>
        </div>
        <div className='flex flex-row justify-start w-full h-auto'>
          <h3 className='p-1'>{`${(getDaysToRead() === null) ? '' : getDaysToRead()}`}</h3>
        </div>
      </div>

    </div>
  )
}

export default ListItem