import { useNavigate } from "react-router-dom"
import '../styles/Navbar.css'

export const Navbar = () => {
  const navigate = useNavigate()

  return (
    <div className="navbar">
    <h2 className="title">Flash card App</h2>
      <button className="link" onClick={() => {navigate('/')}}>Home</button>
      <button className="link" onClick={() => {navigate('decks')}}>Decks</button>
      <button className="link" onClick={() => {navigate('cards')}}>Cards</button>
      <button className="link" onClick={() => {navigate('/importdeck')}}>Import / Export</button>
    </div>
  )
}