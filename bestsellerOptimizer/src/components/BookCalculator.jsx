import React, { useEffect, useState } from 'react';
import BookCalculatorGrid from './BookCalculatorGrid';
import HeaderDropdown from './HeaderDropdown';


const BookCalculator = ({booksInCalculator, setReadingSpeed, setDailyHours, setMonthSize, deleteBookFromCalculator}) => {

    let [speed, setSpeed] = useState('200');
    let [hours, setHours] = useState('1');
    let [monthDays, setMonthDays] = useState('31');
    let [barText, setBarText] = useState('0%');
    let [barPercent, setBarPercent] = useState('0%');
    let [barColor, setBarColor] = useState('bg-blue-600');
    let [bookList, setBookList] = useState([]);
    let [exportFile, setExportFile] = useState([]);
    let [headersOpen, setHeadersOpen] = useState(['hidden', 'hidden', 'hidden']);
    
    
    useEffect(() => {
      
      let tempList = booksInCalculator;

      if(tempList === undefined || tempList === null){
        return;
      }

      let totals = updateMinutesToRead(speed, hours, monthDays, tempList);

      setBarPercent(getPercentageFilled(totals.totalMinutes, totals.totalAvailiable));

      //setBookList([...tempList]);

    }, [booksInCalculator]);


    let changeDays = (value) => {
      if(value === ''){return;}
      setMonthDays(value);
      setMonthSize(parseInt(value));
      let totals = updateMinutesToRead(speed, hours, value, bookList);
      setBarPercent(getPercentageFilled(totals.totalMinutes, totals.totalAvailiable));
    }

    let changeSpeed = (value) => {
      if(value === ''){return;}
      setSpeed(`${value}`);
      setReadingSpeed(parseInt(value));
      let totals = updateMinutesToRead(value, hours, monthDays, bookList);
      setBarPercent(getPercentageFilled(totals.totalMinutes, totals.totalAvailiable));
    }

    let changeHours = (value) => {
      if(value === ''){return;}
      setHours(`${value}`);
      setDailyHours(parseFloat(value));
      let totals = updateMinutesToRead(speed, value, monthDays, bookList);
      setBarPercent(getPercentageFilled(totals.totalMinutes, totals.totalAvailiable));
    }

    function updateMinutesToRead(speedOfReading, hoursDedicated, daysInMonth, listOfBooks){

      let returnValue = {
        totalMinutes : 0,
        totalAvailiable: parseFloat(hoursDedicated) * parseInt(daysInMonth) * 60
      };

      listOfBooks.forEach((book) => {
        book.minutesToRead = Math.round(book.wordcount/parseInt(speedOfReading));
        book.percentage = getIndividualPercentage(book.wordcount, parseInt(speedOfReading), parseFloat(hoursDedicated), parseInt(daysInMonth));
        returnValue.totalMinutes = returnValue.totalMinutes + book.minutesToRead;
      });

      let temp = listOfBooks;
      setBookList([...temp]);

      return returnValue;

    }

    function getIndividualPercentage(wordcount, speedOfReading, hoursDedicated, daysInMonth){

      if(wordcount === 0){
        return '0%';
      }

      let totalMinutesAvailiable = daysInMonth * hoursDedicated * 60;
      let minutes =  Math.round(wordcount/(speedOfReading));
      return Math.round((minutes/totalMinutesAvailiable) * 100) + '%';

    }

    function getPercentageFilled(totalMinutes, totalAvailiable){

      let percentage = Math.round((totalMinutes/totalAvailiable) * 100);

      if(percentage === 0){
        setBarColor('bg-blue-600');
        setBarText('%0');
        return '0%';
      }

      if(percentage > 100){
        setBarColor('bg-red-700');
        setBarText('Over 100%');
        return '100%';
      }
      
      let calculated = percentage + '%';
      setBarColor('bg-blue-600');
      setBarText(calculated);
      return calculated;

    }

    function getHoursString(minutes){
      let h = 0;
      let m = minutes;
      while(m > 60){
        h++;
        m = m - 60;
      }
      if(h === 0){
        return `${m} minutes`;
      }

      return `${h} hour(s) ${m} minutes`;
    }

    function fileStuff(e){
      e.preventDefault();
      if(bookList.length === 0){
        return;
      }

      let header = `Author,Title,Wordcount,Time To Read At ${speed} WPM, Portion Of Reading Over ${monthDays} Days At ${hours} Hour(s) Per Day, Amazon Link\n`;
      let line = header;
      bookList.forEach((element) => {
        let bigLine = line.concat('', `${element.author},${element.title},${element.wordcount},${getHoursString(element.minutesToRead)},${element.percentage},${element.amazonLink}\n`);
        line = bigLine;
        console.log(element);
      });

      let blob = new Blob( [line], {type:'text/csv;charset=utf-8'});
      let url = URL.createObjectURL(blob);

      let arr = [
        <a key={`ExportFileKey`} className='cursor-pointer text-blue-200 underline' href={url} download={'justAnExample.csv'}>readingSchedule.csv</a>
      ];

      setExportFile([...arr]);

      //let link = document.createElement('a');
      //link.href = url;
      //link.setAttribute('download', 'justAnExample.txt');
      //fileHolder.current.appendChild([...arr]);
      //document.body.appendChild(link);
      //link.click();
    }

    
    function changeHeadersOpen(index, value){

      let list = ['hidden', 'hidden', 'hidden'];
      list[index] = value;
      setHeadersOpen([...list]);
    }
    
    
  return (

    <div className='flex flex-col w-160 fullBoxScreen:w-200 min-h-120 h-auto mt-5 mb-5 bg-amber-900 border border-black'>

      <div className='flex flex-col justify-start w-full bg-blue-500 h-20'>

      <div className='flex flex-row justify-around items-center w-full h-full'>

        <div className='flex flex-col justify-start'>
          <h3 className='text-lg text-white font-semibold'>Words Per Minute:</h3>
          <HeaderDropdown title={'Select reading speed'} items={[{display:'100 WPM', value:'100'}, {display:'150 WPM', value:'150'}, {display:'200 WPM', value:'200'}, {display:'250 WPM', value:'250'}, {display:'300 WPM', value:'300'}, {display:'350 WPM', value:'350'}, {display:'400 WPM', value:'400'}]} defaultValue={'200 WPM'} changeFunction={changeSpeed} changeHeadersOpen={changeHeadersOpen} headerOpen={headersOpen[0]} index={0}/>
        </div>

        <div className='flex flex-col justify-start'>
          <h3 className='text-lg text-white font-semibold'>Time Per Day:</h3>
          <HeaderDropdown title={'Select hours per day'} items={[{display:'1 Hour', value:'1'}, {display:'1 Hour 30 Minutes', value:'1.5'}, {display:'2 Hours', value:'2'}, {display:'2 Hours 30 Minutes', value:'2.5'}, {display:'3 Hours', value:'3'}, {display:'3 Hours 30 Minutes', value:'3.5'}, {display:'4 Hours', value:'4'}, {display:'4 Hours 30 Minutes', value:'4.5'}, {display:'5 Hours', value:'5'}, {display:'5 Hours 30 Minutes', value:'5.5'}, {display:'6 Hours', value:'6'}, {display:'6 Hours 30 Minutes', value:'6.5'}, {display:'7 Hours', value:'7'}, {display:'7 Hours 30 Minutes', value:'7.5'}, {display:'8 Hours', value:'8'}]} defaultValue={'1 Hour'} changeFunction={changeHours} changeHeadersOpen={changeHeadersOpen} headerOpen={headersOpen[1]} index={1}/>
        </div>
        <div className='flex flex-col justify-start'>
          <h3 className='text-lg text-white font-semibold'>Days In The Month:</h3>
          <HeaderDropdown title={'Select number of days'} items={[{display:'28 Days', value:'28'}, {display:'29 Days', value:'29'}, {display:'30 Days', value:'30'}, {display:'31 Days', value:'31'}]} defaultValue={'31 Days'} changeFunction={changeDays} changeHeadersOpen={changeHeadersOpen} headerOpen={headersOpen[2]} index={2}/>
        </div>
      </div>

      </div>

      <div className='flex flex-row justify-center items-center w-full h-20'>
        <div className='flex flex-row justify-start items-center w-120 fullBoxScreen:w-160 h-12 bg-white rounded-2xl relative'>
          <div className='absolute left-56 fullBoxScreen:left-78'>
            <h3>{`${barText}`}</h3>
          </div>
          <div className={`flex flex-row justify-center items-center h-full rounded-xl ${barColor}`} style={{width: `${barPercent}`}}></div>
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
        <div className='flex flex-row justify-start w-150 fullBoxScreen:w-160 h-16'>
          <div>
            <button onClick={(e) => {fileStuff(e)}} className='flex flex-row justify-center items-center bg-green-700 w-28 h-12 text-white rounded-lg'>Export To CSV</button>
          </div>
          <div className='flex flex-row justify-center items-center ml-1 w-80 h-12'>
            {exportFile}
            <h3 className='ml-3 text-white'>{(exportFile.length > 0) ? '  (Click To Download)' : ''}</h3>
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default BookCalculator