import { saveAs } from "file-saver"
import { useDeckState } from "../components/useDeckState"
import { useEffect } from "react"

export const Import = () => {
  const [decks, setDecks] = useDeckState()

  useEffect(() => {
    const storedDecks = localStorage.getItem('decks');
    if (storedDecks) {
      setDecks(JSON.parse(storedDecks))
    }
  }, [])

  const handleFileSave = () => {
    var blob = new Blob([localStorage.decks], {type: "text/plain;charset=utf-8"})
    saveAs(blob, "decks.txt")
  }

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
      <div>
      <h2 style={{paddingTop:'20px'}}>Import deck through txt file here</h2>
      <input type='file'/>
      </div>
      <div>
        <h2 style={{paddingTop:'20px'}}>Export deck into a txt file here</h2>
        <button onClick={handleFileSave}>Export Deck</button>
      </div>
    </div>
  )
}