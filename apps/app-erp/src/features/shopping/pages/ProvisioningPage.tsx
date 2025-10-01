import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProvisioningPage.css';
import TitleDescription from '../../../components/common/TitleDescription';
import Input from '../../../components/common/Input';
import { IoSearch } from 'react-icons/io5';

const pageInfo = {
  title: 'Provisionamiento',
  description: 'Define umbrales de stock para reabastecimiento automático',
};

function ProvisioningPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  return (
    <div className='Provisioning-page'>
      <div className='Provisioning-header'>
        <TitleDescription
          title={pageInfo.title}
          description={pageInfo.description}
          titleSize={32}
          descriptionSize={16}
        />
        <div className='Provisioning-search'>
          <Input
            placeholder='Buscar en compras...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<IoSearch color='var(--pri-500)' />}
            className='search-input'
          />
        </div>
      </div>
    </div>
  );
}

export default ProvisioningPage;
