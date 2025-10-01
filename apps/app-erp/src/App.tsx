import './App.css';
import AppRoutes from './routes/AppRoutes';
import Input from './components/common/Input';

function App() {
  return (
    <>
      <AppRoutes />
      <Input label='Descripción' placeholder='Descripción del producto...' />
    </>
  );
}

export default App;
