import './App.css';
import AppRoutes from './routes/AppRoutes';
import Layout from './components/layout/Layout';

function App() {
  return (
    <Layout subtitle='Ferretería'>
      <AppRoutes />
    </Layout>
  );
}

export default App;
