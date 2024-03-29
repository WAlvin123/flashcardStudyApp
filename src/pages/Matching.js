import { useState, useEffect } from "react";
import * as yup from 'yup';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDeckState } from "../components/useDeckState";
import { ConfirmComplete } from "../components/ConfirmComplete";
import { Results } from "../components/Results";
import '../styles/Matching.css'
import { collection, getDocs, query, addDoc, doc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firestore"
import { getAuth } from "firebase/auth";

export const Matching = () => {
  const [decks, setDecks, getDecks] = useDeckState()
  const [randomCards, setRandomCards] = useState()
  const [columnTwo, setColumnTwo] = useState()
  const [filteredDeck, setFilteredDeck] = useState({ cards: ['initial state'] })
  const [modalState, setModalState] = useState(false)
  const [choiceOne, setChoiceOne] = useState('')
  const [choiceTwo, setChoiceTwo] = useState('')
  const [wrong, setWrong] = useState(false)
  const [answerMessage, setAnswerMessage] = useState('')
  const [score, setScore] = useState(0)
  const [selectedOption, setSelectedOption] = useState('------')
  const [total, setTotal] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [message, setMessage] = useState('')
  const [answeredCards, setAnsweredCards] = useState(['test'])
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
  })

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(submissionSchema)
  })

  const onSubmit = (submission) => {
    const smallerArray = []
    if (selectedOption !== '------') {
      if (submission.studyAmount - 1 < filteredDeck.cards.length) {
        while (smallerArray.length < submission.studyAmount) {
          const random = Math.floor(Math.random() * filteredDeck.cards.length)
          if (!smallerArray.includes(filteredDeck.cards[random])) {
            smallerArray.push(filteredDeck.cards[random])
          }
        }
        setRandomCards([...smallerArray].map((item) => { return { ...item, column: 1 } }))
        const newArray = [...smallerArray]
        newArray.sort(() => Math.random() - 0.5)
        setColumnTwo([...newArray].map((item) => { return { ...item, column: 2 } }))
        setModalState(true)
        setTotal(submission.studyAmount)
      } else setErrorMessage('Input surpasses the amount of cards in the deck')
    }
  }

  const handleChoice = (card, column) => {
    if (choiceOne == '' && choiceTwo == '' && column == 1) { //No choice, column 1 first'
      setChoiceOne(card)
    } else if (choiceOne == '' && choiceTwo == '' && column == 2) { //No choice, column 2 first
      setChoiceTwo(card)
    } else if (choiceOne !== '' && choiceTwo == '' && column == 2) {//Column 1, then column 2
      setChoiceTwo(card)
    } else if (choiceOne !== '' && choiceTwo == '' && column == 1) { //Column 1, then Column 1
      setChoiceOne(card)
    } else if (choiceOne == '' && choiceTwo !== '' && column == 2) {
      setChoiceTwo(card)
    } else if (choiceOne == '' && choiceTwo !== '' && column == 1) {
      setChoiceOne(card)
    } else if (choiceOne !== '' && choiceTwo !== '' && column == 1) {//Both choices filled, reselect C1
      setChoiceOne(card)
    } else if (choiceOne !== '' && choiceTwo !== '' && column == 2) {//Both choices filled, reselect C2
      setChoiceTwo(card)
    }
  }

  const handleCheckAnswer = () => {
    const indexChoice1 = randomCards.findIndex(card => card.front == choiceOne.front)
    if (choiceOne.id == choiceTwo.id && choiceOne !== '' && choiceTwo !== '') {
      if (wrong == false) {
        setAnsweredCards(prevAnswered =>
          [{ ...randomCards[indexChoice1], attempt: 0 }, ...prevAnswered]
        )
        setScore(score + 1)
      } else {
        setAnsweredCards(prevAnswered => [randomCards[indexChoice1], ...prevAnswered])
        setWrong(false)
      }
      setRandomCards(randomCards.filter((item) => item.id !== choiceOne.id))
      setColumnTwo(columnTwo.filter((item) => item.id !== choiceOne.id))
      setChoiceOne('')
      setChoiceTwo('')
      setAnswerMessage('Correct')
    } else if (choiceOne == '' && choiceTwo == '') {
      setAnswerMessage('Select an item')
    } else if (choiceOne == '' && choiceTwo !== '' || choiceOne !== '' && choiceTwo == '') {
      setAnswerMessage('Complete your selection')
    } else {
      setRandomCards(prevRandom => {
        const updatedRandomCards = prevRandom.map((card, index) => {
          if (index == indexChoice1) {
            return { ...card, attempt: (card.attempt || 0) + 1 }
          } else {
            return card
          }
        })
        return updatedRandomCards
      })
      console.log(randomCards)
      console.log(randomCards[indexChoice1])
      setWrong(true)
      setAnswerMessage('Incorrect')
      console.log('yes')
    }
  }

  const handleFinishStudy = () => {
      setScore(0)
      setModalState(false)
      setAnswerMessage('')
      setChoiceOne('')
      setChoiceTwo('')
      setAnswerMessage('')
      setMessage('')
      setAnsweredCards([])
      console.log('score added')
      localStorage.removeItem('c1')
      localStorage.removeItem('c2')
      localStorage.removeItem('m-score')
  }

  const leaveStudy = () => {
    setModalState(false)
    setAnswerMessage('')
    setMessage('')
    localStorage.setItem('c1', JSON.stringify(randomCards))
    localStorage.setItem('c2', JSON.stringify(columnTwo))
    localStorage.setItem('m-score', JSON.stringify(score))
    setChoiceOne('')
    setChoiceTwo('')
  }

  const handleResume = () => {
    setModalState(true)
    setRandomCards(JSON.parse(localStorage.getItem('c1')))
    setColumnTwo(JSON.parse(localStorage.getItem('c2')))
    setScore(JSON.parse(localStorage.getItem('m-score')))
  }

  return (
    <div>
      {modalState == true && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            {randomCards.length !== 0 && message == '' && (
              <div>
                <div class='centered-container'>
                  <div class='column-container'>
                    <div>
                      {randomCards.map((card) => {
                        return (
                          <div>
                            <button onClick={() => { handleChoice(card, card.column) }} className="option">
                              {card.front}
                            </button>
                          </div>
                        )
                      })}
                    </div>

                    <div style={{ display: "flex", flexDirection: 'column' }}>
                      {(choiceOne !== '' || choiceTwo !== '') && (
                        <div className='matching-table'>
                          <table style={{ backgroundColor: "black", color: 'rgb(100, 191, 248)' }}>
                            <th className="matching-table-header">Front</th>
                            <th className="matching-table-header">Back</th>
                            <tr style={{ backgroundColor: 'gray' }}>
                              <td className="matching-table-details">{choiceOne.front}</td>
                              <td className="matching-table-details">{choiceTwo.back}</td>
                            </tr>
                          </table>
                        </div>
                      )}
                      <div className="user">
                        <button className='create' onClick={handleCheckAnswer}>Check Answer</button>
                        <h2 className="header">{answerMessage}</h2>
                        <h2 className="header">Score: {score}</h2>
                        <button onClick={() => { setMessage("Are you sure you would like to finish studying before all questions have been answered? Doing so will not add to the weekly studied amount.") }}
                          className="create"
                        >Finish studying</button>
                      </div>
                    </div>

                    <div>
                      {columnTwo.map((card) => {
                        return (
                          <div>
                            <button onClick={() => { handleChoice(card, card.column) }} className="option">
                              {card.back}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <h2></h2>
                </div>
              </div>
            )}

            <ConfirmComplete
              message={message}
              setMessage={setMessage}
              handleFinishStudy={leaveStudy}
            />

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

      <div class='study-options'>
        <h2 className="header">
          <h2>Matching</h2>
        </h2>
        <p className="text">Guide: Match the front with the correct opposite side of the card</p>
        <h2 className="header">
          Select the deck you would like to study from
        </h2>
        <select onChange={(event) => {
          handleSelect(event.target.value)
        }}
          className="text"
        >
          <option>------</option>
          {decks.map((decks) => {
            return (
              <option>
                {decks.name}
              </option>
            )
          })}
        </select>
        {selectedOption !== "------" && <p className="text">Selected deck contains: {filteredDeck.cards.length} cards</p>}
        <div>
          <h2 className="header">Input the amount of cards you would like to study</h2>
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <input
                {...register('studyAmount')}
                onChange={() => { setErrorMessage('') }}
                className="text"
              />
              <input
                className="text"
                type='submit' />
            </form>
            <p>
              {errors.studyAmount?.message}
            </p>
            <button onClick={() => {
              handleResume()
            }}>
              Resume Study
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}