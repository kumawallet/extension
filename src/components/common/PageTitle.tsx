import { FC } from 'react'
import { FiChevronLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface PageTitleProps {
  title: string;
  canNavigateBack?: boolean;
  containerClassName?: string;
}

export const PageTitle: FC<PageTitleProps> = ({
  title,
  canNavigateBack,
  containerClassName
}) => {
  const navigate = useNavigate();

  return (
    <div className={`flex gap-3 items-center mb-7 ${containerClassName}`}>
      {
        canNavigateBack && (
          <FiChevronLeft
            size={26}
            className="cursor-pointer"
            onClick={() => navigate(-1)}
          />
        )
      }

      <p className="text-xl">{title}</p>
    </div>
  )
}
