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
        setAnsweredCards(prevAnsweredCards => [{ ...randomCards[0], attempt: 0 }, ...prevAnsweredCards])
        setRandomCards(randomCards.filter((card) => {
          return card.back !== choice
        }))
        setChoice('')
        setAnswerMessage(<p className="text">Correct</p>)
        handleMC(randomCards[1])
      } else if (randomCards[0].back == choice && wrong == true) {
        setAnsweredCards(prevAnsweredCards => [randomCards[0], ...prevAnsweredCards])
        console.log(answeredCards)
        setRandomCards(randomCards.filter((card) => {
          return card.back !== choice
        }))
        setChoice('')
        setAnswerMessage(<p className="text">Correct</p>)
        handleMC(randomCards[1])
        setWrong(false)
      } else if (randomCards[0].back !== choice && wrong == false) {
        setWrong(true)
        setAnswerMessage(<p className="text">Incorrect</p>)
        setRandomCards(prevRandom => {
          const updatedRandomCards = prevRandom.map((card, index) => {
            if (index == 0) {
              return { ...card, attempt: (card.attempt || 0) + 1 }
            } else {
              return card
            }
          })
          return updatedRandomCards
        })
      } else if (randomCards[0].back !== choice && wrong == true) {
        setAnswerMessage(<p className="text">Incorrect</p>)
        setRandomCards(prevRandom => {
          const updatedRandomCards = prevRandom.map((card, index) => {
            if (index == 0) {
              return { ...card, attempt: (card.attempt || 0) + 1 }
            } else {
              return card
            }
          })
          return updatedRandomCards
        })

        console.log(randomCards)
      }

    } else if (studySide == 'back') {
      if (randomCards[0].front == choice) {
        setAnsweredCards(prevAnsweredCards => {
          const updatedRandomCards = [{ ...randomCards[0], attempt: 0 }, ...prevAnsweredCards]
          return updatedRandomCards
        })
        setRandomCards(randomCards.filter((card) => {
          return card.front !== choice
        }))
        handleMC(randomCards[1])
        setChoice('')
        setAnswerMessage(<p className="text">Correct</p>)
        setScore(score + 1)
        console.log('option 2')
      } else if (randomCards[0].front == choice && wrong == true) {
        setAnsweredCards(prevAnsweredCards => {
          const updatedRandomCards = [randomCards[0], ...prevAnsweredCards]
          return updatedRandomCards
        })
        setRandomCards(randomCards.filter((card) => {
          return card.back !== choice
        }))
        handleMC(randomCards[1])
        setWrong(false)
        setChoice('')
        setAnswerMessage(<p className="text">Correct</p>)
      } else if (randomCards[0].front !== choice && wrong == false) {
        setWrong(true)
        setAnswerMessage(<p className="text">Incorrect</p>)
        setRandomCards(prevRandom => {
          const updatedRandomCards = prevRandom.map((card, index) => {
            if (index == 0) {
              return { ...card, attempt: (card.attempt || 0) + 1 }
            } else {
              return card
            }
          })
          return updatedRandomCards
        })
      } else if (randomCards[0].front !== choice && wrong == true) {
        setRandomCards(prevRandom => {
          const updatedRandomCards = prevRandom.map((card, index) => {
            if (index == 0) {
              return { ...card, attempt: (card.attempt || 0) + 1 }
            } else {
              return card
            }
          })
          return updatedRandomCards
        })
        setAnswerMessage(<p className="text">Incorrect</p>)
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
      setAnsweredCards([])
    } else { // add this to total study score
      setWrong(false)
      setStudySide('')
      setAnswerMessage('')
      setScore(0)
      setMessage('')
      setChoice('')
      setAnsweredCards([])
    }
  }

  return (
    <div>
      {studySide == 'front' && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            {randomCards.length !== 0 && message == '' && (
              <div>
                <p style={{ fontSize: '600%' }}>{randomCards[0].front}</p>
                <div className="centered-container">
                  <div style={{ display: 'flex', justifyContent: "space-between", width: '50%' }}>
                    {multipleChoice.map((choice) => {
                      return (
                        <button onClick={() => {
                          setChoice(choice.back)
                          setAnswerMessage('')
                        }}
                          className="create"
                        >
                          {choice.back}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {choice !== '' && (<p style={{ fontSize: '300%' }}>Selected choice: {choice}</p>)}
                <h3 className="header">Cards remaining: {randomCards.length}</h3>
                <h3 className="header">Score: {score}</h3>
                <p>{answerMessage}</p>
                <div style={{ display: 'grid', justifyContent: 'center' }}>
                  <button onClick={handleCheckAnswer} className="create">Check Answer</button>
                  <button onClick={() => { setMessage("Are you sure you would like to finish studying before all questions have been answered? Doing so will not add to the weekly studied amount.") }} className="create">Finish studying</button>
                </div>
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
              answeredCards={answeredCards}
            />
          </div>
        </div>
      )}

      {studySide == 'back' && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            {randomCards.length !== 0 && message == '' && (
              <div>
                <p style={{ fontSize: '600%' }}>{randomCards[0].back}</p>
                <div className="centered-container">
                  <div style={{ display: 'flex', justifyContent: "space-between", width: '50%' }}>
                    {multipleChoice.map((choice) => {
                      return (
                        <button onClick={() => {
                          setChoice(choice.front)
                          setAnswerMessage('')
                        }}
                          className="create"
                        >
                          {choice.front}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {choice !== '' && (<p style={{ fontSize: '300%' }}>Selected choice: {choice}</p>)}
                <h3 className="header">Cards remaining: {randomCards.length}</h3>
                <h3 className="header">Score: {score}</h3>
                <p>{answerMessage}</p>
                <div style={{ display: 'grid', justifyContent: 'center' }}>
                  <button onClick={handleCheckAnswer} className="create">Check Answer</button>
                  <button onClick={() => { setMessage("Are you sure you would like to finish studying before all questions have been answered? Doing so will not add to the weekly studied amount.") }} className="create">Finish studying</button>
                </div>
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
              answeredCards={answeredCards}
            />
          </div>
        </div>
      )}

      <PreStudyInput
        title={<h2>Multiple Choice</h2>}
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