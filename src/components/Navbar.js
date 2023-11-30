import { Link } from "react-router-dom"

export const Navbar = () => {
  return (
    <div className="navbar">
      <Link to={'/'}>Home</Link>
      <Link to={'/multiplechoice'}>Multiple Choice</Link>
      <Link to={'/matching'}>Matching</Link>
      <Link to={'/shortanswer'}>Short Answer</Link>
    </div>
  )
}