import { useState, useEffect } from "react";
import { useDeckState } from "../components/useDeckState";
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
      <h2>Home</h2>
      <p>A simple flashcard study application where you can choose between <br />
        multiple choice, matching the two sides of the card, and short answer. <br />
      </p>
      <h1>
        Total decks: {decks.length}
      </h1>
      <h1>
        Total cards: {totalCards}
      </h1>
      <p>
        W.I.P user stats
      </p>
    </div>
  )
}