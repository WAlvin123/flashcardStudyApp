import { useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firestore"
import {  getAuth } from "firebase/auth";

export const useDeckState = () => {
  const [decks, setDecks] = useState([])
  const auth = getAuth()

  const getDecks = async () => {
    const user = auth.currentUser;
    const userCollectionRef = collection(db, user.uid);
    const querySnapshot = await getDocs(userCollectionRef);
    const decks = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setDecks(decks);
  }
  return [decks, setDecks, getDecks]
}
