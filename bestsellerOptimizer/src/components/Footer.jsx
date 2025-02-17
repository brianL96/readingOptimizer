import React from 'react';
import {FaCopyright} from 'react-icons/fa'

const Footer = () => {
  return (
    <div className='flex flex-row justify-start min-w-96 w-full h-28 bg-blue-800 mt-10'>
        <div className='flex flex-col justify-between w-1/2 text-white'>
          <div className='flex flex-row justify-start items-center w-full h-full'>
            <h3 className='p-3'>Reading Bestsellers Optimizer</h3>
            <FaCopyright className='text-white text-xl'/>
          </div>
            <h3 className='p-3'>Brian Lemes</h3>
        </div>
        <div className='flex flex-col justify-start w-1/2 text-white'>
            <div className='flex flex-row justify-end'>
                <h3 className='p-3'>brian.a.lemes.1996@gmail.com</h3>
            </div>
        </div>
    </div>
  )
}

export default Footer