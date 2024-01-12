import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useEffect } from "react";
import { useDeckState } from "../components/useDeckState";
import '../styles/Cards.css'
import '../styles/Table.css'
import '../styles/Text.css'

export const Cards = () => {
  useEffect(() => {
    const storedDecks = localStorage.getItem('decks');
    if (storedDecks) {
      setDecks(JSON.parse(storedDecks))
    }
  }, [])

  const [decks, setDecks] = useDeckState()
  const [filteredDeck, setFilteredDeck] = useState([])
  const [filteredDeckIndex, setFilteredDeckIndex] = useState(0)
  const [isItemsVisible, setIsItemsVisible] = useState(false)
  const [formState, setFormState] = useState({
    front: '',
    back: '',
    deck:'------'
  })
  const [editCardsVisible, setEditCardsVisible] = useState(false)
  const [transferVisible, setTransferVisible] = useState(false)
  const [editCard, setEditCard] = useState({})
  const [cardToTransfer, setCardToTransfer] = useState({})
  const [editFront, setEditFront] = useState('')
  const [editBack, setEditBack] = useState('')
  const [targetDeck, setTargetDeck] = useState('------')
  const [errorMessage, setErrorMessage] = useState('')

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
      setErrorMessage("Select a deck")
    } else {
      if (selectedDeck.cards.some((card) => card.front == submission.front
        && card.back == submission.back)) {
        setErrorMessage("A card with the same fields exists in the specified deck")
      } else {
        const newCard = {
          front: submission.front,
          back: submission.back,
          deck: submission.deck,
          id: selectedDeck.cards.length == 0 || selectedDeck.cards[selectedDeck.cards.length - 1].id + 1,
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
          setErrorMessage('')
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

  const completeEdit = () => {
    setDecks(prevDecks => {
      const updatedDecks = prevDecks.map(deck => {
        if (deck.name == editCard.deck) {
          const updatedCards = deck.cards.map(card => {
            if (card.id == editCard.id) {
              if (editFront == '' && editBack == '') {
                return card
              } else if (editFront == '') {
                return { ...card, back: editBack }
              } else if (editBack == '') {
                return { ...card, front: editFront }
              } else return { ...card, front: editFront, back: editBack }
            } else return card
          })
          return { ...deck, cards: updatedCards }
        } else return deck
      })
      localStorage.setItem('decks', JSON.stringify(updatedDecks))
      setEditCardsVisible(false)
      setEditFront('')
      setEditBack('')
      return updatedDecks
    })
  }

  const transferCard = () => {
    if (targetDeck !== '------') {
      const deckIndex = decks.findIndex(deck => targetDeck == deck.name)
      const fronts = decks[deckIndex].cards.map(card => { return card.front })
      const backs = decks[deckIndex].cards.map(card => { return card.back })
      if (!fronts.includes(cardToTransfer.front) && !backs.includes(cardToTransfer.back)) {
        setDecks(prevDecks => {
          const updatedDecks = prevDecks.map(deck => {
            if (deck.name == targetDeck) {
              return { ...deck, cards: [...deck.cards, { ...cardToTransfer, deck: targetDeck, id: Math.random() * 100 }] }
            } else if (deck.name == cardToTransfer.deck) {
              return { ...deck, cards: deck.cards.filter(card => card.id !== cardToTransfer.id) }
            } else return deck
          })
          setTransferVisible(false)
          setTargetDeck('------')
          localStorage.setItem('decks', JSON.stringify(updatedDecks))
          return updatedDecks
        })
      } else {
        console.log('card already exists')
      }
    } else {
      setTransferVisible(false)
    }
  }


  return (
    <div>
      {transferVisible == true && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            <h2>Select the deck you would like to transfer to below</h2>
            <select onChange={event => setTargetDeck(event.target.value)}>
              <option>------</option>
              {decks.map(deck => {
                if (deck.name !== cardToTransfer.deck) {
                  return <option>{deck.name}</option>
                }
              })}
            </select>
            <button className='create' onClick={transferCard}>Confirm changes</button>
          </div>
        </div>
      )}

      {editCardsVisible == true && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            <p>Front: {editCard.front} | Back: {editCard.back} | Deck: {editCard.deck} | ID: {editCard.id}</p>
            <p>Note: If you leave a field empty, then that field will remain uneditted</p>
            <input placeholder={editCard.front} onChange={(event) => { setEditFront(event.target.value) }} />
            <input placeholder={editCard.back} onChange={(event) => { setEditBack(event.target.value) }} />
            <button className='create' onClick={completeEdit}>Submit edits</button>
          </div>
        </div>
      )}

      <div class='cards'>
        <h2 className="header">
          Create card
        </h2>
        <div className="centered-container">
        <form onSubmit={handleSubmit(createCard)} className="submit">
          <input {...register('front')}
            value={formState.front}
            onChange={(event) => { setFormState({ ...formState, front: event.target.value }) }}
            placeholder="Front..."
            className="front-input"
          />
          <textarea {...register('back')}
            value={formState.back}
            onChange={(event) => { setFormState({ ...formState, back: event.target.value }) }}
            placeholder="Back..."
            className="back-input"
          />
          <select {...register('deck')} onChange={(event => {
            setFormState({...formState, deck: event.target.value})
          })}>
            <option>------</option>
            {decks.map((deck) => {
              return (
                <option>
                  {deck.name}
                </option>
              )
            })}
          </select>
          <input type="submit" value='Create' className="create"/>
        </form>
        </div>
        <p style={{ color: 'red' }}>{errorMessage}</p>
        <div>
          <h2 className="header">
            View cards
          </h2>
          <p className="text">
            Select a deck you would like to view the cards of
          </p>
        </div>
        <select onChange={(event => {
          if (event.target.value !== '------') {
            handleChange(event.target.value)
            setIsItemsVisible(true)
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
          <div className="centered-container">
          <table className="view-cards">
            <thead>
              <th className="table-row">Front</th>
              <th className="table-row">Back</th>
              <th className="table-row">Settings</th>
            </thead>
            <tbody>
              {decks[filteredDeckIndex].cards.map((card) => {
                return (
                  <tr style={{backgroundColor:'gray'}}>
                    <td className="table-details">{card.front}</td>
                    <td className="table-details">{card.back}</td>
                    <div className="card-settings">
                    <button className='create' 
                     onClick={() => { removeCard(card.id) }}>Remove</button>
                    <button className='create' 
                     onClick={() => {
                      setEditCardsVisible(true)
                      setEditCard(card)
                    }}>Edit</button>
                    <button  className='create' 
                    onClick={() => {
                      setTransferVisible(true)
                      setCardToTransfer(card)
                    }}>Transfer</button>
                    </div>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  )
}