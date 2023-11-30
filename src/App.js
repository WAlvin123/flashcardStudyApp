import './App.css';
import { HashRouter as Router, Routes, Route, Links } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { MultipleChoice } from './pages/MultipleChoice';
import { ShortAnswer } from './pages/ShortAnswer';
import { Matching } from './pages/Matching';

function App() {

  return (
    <div className="App">
      <h2>Study Application</h2>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='matching' element={<Matching/>}/>
          <Route path='/multiplechoice' element={<MultipleChoice/>}/>
          <Route path='/shortanswer' element={<ShortAnswer/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
