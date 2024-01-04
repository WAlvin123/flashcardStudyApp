export const Results = ({randomCards, score, total, handleFinishStudy}) => {
  if (randomCards.length == 0) {
    return (
      <div>
      <h1>Results:</h1>
      <h2>You scored {score} / {total}</h2>
      <button onClick={handleFinishStudy}>Finish studying</button>
    </div>
    )
  }
}