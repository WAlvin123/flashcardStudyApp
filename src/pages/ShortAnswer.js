import { useDeckState } from "../components/useDeckState"
import { useEffect, useState, useTransition } from "react"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from 'yup'
import { useForm } from "react-hook-form"
import { PreStudyInput } from "../components/PrestudyInput"
import { ConfirmComplete } from "../components/ConfirmComplete"
import { Results } from "../components/Results"
import "../styles/Modal.css"

export const ShortAnswer = () => {
  const [decks, setDecks] = useDeckState()
  const [studySide, setStudySide] = useState('')
  const [randomCards, setRandomCards] = useState([])
  const [filteredDeck, setFilteredDeck] = useState({ cards: ['initial state'] })
  const [userInput, setUserInput] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedOption, setSelectedOption] = useState('------')
  const [score, setScore] = useState(0)
  const [wrong, setWrong] = useState(false)
  const [total, setTotal] = useState(0)
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const [answerMessage, setAnswerMessage] = useState('')
  const [answeredCards, setAnsweredCards] = useState([])

  useEffect(() => {
    const storedDecks = localStorage.getItem('decks');
    if (storedDecks) {
      setDecks(JSON.parse(storedDecks))
    }
  }, [])

  const handleSelect = (deckname) => {
    if (deckname === "------") {
      setFilteredDeck({ cards: ['initial'] })
      setSelectedOption('------')
    } else {
      const selectedDeck = decks.find(deck => deckname === deck.name)
      setFilteredDeck(selectedDeck)
      setSelectedOption(deckname)
    }
  }

  const submissionSchema = yup.object().shape({
    studyAmount: yup
      .number("Please enter a number")
      .typeError("Please enter a number")
      .required("Please enter something")
      .min(0, "Please enter a number >0")
      .max(filteredDeck.cards.length, "The input surpasses the amount of cards in the deck"),
    studySide: yup.string().required()
  })

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(submissionSchema)
  })

  const onSubmit = (submission) => {
    const smallerArray = []
    if (selectedOption !== '------' && studySide !== '------') {
      while (smallerArray.length < submission.studyAmount) {
        const random = Math.floor(Math.random() * filteredDeck.cards.length)
        if (!smallerArray.includes(filteredDeck.cards[random])) {
          smallerArray.push(filteredDeck.cards[random])
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
        setAnsweredCards(prevAnswered => [{...randomCards[0], attempt:0}, ...prevAnswered])
        setRandomCards(randomCards.filter((card) => { return card.back !== userInput }))
        setAnswerMessage('Correct')
        setScore(score + 1)
        setShowAnswer(false)
        setUserInput('')
      } else if (userInput == randomCards[0].back && wrong == true) {
        setAnsweredCards(prevAnswered => [randomCards[0], ...prevAnswered])
        setRandomCards(randomCards.filter((card) => { return card.back !== userInput }))
        setAnswerMessage('Correct')
        setWrong(false)
        setShowAnswer(false)
        setUserInput('')
      } else if (userInput !== randomCards[0].back) {
        setAnswerMessage('Incorrect')
        setRandomCards(prevRandom => {
          const updatedRandom = prevRandom.map((card, index) => {
            if (index == 0) {
              return {...card, attempt: (card.attempt || 0) + 1}
            } else return card
          })
          return updatedRandom
        })
        setWrong(true)
        setShowAnswer(false)
      }
    } else if (userInput == randomCards[0].front && wrong == false) {
      setAnsweredCards(prevAnswered => [{...randomCards[0], attempt:0}, ...prevAnswered])
      setRandomCards(randomCards.filter((card) => { return card.front !== userInput }))
      setAnswerMessage('Correct')
      setScore(score + 1)
      setShowAnswer(false)
      setUserInput('')
    } else if (userInput == randomCards[0].front && wrong == true) {
      setAnsweredCards(prevAnswered => [randomCards[0], ...prevAnswered])
      setRandomCards(randomCards.filter((card) => { return card.front !== userInput }))
      setAnswerMessage('Correct')
      setWrong(false)
      setShowAnswer(false)
      setUserInput('')
    } else if (userInput !== randomCards[0].front) {
      setAnswerMessage('Incorrect')
      setRandomCards(prevRandom => {
        const updatedRandom = prevRandom.map((card, index) => {
          if (index == 0) {
            return {...card, attempt: (card.attempt || 0) + 1}
          } else return card
        })
        return updatedRandom
      })
      setWrong(true)
      setShowAnswer(false)
    }
  }

  const handleFinishStudy = () => {
    if (randomCards.length !== 0) {
      setScore(0)
      setStudySide('')
      setUserInput('')
      setConfirmationMessage('')
      setShowAnswer(false)
      setAnsweredCards([])
      setAnswerMessage('')
    } else { // add this to total study score
      setScore(0)
      setStudySide('')
      setUserInput('')
      setConfirmationMessage('')
      setShowAnswer(false)
      setAnsweredCards([])
      setAnswerMessage('')
    }
  }

  return (

    <div>
      {studySide == 'front' && (
        <div class='modalBackground'>
          <div class='modalContainer'>

            {randomCards.length !== 0 && confirmationMessage == '' && (
              <div>
                <div>
                  <input onChange={(event) => { setUserInput(event.target.value) }} value={userInput} />
                  <button onClick={checkAnswer}>Check answer</button>
                </div>
                <h2>
                  {randomCards[0].front}<button onClick={() => {
                    setShowAnswer(!showAnswer)
                    setWrong(true)
                  }}>Show Answer</button>
                </h2>
                {showAnswer && randomCards[0].back}
                <h3>{answerMessage}</h3>
                <h3>Cards remaining: {randomCards.length}</h3>
                <h3>Score: {score}</h3>
                <button onClick={() => { setConfirmationMessage("Are you sure you would like to finish studying before all questions have been answered? Doing so will not add to the weekly studied amount.") }}>Finish studying</button>
              </div>
            )}

            <ConfirmComplete
              message={confirmationMessage}
              setMessage={setConfirmationMessage}
              handleFinishStudy={handleFinishStudy} />


            <Results
              randomCards={randomCards}
              score={score}
              total={total}
              handleFinishStudy={handleFinishStudy}
              answeredCards={answeredCards}
            />
          </div>
        </div>
      )}

      {(studySide == 'back') && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            {randomCards.length !== 0 && confirmationMessage == '' && (
              <div>
                <div>
                  <input onChange={(event) => { setUserInput(event.target.value) }} value={userInput} />
                  <button onClick={checkAnswer}>Check answer</button>
                </div>
                <h2>
                  {randomCards[0].back} <button onClick={() => {
                    setShowAnswer(!showAnswer)
                  }}>Show Answer</button> {showAnswer && randomCards[0].front}
                </h2>
                {showAnswer && randomCards[0].back}
                <p></p>
                <h3>Cards remaining: {randomCards.length}</h3>
                <h3>Score: {score}</h3>
                <button onClick={() => { setConfirmationMessage("Are you sure you would like to finish studying before all questions have been answered? Doing so will not add to the weekly studied amount.") }}>Finish studying</button>
              </div>)}

            <ConfirmComplete
              message={confirmationMessage}
              setMessage={setConfirmationMessage}
              handleFinishStudy={handleFinishStudy} />

            <Results
              randomCards={randomCards}
              score={score}
              total={total}
              handleFinishStudy={handleFinishStudy}
              answeredCards={answeredCards}
            />
          </div>
        </div>
      )}
      <PreStudyInput
        title={<h1>Short Answer</h1>}
        guideMessage={
          <p>
            Guide: Enter the corresponding side of the card
          </p>
        }
        handleSelect={handleSelect}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        decks={decks}
        filteredDeck={filteredDeck}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        register={register}
        errors={errors} />
    </div>
  )
}