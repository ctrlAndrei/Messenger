import React, { useState, useEffect } from "react";

class FriendsRequests extends React.Component {
  state = {
    requests: []
  };
  componentDidMount() {
    fetch(`http://${window.location.hostname}:3000/get_friends_requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: this.props.token
      }
    })
      .then(res => res.json())
      .then(res => {
        this.setState({ requests: [...JSON.parse(res)] });
        console.log(JSON.parse(res));
      });
  }
  render() {
    return (
      <ul>
        {this.state.requests.map(el => (
          <li>
            <img style={{ borderRadius: "50%" }} width="80px" height="80px" src={el.poza} />
            <span>{el.username}</span>
            <button
              onClick={ev => {
                fetch(`http://${window.location.hostname}:3000/accept_friend_request`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    token: this.props.token
                  },
                  body: JSON.stringify({ user_id: el.id })
                });
                alert("request accepted !");
              }}
            >
              accept
            </button>
          </li>
        ))}
      </ul>
    );
  }
}

export default FriendsRequests;
