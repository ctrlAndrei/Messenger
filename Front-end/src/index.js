import React from "react";
import ReactDOM from "react-dom";
import LoginPage from "./Components/Login";
import MessengerPage from "./Components/Messenger";
import "./styles.css";


class App extends React.Component {
  constructor() {
    super();
    this.state = {
      logat: false,
      token: ""
    };
  }

  componentDidMount() {
    if (sessionStorage.getItem("token")) {
      this.setLogin(true, sessionStorage.getItem("token"));
    }
  }

  activateLogin = (nume, parola) => {
    let verify = false;
    if (nume === "" || parola === "") {
      alert("completati toate campurile");
      return;
    }
    fetch(`http://${window.location.hostname}:3000/login`, {
      method: 'POST',
      body: JSON.stringify({ username: nume, password: parola }),
      headers: { 'Content-Type': 'application/json' },
    }).then(res => {
      if (res.ok) {
        verify = true;
        return res.json()
      }
    })
      .then(data => {
        (verify) ? this.setLogin(verify, data.token) : alert("informatiile pentru nume/parola nu sunt corecte");
        // salvam sesiunea
        if (verify) sessionStorage.setItem("token", data.token);
      })
      .catch(err => console.log(err));
  };

  register = (nume, pass, mail) => {
    let campGol = nume === "" || pass === "" || mail === "";
    if (campGol || !/\S+@\S+\.\S+/.test(mail)) {
      alert("Completati toate campurile si introduceti un email valid");
      return;
    }
    fetch(`http://${window.location.hostname}:3000/register`, {
      method: 'POST',
      body: JSON.stringify({ username: nume, password: pass, email: mail }),
      headers: { 'Content-Type': 'application/json' },
    }).then(res => {
      if (res.ok) {
        alert("Registered with succes !");
        // this.setState({ logat: true })
      } else {
        alert("numele/emailul este deja folosit");
      }
    })
      .catch(err => console.log(err));
  };

  setLogin = (booleanValue, tk = this.state.token) => {
    this.setState({
      logat: booleanValue,
      token: tk
    });
  };

  render() {
    console.log("Se randeaza pagina");

    return (
      <div>
        {this.state.logat ? (
          <MessengerPage logOutFunction={this.setLogin} token={this.state.token} />
        ) : (
            <LoginPage
              logInFunction={this.setLogin}
              register={this.register}
              activateLogin={this.activateLogin}
            />
          )}
      </div>
    );
  }
}

const rootElement = document.getElementById("root");

ReactDOM.render(<App />, rootElement);
