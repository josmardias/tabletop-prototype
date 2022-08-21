export const Character = ({ name, attributes, actions, onAction }) => {
  return (
    <div>
      <p>{name}</p>
      <div style={styles.panels}>
        <div>
          <h4>Stats</h4>
          {Object.entries(attributes).map(([key, value], i) => (
            <p key={key}>
              {key}: {value}
            </p>
          ))}
          <h4>Actions</h4>
          {Object.entries(actions).map(([key, value], i) => (
            <button key={key} title={value} onClick={() => onAction(key)}>
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  panels: {
    display: 'flex',
    gap: 10,
    minWidth: 400,
  },
}
