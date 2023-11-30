import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useEffect } from "react";
import { useDeckState } from "../components/useDeckState";
import "./Home.css"

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


  const createDeck = () => {
    if (decks.some(deck => deck.name == inputValue)) {
      console.log('Deck with the same name already exists')
    } else {
      const newDeck = {
        name: inputValue,
        cards: [],
        id: decks.length == 0 || decks[decks.length - 1].id + 1,
        column: 0
      }
      const updatedDecks = [...decks, newDeck]
      localStorage.setItem('decks', JSON.stringify(updatedDecks))
      setDecks(updatedDecks)
    }
  }

  const removeDeck = (id) => {
    setDecks(prevDecks => {
      const updatedDecks = prevDecks.filter(decks => decks.id !== id);
      localStorage.setItem('decks', JSON.stringify(updatedDecks));
      return updatedDecks;
    });
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

    if (submission.deck == undefined) {
      console.log('Invalid deck')
    } else {
      if (selectedDeck.cards.some((card) => card.front == submission.front
        && card.back == submission.back)) {
        console.log('card exists')
      } else {
        const newCard = {
          front: submission.front,
          back: submission.back,
          id: selectedDeck.cards.length == 0 || selectedDeck.cards[selectedDeck.cards.length - 1].id + 1
        }

        const updatedDeck = { ...selectedDeck, cards: [...selectedDeck.cards, newCard] }
        const updatedDecks = [...decks.slice(0, deckIndex), updatedDeck, ...decks.slice(deckIndex + 1)]
        setDecks(updatedDecks)
        localStorage.setItem('decks', JSON.stringify(updatedDecks))
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
        if (deck.name == filteredDeck.name) {
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

  return (
    <div>
      <h2>Home</h2>
      <p>A simple flashcard study application where you can choose between <br />
        multiple choice, matching the two sides of the card, and short answer.
      </p>
      <div class='container'>
        <div class='decks'>
          <h2>Create Deck</h2>
          <input onChange={(event) => { setInputValue(event.target.value) }} />
          <button onClick={createDeck}>Create</button>
          <h2>View Deck</h2>
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
            <input {...register('front')} />
            <input {...register('back')} />
            <select {...register('deck')}>
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
          {isItemsVisible && (
            <table style={{ backgroundColor: "black" }}>
              <th style={{ backgroundColor: "black", color: "white" }}>Front</th>
              <th style={{ backgroundColor: "black", color: "white" }}>Back</th>
              {decks[filteredDeckIndex].cards.map((card) => {
                return (
                  <tr style={{ backgroundColor: "white" }}>
                    <td>{card.front}</td>
                    <td>{card.back}</td>
                    <button onClick={() => { removeCard(card.id) }}>Remove Card</button>
                  </tr>
                )
              })}
            </table>
          )}
        </div>
      </div>
    </div>
  )
}