import { useState, useEffect } from "react";
import { useDeckState } from "../components/useDeckState";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css"

export const Home = () => {
  const [totalCards, setTotalCards] = useState(0)
  const [decks, setDecks] = useDeckState()
  const navigate = useNavigate()


  useEffect(() => {
    const storedDecks = JSON.parse(localStorage.getItem('decks'));
    let sum = 0

    if (storedDecks) {
      setDecks(storedDecks)
    }

    storedDecks.forEach(deck => {
      sum += deck.cards.length
    })
    setTotalCards(sum)
  }, [])

  return (
    <div>
      <p style={{ fontSize: 40 }}>Select a study method</p>
      <div className="centered-container">
          <table>
            <th>
            <button className='bg-button' onClick={() => {navigate('/simple')}}>
              SIMPLE STUDY
            </button>
            <td>
              <button className='bg-button' onClick={() => {navigate('/matching')}}>
                MATCHING
              </button>
              </td>
            </th>

            <th>  
              <button className='bg-button' onClick={() => {navigate('/multiplechoice')}}>  
              MULTIPLE CHOICE    
              </button>  
              <td>
                <button className='bg-button' onClick={() => {navigate('/shortanswer')}}>
                  SHORT ANSWER
                </button>
                </td>
            </th>
          </table>
      </div>
      <h1>
        Total decks: {decks.length}
      </h1>
      <h1>
        Total cards: {totalCards}
      </h1>
    </div>
  )
}