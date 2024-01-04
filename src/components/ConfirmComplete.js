export const ConfirmComplete = ({message, setMessage, handleFinishStudy}) => {
  if (message !== '') {
    return (<div>
      <h2>Confirmation: </h2>
      <p className="confirmation-message">{message}</p>
      <div>
        <button onClick={handleFinishStudy}>
          YES
        </button>
        <button onClick={() => {
          setMessage('')
        }}>
          NO
        </button>
      </div>
    </div>)
  }
}