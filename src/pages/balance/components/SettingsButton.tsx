import { useNavigate } from 'react-router-dom';
import { BsGear } from 'react-icons/bs';
import { Setting  } from "@src/components/icons/Setting";

export const ButtonSettings = () => {
  const navigate = useNavigate();

  return (
    <div>
      <button 
      onClick={ () => navigate('/settings')}
      className='flex justify-center items-center p-2 rounded-lg hover:bg-gray-500 hover:bg-opacity-20 transition-colors'
      >
        <Setting size="24" color='#B0B0CE' />
      </button>
    </div>
  );
};
