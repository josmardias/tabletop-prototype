export const BattleLog = ({ logs }) => {
  if (!logs.length) {
    return <div style={styles.container}>No logs yet.</div>
  }

  return (
    <div style={styles.container}>
      {logs.map((log, index) => (
        <div key={index}>
          <p>{JSON.stringify(log)}</p>
        </div>
      ))}
    </div>
  )
}

const styles = {
  container: {},
}
