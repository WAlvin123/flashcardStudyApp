import { useState, useEffect } from "react";
import { useDeckState } from "../components/useDeckState";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css"

export const Home = () => {
  const [decks, setDecks] = useDeckState()
  const navigate = useNavigate()
  let sum = 0


  useEffect(() => {
    const storedDecks = localStorage.getItem('decks');
    if (storedDecks) {
      setDecks(JSON.parse(storedDecks))
    }
  }, [])

  return (
    <div className="selection">
      <p style={{ fontSize: 40 }}>Select a study method</p>
      <div className="centered-container">
        <div>
          <div>
            <button className='study-button' onClick={() => { navigate('/memorization') }}>
              MEMORIZATION
            </button>
            <button className='study-button' onClick={() => { navigate('/matching') }}>
                MATCHING
            </button>
          </div>

          <div>
            <button className='study-button' onClick={() => { navigate('/multiplechoice') }}>
              MULTIPLE CHOICE
            </button>
            <button className='study-button' onClick={() => { navigate('/shortanswer') }}>
                SHORT ANSWER
            </button>
          </div>
        </div>
      </div>
      <h1>Total decks: {decks.length}</h1>
    </div>
  )
}