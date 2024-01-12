export const PreStudyInput = ({ title, handleSelect, setSelectedOption, selectedOption, decks, filteredDeck, handleSubmit, onSubmit, register, errors, guideMessage }) => {
  return (
    <div>
      <h2 className="header">{title}</h2>
      <p className="text">{guideMessage}</p>
      <h2 className="header">Select the deck you would like to study from</h2>
      <select onChange={(event) => {
        handleSelect(event.target.value)
        setSelectedOption(event.target.value)
      }}
        className="text">
        <option>------</option>
        {decks.map((decks) => {
          return (
            <option>
              {decks.name}
            </option>
          )
        })}
      </select>
      {selectedOption !== "------" && <p className="text">Selected deck contains: {filteredDeck.cards.length} cards</p>}
      <div>
        <h2 className="header">Input the amount of cards would like to study, and <br />
          select what side you would like the question prompt to be</h2>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('studyAmount')}
              className="text"
            />
            <select {...register('studySide')}
              className="text"
            >
              <option>------</option>
              <option>front</option>
              <option>back</option>
            </select>
            <input type='submit'
              style={{ fontSize: '180%' }}
              className="text"
            />
            <p>{errors.studyAmount?.message}</p>
          </form>
        </div>
      </div>
    </div>
  )
}