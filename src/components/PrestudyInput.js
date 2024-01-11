export const PreStudyInput = ({ title, handleSelect, setSelectedOption, selectedOption, decks, filteredDeck, handleSubmit, onSubmit, register, errors, guideMessage }) => {
  return (
    <div class='study-options'>
      {title}
      {guideMessage}
      <h2>Select the deck you would like to study from</h2>
      <select onChange={(event) => {
        handleSelect(event.target.value)
        setSelectedOption(event.target.value)
      }}>
        <option>------</option>
        {decks.map((decks) => {
          return (
            <option>
              {decks.name}
            </option>
          )
        })}
      </select>
      {selectedOption !== "------" && <p>Selected deck contains: {filteredDeck.cards.length} cards</p>}
      <div>
        <h2>Input the amount of cards would like to study, and <br />
          select what side you would like the question prompt to be</h2>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('studyAmount')} />
            <select {...register('studySide')}>
              <option>------</option>
              <option>front</option>
              <option>back</option>
            </select>
            <input type='submit' />
            <p>{errors.studyAmount?.message}</p>
          </form>
        </div>
      </div>
    </div>
  )
}