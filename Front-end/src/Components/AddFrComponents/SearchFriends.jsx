import React, { useState, useEffect } from "react";

function SearchFriends(props) {
  const [pattern, setPattern] = useState(" ");
  const [friends, setFriends] = useState([]);

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
        .then(res => setFriends(res[1]))
        .then(res => console.log(res));
    }
  }, [pattern]);

  return(
      <>
      <input
        placeholder="search for new people"
        className="mt-2"
        onChange={ev => {
          setPattern(ev.target.value);
        }}
      />
      <ul>
        {friends.map(el => (
          <li className="mt-2">
            <img
              style={{ borderRadius: "50%" }}
              height="80px"
              width="80px"
              src={el.link_poza}
            />
            <span>{el.username}</span>
            <span>
              <button
                onClick={ev => {
                  fetch(`http://${window.location.hostname}:3000/send_friend_request`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      token: props.token
                    },
                    body: JSON.stringify({ user_id: el._id })
                  });
                  //   props.updateComponent();
                  alert("request sent !");
                  // props.setMode("messenger");
                }}
              >
                add
              </button>
            </span>
          </li>
        ))}
      </ul>
      </>
  )
}

export default SearchFriends;