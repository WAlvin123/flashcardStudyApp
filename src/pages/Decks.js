import { useState, useEffect } from "react";
import { useDeckState } from "../components/useDeckState";
import "./Home.css"

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


  const createDeck = () => {
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
    if (editDeckName !== '') {
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
    } else {
      setEditDecksVisible(false)
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
    <div>
      {editDecksVisible == true && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            <p>{editDeck.name}</p>
            <input placeholder="New deck name..." onChange={(event) => setEditDeckName(event.target.value)} />
            <button onClick={completeEdit}>Submit edit</button>
          </div>
        </div>
      )}

      <div>
        <div class='container'>
          <div class='decks'>
            <h2>Create Deck</h2>
            <div>
              <input onChange={(event) => { setInputValue(event.target.value) }} value={inputValue} />
              <button onClick={createDeck}>Create</button>
            </div>
            <h2>Decks</h2>

            {combineState == 0 && (
              <div>
                <button onClick={() => { setCombineState(1) }}>
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

            <table class='view-deck' style={{ backgroundColor: 'black' }}>
              <th style={{ width: '150px', backgroundColor: 'black', color: "white" }}>Name</th>
              <th style={{ width: '150px', backgroundColor: 'black', color: "white" }}>Amount of Cards</th>
              <th style={{ width: '100px', backgroundColor: 'black', color: "white" }}>Settings</th>


              {decks.map((deck) => {
                return (
                  <tr>
                    <td style={{ backgroundColor: 'white' }}>{deck.name}</td>
                    <td style={{ backgroundColor: 'white' }}>{deck.cards.length}</td>
                    <td style={{ backgroundColor: 'white' }}>
                      <button onClick={
                        () => { removeDeck(deck.id) }
                      }>Remove</button>
                      <button onClick={() => {
                        setEditDecksVisible(true)
                        setEditDeck(deck)
                      }}>Edit</button>
                    </td>

                    {combineState == 1 && (
                      <button onClick={() => {
                        setCombineState(2)
                        setMainDeck({ ...deck })
                      }}>
                        Set main deck
                      </button>
                    )
                    }

                    {(combineState == 2 && deck.id !== mainDeck.id) && (
                      <button onClick={() => {
                        setSubDeck(deck)
                      }}>
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
    </div>
  )
}