import React, { Component } from 'react';
import SideBar from './SideBar';
import Main from './Main';


class Application extends Component {
  render() {
      return (
        <div>
          <SideBar />
          <Main />
        </div>
      );
  }
}

export default Application;
