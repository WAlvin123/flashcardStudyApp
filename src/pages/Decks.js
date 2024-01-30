import { useState, useEffect } from "react";
import { useDeckState } from "../components/useDeckState";
import '../styles/Decks.css'
import '../styles/Table.css'
import { collection, getDocs, query, addDoc, doc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firestore"
import { getAuth, signOut } from "firebase/auth";

// re-implement local storage functionality for non-logged in users

export const Decks = () => {
  let auth
  if (localStorage.getItem('is_auth') == 'true') {
    auth = getAuth();
  } else {
    auth = getAuth()
    signOut(auth)
  }
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user)
        getDecks()
        localStorage.setItem('signed-in', true)
      } else {
        const storedDecks = localStorage.getItem('decks')
        if (storedDecks) {
          setDecks(JSON.parse(storedDecks))
        }
      }
    })
    return unsubscribe
  }, [])

  const [decks, setDecks, getDecks] = useDeckState()
  const [inputValue, setInputValue] = useState('')
  const [editDecksVisible, setEditDecksVisible] = useState(false)
  const [editDeck, setEditDeck] = useState({})
  const [editDeckName, setEditDeckName] = useState('')
  const [duplicateMessage, setDuplicateMessage] = useState('')
  let userCollectionRef
  if (auth.currentUser !== null) {
    userCollectionRef = collection(db, auth.currentUser.uid)
  }


  const createDeck = async () => {
    const deckNames = decks.map(deck => { return deck.name })
    if (deckNames.includes(inputValue)) {
      setDuplicateMessage(`A deck with the same name already exists`)
    } else if (inputValue !== '') {
      const newDeck = {
        name: inputValue,
        cards: [],
        column: 0,
        ...(auth.currentUser === null && { localid: Math.random() })
      }
      if (auth.currentUser !== null) {
        try {
          await addDoc(collection(db, auth.currentUser.uid), { ...newDeck })
        } catch (error) {
          console.log(error)
        }
        setInputValue('')
        setDuplicateMessage('')
        getDecks()
      } else {
        setDecks(prevDecks => {
          const updatedDecks = [...prevDecks, newDeck]
          localStorage.setItem('decks', JSON.stringify(updatedDecks))
          return updatedDecks
        })
        setInputValue('')
        setDuplicateMessage('')
      }
    } else {
      setDuplicateMessage('')
    }
  }

  const removeDeck = (id) => {
    if (auth.currentUser !== null) {
        deleteDoc(doc(db, auth.currentUser.uid, id)).then(()=> {
          getDecks()
        })
    } else {
      setDecks(prevDecks => {
        const updatedDecks = prevDecks.filter(deck => {
          return deck.localid !== id
        })
        localStorage.setItem('decks', JSON.stringify(updatedDecks))
        return updatedDecks
      })
    }
  }

  const completeEdit = async () => {
    const deckNames = decks.map(deck => { return deck.name })
    if (auth.currentUser !== null) {
      if (deckNames.includes(editDeckName)) {
        setDuplicateMessage('A deck with the same name already exists')
      } else if (editDeckName !== '') {
        await setDoc(doc(db, auth.currentUser.uid, editDeck.id), {
          name: editDeckName,
          cards: editDeck.cards
        })
        getDecks()
        setEditDecksVisible(false)
        setDuplicateMessage('')
      } else {
        setEditDecksVisible(false)
        setDuplicateMessage('')
      }
    } else {
      if (decks.some(deck => deck.name == editDeckName)) {
        console.log('A deck with the same name already exists')
      } else {
        setDecks(prevDecks => {
          const updatedDecks = prevDecks.map(deck => {
            if (deck.id == editDeck.id) {
              if (editDeckName !== '') {
                return { ...deck, name: editDeckName }
              } else {
                return deck
              }
            } else {
              return deck
            }
          })
          return updatedDecks
        })
      }
    }
    setEditDecksVisible(false)
  }


  return (
    <div className="total">
      {editDecksVisible == true && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            <p className="header">{editDeck.name}</p>
            <div>
              <input placeholder="New deck name..." onChange={(event) => setEditDeckName(event.target.value)}
                className="edit"
              />
            </div>
            <button
              onClick={completeEdit}
              className="create"
            >Submit edit</button>
            <p>{duplicateMessage}</p>
          </div>
        </div>
      )}

      <div class='decks'>
        <h2 className="header">Create Deck</h2>
        <div className='centered-container'>
          <div className="deck-submit">
            <input
              placeholder="Deck name..."
              onChange={(event) => { setInputValue(event.target.value) }}
              value={inputValue}
              className="text"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  createDeck()
                }
              }}
            />
            <button onClick={createDeck} className="create">Create</button>
            <p>{duplicateMessage}</p>
          </div>
        </div>
        <h2 className="header">Decks</h2>

        <div className="centered-container">
          <table class='view-deck'>
            <th className="table-row">Name</th>
            <th className="table-row">Amount of Cards</th>
            <th className="table-row">Settings</th>
            {decks.map((deck) => {
              return (
                <tr style={{ backgroundColor: 'white' }}>
                  <td className="table-details">{deck.name}</td>
                  <td className="table-details">{deck.cards.length}</td>
                  <div className="settings">
                    <button
                      onClick={
                        () => {
                          if (auth.currentUser !== null) {
                            removeDeck(deck.id)
                          } else {
                            removeDeck(deck.localid)
                          }
                        }
                      }
                      className="settings-button"
                    >Remove</button>
                    <button
                      onClick={() => {
                        setEditDecksVisible(true)
                        setEditDeck(deck)
                      }}
                      className="settings-button"
                    >Edit</button>
                  </div>
                </tr>
              )
            })}
          </table>
        </div>
      </div>
    </div>
  )
}
