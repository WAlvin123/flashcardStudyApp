import { useState, useEffect } from "react";
import { useDeckState } from "../components/useDeckState";
import { Link } from "react-router-dom";
import "./Home.css"

export const Home = () => {
  const [totalCards, setTotalCards] = useState(0)
  const [decks, setDecks] = useDeckState()


  useEffect(() => {
    const storedDecks = JSON.parse(localStorage.getItem('decks'));
    let sum = 0

    if (storedDecks) {
      setDecks(storedDecks)
    }

    storedDecks.forEach(deck => {
      sum += deck.cards.length
    })
    setTotalCards(sum)
  }, [])

  return (
    <div>
      <p style={{fontSize:40}}>Select a study method</p>
    <div className="centered-container">
      <div className="study-select">
          <Link to={'/simple'} style={{fontSize:25}}>SIMPLE STUDY</Link>
          <Link to={'/matching'} style={{fontSize:25}}>MATCHING</Link>
          <Link to={'/multiplechoice'} style={{fontSize:25}}>MULTIPLE CHOICE</Link>
          <Link to={'/shortanswer'} style={{fontSize:25}}>SHORT ANSWER</Link>
      </div>
    </div>
    <h1>______________________________________FILLER DIVIDER_________________________________________</h1>
    <h1>
        Total decks: {decks.length}
      </h1>
      <h1>
        Total cards: {totalCards}
      </h1>
    </div>
  )
}