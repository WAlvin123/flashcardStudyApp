import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup';
import { useDeckState } from "../components/useDeckState"
import { useState, useEffect } from "react"
import "./Modal.css"

export const MultipleChoice = () => {
  const [decks, setDecks] = useDeckState()
  const [filteredDeck, setFilteredDeck] = useState({})
  const [randomCards, setRandomCards] = useState([])
  const [multipleChoice, setMultipleChoice] = useState([])
  const [studySide, setStudySide] = useState('')
  const [choice, setChoice] = useState('')
  const [wrong, setWrong] = useState(false)
  const [score, setScore] = useState(0)
  const [answerMessage, setAnswerMessage] = useState('')
  const [selectedOption, setSelectedOption] = useState('------')
  const [total, setTotal] = useState(0)

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
    studyAmount: yup.number().required().min(0),
    studySide: yup.string().required()
  })

  const { register, handleSubmit } = useForm({
    resolver: yupResolver(submissionSchema)
  })

  const onSubmit = (submission) => {
    const smallerArray = []
    if (selectedOption !== '------' && submission.studySide !== '------') {
      if (submission.studyAmount - 1 < filteredDeck.cards.length) {
        while (smallerArray.length < submission.studyAmount) {
          const random = Math.floor(Math.random() * filteredDeck.cards.length)
          if (!smallerArray.includes(filteredDeck.cards[random])) {
            smallerArray.push(filteredDeck.cards[random])
          }
        }
        setTotal(submission.studyAmount)
        setStudySide(submission.studySide)
        setRandomCards(smallerArray)
        handleMC(smallerArray[0])
      }
    }
  }

  const handleMC = (answer) => {
    const choices = [answer]

    while (choices.length < 5) {
      const random = Math.floor(Math.random() * filteredDeck.cards.length)
      if (!choices.includes(filteredDeck.cards[random])) {
        choices.push(filteredDeck.cards[random])
      }
    }
    choices.sort(() => 0.5 - Math.random())
    setMultipleChoice(choices)
  }

  const handleCheckAnswer = () => {
    if (studySide == 'front') {
      if (randomCards[0].back == choice && wrong == false) {
        setScore(score + 1)
        setRandomCards(randomCards.filter((card) => {
          return card.back !== choice
        }))
        setAnswerMessage('Correct')
        handleMC(randomCards[1])
      } else if (randomCards[0].back == choice && wrong == true) {
        setRandomCards(randomCards.filter((card) => {
          return card.back !== choice
        }))
        setAnswerMessage('Correct')
        handleMC(randomCards[1])
        setWrong(false)
      } else if (randomCards[0].back !== choice && wrong == false) {
        setWrong(true)
        setAnswerMessage('Incorrect')
      }

    } else if (studySide == 'back') {
      if (randomCards[0].front == choice) {
        console.log('correct')
        setRandomCards(randomCards.filter((card) => {
          return card.front !== choice
        }))
        handleMC(randomCards[1])
        setAnswerMessage('Correct')
        setScore(score + 1)
      } else if (randomCards[0].front == choice && wrong == true) {
        setRandomCards(randomCards.filter((card) => {
          return card.back !== choice
        }))
        handleMC(randomCards[1])
        setWrong(false)
        setAnswerMessage('Correct')
      } else if (randomCards[0].front !== choice && wrong == false) {
        setWrong(true)
        setAnswerMessage('Incorrect')
      }
    }
  }

  const handleFinishStudy = () => {
    setWrong(false)
    setStudySide('')
    setAnswerMessage('')
    setScore(0)
  }

  return (
    <div>
      {studySide == 'front' && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            {randomCards.length !== 0 && (
              <div>
                {randomCards[0].front}
                <div>
                  {multipleChoice.map((choice) => {
                    return (
                      <button onClick={() => { setChoice(choice.back) }}>
                        {choice.back}
                      </button>
                    )
                  })}
                </div>
                <h2>Score: {score}</h2>
                <h2>{answerMessage}</h2>
                <button onClick={handleCheckAnswer}>Check Answer</button>
                <button onClick={handleFinishStudy}>Finish studying</button>
              </div>
            )}

            {randomCards.length == 0 && (
              <div>
                <h2>You scored {score} / {total}</h2>
                <button onClick={handleFinishStudy}>Finish studying</button>
              </div>
            )}
          </div>
        </div>
      )}

      {studySide == 'back' && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            {randomCards.length !== 0 && (
              <div>
                {randomCards[0].back}
                <div>
                  {multipleChoice.map((choice) => {
                    return (
                      <button onClick={() => { setChoice(choice.front) }}>
                        {choice.front}
                      </button>
                    )
                  })}
                </div>
                <h2>Score: {score}</h2>
                <h2>{answerMessage}</h2>
                <button onClick={handleCheckAnswer}>Check Answer</button>
                <button onClick={handleFinishStudy}>Finish studying</button>
              </div>
            )}

            {randomCards.length == 0 && (
              <div>
                <h2>You scored {score} / {total}</h2>
                <button onClick={handleFinishStudy}>Finish studying</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div class='study-options'>
        <h2>Select the deck you would like to study from</h2>
        <p>Guide: Pick the correct option corresponding to the opposite side of the card</p>
        <select onChange={(event) => {
          handleSelect(event.target.value)
          setSelectedOption(event.target.value)
        }}>
          <option>------</option>
          {decks.map((decks) => {
            return (
              <option>
                {decks.name}
              </option>
            )
          })}
        </select>
        {selectedOption !== "------" && <p>Selected deck contains: {filteredDeck.cards.length} cards</p>}
        <div>
          <h2>Input the amount of cards would like to study, and <br />
            select what side you would like the question prompt to be</h2>
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <input {...register('studyAmount')} />
              <select {...register('studySide')}>
                <option>------</option>
                <option>front</option>
                <option>back</option>
              </select>
              <input type='submit' />
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}