import React, { useEffect, useState } from 'react';
import {IoClose} from 'react-icons/io5';

const BookGridObject = ({title, author, bookCover, wordcount, percentage, deleteBookFromCalculator}) => {

    let [cover, setCover] = useState('#');
    let [count, setCount] = useState(0);
    let [percent, setPercent] = useState('0%');
    let [objectTitle, setObjectTitle] = useState('');
    let [objectAuthor, setObjectAuthor] = useState('');

    useEffect(() => {

        setCover(bookCover);
        setCount(wordcount);
        setPercent(percentage);
        setObjectTitle(title);
        setObjectAuthor(author);

    }, [bookCover, wordcount, percentage, title, author]);

    let deleteBook = (e) => {
        e.preventDefault();
        console.log("Doing work here");
        console.log(`${objectAuthor} ${objectTitle}`);
        deleteBookFromCalculator(objectAuthor, objectTitle);
    }



  return (
    <div className='flex flex-col justify-start w-32 h-60 border border-gray-500 m-2 relative'>
        <div className='flex flex-row justify-center absolute ml-25 w-6 h-6 bg-gray-300 z-20'>
            <IoClose onClick={(e) => deleteBook(e)} className='text-red-700 text-2xl cursor-pointer'/>
        </div>
        <img className='h-48 w-full' src={cover} alt="Nothing Found"></img>
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