import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useEffect } from "react";
import { useDeckState } from "../components/useDeckState";
import '../styles/Cards.css'
import '../styles/Table.css'
import '../styles/Text.css'
import { doc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firestore"
import { getAuth, signOut } from "firebase/auth";

export const Cards = () => {
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

  const [decks, setDecks, getDecks] = useDeckState()
  const [filteredDeck, setFilteredDeck] = useState([])
  const [filteredDeckIndex, setFilteredDeckIndex] = useState(0)
  const [isItemsVisible, setIsItemsVisible] = useState(false)
  const [formState, setFormState] = useState({
    front: '',
    back: '',
    deck: '------'
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

    if (auth.currentUser !== null) {
      if (selectedDeck == undefined) {
        setErrorMessage("Select a deck")
      } else {
        if (selectedDeck.cards.some(card => card.front == submission.front
          && card.back == submission.back)) {
          setErrorMessage("A card with the same fields exists in the specified deck")
        } else {
          const newCard = {
            front: submission.front,
            back: submission.back,
            deck: submission.deck,
            id: selectedDeck.cards.length == 0 || selectedDeck.cards[selectedDeck.cards.length - 1].id + 1
          }
          const updatedCards = [...selectedDeck.cards, newCard]
          setDoc(doc(db, auth.currentUser.uid, selectedDeck.id), {
            name: selectedDeck.name,
            cards: updatedCards
          }).then(() => {
            getDecks()
          })
          setFormState({ ...formState, front: '', back: '' })
          setErrorMessage('')
        }
      }
    } else {
      if (selectedDeck == undefined) {
        setErrorMessage('Select a deck')
      } else {
        if (selectedDeck.cards.some(card => card.front == submission.front && card.back == submission.back))
        {
          setErrorMessage('A card with the same fields exists in the specified deck')
        } else {
          const newCard = {
            front: submission.front,
            back: submission.back,
            deck: submission.deck,
            id: selectedDeck.cards.length == 0 || selectedDeck.cards[selectedDeck.cards.length - 1].id + 1
          }
          const updatedCards = [...selectedDeck.cards, newCard]
          setDecks(prevDecks => {
            const updatedDecks = prevDecks.map(deck => {
              if (deck.name == selectedDeck.name) {
                return { ...deck, cards: updatedCards }
              } else {
                return deck
              }
            })
            localStorage.setItem('decks', JSON.stringify(updatedDecks))
            return updatedDecks
          })
        }
      }
    }
  }

  const handleChange = (selectedDeck) => {
    const filteredDeck = decks.find((deck) => deck.name === selectedDeck)
    const filteredDeckIndex = decks.indexOf(filteredDeck)
    setFilteredDeck(filteredDeck)
    setFilteredDeckIndex(filteredDeckIndex)
    console.log(filteredDeck)
  }

  const removeCard = (id) => {
    if (auth.currentUser !== null) {
      const updatedCards = decks[filteredDeckIndex].cards.filter((card) => {
        return card.id !== id
      })
      setDecks(decks.map(deck => {
        if (deck.id == filteredDeck.id) {
          return { ...deck, cards: updatedCards }
        } else {
          return deck
        }
      }))
      setDoc(doc(db, auth.currentUser.uid, filteredDeck.id), {
        name: filteredDeck.name,
        cards: updatedCards
      }).then(() => {
        getDecks()
      })
    } else {
      setDecks(prevDecks => {
        const updatedDecks = prevDecks.map(deck => {
          if (deck.id == filteredDeck.id) {
            const updatedCards = deck.cards.filter(card => 
              card.id !== id
            )
            return {...deck, cards:updatedCards}
          } else {
            return deck
          }
        })
        localStorage.setItem('decks', JSON.stringify(updatedDecks))
        return updatedDecks
      })
    }
  };

  const completeEdit = () => {
    const editCardIndex = decks.findIndex(deck => deck.name == editCard.deck)
    if (auth.currentUser !== null) {
      const updatedCards = decks[editCardIndex].cards.map(card => {
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
      decks[editCardIndex].cards = updatedCards
      setDoc(doc(db, auth.currentUser.uid, decks[editCardIndex].id), {
        name: decks[editCardIndex].name,
        cards: updatedCards
      })
      setEditCardsVisible(false)
      setEditFront('')
      setEditBack('')
    } else {
      setDecks(prevDecks => {
        const updatedDecks = prevDecks.map(deck => {
          if (deck.name == editCard.deck) {
            const updatedCards = deck.cards.map(card => {
              if (card.id == editCard.id) {
                if (editFront !== '' && editBack !== '') {
                  return {...card, front:editFront, back:editBack}
                } else if (editFront !=='') {
                  return {...card, front:editFront}
                } else if (editBack !=='') {
                  return {...card, back:editBack}
                } else {
                  return card
                }
              } else return card
            })
            return {...deck, cards: updatedCards}
          } else {
            return deck
          }
        })
        return updatedDecks
      })
      setEditCardsVisible(false)
    }
  }

  const transferCard = () => {
    if (auth.currentUser !== null) {
      if (targetDeck !== '------') {
        const targetIndex = decks.findIndex(deck => targetDeck == deck.name)
        const transferredIndex = decks.findIndex(deck => cardToTransfer.deck == deck.name)
        const fronts = decks[targetIndex].cards.map(card => { return card.front })
        const backs = decks[targetIndex].cards.map(card => { return card.back })
        if (!fronts.includes(cardToTransfer.front) && !backs.includes(cardToTransfer.back)) {
          const updatedCards = [...decks[targetIndex].cards, { ...cardToTransfer, deck: targetDeck, id: Math.random() * 100 }]
          const updatedCards2 = decks[transferredIndex].cards.filter(card => card.id !== cardToTransfer.id)
          decks[targetIndex].cards = updatedCards
          decks[transferredIndex].cards = updatedCards2
          setTransferVisible(false)
          setDoc(doc(db, auth.currentUser.uid, decks[transferredIndex].id), {
            name: decks[transferredIndex].name,
            cards: updatedCards2
          })
          setDoc(doc(db, auth.currentUser.uid, decks[targetIndex].id), {
            name: decks[targetIndex].name,
            cards: updatedCards
          })
          setTargetDeck('------')
        } else {
          console.log('card already exists')
        }
      } else {
        setTransferVisible(false)
      }
    } else {
      console.log('implement again')
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
            <p className="text">Front: {editCard.front} | Back: {editCard.back} | Deck: {editCard.deck}</p>
            <p className="text">Note: If you leave a field empty, then that field will remain uneditted</p>
            <div>
              <input
                placeholder={editCard.front}
                onChange={(event) => { setEditFront(event.target.value) }}
                className="edit"
              />
              <input
                placeholder={editCard.back}
                onChange={(event) => { setEditBack(event.target.value) }}
                className="edit"
              />
            </div>
            <button className='create' onClick={completeEdit}>Submit edits</button>
          </div>
        </div>
      )}

      <div class='cards'>
        <h2 className="header">
          Create Card
        </h2>
        <div className="centered-container">
          <form onSubmit={handleSubmit(createCard)} className="submit">
            <input {...register('front')}
              value={formState.front}
              onChange={(event) => { setFormState({ ...formState, front: event.target.value }) }}
              placeholder="Front..."
              className="text"
            />
            <textarea {...register('back')}
              value={formState.back}
              onChange={(event) => { setFormState({ ...formState, back: event.target.value }) }}
              placeholder="Back..."
              className="text"
            />
            <select {...register('deck')} onChange={(event => {
              setFormState({ ...formState, deck: event.target.value })
            })}
              className="text"
            >
              <option>------</option>
              {decks.map((deck) => {
                return (
                  <option>
                    {deck.name}
                  </option>
                )
              })}
            </select>
            <input type="submit" value='Create' className="create" />
          </form>
        </div>
        <p style={{ color: 'red' }}>{errorMessage}</p>
        <div>
          <h2 className="header">
            View Cards
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
        )}
          className="text"
        >
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
                    <tr style={{ backgroundColor: 'white' }}>
                      <td className="table-details">{card.front}</td>
                      <td className="table-details">{card.back}</td>
                      <div className="card-settings">
                        <button className='settings-button'
                          onClick={() => { removeCard(card.id) }}>Remove</button>
                        <button className='settings-button'
                          onClick={() => {
                            setEditCardsVisible(true)
                            setEditCard(card)
                          }}>Edit</button>
                        <button className='settings-button'
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