import { useState } from "react"

export const useDeckState = () => {
  const [decks, setDecks] = useState([{
    name: '',
    cards: [],
    id: 0
  }])

  return [decks, setDecks]
}
