function AnswerOptions({
  options = [],
  onSelect,
  disabled = false,
  selectedOption = null,
}) {
  if (!Array.isArray(options) || options.length === 0) {
    return null;
  }

  return (
    <div className="answer-options">
      {options.map((option, index) => {
        const isSelected = selectedOption === option;

        return (
          <button
            key={`${option}-${index}`}
            type="button"
            className={`answer-option ${
              isSelected ? "selected" : ""
            }`}
            onClick={() => onSelect?.(option)}
            disabled={disabled}
          >
            <span className="option-number">
              {index + 1}
            </span>

            <span className="option-text">
              {option}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default AnswerOptions;