import { useNavigate } from 'react-router-dom';
import { Setting } from "@src/components/icons/Setting";
import { SETTINGS } from '@src/routes/paths';

export const ButtonSettings = () => {
  const navigate = useNavigate();

  return (
    <button
      data-testid="settings"
      onClick={() => navigate(SETTINGS)}
      className='flex justify-center items-center p-2 rounded-lg hover:bg-gray-500 hover:bg-opacity-20 transition-colors'

      >
        <Setting size="26" color='#B0B0CE' />
      </button>
  );
};
