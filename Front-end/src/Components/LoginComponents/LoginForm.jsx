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
      <div id="login" style={{ textAlign: "center", paddingTop:"70px" }}>
        <input onChange={this.updateName} placeholder="nume" className="mb-2"/>
        <br />
        <input
          type="password"
          onChange={this.updatePass}
          placeholder="parola"
          className="mb-3"
        />
        <br />
        <button
          onClick={() =>
            this.props.activateLogin(this.state.nume, this.state.parola)
          }
          style={{paddingRight:"140px"}}
        >
          Login
        </button>
      </div>
    );
  }
}

export default LoginForm;
