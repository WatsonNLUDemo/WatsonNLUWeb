import React, { Component } from 'react';
import { Link } from 'react-router-dom'
//import 'vendor/bootstrap/css/bootstrap.min.css'
import { Collapse, Button, ButtonGroup, CardBody, Card } from 'reactstrap';

// The Header creates links that can be used to navigate
// between routes.

//<nav>
//  <ul>
//    <li><Link to='/'>Home</Link></li>
//    <li><Link to='/roster'>Roster</Link></li>
//    <li><Link to='/schedule'>Schedule</Link></li>
//  </ul>
//</nav>


class SideBar extends Component {

  constructor(props) {
    super(props);
    this.onEntering = this.onEntering.bind(this);
    this.onEntered = this.onEntered.bind(this);
    this.onExiting = this.onExiting.bind(this);
    this.onExited = this.onExited.bind(this);
    this.toggle = this.toggle.bind(this);
    this.state = { collapse: false, status: 'Closed' };
  }

  onEntering() {
    this.setState({ status: 'Opening...' });
  }

  onEntered() {
    this.setState({ status: 'Opened' });
  }

  onExiting() {
    this.setState({ status: 'Closing...' });
  }

  onExited() {
    this.setState({ status: 'Closed' });
  }

  toggle() {
    this.setState({ collapse: !this.state.collapse });
  }

  render() {
      return (
  <header>

  <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top" id="mainNav">
    <Link to='/' className="navbar-brand">Watson Natural Language Understanding</Link>
    <Button  className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </Button>
    <div className="collapse navbar-collapse" id="navbarResponsive">
      <ul className="navbar-nav navbar-sidenav" id="exampleAccordion">

        <li className="nav-item" data-toggle="tooltip" data-placement="right" title="Entities">
          <Link to='/Entities' className="nav-link">
            <i className="fa fa-fw fa-area-chart"></i>
            <span className="nav-link-text">Raw Entities</span>
          </Link>
        </li>

        <li className="nav-item" data-toggle="tooltip" data-placement="right" title="Categories">
          <Link to='/Categories' className="nav-link">
            <i className="fa fa-fw fa-area-chart"></i>
            <span className="nav-link-text">Raw Categories</span>
          </Link>
        </li>

        <li className="nav-item" data-toggle="tooltip" data-placement="right" title="Keywords">
          <Link to='/Keywords' className="nav-link">
            <i className="fa fa-fw fa-area-chart"></i>
            <span className="nav-link-text">Raw Keywords</span>
          </Link>
        </li>


        <li className="nav-item" data-toggle="tooltip" data-placement="right" title="Concepts">
          <Link to='/Concepts' className="nav-link">
            <i className="fa fa-fw fa-area-chart"></i>
            <span className="nav-link-text">Raw Concepts</span>
          </Link>
        </li>

        <li className="nav-item" data-toggle="tooltip" data-placement="right" title="NLUItems">
          <Link to='/NLUItems' className="nav-link">
            <i className="fa fa-fw fa-area-chart"></i>
            <span className="nav-link-text">All Raw Items</span>
          </Link>
        </li>


        <li className="nav-item" data-toggle="tooltip" data-placement="right" title="AGR Entities">
          <Link to='/AGREntities' className="nav-link">
            <i className="fa fa-fw fa-area-chart"></i>
            <span className="nav-link-text">AGR Entities</span>
          </Link>
        </li>

        <li className="nav-item" data-toggle="tooltip" data-placement="right" title="AGR Categories">
          <Link to='/AGRCategories' className="nav-link">
            <i className="fa fa-fw fa-area-chart"></i>
            <span className="nav-link-text">AGR Categories</span>
          </Link>
        </li>

        <li className="nav-item" data-toggle="tooltip" data-placement="right" title="AGR Keywords">
          <Link to='/AGRKeywords' className="nav-link">
            <i className="fa fa-fw fa-area-chart"></i>
            <span className="nav-link-text">AGR Keywords</span>
          </Link>
        </li>


        <li className="nav-item" data-toggle="tooltip" data-placement="right" title="AGR Concepts">
          <Link to='/AGRConcepts' className="nav-link">
            <i className="fa fa-fw fa-area-chart"></i>
            <span className="nav-link-text">AGR Concepts</span>
          </Link>
        </li>


        <li className="nav-item" data-toggle="tooltip" data-placement="right" title="NLUItems">
          <Link to='/NLUSumItems' className="nav-link">
            <i className="fa fa-fw fa-area-chart"></i>
            <span className="nav-link-text">All AGR Items</span>
          </Link>
        </li>



        <li className="nav-item" data-toggle="tooltip" data-placement="right" title="Dashboard">
            <Link to='/Dashboard' className="nav-link">
              <i className="fa fa-fw fa-dashboard"></i>
              <span className="nav-link-text">Dashboard</span>
            </Link>
        </li>


      </ul>
    </div>
  </nav>
  </header>
    );
  }
}

export default SideBar
