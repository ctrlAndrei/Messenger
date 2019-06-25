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
      <div id="login" style={{paddingTop:"70px"}}>
        <input placeholder="nume" onChange={this.updateName} />
        <br />
        <input
          type="password"
          placeholder="parola"
          onChange={this.updatePass}
          className="mt-2"
        />
        <br />
        <input placeholder="email" onChange={this.updateEmail} className="mt-2"/>
        <br />
        <button
          onClick={() =>
            this.props.register(
              this.state.nume,
              this.state.parola,
              this.state.email
            )
          }
          className="mt-2"
        >
          Register
        </button>
      </div>
    );
  }
}

export default RegisterForm;
