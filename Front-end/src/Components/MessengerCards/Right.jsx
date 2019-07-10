import React from "react";
import Card from "react-bootstrap/Card";

function Right(props) {
  return (
    <Card>
      Nume: {props.person.username} <br />
      {/* Data nasterii:{" "}
      {props.person.data_nasterii.ziua +
        "/" +
        props.person.data_nasterii.luna +
        "/" +
        props.person.data_nasterii.anul}{" "}
      <br />
      Nr_telefon: {props.person.nr_telefon} */}
      <img
        src={props.person.link_poza}
        height="400px"
        width="300px"
        className="ml-2 mt-3"
        style={{ "border-radius": "50px" }}
      />
    </Card>
  );
}

export default Right;
