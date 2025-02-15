import DotLoader from 'react-spinners/DotLoader';

const LoaderCard = () => {

  return (
    <div className='flex flex-row justify-center items-center h-114 min-w-28'>
      <DotLoader color={'blue'}/>
    </div>
  )
}

export default LoaderCard