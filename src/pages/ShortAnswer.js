import { useDeckState } from "../components/useDeckState"
import { useEffect, useState, useTransition } from "react"
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
  const [selectedOption, setSelectedOption] = useState('------')
  const [score, setScore] = useState(0)
  const [wrong, setWrong] = useState(false)
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
    if (selectedOption !== '------' && studySide !== '------') {
      if (submission.studyAmount - 1 < filteredDeck.cards.length) {
        while (smallerArray.length < submission.studyAmount) {
          const random = Math.floor(Math.random() * filteredDeck.cards.length)
          if (!smallerArray.includes(filteredDeck.cards[random])) {
            smallerArray.push(filteredDeck.cards[random])
          }
        }
      }
      setStudySide(submission.studySide)
      setRandomCards(smallerArray)
      setTotal(submission.studyAmount)
    }
  }

  const checkAnswer = () => {
    if (studySide == 'front') {
      if (userInput == randomCards[0].back && wrong == false) {
        setRandomCards(randomCards.filter((card) => { return card.back !== userInput }))
        setScore(score + 1)
        setShowAnswer(false)
        setUserInput('')
      } else if (userInput == randomCards[0].back && wrong == true) {
        setRandomCards(randomCards.filter((card) => { return card.back !== userInput }))
        setWrong(false)
        setShowAnswer(false)
        setUserInput('')
      } else if (userInput !== randomCards[0].back) {
        setWrong(true)
        setShowAnswer(false)
      }
    } else if (userInput == randomCards[0].front && wrong == false) {
      setRandomCards(randomCards.filter((card) => { return card.front !== userInput }))
      setScore(score + 1)
      setShowAnswer(false)
    } else if (userInput == randomCards[0].front && wrong == true) {
      setRandomCards(randomCards.filter((card) => { return card.front !== userInput }))
      setWrong(false)
      setShowAnswer(false)
    } else if (userInput !== randomCards[0].front) {
      setWrong(true)
      setShowAnswer(false)
    }
  }

  const handleFinishStudy = () => {
    setScore(0)
    setStudySide('')
  }

  return (

    <div>
      {studySide == 'front' && (
        <div class='modalBackground'>
          <div class='modalContainer'>

            {randomCards.length !== 0 && (
              <div>
                <div>
                  <input onChange={(event) => { setUserInput(event.target.value) }} value={userInput}/>
                  <button onClick={checkAnswer}>Check answer</button>
                </div>
                <h2>
                  {randomCards[0].front}<button onClick={() => {
                    setShowAnswer(!showAnswer)
                    setWrong(true)
                  }}>Show Answer</button>
                </h2>
                {showAnswer && randomCards[0].back}
                <p></p>
                <h2>Current score: {score}</h2>
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

      {(studySide == 'back') && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            {randomCards.length !== 0 && (
              <div>
                <div>
                  <input onChange={(event) => { setUserInput(event.target.value)}} value={userInput}/>
                  <button onClick={checkAnswer}>Check answer</button>
                </div>
                <h2>
                  {randomCards[0].back} <button onClick={() => {
                    setShowAnswer(!showAnswer)
                  }}>Show Answer</button> {showAnswer && randomCards[0].front}
                </h2>
                {showAnswer && randomCards[0].back}
                <p></p>
                <h2>Current score: {score}</h2>
                <button onClick={handleFinishStudy}>Finish studying</button>
              </div>)}

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
        <p>Guide: Enter the corresponding side of the card</p>
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