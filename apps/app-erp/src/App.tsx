import './App.css';
import AppRoutes from './routes/AppRoutes';
import Input from './components/common/Input';

function App() {
  return (
    <>
      <AppRoutes />
      <Input type='text' placeholder='Ingresa tu nombre' />
    </>
  );
}

export default App;
