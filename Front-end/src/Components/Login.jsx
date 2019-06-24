import React from "react";

import LoginForm from "./LoginComponents/LoginForm";

import RegisterForm from "./LoginComponents/RegisterForm";

import "./style.css";

class Login extends React.Component {
  constructor() {
    super();

    this.state = {
      isLoginForm: true
    };
  }

  changeForm = () => {
    this.setState({
      isLoginForm: !this.state.isLoginForm
    });
  };

  render() {
    return (
      <div>
        <div>
          <h3>Welcome to Messenger</h3>
        </div>

        {this.state.isLoginForm ? (
          <LoginForm {...this.props} />
        ) : (
          <RegisterForm {...this.props} />
        )}

        <button onClick={this.changeForm}>changeForm</button>
      </div>
    );
  }
}

export default Login;
