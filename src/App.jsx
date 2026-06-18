import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import NfeList from './pages/NfeList';
import NfeDetail from './pages/NfeDetail';
import XmlCentral from './pages/XmlCentral';
import Reports from './pages/Reports';
import Empresa from './pages/Empresa';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { SearchProvider } from './context/SearchContext';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <SearchProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="nfe" element={<NfeList />} />
                <Route path="nfe/:id" element={<NfeDetail />} />
                <Route path="xml" element={<XmlCentral />} />
                <Route path="relatorios" element={<Reports />} />
                <Route path="empresa" element={<Empresa />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </SearchProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
