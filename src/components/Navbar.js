import { useNavigate } from "react-router-dom"
import '../styles/Navbar.css'
import { getAuth, signOut } from "firebase/auth"
import { useDeckState } from "./useDeckState";

export const Navbar = () => {
  const navigate = useNavigate()
  const auth = getAuth();

  const handleSignOut = () => {
    signOut(auth).then(() => {
      localStorage.setItem('is_auth', false)
      navigate('/')
    }).catch((error) => {
      console.log(error)
    })
  }

  return (
    <div className="navbar">
      <h2 className="title"><span style={{ color: 'black' }}>Simply</span>Study</h2>
      <button className="link" onClick={() => { navigate('/') }}>Home</button>
      <button className="link" onClick={() => { navigate('decks') }}>Decks</button>
      <button className="link" onClick={() => { navigate('cards') }}>Cards</button>
      {localStorage.getItem('is_auth') == 'true' && (
        <button className="link" onClick={() => { navigate('/importdeck') }}>Import </button>
      )}
      {localStorage.getItem('is_auth') !== 'true' && (
        <button className="link" onClick={() => { navigate('/signin') }}>Sign in / Register</button>
      )}
      {localStorage.getItem('is_auth') == 'true' && (
        <button className="link" onClick={handleSignOut}>Sign Out</button>
      )}
    </div>
  )
}