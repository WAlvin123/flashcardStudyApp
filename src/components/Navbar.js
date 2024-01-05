import { Link } from "react-router-dom"

export const Navbar = () => {
  return (
    <div className="navbar">
      <Link to={'/'} style={{color:'white', textDecoration:'none', fontSize:25}}>Home</Link>
      <Link to={'/decks'} style={{color:'white', textDecoration:'none', fontSize:25}}>Decks</Link>
      <Link to={'/cards'} style={{color:'white', textDecoration:'none', fontSize:25}}>Cards</Link>
      <Link to={'/importdeck'} style={{color:'white', textDecoration:'none', fontSize:25}}>Import / Export Decks</Link>
    </div>
  )
}