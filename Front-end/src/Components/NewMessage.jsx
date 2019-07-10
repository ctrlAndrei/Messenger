import React, { useState, useEffect } from "react";

function NewMessage(props) {
  const [pattern, setPattern] = useState(" ");
  const [friends, setFriends] = useState([]);
  const [newMessage, setMessage] = useState("");

  useEffect(() => {
    if (pattern.length > 2) {
      fetch(`http://${window.location.hostname}:3000/search_friends`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: props.token
        },
        body: JSON.stringify({ search: pattern })
      })
        .then(res => res.json())
        .then(res => setFriends(res[0]))
        .then(res => console.log(res));
    }
  }, [pattern]);
  return (
    <div className="mt-3 ml-3">
      <h2>New Message</h2>
      <input
        placeholder="search in friends list"
        className="mt-2"
        onChange={ev => {
          setPattern(ev.target.value);
        }}
      />
      <ul>
        {friends.map(el => (
          <li className="mt-3">
            <div>
              <img
                style={{ borderRadius: "50%" }}
                height="80px"
                width="80px"
                src={el.link_poza}
              />
              <span>
                <input
                  className="ml-2 mr-2"
                  placeholder="type new message"
                  onChange={ev => {
                    setMessage(ev.target.value);
                  }}
                />
                <button
                  onClick={ev => {
                    if (newMessage != "") {
                      props.webSocket.send(
                        JSON.stringify({
                          token: props.token,
                          id_prieten: el._id,
                          continut: newMessage
                        })
                      );
                      props.updateComponent();
                      alert("message sent !");
                    }
                    // props.setMode("messenger");
                  }}
                >
                  send
              </button>
              </span>
            </div>
            <span><b>{el.username}</b></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NewMessage;
