export const Results = ({ randomCards, score, total, handleFinishStudy, answeredCards }) => {
  const sortedAnsweredCards = answeredCards.sort((a, b) => b.attempt - a.attempt)


  if (randomCards.length == 0) {
    return (
      <div>
        <h1>Results:</h1>
        <h2>You scored {score} / {total}</h2>

        {answeredCards.some(card => card.attempt !== 0) && (
          <div>
            <p>Most attempted cards (up to 5)</p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <table style={{ display: 'flex', alignContent: "center", }}>
                <th style={{paddingRight:'30px'}}>
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
                <th>
                  Attempts
                  <td>
                    {sortedAnsweredCards.slice(0, 5).map(card => {
                      if (card.attempt !== 0) {
                        return (
                          <p style={{ paddingLeft: '30px' }}>{card.attempt}</p>
                        )
                      }
                    })}
                  </td>
                </th>
              </table>
            </div>
          </div>
        )}
        <button onClick={handleFinishStudy}>Finish studying</button>
      </div>
    )
  }
}