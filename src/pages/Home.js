import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useEffect } from "react";
import { useDeckState } from "../components/useDeckState";
import "./Home.css"
// TODO: Make deck removable even when viewing (Or make deck unremovable when viewing)

export const Home = () => {
  useEffect(() => {
    const storedDecks = localStorage.getItem('decks');
    if (storedDecks) {
      setDecks(JSON.parse(storedDecks))
    }
  }, [])

  const [decks, setDecks] = useDeckState()
  const [inputValue, setInputValue] = useState('')
  const [filteredDeck, setFilteredDeck] = useState([])
  const [filteredDeckIndex, setFilteredDeckIndex] = useState(0)
  const [isItemsVisible, setIsItemsVisible] = useState(false)
  const [formState, setFormState] = useState({
    front: '',
    back: ''
  })
  const [editCardsVisible, setEditCardsVisible] = useState(false)
  const [editDecksVisible, setEditDecksVisible] = useState(false)
  const [editCard, setEditCard] = useState({})
  const [editDeck, setEditDeck] = useState({})
  const [editFront, setEditFront] = useState('')
  const [editBack, setEditBack] = useState('')
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

  };

  const cardSchema = yup.object().shape({
    front: yup.string().required(),
    back: yup.string().required(),
    deck: yup.string().required()
  })

  const { register, handleSubmit } = useForm({
    resolver: yupResolver(cardSchema)
  })

  const createCard = (submission) => {
    const deckIndex = decks.findIndex(deck => submission.deck === deck.name)
    const selectedDeck = decks[deckIndex]

    if (selectedDeck == undefined) {
      console.log('Invalid deck')
    } else {
      if (selectedDeck.cards.some((card) => card.front == submission.front
        && card.back == submission.back)) {
        console.log('card exists')
      } else {
        const newCard = {
          front: submission.front,
          back: submission.back,
          deck: submission.deck,
          id: selectedDeck.cards.length == 0 || selectedDeck.cards[selectedDeck.cards.length - 1].id + 1
        }
        setDecks(prevDecks => {
          const updatedDecks = prevDecks.map((deck) => {
            if (submission.deck == deck.name) {
              const updatedCards = [...deck.cards, newCard]
              return { ...deck, cards: updatedCards }
            } else {
              return deck
            }
          })
          setFormState({ ...formState, front: '', back: '' })
          localStorage.setItem('decks', JSON.stringify(updatedDecks))
          return updatedDecks
        })
      }
    }
  }

  const handleChange = (selectedDeck) => {
    const filteredDeck = decks.find((deck) => deck.name === selectedDeck)
    const filteredDeckIndex = decks.indexOf(filteredDeck)
    setFilteredDeck(filteredDeck)
    setFilteredDeckIndex(filteredDeckIndex)
  }

  const removeCard = (id) => {
    setDecks(prevDecks => {
      const updatedDecks = prevDecks.map((deck) => {
        if (deck.id == filteredDeck.id) {
          const updatedCards = deck.cards.filter((card) => {
            return card.id !== id
          })
          return { ...deck, cards: updatedCards };
        } else {
          return deck
        }
      })
      localStorage.setItem('decks', JSON.stringify(updatedDecks))
      return updatedDecks
    })
  };

  const completeEditDeck = () => {
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
  }

  const completeEdit = () => {
    setDecks(prevDecks => {
      const updatedDecks = prevDecks.map(deck => {
        if (deck.name == editCard.deck) {
          const updatedCards = deck.cards.map(card => {
            if (card.id == editCard.id) {
              return { ...card, front: editFront, back: editBack }
            } else return card
          })
          return { ...deck, cards: updatedCards }
        } else return deck
      })
      localStorage.setItem('decks', JSON.stringify(updatedDecks))
      setEditCardsVisible(false)
      return updatedDecks
    })
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
          mainDeck.cards.push({ ...card, id: maxID++})
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
            <button onClick={completeEditDeck}>Submit edit</button>
          </div>
        </div>
      )}

      {editCardsVisible == true && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            <p>Front: {editCard.front} | Back: {editCard.back} | Deck: {editCard.deck} | ID: {editCard.id}</p>
            <input placeholder="New front..." onChange={(event) => { setEditFront(event.target.value) }} />
            <input placeholder="New back..." onChange={(event) => { setEditBack(event.target.value) }} />
            <button onClick={completeEdit}>Submit edits</button>
          </div>
        </div>
      )}

      <div>
        <h2>Home</h2>
        <p>A simple flashcard study application where you can choose between <br />
          multiple choice, matching the two sides of the card, and short answer.
        </p>
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

              {decks.map((deck) => {
                return (
                  <tr>
                    <td style={{ backgroundColor: 'white' }}>{deck.name}</td>
                    <td style={{ backgroundColor: 'white' }}>{deck.cards.length}</td>
                    <button onClick={
                      () => { removeDeck(deck.id) }
                    }>Remove Deck</button>
                    <button onClick={() => {
                      setEditDecksVisible(true)
                      setEditDeck(deck)
                    }}>Edit Deck</button>

                    {combineState == 1 && (
                      <button onClick={() => {
                        setCombineState(2)
                        setMainDeck({...deck})
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
          <div class='cards'>
            <h2>
              Create card
            </h2>
            <form onSubmit={handleSubmit(createCard)}>
              <input {...register('front')} value={formState.front}
                onChange={(event) => { setFormState({ ...formState, front: event.target.value }) }} />
              <input {...register('back')} value={formState.back}
                onChange={(event) => { setFormState({ ...formState, back: event.target.value }) }} />
              <select {...register('deck')}>
                <option>------</option>
                {decks.map((deck) => {
                  return (
                    <option>
                      {deck.name}
                    </option>
                  )
                })}
              </select>
              <input type="submit" />
            </form>

            <h2>
              View card
            </h2>
            <select onChange={(event => {
              if (event.target.value !== '------') {
                handleChange(event.target.value)
                setIsItemsVisible(true)
                console.log(filteredDeck)
              } else {
                setIsItemsVisible(false)
              }
            }
            )}>
              <option>------</option>
              {decks.map((deck) => {
                return (
                  <option>
                    {deck.name}
                  </option>
                )
              })}
            </select>
            <p></p>
            {isItemsVisible && (
              <table style={{ backgroundColor: "black" }}>
                <thead>
                  <th style={{ backgroundColor: "black", color: "white" }}>Front</th>
                  <th style={{ backgroundColor: "black", color: "white" }}>Back</th>
                </thead>
                <tbody>
                  {decks[filteredDeckIndex].cards.map((card) => {
                    return (
                      <tr style={{ backgroundColor: "white" }}>
                        <td>{card.front}</td>
                        <td>{card.back}</td>
                        <button onClick={() => { removeCard(card.id) }}>Remove Card</button>
                        <button onClick={() => {
                          setEditCardsVisible(true)
                          setEditCard(card)
                        }}>Edit Card</button>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}