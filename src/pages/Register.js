import { createUserWithEmailAndPassword, getAuth } from "firebase/auth"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../config/firestore"
import { setDoc, doc, collection, addDoc } from "firebase/firestore"

export const Register = () => {
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const auth = getAuth();

  const handleRegister = async (e) => {
    e.preventDefault()

    try {
      await createUserWithEmailAndPassword(auth, email, password)
      const user = auth.currentUser
      const userCollectionRef = collection(db, user.uid)
      await addDoc(userCollectionRef, {
        cards:[],
        name:'Welcome'
      })
      localStorage.setItem('is_auth', true)
      navigate('/')
    } catch (error) {
      setErrorMessage('Something went wrong')
    }
  }

  return (
    <div>
      {auth.user !== null && (
        <form onSubmit={handleRegister}>
          <div class='centered-container'>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <p className="header">E-mail</p>
              <input value={email} onChange={(event) => setEmail(event.target.value)} className="text" />
              <p className="header">Password</p>
              <input value={password} onChange={(event) => setPassword(event.target.value)} className="text" />
              <p>{errorMessage}</p>
              <input type='submit' className="create" value="Create account" />
            </div>
          </div>
        </form>
      )}
    </div>
  )
}