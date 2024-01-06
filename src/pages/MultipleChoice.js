import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup';
import { useDeckState } from "../components/useDeckState"
import { useState, useEffect } from "react"
import "../styles/Modal.css"
import { PreStudyInput } from "../components/PrestudyInput";
import { ConfirmComplete } from "../components/ConfirmComplete";
import { Results } from "../components/Results";

export const MultipleChoice = () => {
  const [decks, setDecks] = useDeckState()
  const [filteredDeck, setFilteredDeck] = useState({ cards: ['initial state'] })
  const [randomCards, setRandomCards] = useState([])
  const [multipleChoice, setMultipleChoice] = useState([])
  const [studySide, setStudySide] = useState('')
  const [choice, setChoice] = useState('')
  const [wrong, setWrong] = useState(false)
  const [score, setScore] = useState(0)
  const [answerMessage, setAnswerMessage] = useState('')
  const [selectedOption, setSelectedOption] = useState('------')
  const [total, setTotal] = useState(0)
  const [message, setMessage] = useState('')

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
        setChoice('')
        setAnswerMessage('Correct')
        handleMC(randomCards[1])
      } else if (randomCards[0].back == choice && wrong == true) {
        setRandomCards(randomCards.filter((card) => {
          return card.back !== choice
        }))
        setChoice('')
        setAnswerMessage('Correct')
        handleMC(randomCards[1])
        setWrong(false)
      } else if (randomCards[0].back !== choice && wrong == false) {
        setWrong(true)
        setAnswerMessage('Incorrect')
      } else if (randomCards[0].back !== choice && wrong == true) {
        setAnswerMessage('Incorrect')
      }

    } else if (studySide == 'back') {
      if (randomCards[0].front == choice) {
        console.log('correct')
        setRandomCards(randomCards.filter((card) => {
          return card.front !== choice
        }))
        handleMC(randomCards[1])
        setChoice('')
        setAnswerMessage('Correct')
        setScore(score + 1)
      } else if (randomCards[0].front == choice && wrong == true) {
        setRandomCards(randomCards.filter((card) => {
          return card.back !== choice
        }))
        handleMC(randomCards[1])
        setWrong(false)
        setChoice('')
        setAnswerMessage('Correct')
      } else if (randomCards[0].front !== choice && wrong == false) {
        setWrong(true)
        setAnswerMessage('Incorrect')
      } else if (randomCards[0].front !== choice && wrong == true) {
        setAnswerMessage('Incorrect')
      }
    }
  }

  const handleFinishStudy = () => {
    if (randomCards.length !== 0) {
      setWrong(false)
      setStudySide('')
      setAnswerMessage('')
      setScore(0)
      setMessage('')
      setChoice('')
    } else { // add this to total study score
      setWrong(false)
      setStudySide('')
      setAnswerMessage('')
      setScore(0)
      setMessage('')
      setChoice('')
    }
  }

  return (
    <div>
      {studySide == 'front' && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            {randomCards.length !== 0 && message == '' && (
              <div>
                <p style={{ fontSize: 20 }}>{randomCards[0].front}</p>
                <div>
                  {multipleChoice.map((choice) => {
                    return (
                      <button onClick={() => {
                        setChoice(choice.back)
                        setAnswerMessage('')
                      }}>
                        {choice.back}
                      </button>
                    )
                  })}
                </div>
                {choice !== '' && (<p>Selected choice: {choice}</p>)}
                <h3>Cards remaining: {randomCards.length}</h3>
                <h3>Score: {score}</h3>
                <p>{answerMessage}</p>
                <button onClick={handleCheckAnswer}>Check Answer</button>
                <button onClick={() => { setMessage("Are you sure you would like to finish studying before all questions have been answered? Doing so will not add to the weekly studied amount.") }}>Finish studying</button>
              </div>
            )}

            <ConfirmComplete
              message={message}
              setMessage={setMessage}
              handleFinishStudy={handleFinishStudy} />

            <Results
              randomCards={randomCards}
              score={score}
              total={total}
              handleFinishStudy={handleFinishStudy}
            />
          </div>
        </div>
      )}

      {studySide == 'back' && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            {randomCards.length !== 0 && message == '' && (
              <div>
                <p style={{ fontSize: 20 }}>{randomCards[0].back}</p>
                <div>
                  {multipleChoice.map((choice) => {
                    return (
                      <button onClick={() => {
                        setChoice(choice.front)
                        setAnswerMessage('')
                      }}>
                        {choice.front}
                      </button>
                    )
                  })}
                </div>
                {choice !== '' && (<p>Selected choice: {choice}</p>)}
                <h3>Cards remaining: {randomCards.length}</h3>
                <h3>Score: {score}</h3>
                <p>{answerMessage}</p>
                <button onClick={handleCheckAnswer}>Check Answer</button>
                <button onClick={() => { setMessage("Are you sure you would like to finish studying before all questions have been answered? Doing so will not add to the weekly studied amount.") }}>Finish studying</button>
              </div>
            )}

            <ConfirmComplete
              message={message}
              setMessage={setMessage}
              handleFinishStudy={handleFinishStudy} />


            <Results
              randomCards={randomCards}
              score={score}
              total={total}
              handleFinishStudy={handleFinishStudy}
            />
          </div>
        </div>
      )}

      <PreStudyInput
        guideMessage={
          <p>
            Guide: Select the right option corresponding <br />
            to the opposite side of the card
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