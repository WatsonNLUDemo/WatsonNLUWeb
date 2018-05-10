import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Table from './Table';

import NLUItems from './NLUItems';
import Entities from './Entities';
import Categories from './Categories';
import Keywords from './Keywords';
import Concepts from './Concepts';
import NLUSumItems from './NLUSumItems';
import AGREntities from './AGREntities';
import AGRCategories from './AGRCategories';
import AGRKeywords from './AGRKeywords';
import AGRConcepts from './AGRConcepts';


// The Main component renders one of the three provided
// Routes (provided that one matches). Both the /roster
// and /schedule routes will match any pathname that starts
// with /roster or /schedule. The / route will only match
// when the pathname is exactly the string "/"
class Main extends Component {

  render() {
      return (
      <main>
        <Switch>
          <Route exact path='/' component={Dashboard}/>
          <Route path='/Dashboard' component={Dashboard}/>
          <Route path='/Table' component={Table}/>
          <Route path='/Entities' component={Entities}/>
          <Route path='/Categories' component={Categories}/>
          <Route path='/Keywords' component={Keywords}/>
          <Route path='/Concepts' component={Concepts}/>
          <Route path='/AGREntities' component={AGREntities}/>
          <Route path='/AGRCategories' component={AGRCategories}/>
          <Route path='/AGRKeywords' component={AGRKeywords}/>
          <Route path='/AGRConcepts' component={AGRConcepts}/>
          <Route path='/NLUSumItems' component={NLUSumItems}/>
          <Route path='/NLUItems' component={NLUItems}/>
        </Switch>
      </main>
    );
  }
}

export default Main;
