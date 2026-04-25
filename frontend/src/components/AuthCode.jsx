import './Login.css';

const AuthCode = () => {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="title">Akademik+</h1>
        <p className="subtitle">Wprowadź kod autoryzacyjny</p>

        <form className="form" onSubmit={(e) => e.preventDefault()}>
          <div className="input-group">
            <label htmlFor="authCode">Podaj kod autoryzacyjny</label>
            <input type="text" id="authCode" placeholder="Wpisz kod" />
          </div>

          <div className="button-center-wrapper">
            <button type="submit" className="confirm-btn">
              Zatwierdź
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthCode;