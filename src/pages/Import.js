import { saveAs } from "file-saver"
import { useDeckState } from "../components/useDeckState"
import { useEffect, useState } from "react"

export const Import = () => {
  const [decks, setDecks] = useDeckState()
  const [loadCompleteMessage, setLoadCompleteMessage] = useState("")
  const [deckName, setDeckName] = useState('')

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
      localStorage.setItem('decks', e.target.result)
      setLoadCompleteMessage("The decks have been successfully loaded")
    }
    reader.readAsText(file)
  }

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
      <div>
      <h2 style={{paddingTop:'20px'}}>Import deck through txt</h2>
      <h3>Warning: When you load a set of decks, your original decks will be overwritten</h3>
      <input type='file' accept='.txt' onChange={handleFileChange}/>
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