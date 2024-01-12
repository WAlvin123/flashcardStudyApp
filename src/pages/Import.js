import { saveAs } from "file-saver"
import { useDeckState } from "../components/useDeckState"
import { useEffect, useState } from "react"

// TODO: Fully comprehend the newly implemented import function.

export const Import = () => {
  const [decks, setDecks] = useDeckState()
  const [loadCompleteMessage, setLoadCompleteMessage] = useState("")
  const [deckName, setDeckName] = useState('')
  const [loadedDeck, setLoadedDeck] = useState([])

  useEffect(() => {
    const storedDecks = localStorage.getItem('decks');
    if (storedDecks) {
      setDecks(JSON.parse(storedDecks))
    }
  }, [])

  const handleFileSave = () => {
    var blob = new Blob([localStorage.decks], { type: "text/plain;charset=utf-8" })
    saveAs(blob, `${deckName}.txt`)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();

    reader.onload = (e) => {
      const storedDecks = localStorage.getItem('decks') ? JSON.parse(localStorage.getItem('decks')) : [];
      const loadedDecks = JSON.parse(e.target.result)
      const updatedDecks = [];

      storedDecks.forEach(deck => {
        const matchingIndex = loadedDecks.findIndex(loadedDeck => loadedDeck.name == deck.name)
        const storedFronts = deck.cards.map(card => {return card.front})
        const storedBacks = deck.cards.map(card => {return card.back})
        let maxID = 0
        deck.cards.forEach(card => {
          if (maxID < card.id) {
            maxID = card.id
          }
        })
        if (matchingIndex !== -1) {
          const matchingDeck = loadedDecks[matchingIndex]
          matchingDeck.cards.forEach(card => {
            if (!storedFronts.includes(card.front) && !storedBacks.includes(card.back)) {
              deck.cards.push({...card, id:++maxID})
            }
          })
          updatedDecks.push({...deck, id: Math.random() * 100})
          loadedDecks.splice(matchingIndex, 1)
        } else {
          updatedDecks.push(deck)
        }
      })

      loadedDecks.forEach(deck => {
        updatedDecks.push(deck)
      })
      localStorage.setItem('decks', JSON.stringify(updatedDecks))
      setLoadCompleteMessage('Decks have been succesfully loaded')
    }
    reader.readAsText(file)
  }

  return (
    <div className='import'>
      <div>
        <h2 className="header">Save and export deck into a txt file</h2>
        <div>
          <input onChange={event => { setDeckName(event.target.value) }} />
          <button onClick={handleFileSave}>Export Deck</button>
        </div>
      </div>
      <div>
        <h2 className="header">Import deck through txt</h2>
        <p className="text">Note: Decks with the same name will be combined <br />
          taking only unique cards from the imported deck</p>
        <input type='file' accept='.txt' onChange={handleFileChange} />
        <h2>
          {loadCompleteMessage}
        </h2>
      </div>
    </div>
  )
}