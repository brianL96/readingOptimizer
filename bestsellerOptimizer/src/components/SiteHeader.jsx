import React from 'react'

const SiteHeader = () => {
  return (

    <div className='flex flex-col justify-start items-center min-h-52 h-auto w-160 fullBoxScreen:w-200'>

        <div className='flex flex-row justify-start fullBoxScreen:justify-center items-center min-h-16 w-full fullBoxScreen:w-1/2'>
            <h3 className='text-3xl text-black font-medium'>Optimize Reading Best Sellers</h3>
        </div>

        <div className='flex flex-col fullBoxScreen:flex-row justify-between items-center fullBoxScreen:items-start min-h-10 h-auto w-full fullBoxScreen:w-4/5'>

            <div className='flex flex-col justify-start w-full h-auto fullBoxScreen:w-1/2'>
                <div className='flex flex-row flex-wrap justify-start min-h-7 h-auto w-full mt-1 p-2'>
                    <h3 className='text-base text-gray-600 font-medium'>Pick books from several bestseller lists</h3>
                </div>
                <div className='flex flex-row flex-wrap justify-start min-h-7 h-auto w-full mt-1 p-2'>
                    <h3 className='text-base text-gray-600 font-medium'>Easy to find unique books: they only appear once in each category</h3>
                </div>
            </div>

            <div className='flex flex-row flex-wrap justify-start min-h-7 h-auto w-full fullBoxScreen:w-1/2 mt-1 p-2'>
                <h3 className='text-base text-gray-600 font-medium'>Wordcounts: based on audiobook length (provided by Spotify) and audiobook reading speed of 131 words per minute</h3>
            </div>
        </div>

    </div>
  )
}

export default SiteHeader