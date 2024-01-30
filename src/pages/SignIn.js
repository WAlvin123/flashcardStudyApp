import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useState, createContext } from "react";
import { useNavigate } from "react-router-dom";

export const SignIn = () => {

  const [email, setEmail] = useState()
  const [password, setPassword] = useState()
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  let auth
  if (localStorage.getItem('is_auth') == 'true') {
     auth = getAuth();
  } else {
    auth = getAuth()
    signOut(auth)
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      localStorage.setItem('is_auth', true)
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/')
    } catch (error) {
      setErrorMessage('Login information is incorrect')
    }
  }

  return (
    <div>
      {auth.user !== null && (
        <form onSubmit={handleLogin}>
          <div class='centered-container'>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <p className="header">E-mail</p>
              <input value={email} onChange={(event) => setEmail(event.target.value)} className="text" />
              <p className="header">Password</p>
              <input value={password} onChange={(event) => setPassword(event.target.value)} className="text" />
              <p>{errorMessage}</p>
              <input type='submit' className="create" value="Sign in" />
              <p>Don't have an account? Register <button
                onClick={() => { navigate('/register') }}
                style={
                  {
                    background: 'transparent',
                    border: 'none',
                    color: "green",
                    cursor: 'pointer',
                    width: 'fit-content',
                    fontSize: '15px',
                  }
                }>here</button></p>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}