import * as yup from 'yup'
import { useForm } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useEffect } from "react";
import { useDeckState } from "../components/useDeckState";
import { PreStudyInput } from '../components/PrestudyInput';
import { Results } from '../components/Results';
import { ConfirmComplete } from '../components/ConfirmComplete';
import "../styles/Modal.css"
import { getAuth } from 'firebase/auth';


export const SimpleStudy = () => {
  const auth = getAuth()

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
  const [filteredDeck, setFilteredDeck] = useState({ cards: [] })
  const [randomCards, setRandomCards] = useState([])
  const [answeredCards, setAnsweredCards] = useState([])
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
    const copiedRandomCards = [...randomCards]

    randomCards.forEach((card, index) => {
      if (card.firstTry == undefined && index == 0) {
        setAnsweredCards(prevAnsweredCards => [{ ...copiedRandomCards[0], attempt: 0 }, ...prevAnsweredCards])
        randomCards.splice(0, 1)
        setScore(score + 1)
        return false
      } else if (card.firstTry == false && index == 0) {
        setAnsweredCards(prevAnsweredCards => [copiedRandomCards[0], ...prevAnsweredCards])
        randomCards.splice(0, 1)
        return false
      }
    })
    setAnswerState(0)
  }

  const handleBad = () => {
    setRandomCards(prevRandom => {
      const firstCard = { ...prevRandom[0], firstTry: false, attempt: (prevRandom[0].attempt || 0) + 1 }
      const remainingCards = prevRandom.slice(1)
      remainingCards.sort(() => Math.random() - 0.5)
      const updatedRandomCards = [...remainingCards, firstCard]
      localStorage.setItem('simple', JSON.stringify(updatedRandomCards))
      setAnswerState(0)
      return updatedRandomCards
    })
  }

  const handleFinishStudy = () => {
    setModalState(false)
    setScore(0)
    setAnswerState(0)
    setMessage('')
    setAnsweredCards([])
    localStorage.removeItem('simple')
    localStorage.removeItem('simple-score')
  }

  const leaveStudy = () => {
    setMessage('')
    setModalState(false)
    localStorage.setItem('simple', JSON.stringify(randomCards))
    localStorage.setItem('side', JSON.stringify(studySide))
    localStorage.setItem('simple-score', JSON.stringify(score))
  }

  const handleResume = () => {
    setRandomCards(JSON.parse(localStorage.getItem('simple')))
    setScore(JSON.parse(localStorage.getItem('simple-score')))
    setStudySide(JSON.parse(localStorage.getItem('side')))
  }

  return (
    <div>
      {(modalState == true && studySide == 'front') && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            {randomCards.length > 0 && message == '' && (
              <div class='mid-study'>
                <p style={{ fontSize: '600%' }}>{randomCards[0].front}</p>
                {answerState == 0 && (
                  <button
                    onClick={() => { setAnswerState(1) }}
                    className='create'
                  >Show Answer</button>
                )}

                {answerState == 1 && (
                  <div>
                    <p style={{ fontSize: '300%' }}>{randomCards[0].back}</p>
                    <p className='text'>How did you feel about this card?</p>
                    <div className='centered-container'>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '12vw' }}>
                        <button onClick={handleBad} className='create'>Try again</button>
                        <button onClick={handleGood} className='create'>Good</button>
                      </div>
                    </div>
                  </div>
                )}
                <h3 className='header'>Cards remaining: {randomCards.length}</h3>
                <h3 className='header'>Score: {score}</h3>
                <button onClick={() => { setMessage("You can resume this session later") }} className='create'>Finish studying</button>
              </div>
            )}

            <ConfirmComplete
              message={message}
              setMessage={setMessage}
              handleFinishStudy={leaveStudy} />

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

      {(modalState == true && studySide == 'back') && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            {randomCards.length > 0 && message == '' && (
              <div class='mid-study'>
                <p style={{ fontSize: '600%' }}>{randomCards[0].back}</p>
                {answerState == 0 && (
                  <button onClickCapture={() => { setAnswerState(1) }} className='create'>Show Answer</button>
                )}

                {answerState == 1 && (
                  <div>
                    <p style={{ fontSize: '300%' }}>{randomCards[0].front}</p>
                    <p className='text'>How did you feel about this card?</p>
                    <div className='centered-container'>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '12vw' }}>
                        <button onClick={handleBad} className='create'>Try again</button>
                        <button onClick={handleGood} className='create'>Good</button>
                      </div>
                    </div>
                  </div>
                )}
                <h3 className='header'>Cards remaining: {randomCards.length}</h3>
                <h3 className='header'>Score: {score}</h3>
                <button onClick={() => { setMessage("Are you sure you would like to finish studying before all questions have been answered? Doing so will not add to the weekly studied amount.") }} className='create'>Finish studying</button>
              </div>
            )}

            <ConfirmComplete
              message={message}
              setMessage={setMessage}
              handleFinishStudy={leaveStudy} />

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
        title={<h2>Memorization</h2>}
        guideMessage={
          <p>
            Guide: If the card is not memorized it will be pushed to the<br />
            back of the study set to be answered again later
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

      {localStorage.getItem('simple') && (

        <button className='create'
          onClick={() => {
            setModalState(true)
            handleResume()
          }}
        >
          Resume studying
        </button>)}
    </div>
  )
}