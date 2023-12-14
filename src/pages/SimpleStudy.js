import * as yup from 'yup'
import { useForm } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useEffect } from "react";
import { useDeckState } from "../components/useDeckState";

export const SimpleStudy = () => {
  useEffect(() => {
    const storedDecks = localStorage.getItem('decks');
    if (storedDecks) {
      setDecks(JSON.parse(storedDecks))
    }
  }, [])

  const [decks, setDecks] = useDeckState()
  const [filteredDeck, setFilteredDeck] = useState({ cards: [] })
  const [randomCards, setRandomCards] = useState([])
  const [modalState, setModalState] = useState(false)
  const [answerState, setAnswerState] = useState(0)
  const [score, setScore] = useState(0)

  const handleSelect = (selectedDeck) => {
    const filteredIndex = decks.findIndex(deck => deck.name == selectedDeck)
    if (filteredIndex !== -1) {
      setFilteredDeck(decks[filteredIndex])
      console.log(filteredDeck)
    } else if (selectedDeck == '------') {
      setFilteredDeck({ cards: [] })
    }
  }

  const submissionSchema = yup.object().shape({
    studyAmount: yup
      .number()
      .required()
      .max(filteredDeck.cards.length)
      .min(1)
  })

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(submissionSchema)
  })

  const onSubmit = (submission) => {
    const studyArray = []
    while (submission.studyAmount > studyArray.length) {
      const randomIndex = Math.floor(Math.random() * filteredDeck.cards.length)
      if (!studyArray.includes(filteredDeck.cards[randomIndex])) {
        studyArray.push(filteredDeck.cards[randomIndex])
      }
    }
    setRandomCards(studyArray)
    setModalState(true)
  }

  const handleGood = () => {
    setRandomCards(prevRandom => {
      const updatedCards = prevRandom.filter((card, index) => {
        if (card.firstTry == undefined && index == 0) {
          setScore(score + 1)
          return false
        } else if (card.firstTry == false && index == 0) {
          return false
        } else {
          return true
        }
      })
      setAnswerState(0)
      return updatedCards
    })
  }

  const handleBad = () => {

    setRandomCards(prevRandom => {
      const firstCard = { ...prevRandom[0], firstTry: false }
      const remainingCards = prevRandom.slice(1)
      remainingCards.sort(() => Math.random() - 0.5)
      const updatedRandomCards = [...remainingCards, firstCard]
      setAnswerState(0)
      return updatedRandomCards
    })
  }

  const handleFinish = () => {
    setModalState(false)
    setScore(0)
    setAnswerState(0)
  }

  return (
    <div>
      {modalState == true && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            {randomCards.length > 0 && (
              <div class='mid-study'>
                <h2>{randomCards[0].front}</h2>
                {answerState == 0 && (
                  <button onClickCapture={() => { setAnswerState(1) }}>Show Answer</button>
                )}

                {answerState == 1 && (
                  <div>
                    <h2>{randomCards[0].back}</h2>
                    <p>How did you feel about this card?</p>
                    <button onClick={handleGood}>Memorized</button>
                    <button onClick={handleBad}>Try again</button>
                  </div>
                )}
                <h2>Score: {score}</h2>
                <button onClick={handleFinish}>Finish studying</button>
              </div>
            )}

            {randomCards.length == 0 && (
              <div>
                <h2>You scored {score}</h2>
                <button onClick={handleFinish}>Finish studying</button>
              </div>
            )}
          </div>
        </div>
      )}


      <div className='select-deck'>
        <h2>Select the deck you would like to study from</h2>
        <p>Guide: Respond with whether or not you have the other side of card memorized. <br />
          If not, then the question will be moved to the back and asked again
        </p>
        <select onChange={(event) => handleSelect(event.target.value)}>
          <option>------</option>
          {decks.map(deck => {
            return (
              <option>
                {deck.name}
              </option>
            )
          })}
        </select>
        {filteredDeck.cards.length !== 0 && (
          <p>Selected deck contains: {filteredDeck.cards.length} cards</p>
          )}
      </div>

      <div className='input-amount'>
        <h2>
          Input the amount of cards you would like to study
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register('studyAmount')} />
          <input type='submit' />
        </form>
      </div>
    </div>
  )
}