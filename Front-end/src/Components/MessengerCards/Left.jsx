import React from "react";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function Left(props) {
  const rounded = { "borderRadius": "50%" };
  // console.log(props);
  return (
    <Card style={{ height: "500px", overflow: "auto" }}>
      <h4 className="ml-2 mt-2">Conversations</h4>
      {props.people.map(el => {
        return (
          <div onClick={props.selectConv} className="convo" style={{borderRadius:"15px"}}>
            <Container>
              <Row className="mt-2">
                <Col id={el.id}>
                  <img
                    style={rounded}
                    width="80px"
                    src={el.link_poza}
                    id={el.id}
                  />
                </Col>
                <Col md={9} id={el.id}>
                  <span id={el.id}>
                    <b id={el.id}>{el.username}</b>
                  </span>
                </Col>
              </Row>
            </Container>
          </div>
        );
      })}
    </Card>
  );
}

export default Left;
