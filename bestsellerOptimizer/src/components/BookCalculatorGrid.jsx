import React, { useEffect, useState } from 'react';
import BookGridObject from './BookGridObject';

const BookCalculatorGrid = ({bookList, deleteBookFromCalculator}) => {

    let [books, setBooks] = useState([]);

    useEffect(() => {
        setBooks([...bookList]);
    }, [bookList]);

    function loadList(){

        let maxPerRow = 4;
        let amountInRow = 0;
        let index = 0;
        let length = books.length;
        let bigArr = [];
        let smallArr = [];
        let rowValue = 0;

        while(index < length){

            smallArr.push(
                <BookGridObject key={`BookGridObject-${books[index].id}}`} title={books[index].title} author={books[index].author} bookCover={books[index].bookCover} wordcount={books[index].wordcount} percentage={books[index].percentage} deleteBookFromCalculator={deleteBookFromCalculator} amazonLink={books[index].amazonLink}/>
            );

            amountInRow++;
            index++;

            if(amountInRow >= maxPerRow || index >= length){
                bigArr.push(
                    <div key={`BookGridRow-${rowValue}`} className='flex flex-row justify-start w-150 h-auto overflow-x-hidden'>
                        {[...smallArr]}
                    </div>
                );
                amountInRow = 0;
                smallArr = [];
                rowValue++;
            }
        }

        return [...bigArr];
    }


    return (
        <div className='h-auto w-150'>
            {loadList()}
        </div>
    )
}

export default BookCalculatorGrid