import React, { useEffect, useState } from 'react';
import {IoClose} from 'react-icons/io5';


const BookGridObject = ({title, author, bookCover, wordcount, percentage, deleteBookFromCalculator, amazonLink}) => {

    let [cover, setCover] = useState('#');
    let [count, setCount] = useState(0);
    let [percent, setPercent] = useState('0%');
    let [objectTitle, setObjectTitle] = useState('');
    let [objectAuthor, setObjectAuthor] = useState('');
    let [amazon, setAmazon] = useState('');

    useEffect(() => {

        setCover(bookCover);
        setCount(wordcount);
        setPercent(percentage);
        setObjectTitle(title);
        setObjectAuthor(author);
        setAmazon(amazonLink);
    }, [bookCover, wordcount, percentage, title, author, amazonLink]);

    let deleteBook = (e) => {
        e.preventDefault();
        console.log("Doing work here");
        console.log(`${objectAuthor} ${objectTitle}`);
        deleteBookFromCalculator(objectAuthor, objectTitle);
    }

    let openAmazonLink = (e) => {
        e.preventDefault();
        if(amazon.length === 0){
            return;
        }
        window.open(amazon, '_blank', 'noopener, noreferrer');
    }


  return (
    <div className='flex flex-col justify-start w-32 h-60 border border-gray-500 m-2 relative'>
        <div className='flex flex-row justify-center absolute ml-28 w-6 h-7 z-20 -mt-2 bg-white rounded-3xl'>
            <IoClose onClick={(e) => deleteBook(e)} className='text-red-700 text-3xl cursor-pointer pb-1'/>
        </div>
        <img onClick={(e) => {openAmazonLink(e)}} className='h-48 w-full cursor-pointer' src={cover} alt={`${objectTitle}`}></img>
        <div className='flex flex-col h-12 w-full'>
            <div className='flex flex-row justify-center items-center h-1/2 w-full'>
                <h3 className='text-sm'>{`${count} words`}</h3>
            </div>
            <div className='flex flex-row justify-center items-center h-1/2 w-full'>
                <h3 className='text-sm'>{`${percent} allotted time`}</h3>
            </div>
        </div>   
    </div>
  )
}

export default BookGridObject