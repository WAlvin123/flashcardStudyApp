export const Results = ({ randomCards, score, total, handleFinishStudy, answeredCards }) => {
  const sortedAnsweredCards = answeredCards.sort((a, b) => b.attempt - a.attempt)


  if (randomCards.length == 0) {
    return (
      <div>
        <h1 className="header">Results:</h1>
        <h2 className="header">You scored {score} / {total}</h2>

        {answeredCards.some(card => card.attempt !== 0) && (
          <div>
            <p className="text">Most attempted cards (up to 5)</p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <table style={{ display: 'flex', alignContent: "center", }}>
                <th className="text">
                  Card
                  <td>
                    {sortedAnsweredCards.slice(0, 5).map(card => {
                      if (card.attempt !== 0) {
                        return (
                          <p>{card.front}</p>
                        )
                      }
                    })}

                  </td>
                </th>
                <th className="text">
                  Attempts
                  <td>
                    {sortedAnsweredCards.slice(0, 5).map(card => {
                      if (card.attempt !== 0) {
                        return (
                          <p>{card.attempt}</p>
                        )
                      }
                    })}
                  </td>
                </th>
              </table>
            </div>
          </div>
        )}
        <button onClick={handleFinishStudy} className="create">Finish studying</button>
      </div>
    )
  }
}