import React, { useState, useEffect } from "react";
import FriendRequests from "./AddFrComponents/FriendsRequests";
import SearchFriends from "./AddFrComponents/SearchFriends"

function AddFriend(props) {
  
  return (
    <div className="mt-3 ml-3">
      <h2>Add friends</h2>
      <SearchFriends token={props.token} />
      <hr />
      <h3>Friend requests</h3>
      <FriendRequests token={props.token} />
    </div>
  );
}

export default AddFriend;
