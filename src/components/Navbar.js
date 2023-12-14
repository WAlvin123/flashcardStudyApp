import { Link } from "react-router-dom"

export const Navbar = () => {
  return (
    <div className="navbar">
      <Link to={'/'} style={{color:'white', textDecoration:'none'}}>Home</Link>
      <Link to={'/simple'} style={{color:'white', textDecoration:'none'}}> Simple Study</Link>
      <Link to={'/matching'} style={{color:'white', textDecoration:'none'}}>Matching</Link>
      <Link to={'/multiplechoice'} style={{color:'white', textDecoration:'none'}}>Multiple Choice</Link>
      <Link to={'/shortanswer'} style={{color:'white', textDecoration:'none'}}>Short Answer</Link>
      <Link to={'/importdeck'} style={{color:'white', textDecoration:'none'}}>Import / Export Decks</Link>
    </div>
  )
}