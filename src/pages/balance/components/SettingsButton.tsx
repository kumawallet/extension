import { useNavigate } from 'react-router-dom';
import { BsGear } from 'react-icons/bs';
import {  Button } from "@src/components/common";

export const ButtonSettings = () => {
  const navigate = useNavigate();

  return (
    <div>
      <button 
      onClick={ () => navigate('/settings')}
      className='flex justify-center items-center p-2 rounded-lg hover:bg-gray-500 hover:bg-opacity-20 transition-colors'
      >
        <BsGear size={24} />
      </button>
    </div>
  );
};
