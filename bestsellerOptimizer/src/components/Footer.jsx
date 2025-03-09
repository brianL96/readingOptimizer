import React from 'react';
import {FaCopyright} from 'react-icons/fa'

const Footer = () => {
  return (
    <div className='flex flex-col fullFeaturesScreen:flex-row justify-start min-w-96 w-full h-28 mt-10 bg-blue-800 relative z-30'>

        <div className='flex flex-col justify-between w-full fullFeaturesScreen:w-1/2 h-1/2 fullFeaturesScreen:h-full text-white'>
          <div className='flex flex-row justify-center fullFeaturesScreen:justify-start items-center w-full h-1/2'>
            <h3 className='p-3'>Reading Bestsellers Scheduler</h3>
            <FaCopyright className='text-white text-xl'/>
          </div>
          <div className='flex flex-row justify-center fullFeaturesScreen:justify-start items-center w-full h-1/2'>
            <h3 className='p-3'>Brian Lemes</h3>
          </div>
        </div>

        <div className='flex flex-col justify-start h-1/2 fullFeaturesScreen:h-full w-full fullFeaturesScreen:w-1/2 text-white'>
            <div className='flex flex-row justify-center fullFeaturesScreen:justify-end'>
                <h3 className='p-3'>brian.a.lemes.1996@gmail.com</h3>
            </div>
        </div>

    </div>
  )
}

export default Footer