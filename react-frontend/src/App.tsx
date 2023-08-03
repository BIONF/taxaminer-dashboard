import { TaxaminerDashboard } from './components';

// Stylesheet
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  // Info on selected gene
  return (
    // <TaxaminerDashboard base_url={window.location.href.split(":").slice(1,2).join("")}/>
    <TaxaminerDashboard base_url={"127.0.0.1"}/>
  );
}

export default App;
