import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Accordion from "react-bootstrap/Accordion";
import { useState } from "react";

//56cm style={{ "padding-top": length + "cm" }}

function Middle(props) {
  const [newMes, setNewMes] = useState("");
  let length = props.message.length > 9 ? 0 : 9 - props.message.length + 2; //15
  const emoji = ["😁", "😂" ,"🤣", "😃", "😄", "😅" ,"😆", "😉", "😊", "😋", "😎", "😍" ,"😘" ,"😗", "😙" ,"😚", '☺️', "🙂" ,"🤗",
    "🤩", "🤔", "🤨" ,"😐", "😑", "😶" ,"🙄", "😏", "😣", "😥", "😮", "🤐", "😯", "😪", "😫", "😴", "😌", "😛", "😜", "😝", "🤤",
    "😒", "😓", "😔", "😕", "🙃", "🤑", "😲" ,"☹️", "🙁", "😖", "😞", "😟", "😤", "😢", "😭", "😦", "😧", "😨", "😩", "🤯", "😬",
    "😰", "😱", "😳", "🤪", "😵", "😡", "😠", "🤬", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "😇", "🤠", "🤡" ,
    "🤥", "🤫", "🤭", "🧐" ,"🤓", "😈" ,"👿", "👹", "👺", "💀", "👻", "👽", "🤖" ,"💩", "😺", "😸", "😹" ,"😻", "😼", "😽",
    "🙀" ,"😿", "😾"]
  return (
    <React.Fragment style={{ display: "block" }}>
      <Card
      // style={{
      //   height: "700px",
      //   overflow: "auto",
      //   "padding-top": length + "cm"
      // }}
      >
        <Card.Body
          style={{
            height: "300px",
            overflow: "auto",
            "padding-top": length + "cm"
          }}
        >
          {props.message.map(el => {
            if (el.mesajul_meu == 1)
              return (
                <span
                  style={{
                    "background-color": "lightblue",
                    "border-radius": "6px",
                    display: "block"
                  }}
                  className="mr-5 mt-2"
                >
                  {el.continut}
                </span>
              );
            else {
              return (
                <span
                  style={{
                    "background-color": "lightgreen",
                    "border-radius": "6px",
                    display: "block"
                  }}
                  className="ml-5 mt-2"
                >
                  {el.continut}
                </span>
              );
            }
          })}
        </Card.Body>
        <Card.Footer style={{ position: "sticky" }}>
          <span>
            <input
              onChange={ev => setNewMes(ev.target.value)}
              value={newMes}
              style={{ "box-shadow": "none", "font-size": "12px" }}
            />
            <Button
              variant="primary"
              className="ml-2"
              onClick={() => {
                props.sendMes(newMes);
                setNewMes("");
              }}
            >
              send
            </Button>
            <Accordion defaultActiveKey="0" style={{ display: "inline" }}>
              <Accordion.Toggle as={Button} variant="link" eventKey="1">
                🙂 
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="1">
                <Card.Body>
                  {emoji.map(el => <a onClick={ev => setNewMes(newMes + ev.target.innerText)}>{el}</a>)}
                </Card.Body>
              </Accordion.Collapse>
            </Accordion>
          </span>
        </Card.Footer>
      </Card>
    </React.Fragment>
  );
}

export default Middle;
