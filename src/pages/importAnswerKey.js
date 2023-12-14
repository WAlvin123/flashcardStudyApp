const loadedDecks = JSON.parse(e.target.result)
      const storedDecks = localStorage.getItem('decks') ? JSON.parse(localStorage.getItem('decks')) : [];
      const updatedDecks = [];

      storedDecks.forEach(deck => {
        const matchingDeckIndex = loadedDecks.findIndex(loadedDeck => loadedDeck.name == deck.name)
        let maxID = 0
        deck.cards.forEach(card => {
          if (card.id > maxID) {
            maxID = card.id
          }
        })
        if (matchingDeckIndex !== -1) {
          const matchingDeck = loadedDecks[matchingDeckIndex]
          const storedFronts = deck.cards.map(card => {return card.front})
          const storedBacks = deck.cards.map(card => {return card.back})
          matchingDeck.cards.forEach(card => {
            if (!storedFronts.includes(card.front) && !storedBacks.includes(card.back)) {
              deck.cards.push({...card, id: ++maxID})
            }
          })
          loadedDecks.splice(matchingDeckIndex, 1)
        }
        updatedDecks.push({...deck, id: Math.random() * 1000})
      })

      loadedDecks.forEach(deck => {
        updatedDecks.push(deck)
      })

      localStorage.setItem('decks', JSON.stringify(updatedDecks))