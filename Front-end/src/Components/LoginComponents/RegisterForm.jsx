import React from "react";

class RegisterForm extends React.Component {
  state = {
    nume: "",
    parola: "",
    email: ""
  };

  updateName = ev => {
    this.setState({ nume: ev.target.value });
  };
  updatePass = ev => {
    this.setState({ parola: ev.target.value });
  };
  updateEmail = ev => {
    this.setState({ email: ev.target.value });
  };

  render() {
    return (
      <div id="login">
        <input placeholder="nume" onChange={this.updateName} />

        <input type="password" placeholder="parola" onChange={this.updatePass} />

        <input placeholder="email" onChange={this.updateEmail} />

        <button
          onClick={() =>
            this.props.register(
              this.state.nume,
              this.state.parola,
              this.state.email
            )
          }
        >
          Activeaza
        </button>
      </div>
    );
  }
}

export default RegisterForm;
