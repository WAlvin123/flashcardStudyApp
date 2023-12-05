const completeEdit = () => {
  setDecks(prevDecks => {
    const updatedDecks = prevDecks.map((deck) => {
      if (deck.name == editCard.deck) {
        const updatedCards = deck.cards.map((card) => {
          if (card.id == editCard.id) {
            return { ...card, front: editFront, back: editBack }
          }
          return card
        })
        return { ...deck, cards: updatedCards }
      }
      return deck
    })
    localStorage.setItem('decks', JSON.stringify(updatedDecks))
    setEditVisible(false)
    return updatedDecks
  })
}