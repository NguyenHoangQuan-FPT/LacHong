import { useEffect } from 'react'
import './App.css'
import { BrowserRouter, useLocation } from 'react-router-dom'
import RouterComponent from './routers/RouterComponent'
import 'bootstrap-icons/font/bootstrap-icons.css';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {

  return (
    <BrowserRouter>
      <ScrollToTop />
      <RouterComponent></RouterComponent>
    </BrowserRouter>
  )
}

export default App
