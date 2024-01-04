import * as yup from 'yup'
import { useForm } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useEffect } from "react";
import { useDeckState } from "../components/useDeckState";
import { PreStudyInput } from '../components/PrestudyInput';
import { Results } from '../components/Results';
import { ConfirmComplete } from '../components/ConfirmComplete';

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
  const [total, setTotal] = useState(0)
  const [studySide, setStudySide] = useState('')
  const [selectedOption, setSelectedOption] = useState('------')
  const [message, setMessage] = useState('')

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
    const studyArray = []
    while (submission.studyAmount > studyArray.length) {
      const randomIndex = Math.floor(Math.random() * filteredDeck.cards.length)
      if (!studyArray.includes(filteredDeck.cards[randomIndex])) {
        studyArray.push(filteredDeck.cards[randomIndex])
      }
    }
    setStudySide(submission.studySide)
    setRandomCards(studyArray)
    setModalState(true)
    setTotal(studyArray.length)
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

  const handleFinishStudy = () => {
    if (randomCards.length !== 0) {
      setModalState(false)
      setScore(0)
      setAnswerState(0)
      setMessage('')
    } else { // add this to total study score
      setModalState(false)
      setScore(0)
      setAnswerState(0)
      setMessage('')
    }
  }

  return (
    <div>
      {(modalState == true && studySide == 'front') && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            {randomCards.length > 0 && message == '' && (
              <div class='mid-study'>
                <p style={{ fontSize: 25 }}>{randomCards[0].front}</p>
                {answerState == 0 && (
                  <button onClickCapture={() => { setAnswerState(1) }}>Show Answer</button>
                )}

                {answerState == 1 && (
                  <div>
                    <h2>{randomCards[0].back}</h2>
                    <p>How did you feel about this card?</p>
                    <button onClick={handleBad}>Try again</button>
                    <button onClick={handleGood}>Memorized</button>
                  </div>
                )}
                <h3>Cards remaining: {randomCards.length}</h3>
                <h3>Score: {score}</h3>
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

      {(modalState == true && studySide == 'back') && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            {randomCards.length > 0 && message == '' && (
              <div class='mid-study'>
                <h2>{randomCards[0].back}</h2>
                {answerState == 0 && (
                  <button onClickCapture={() => { setAnswerState(1) }}>Show Answer</button>
                )}

                {answerState == 1 && (
                  <div>
                    <p style={{ fontSize: 25 }}>{randomCards[0].front}</p>
                    <p>How did you feel about this card?</p>
                    <button onClick={handleBad}>Try again</button>
                    <button onClick={handleGood}>Memorized</button>
                  </div>
                )}
                <h3>Cards remaining: {randomCards.length}</h3>
                <h2>Score: {score}</h2>
                <button onClick={ () => {setMessage("Are you sure you would like to finish studying before all questions have been answered? Doing so will not add to the weekly studied amount.")}}>Finish studying</button>
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
            Guide: Simple memorization. If the card is not memorized <br />
            it will be pushed to the back of the study set
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