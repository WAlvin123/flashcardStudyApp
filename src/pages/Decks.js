import { useState, useEffect } from "react";
import { useDeckState } from "../components/useDeckState";
import '../styles/Decks.css'
import '../styles/Table.css'
import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup';


export const Decks = () => {
  useEffect(() => {
    const storedDecks = localStorage.getItem('decks');
    if (storedDecks) {
      setDecks(JSON.parse(storedDecks))
    }
  }, [])

  const [decks, setDecks] = useDeckState()
  const [inputValue, setInputValue] = useState('')
  const [isItemsVisible, setIsItemsVisible] = useState(false)
  const [editDecksVisible, setEditDecksVisible] = useState(false)
  const [editDeck, setEditDeck] = useState({})
  const [editDeckName, setEditDeckName] = useState('')
  const [combineState, setCombineState] = useState(0)
  const [mainDeck, setMainDeck] = useState({})
  const [subDeck, setSubDeck] = useState({})
  const [duplicateMessage, setDuplicateMessage] = useState('')

  const createDeck = () => {
    const deckNames = decks.map(deck => { return deck.name })

    if (deckNames.includes(inputValue)) {
      setDuplicateMessage(`A deck with the same name already exists`)
    } else if (inputValue !== '') {
      const newDeck = {
        name: inputValue,
        cards: [],
        id: decks.length == 0 || decks[decks.length - 1].id + 1,
        column: 0
      }
      const updatedDecks = [...decks, newDeck]
      localStorage.setItem('decks', JSON.stringify(updatedDecks))
      setDecks(updatedDecks)
      setInputValue('')
      setDuplicateMessage('')
    } else {
      setDuplicateMessage('')

    }
  }

  const removeDeck = (id) => {
    if (isItemsVisible == false) {
      setDecks(prevDecks => {
        const updatedDecks = prevDecks.filter(decks => decks.id !== id);
        localStorage.setItem('decks', JSON.stringify(updatedDecks));
        return updatedDecks;
      });
    }

  }

  const completeEdit = () => {
    const deckNames = decks.map(deck => { return deck.name })

    if (deckNames.includes(editDeckName)) {
      setDuplicateMessage('A deck with the same name already exists')
    } else if (editDeckName !== '') {
      setDecks(prevDecks => {
        const updatedDecks = prevDecks.map(deck => {
          if (deck.id == editDeck.id) {
            return { ...deck, name: editDeckName }
          } else return deck
        })
        setEditDecksVisible(false)
        localStorage.setItem('decks', JSON.stringify(updatedDecks))
        return updatedDecks
      })
      setDuplicateMessage('')
    } else {
      setEditDecksVisible(false)
      setDuplicateMessage('')

    }
  }

  const combineDecks = () => {
    if (mainDeck.cards !== undefined && subDeck.cards !== undefined) {
      const cardFronts = mainDeck.cards.map((card) => { return card.front })
      const cardBacks = mainDeck.cards.map((card) => { return card.back })

      let maxID = 0
      mainDeck.cards.forEach(card => {
        if (card.id > maxID) {
          maxID = card.id
        }
      })

      subDeck.cards.forEach(card => {
        if (!cardFronts.includes(card.front) && !cardBacks.includes(card.back)) {
          mainDeck.cards.push({ ...card, id: maxID++ })
        }
      })
      const updatedDecks = decks.filter(deck => deck.id !== subDeck.id)
      setDecks(updatedDecks)
      setCombineState(0)
      setMainDeck({})
      setSubDeck({})
      localStorage.setItem('decks', JSON.stringify(updatedDecks))
    } else console.log('select something')
  }

  return (
    <div className="total">
      {editDecksVisible == true && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            <p>{editDeck.name}</p>
            <input placeholder="New deck name..." onChange={(event) => setEditDeckName(event.target.value)} />
            <button onClick={completeEdit}>Submit edit</button>
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
              className="text-box"
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

            {combineState == 0 && (
              <div>
                <button onClick={() => { setCombineState(1) }} className="create">
                  Combine decks
                </button>
                <h2></h2>
              </div>
            )
            }

            {combineState !== 0 && (
              <div>
                <p>After combining, the combined deck <br />will retain the main deck properties</p>
                <p>Main deck: {mainDeck.name}</p>
                <p>Sub deck: {subDeck.name}</p>
                <button onClick={combineDecks}>Confirm</button>
                <button onClick={() => { setCombineState(0) }}>Return</button>
                <h2></h2>
              </div>
            )
            }

            <div className="centered-container">
            <table class='view-deck' style={{ backgroundColor: 'black' }}>
              <th className="table-row">Name</th>
              <th className="table-row">Amount of Cards</th>
              <th className="table-row">Settings</th>
              {decks.map((deck) => {
                return (
                  <tr style={{backgroundColor:'gray'}}>
                    <td className="table-details">{deck.name}</td>
                    <td className="table-details">{deck.cards.length}</td>
                      <div className="settings">
                      <button onClick={
                        () => { removeDeck(deck.id) }
                      }
                      className="create">Remove</button>
                      <button onClick={() => {
                        setEditDecksVisible(true)
                        setEditDeck(deck)
                      }}
                      className="create">Edit</button>
                      </div>

                    {combineState == 1 && (
                      <button onClick={() => {
                        setCombineState(2)
                        setMainDeck({ ...deck })
                      }}
                      className="create"
                      >
                        Set main deck
                      </button>
                    )
                    }

                    {(combineState == 2 && deck.id !== mainDeck.id) && (
                      <button onClick={() => {
                        setSubDeck(deck)
                      }}
                      className="create"
                      >
                        Set sub deck
                      </button>
                    )
                    }
                  </tr>
                )
              })}
            </table>
            </div>
          </div>
      </div>
  )
}