import { TaxaminerDashboard } from './components/dashboard';

// Stylesheet
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  // Info on selected gene
  return (
    <TaxaminerDashboard base_url={window.location.href.split(":").slice(1,2).join("")}/>
  );
}

export default App;
