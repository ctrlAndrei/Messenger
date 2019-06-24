import React from "react";

class LoginForm extends React.Component {
  state = {
    nume: "",
    parola: ""
  };
 
  updateName = ev => {
    this.setState({ nume: ev.target.value });
  };
  updatePass = ev => {
    this.setState({ parola: ev.target.value });
  };
  render() {
    return (
      <div id="login">
        <input onChange={this.updateName} placeholder="nume" />

        <input type="password" onChange={this.updatePass} placeholder="parola" />

        <button
          onClick={() =>
            this.props.activateLogin(this.state.nume, this.state.parola)
          }
        >
          Activeaza
        </button>
      </div>
    );
  }
}

export default LoginForm;
