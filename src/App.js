import "./App.css"
import { HashRouter as Router, Routes, Route, Links } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Cards } from './pages/Cards';
import { MultipleChoice } from './pages/MultipleChoice';
import { ShortAnswer } from './pages/ShortAnswer';
import { Matching } from './pages/Matching';
import { Import } from './pages/Import';
import { SimpleStudy } from './pages/SimpleStudy';
import { Decks } from './pages/Decks';
import { SignIn } from "./pages/SignIn";
import { Register } from "./pages/Register";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";

function App() {

  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/decks' element={<Decks/>}/>
          <Route path='/cards' element={<Cards/>}/>
          <Route path='/memorization' element={<SimpleStudy/>}/>
          <Route path='/matching' element={<Matching/>}/>
          <Route path='/multiplechoice' element={<MultipleChoice/>}/>
          <Route path='/shortanswer' element={<ShortAnswer/>}/>
          <Route path='/importdeck' element={<Import/>}/>
          <Route path='/signin' element={<SignIn/>}/>
          <Route path='register' element={<Register/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
