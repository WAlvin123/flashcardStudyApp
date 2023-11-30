import { useState, useEffect } from "react";
import * as yup from 'yup';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDeckState } from "../components/useDeckState";

export const Matching = () => {
  const [decks, setDecks] = useDeckState()
  const [columnOne, setColumnOne] = useState()
  const [columnTwo, setColumnTwo] = useState()
  const [filteredDeck, setFilteredDeck] = useState({})
  const [modalState, setModalState] = useState(false)
  const [choiceOne, setChoiceOne] = useState('')
  const [choiceTwo, setChoiceTwo] = useState('')
  const [wrong, setWrong] = useState(false)
  const [answerMessage, setAnswerMessage] = useState('')
  const [score, setScore] = useState(0)

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
      setColumnOne([...smallerArray].map((item) => { return { ...item, column: 1 } }))
      const newArray = [...smallerArray]
      newArray.sort(() => Math.random() - 0.5)
      setColumnTwo([...newArray].map((item) => { return { ...item, column: 2 } }))
      setModalState(true)
    }
  }

  const handleChoice = (card, column) => {
    if (choiceOne == '' && choiceTwo == '' && column == 1) { //No choice, column 1 first
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
    if (choiceOne.id == choiceTwo.id && choiceOne !== '' && choiceTwo !== '') {
      setColumnOne(columnOne.filter((item) => item.id !== choiceOne.id))
      setColumnTwo(columnTwo.filter((item) => item.id !== choiceOne.id))
      setChoiceOne('')
      setChoiceTwo('')
      setAnswerMessage('Correct')
      if (wrong == false) {
        setScore(score + 1)
      } else {
        setWrong(false)
      }
    } else if (choiceOne == '' && choiceTwo == '') {
      setAnswerMessage('Select an item')
    } else if (choiceOne == '' && choiceTwo !== '' || choiceOne !== '' && choiceTwo == '') {
      setAnswerMessage('Complete your selection')
    } else {
      if (wrong == false && score == 0) {
        setWrong(true)
      } else if (wrong == false) {
        setWrong(true)
      } else if (wrong == true) {
        setScore(score)
      }
      setAnswerMessage('Incorrect')
    }
  }

  const handleFinishStudy = () => {
    setScore(0)
    setModalState(false)
    setAnswerMessage('')
  }

  return (
    <div>
      {(modalState == true && columnOne.length !== 0) && (
        <div class='modalBackground'>
          <div class='modalContainer'>
            <div style={{ display: 'flex', justifyContent: "center" }}>
              <table style={{ backgroundColor: "black", color: 'white' }}>
                <th width='200px'>Front</th>
                <th width='200px'>Back</th>
                <tr style={{ backgroundColor: 'white' }}>
                  <td style={{ color: "black" }}>{choiceOne.front}</td>
                  <td style={{ color: "black" }}>{choiceTwo.back}</td>
                </tr>
              </table>
            </div>
            <h2>{answerMessage}</h2>
            <h2>Score: {score}</h2>
            <div class='column-container'>
              <div>
                {columnOne.map((card) => {
                  return (
                    <div>
                      <button onClick={() => { handleChoice(card, card.column) }}>
                        {card.front}
                      </button>
                    </div>
                  )
                })}
              </div>
              <div>
                {columnTwo.map((card) => {
                  return (
                    <div>
                      <button onClick={() => { handleChoice(card, card.column) }}>
                        {card.back}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
            <h2></h2>
            <button onClick={handleCheckAnswer}>Check Answer</button>
            <button onClick={handleFinishStudy}>Finish studying</button>
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
        </div>
      </div>
    </div>
  )
}