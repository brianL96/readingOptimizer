import React, { useEffect, useState } from 'react';
import {IoMdArrowDropdown} from "react-icons/io";

const HeaderDropdown = ({title, items, defaultValue, changeFunction, changeHeadersOpen, headerOpen, index}) => {

    let [selectedValue, setSelectedValue] = useState(-1);
    let [list, setList] = useState([]);
    let [listTitle, setListTitle] = useState('');
    let [listIndex, setListIndex] = useState(-1);
    let [hiddenStatus, setHiddenStatus] = useState('hidden');

    useEffect(() => {

        if(selectedValue === -1){
            setSelectedValue(defaultValue);
        }

        setListTitle(title);
        


        if(items === undefined || items === null){
            return;
        }

        setList([...items]);
        
        setHiddenStatus(headerOpen);
        setListIndex(index);


    }, [title, items, defaultValue, headerOpen, index]);

    function switchHiddenStatus(e){
        e.preventDefault();
        if(hiddenStatus === 'hidden'){
            //setHiddenStatus('');
            changeHeadersOpen(listIndex, '');
        }
        else if(hiddenStatus === ''){
            //setHiddenStatus('hidden');
            changeHeadersOpen(listIndex, 'hidden');
        }
    }

    function changeSelectedValue(e, display, value){
        //let value = e.currentTarget.getAttribute('value');
        setSelectedValue(display);
        //setHiddenStatus('hidden');
        changeHeadersOpen(listIndex, 'hidden');
        changeFunction(value);
        //console.log(`Look here: ${value}`);
    }

    function getList(){

        let arr = [];

        if(list.length > 0){
            arr.push(
                <div key={`ListTitle-${listTitle}`} className='flex flex-row justify-center items-center w-full h-8 text-black bg-gray-200'>
                    <h3>{listTitle}</h3>
                </div>
            );
        }

        list.forEach((element) => {
            arr.push(
                <div key={`ListTitle-${element.display}${element.value}`} value={element.value} onClick={(e) => {changeSelectedValue(e, element.display, element.value)}} className='flex flex-row justify-start items-center w-full h-8 bg-white text-black hover:bg-gray-700 hover:text-white cursor-pointer'>
                    <h3 className='p-1'>{element.display}</h3>
                </div>
            );
        });
        return arr;
    }





  return (
    <div className='flex flex-col justify-start relative'>
        <div onClick={(e) => {switchHiddenStatus(e)}} className='flex flex-row justify-between items-center w-48 h-6 bg-white m-1 cursor-pointer'>
            <h3 className='p-1'>{selectedValue}</h3>
            <IoMdArrowDropdown/>
        </div>
        <div className={`ml-1 mt-8 w-48 max-h-36 absolute bg-white rounded-md ${hiddenStatus} overflow-y-auto z-50 overscroll-none`}>
            {getList()}
        </div>

    </div>
  )
}

export default HeaderDropdown