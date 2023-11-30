import { useDeckState } from "../components/useDeckState"
import { useEffect, useState } from "react"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from 'yup'
import { useForm } from "react-hook-form"

export const ShortAnswer = () => {
  const [decks, setDecks] = useDeckState()
  const [studySide, setStudySide] = useState('')
  const [randomCards, setRandomCards] = useState([])
  const [filteredDeck, setFilteredDeck] = useState([])
  const [userInput, setUserInput] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)

  useEffect(() => {
    const storedDecks = localStorage.getItem('decks');
    if (storedDecks) {
      setDecks(JSON.parse(storedDecks))
    }
  }, [])

  const handleSelect = (deckname) => {
    const selectedDeck = decks.find(deck => deckname === deck.name)
    setFilteredDeck(selectedDeck)
  }

  const submissionSchema = yup.object().shape({
    studyAmount: yup.number().required().min(0)
  })

  const { register, handleSubmit } = useForm({
    resolver: yupResolver(submissionSchema)
  })

  const onSubmit = (submission) => {
    const smallerArray = []
    if (filteredDeck.cards !== undefined) {
      if (submission.studyAmount - 1 < filteredDeck.cards.length) {
        while (smallerArray.length < submission.studyAmount) {
          const random = Math.floor(Math.random() * filteredDeck.cards.length)
          if (!smallerArray.includes(filteredDeck.cards[random])) {
            smallerArray.push(filteredDeck.cards[random])
          }
        }
      }
      setRandomCards(smallerArray)
    }
  }

  const checkAnswer = () => {
    if (studySide == 'front') {
      if (userInput == randomCards[0].back) {
        setRandomCards(randomCards.filter((card) => { return card.back !== userInput }))
      }
    } else {
      setRandomCards(randomCards.filter((card) => { return card.front !== userInput }))
    }
  }

  return (

    <div>
      {(studySide == 'front' && randomCards.length !== 0) && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            <div>
              <input onChange={(event) => { setUserInput(event.target.value) }} />
              <button onClick={checkAnswer}>Check answer</button>
            </div>
            <h2>
              {randomCards[0].front}<button onClick={() => {
                setShowAnswer(!showAnswer)
              }}>Show Answer</button> 
            </h2>
            {showAnswer && randomCards[0].back}
            <p></p>
            <button onClick={() => { setStudySide('') }}>Finish studying</button>
          </div>
        </div>
      )}

      {(studySide == 'back' && randomCards.length !== 0) && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            <div>
              <input onChange={(event) => { setUserInput(event.target.value) }} />
              <button onClick={checkAnswer}>Check answer</button>
            </div>
            <h2>
              {randomCards[0].back} <button onClick={() => {
                setShowAnswer(!showAnswer)
              }}>Show Answer</button> {showAnswer && randomCards[0].front}
            </h2>
            {showAnswer && randomCards[0].back}
            <p></p>
            <button onClick={() => { setStudySide('') }}>Finish studying</button>
          </div>
        </div>
      )}

      <div class='study-options'>
        <h2>Select the deck you would like to study from</h2>
        <select onChange={(event) => { handleSelect(event.target.value) }}>
          <option>------</option>
          {decks.map((decks) => {
            return (
              <option>
                {decks.name}
              </option>
            )
          })}
        </select>
        <div>
          <h2>Input the amount of cards you would like to study</h2>
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <input {...register('studyAmount')} />
              <input type='submit' />
            </form>
          </div>
          <button onClick={() => { setStudySide('front') }}>Front</button>
          <button onClick={() => { setStudySide('back') }}>Back</button>
        </div>
      </div>
    </div>
  )
}