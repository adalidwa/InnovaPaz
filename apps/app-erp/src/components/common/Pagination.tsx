import './Pagination.css';
import Button from './Button';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemName?: string;
  className?: string;
}

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemName = 'elementos',
  className = '',
}: PaginationProps) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`paginationContainer ${className}`}>
      <div className='paginationInfo'>
        Mostrando {startIndex + 1}-{endIndex} de {totalItems} {itemName}
      </div>
      <div className='paginationControls'>
        <Button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          variant='secondary'
          className='paginationButton'
        >
          <IoChevronBack />
        </Button>
        <span className='paginationText'>
          Página {currentPage} de {totalPages}
        </span>
        <Button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          variant='secondary'
          className='paginationButton'
        >
          <IoChevronForward />
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
