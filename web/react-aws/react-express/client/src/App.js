import React from 'react';
import './App.css';
import Nav from './Nav.js';
import Home from './Home';
import Read from './read.js';
import Write from './write.js';
import Image from './Image.js';

import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

function App() {

  return (
    <Router>
      <div>
        <Nav />
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/image" exact component={Image} />
          <Route path="/gallery" component={Read} />
          <Route path="/Write" component={Write} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;