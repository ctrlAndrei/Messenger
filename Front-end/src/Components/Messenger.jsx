import React from "react";
import CardDeck from "react-bootstrap/CardDeck";
import Left from "./MessengerCards/Left.jsx";
import Middle from "./MessengerCards/Middle.jsx";
import Right from "./MessengerCards/Right.jsx";
import NewMessage from "./NewMessage";
import AddFriend from "./AddFriend";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton"


function checkText(data) {
  var patt = new RegExp("^[a-zA-Z ]*$");
  var res = patt.test(data);
  if (res) {
    return data;
  } else {
    return "eroare";
  }
}

var ID = function () {
  return (
    "_" +
    Math.random()
      .toString(36)
      .substr(2, 9)
  );
};

const profilePics = ["https://images.unsplash.com/photo-1522778147829-047360bdc7f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=658&q=80",
  "https://images.unsplash.com/photo-1560012454-137d194fa194?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=60",
  "https://images.unsplash.com/photo-1471898554234-bcbfedd35134?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=60",
  "https://images.unsplash.com/photo-1562447279-69402cb4587d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60"]

class Messenger extends React.Component {
  constructor() {
    super();
    this.state = {
      mode: "messenger",
      dataIsLoaded: false,
      message: 0,
      webSocket: {}
    };
  }

  componentDidMount() {
    let socketCopy = new WebSocket(`ws://${window.location.hostname}:8080`);
    socketCopy.onopen = ev => {
      socketCopy.send(
        JSON.stringify({
          token: this.props.token,
          id_prieten: "1",
          continut: ""
        })
      );
    };
    socketCopy.onmessage = ev => {
      let info = JSON.parse(ev.data);
      let idConv = info.id_conversatie;
      let mesaj = info.continut;
      let copy = this.state.people;
      copy.forEach(el => {
        if (el.id_conversatie === idConv) {
          el.messages.push({
            id_participant: info.id_participant,
            continut: mesaj,
            mesajul_meu: false
          });
        } else {
          this.getConversations();
        }
      });
      this.setState({ people: copy });
    };
    this.setState({ webSocket: socketCopy });
    // fetch("https://demo3305866.mockable.io/messenger")
    this.getConversations();
  }

  getConversations = () => {
    fetch(`http://${window.location.hostname}:3000/get_conversations_list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: this.props.token
      }
    })
      .then(res => res.json())
      .then(
        result => {
          let convList = JSON.parse(result);
          this.setState(
            {
              // dataIsLoaded: true,
              people: [...convList].map((x, i) => {
                x.id = i;
                x.key = ID();
                x.activated = false;
                x.messages = [];
                return x;
              })
            },
            () => {
              // verificam daca exista conversatii de afisat
              if (this.state.people.length === 0) {
                this.setState({ mode: "newMessage" });
                return;
              }
              this.state.people.forEach((el, i) => {
                fetch(`http://${window.location.hostname}:3000/get_conversation`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    token: this.props.token
                  },
                  body: JSON.stringify({ id_conversatie: el.id_conversatie })
                })
                  .then(res => res.json())
                  .then(res => {
                    let messages = JSON.parse(res);
                    let copy = this.state.people;
                    copy[i].messages = messages;
                    console.log(copy);
                    this.setState({
                      people: copy
                    });
                  });
              });
            }
          );
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        error => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
      .then(data => {
        this.setState({ dataIsLoaded: true });
      });
  };

  selectConv = ev => {
    console.log(typeof ev.target.id);
    this.state.people.forEach((el, i) => {
      if (el.id == ev.target.id) {
        this.setState({ message: el.id });
      }
    });
  };

  sendMes = mesajul => {
    if (mesajul != "") {
      let copy = this.state.people;
      copy[this.state.message].messages.push({
        continut: mesajul,
        mesajul_meu: true
      });
      this.setState({ people: copy });
      let idPrieten = copy[this.state.message].messages.find(
        el => el.mesajul_meu === false
      );
      idPrieten === undefined
        ? (idPrieten = copy[this.state.message].participanti.find(
          el => el !== copy[this.state.message].messages[0].id_participant
        ))
        : (idPrieten = idPrieten.id_participant);
      this.state.webSocket.send(
        JSON.stringify({
          token: this.props.token,
          id_prieten: idPrieten,
          continut: mesajul
        })
      );
    }
  };

  setMode = selected => {
    this.setState({ mode: selected });
  };

  setAvatar = event => {
    fetch(`http://${window.location.hostname}:3000/update_picture`, {
      method: "POST",
      body: JSON.stringify({ link_poza: event.target.dataset.url }),
      headers: { 'Content-Type': 'application/json', 'token': this.props.token }
    }).then(response => alert("avatar changed"))
      .catch(err => console.log(err))
  }
  // componentWillUnmount() {
  //   this.state.webSocket.close();
  // }

  render() {
    if (this.state.error) {
      return <h3>Ai o eroare de retea {this.state.error.message}</h3>;
    }
    if (this.state.dataIsLoaded == false) {
      return <h1>Please wait, data is loading...</h1>;
    }

    let component;
    if (this.state.mode === "messenger") {
      component = (
        <CardDeck>
          <Left people={this.state.people} selectConv={this.selectConv} />
          <Middle
            message={this.state.people[this.state.message].messages}
            sendMes={this.sendMes}
          />
          <Right person={this.state.people[this.state.message]} />
        </CardDeck>
      );
    } else if (this.state.mode === "newMessage") {
      component = (
        <NewMessage
          token={this.props.token}
          setMode={this.setMode}
          webSocket={this.state.webSocket}
          updateComponent={this.getConversations}
        />
      );
    } else if (this.state.mode === "AddFriend") {
      component = <AddFriend token={this.props.token} />;
    }
    return (
      <div style={{ border: "2px solid lightblue" }} className="mx-3 mt-3 mb-3">
        <h3 style={{ "text-align": "center" }}>Messenger</h3>
        <ButtonToolbar>
          <button onClick={() => { sessionStorage.removeItem("token"); this.deactivateLogin(); }}>Log-out</button>
          <button
            onClick={() => {
              // îi permitem sa acceseze fereastra cu conversatii doar daca exista conversatii anterioare
              if (this.state.people.length !== 0) this.setMode("messenger");
            }}
          >
            messenger
        </button>{" "}
          <button
            onClick={() => {
              this.setMode("newMessage");
            }}
          >
            new message
        </button>
          <button
            onClick={() => {
              this.setMode("AddFriend");
            }}
          >
            add friends
        </button>
          <span style={{ "padding-left": "875px" }}><i>change profile picture</i></span>
          <DropdownButton>
            {profilePics.map(pic => <Dropdown.Item
              data-url={pic}
              onClick={this.setAvatar}
            >
              <img height="80px" width="80px" style={{ borderRadius: "20px" }} src={pic} data-url={pic}></img>
            </Dropdown.Item>)}
          </DropdownButton>
        </ButtonToolbar>
        {component}
      </div>
    );
  }

  deactivateLogin = () => {
    this.props.logOutFunction(false);
  };
}

export default Messenger;
