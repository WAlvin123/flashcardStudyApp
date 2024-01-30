import { useState, useEffect } from "react";
import { useDeckState } from "../components/useDeckState";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css"
import { getAuth, signOut } from "firebase/auth";

export const Home = () => {
  const [decks, setDecks, getDecks] = useDeckState()
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  let auth
  if (localStorage.getItem('is_auth') == 'true') {
    auth = getAuth();
 } else {
   auth = getAuth()
   signOut(auth)
 }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user)
        getDecks()
        localStorage.setItem('signed-in', true)
      } else {
        const storedDecks = localStorage.getItem('decks')
        if (storedDecks) {
          setDecks(JSON.parse(storedDecks))
        }
      }
    })
    return unsubscribe
  }, [])

  return (
    <div className="selection">
      {auth.currentUser !== null && (<h2>Welcome {auth.currentUser.email}</h2>)}
      {auth.currentUser == null && (
        <h2>
          You are currently a guest. Cards will<br />
          not be synced with the database <br />
        </h2>
      )}
      <h2 className="header">Select a study method</h2>
      <div className="centered-container">
        <div>
          <div>
            <button className='study-button' onClick={() => { navigate('/memorization') }}>
              MEMORIZATION
            </button>
            <button className='study-button' onClick={() => { navigate('/matching') }}>
              MATCHING
            </button>
          </div>

          <div>
            <button className='study-button' onClick={() => { navigate('/multiplechoice') }}>
              MULTIPLE CHOICE
            </button>
            <button className='study-button' onClick={() => { navigate('/shortanswer') }}>
              SHORT ANSWER
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}