import { TaxaminerDashboard } from './components/dashboard';

// Stylesheet
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState } from 'react';

function App() {
  // Info on selected gene
  return (
    <TaxaminerDashboard base_url='127.0.0.1'/>
  );
}

export default App;
