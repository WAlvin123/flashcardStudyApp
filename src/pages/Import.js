import { saveAs } from "file-saver"
import { useDeckState } from "../components/useDeckState"
import { useEffect, useState } from "react"

// TODO: Append decks rather than overwrite all decks.

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
    var blob = new Blob([localStorage.decks], {type: "text/plain;charset=utf-8"})
    saveAs(blob, `${deckName}.txt`)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();

    reader.onload = (e) => {
      const loadedFileObject = JSON.parse(e.target.result)
      const localStorageObject = localStorage.getItem('decks') ? JSON.parse(localStorage.getItem('decks')) : [];
      let newID = localStorageObject.length + 1

      const newDecks = loadedFileObject.map(deck => {
        newID++
        return {...deck, name:`${deck.name} [IMPORTED]`, id: newID}
      })
      const updatedDecks = [...localStorageObject, ...newDecks]
      setLoadedDeck(updatedDecks)
      localStorage.setItem('decks', JSON.stringify(updatedDecks))
      setLoadCompleteMessage("The decks have been successfully loaded")
    }
    reader.readAsText(file)
  }

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
      <div>
      <h2 style={{paddingTop:'20px'}}>Import deck through txt</h2>
      <h3>Note: Decks with the same name will not be loaded</h3>
      <input type='file' accept='.txt' onChange={handleFileChange}/>
      <h2>---------------------------------</h2>
      <div>
        {loadedDeck.map((deck) => {
          return <div>{deck.name} | {deck.cards.length} cards</div>
        })}
      </div>
      <h2>
        {loadCompleteMessage}
      </h2>
      </div>
      <div>
        <h2 style={{paddingTop:'20px'}}>Save and export deck into a txt file</h2>
        <div>
        <input onChange={event => {setDeckName(event.target.value)}}/>
        <button onClick={handleFileSave}>Export Deck</button>
        </div>
      </div>
    </div>
  )
}