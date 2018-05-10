'use strict';


//const React = require('react');
import React from 'react';
//const ReactDOM = require('react-dom');
import ReactDOM from 'react-dom';
//const when = require('when');
import when from 'when';
//const client = require('./client');
import client from './client';
//import { NavBar } from './NavBar';
//const follow = require('./follow'); // function to hop multiple links by "rel"
import follow from './follow';
//const stompClient = require('./websocket-listener');
import stompClient from './websocket-listener';
//const root = '/api';
import { Button , ButtonGroup } from 'reactstrap';
import {Line, Pie, Bar } from 'react-chartjs-2';

import NLUItems from './NLUItems'

class Keywords extends React.Component {
  render(){
    return (
    <div>
      <NLUItems itemParameter='Keyword' rootParameter=''  />
    </div>
    );
  }
}

  export default Keywords;
