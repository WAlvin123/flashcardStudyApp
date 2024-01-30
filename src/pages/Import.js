import { saveAs } from "file-saver"
import { useDeckState } from "../components/useDeckState"
import { useEffect, useState } from "react"
import { addDoc, collection, query, where, getDocs, getCollections } from "firebase/firestore"
import { db } from "../config/firestore"
import { getAuth, signOut } from "firebase/auth"


export const Import = () => {
  const [decks, setDecks, getDecks] = useDeckState()
  const [loadCompleteMessage, setLoadCompleteMessage] = useState("")
  const [deckName, setDeckName] = useState('')
  const storedDecks = localStorage.getItem('decks') ? JSON.parse(localStorage.getItem('decks')) : [];
  const user = getAuth().currentUser

  let auth
  if (localStorage.getItem('is_auth') == 'true') {
    auth = getAuth();
  } else {
    auth = getAuth()
    signOut(auth)
  }

  useEffect(() => {
    if (auth.currentUser !== null) {
      getDecks()
    } else {
      const storedDecks = localStorage.getItem('decks')
      if (storedDecks) {
        setDecks(JSON.parse(storedDecks))
      }
    }
  }, [])

  const handleFileSave = async () => {
    if (auth.currentUser !== null) {
      console.log('sign out')
    } else {
      var blob = new Blob([localStorage.decks], { type: "text/plain;charset=utf-8" })
      saveAs(blob, `${deckName}.txt`)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const loadedDecks = JSON.parse(e.target.result)
      const updatedDecks = [];

      storedDecks.forEach(deck => {
        const matchingIndex = loadedDecks.findIndex(loadedDeck => deck.name == loadedDeck.name)
        if (matchingIndex !== -1) {
          const matchingDeck = loadedDecks[matchingIndex]
          matchingDeck.cards.forEach(card => {
            if (deck.cards.some(storedCard => storedCard.front !== card.front && storedCard.back !== card.back)) {
              deck.cards.push(card)
            }
          })
          updatedDecks.push(deck)
          loadedDecks.splice(matchingIndex, 1)
        } else {
          updatedDecks.push(deck)
        }
      })

      loadedDecks.forEach(deck => {
        updatedDecks.push(deck)
      })

      localStorage.setItem('decks', JSON.stringify(updatedDecks))

    }
    reader.readAsText(file)
  }

  const handleImportLocal = () => {
    storedDecks.forEach(async deck => {
      delete deck.id
      const querySnapshot = await getDocs(query(collection(db, user.uid), where('name', '==', deck.name)))

      if (querySnapshot.empty) {
        await addDoc(collection(db, user.uid), deck)
      } else {
        console.log('exists')
      }
    })
  }

  return (
    <div className='import'>
      {auth.currentUser == null && (<div>
        <div>
          <p>(Local storage capabilities only at the moment)</p>
          <h2 className="header">Save and export deck into a txt file</h2>
          <div>
            <input onChange={event => { setDeckName(event.target.value) }} style={{ fontSize: '180%' }} />
            <button onClick={handleFileSave} className="text">Export Deck</button>
          </div>
        </div>
        <div>
          <h2 className="header">Import deck</h2>
          <p className="text">Note: Decks with the same name will be combined <br />
            taking only unique cards from the imported deck</p>
          <input type='file' accept='.txt' onChange={handleFileChange} style={{ fontSize: '180%' }} />
          <h2>
            {loadCompleteMessage}
          </h2>
        </div>
      </div>)}
      {auth.currentUser !== null && (
        <>
          <h1>Import guest decks</h1>
          <p className="text">
            Click on the button below to import <br />
            the decks you have created as a guest
          </p>
          <button onClick={handleImportLocal} className="create">
            Import
          </button>
        </>
      )}
    </div>

  )
}
