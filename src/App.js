import React, { Component } from 'react';
import 'whatwg-fetch';
import {Jumbotron, Container, Input, InputGroup,
  Button, Row, Col, Card, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle, Collapse} from 'reactstrap';
import './style.css';

let urlTemplate = "https://pokeapi.co/api/v2/type/"

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      isLoaded: false,
      pokemonArray: [],
      firstLoad: true,
      serverResponse: true
    };
  }

  componentDidMount(search) {
    this.setState({
      isLoaded: false,
      error: false
    });
    fetch(urlTemplate + search + '/')
      .then((result) => {
        // Checks for server status, mainly 404 errors.
        this.setState({
          serverResponse: result.ok
        });
        return result.json();
      })
      .then((result) => {
        this.setState({
          pokemonArray: result.pokemon,
          isLoaded: true
        });
      })
      .catch(() => {
         this.renderError();
      });
  }

  renderError() {
    this.setState({
      error: true
    });
  }

  render() {
    // Conditional rendering for when the page is first loaded with no data.
    let createList;
    if (this.state.firstLoad) {
      createList = <h2> Pick a Pokemon Type! Ex: water</h2>;
    } else if (!this.state.isLoaded && !this.state.firstLoad) { // To show that data is loading
      createList = <h2>Loading...</h2>
    } else if (this.state.isLoaded && this.state.pokemonArray != null) { // If there is data downloaded then it creates a pokemon list
      createList = <PokeList pokemonArray={this.state.pokemonArray} />
    } else if (!this.state.serverResponse) { // If the servers do run into a 404 error then an error message is displayed
      createList = <h2>Error! 404 not found. Please try a different type!</h2>
    }
    return(
      <div>
        <header>
          <Jumbotron fluid className='jumbo'>
            <Container fluid>
              <h1 id="title">
                <img src='./img/Pokeball.PNG' className='pokeball' alt='pokeball' />
                Pokemon Search!
                <img src='./img/Pokeball.PNG' className='pokeball' alt='pokeball' />
              </h1>
              <InputGroup id="search">
                <Input placeholder="Pokemon Type" id="pokeType" aria-label="search bar"/>
                <Button color="secondary" onClick={() => {
                  this.componentDidMount(document.querySelector('#pokeType').value.toLowerCase()); // converts input to lowercase to work
                  this.setState({ // on button click states are reset so the search works again
                    isLoaded: false,
                    pokemonArray: null,
                    firstLoad: false
                  });
                }}>Search</Button>
              </InputGroup>
            </Container>
          </Jumbotron>
        </header>

        <main>
          <Container>
            <Row id="mainContent">
            {
              this.state.error? // Condition for if a different error occurs while downloading
                <h2>Error! Please try again later!</h2> : createList
            }
            </Row>
          </Container>
        </main>

        <footer>
          <p><cite>Data from https://pokeapi.co/</cite></p>
        </footer>
      </div>
    );
  }
}

class PokeList extends Component {
  render() {
    return(
      this.props.pokemonArray.map((object) => { // maps the pokemon types into different cards
        return <PokeCard pokemon={object.pokemon} key={object.pokemon.name}/>
      })
    );
  }
}

class PokeCard extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      collapse: false,
      clicked: false
    };
  }

  toggle() { // toggles the collapse function
    this.setState({ collapse: !this.state.collapse });
  }

  handleAddCardDetail() { // Keeps track of if the card was clicked on to download details.
    this.setState({ clicked: true });
  }

  render() {
    return( 
        <Col xs="12" sm="6" md="4" lg="3">
          <Card body outline color="danger" aria-label="card with pokemon name">
            <CardTitle>{this.props.pokemon.name.toUpperCase().split('-').join(' ')}</CardTitle>
            <Button 
              color="secondary" 
              aria-label="button to show pokemon details"
              onClick={() => { // If clicked, the collapse will toggle clicked turns true
                this.toggle();
                this.handleAddCardDetail();
              }}
              style={{
                marginBottom: '1rem'
              }}>
            Details
            </Button>
          </Card>
          <Collapse isOpen={this.state.collapse} id={this.props.pokemon.name}>
            {
              this.state.clicked? // If clicked then pokemon details are downloaded, otherwise there is no download
                <CardDetails url={this.props.pokemon.url} /> : <div></div>
            }
          </Collapse>
        </Col>
    );
  }
}

class CardDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pokemon: {},
      pokemonLoaded: false,
      cardError: false
    }
  }

  componentDidMount() {
    fetch(this.props.url)
      .then((result) => result.json())
      .then((result) => {
        this.setState({
          pokemon: result,
          pokemonLoaded: true
        });
      })
      .catch(() => {
        this.renderError();
      });
  }

  renderError() {
    this.setState({
      cardError: true
    });
  }

  render() {
    let types = '';
    let stats = '';
    let content = <CardTitle>Loading...</CardTitle>;
    if (this.state.cardError) { // If there is an error downloading this error message is displayed, otherwise creates the card details
      content = <CardTitle>Error! Please try again later.</CardTitle>
    } else if(this.state.pokemonLoaded) { // Goes through all the types a pokemon has and makes a string of them
      this.state.pokemon.types.forEach((type) => {
        types += type.type.name + ', ';
      });
      this.state.pokemon.stats.forEach((stat) => { // Goes through the stats a pokemon has and makes a string of them
        stats += stat.stat.name + '(' + stat.base_stat + '), ';
      });
      content = (
        <div>
          <CardImg top width="100%" src={this.state.pokemon.sprites.front_default} alt={this.state.pokemon.name} />
          <CardBody>
            <CardSubtitle>ID #: {this.state.pokemon.id}</CardSubtitle>
            <CardText>Types: {types.substring(0, types.length - 2) /*removes space and comma at the end*/ }</CardText>
            <CardText>Base Stats: {stats.split('-').join(' ').substring(0, stats.length - 2) /*Removes end comma and changes - to spaces*/}</CardText>
          </CardBody>
        </div>
      );
    }
    return(
      <Card body outline color="danger">
        {content}
      </Card>
    );
  }
}

export default App;
