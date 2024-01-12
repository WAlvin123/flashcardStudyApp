export const ConfirmComplete = ({message, setMessage, handleFinishStudy}) => {
  if (message !== '') {
    return (<div>
      <h2 className="header">Confirmation: </h2>
      <p className="confirmation-message">{message}</p>
      <div>
        <button onClick={handleFinishStudy}
        className="create">
          YES
        </button>
        <button onClick={() => {
          setMessage('')
        }}
        className="create">
          NO
        </button>
      </div>
    </div>)
  }
}