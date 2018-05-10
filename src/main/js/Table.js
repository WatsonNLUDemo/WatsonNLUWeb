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

import { Button , ButtonGroup } from 'reactstrap';


const root = '/api';

class Table extends React.Component {

	constructor(props) {
		super(props);
		this.state = {nlus: [], cellSelected: [], attributes: [], page: 1, pageSize: 20, links: {}};
		this.updatePageSize = this.updatePageSize.bind(this);
		this.onCreate = this.onCreate.bind(this);
		this.onUpdate = this.onUpdate.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onNavigate = this.onNavigate.bind(this);
		this.refreshCurrentPage = this.refreshCurrentPage.bind(this);
		this.refreshAndGoToLastPage = this.refreshAndGoToLastPage.bind(this);

		this.onDataCellClick = this.onDataCellClick.bind(this);
		this.onDataCellClickCarat = this.onDataCellClickCarat.bind(this);


	}
	onDataCellClick(selected) {
    const index = this.state.cellSelected.indexOf(selected);
    if (index < 0) {
      this.state.cellSelected.push(selected);
    } else {
      this.state.cellSelected.splice(index, 1);
    }
    this.setState({ cellSelected: [...this.state.cellSelected] });
  }

  onDataCellClickCarat(selected) {
    const index = this.state.cellSelected.indexOf(selected);
    if (index < 0) {
      return( "fa fa-caret-down") ;
    } else {
      return( "fa fa-caret-up") ;
    }

  }
	loadFromServer(pageSize) {
		follow(client, root, [
				{rel: 'nlus', params: {size: pageSize}}]
		).then(nluCollection => {
				return client({
					method: 'GET',
					path: nluCollection.entity._links.profile.href,
					headers: {'Accept': 'application/schema+json'}
				}).then(schema => {
					this.schema = schema.entity;
					this.links = nluCollection.entity._links;
					return nluCollection;
				});
		}).then(nluCollection => {
			this.page = nluCollection.entity.page;
			return nluCollection.entity._embedded.nlus.map(nlu =>
					client({
						method: 'GET',
						path: nlu._links.self.href
					})
			);
		}).then(nluPromises => {
			return when.all(nluPromises);
		}).done(nlus => {
			this.setState({
				page: this.page,
				nlus: nlus,
				attributes: Object.keys(this.schema.properties),
				pageSize: pageSize,
				links: this.links
			});
		});
	}

	// tag::on-create[]
	onCreate(newNLU) {
		follow(client, root, ['nlus']).done(response => {
			client({
				method: 'POST',
				path: response.entity._links.self.href,
				entity: newNLU,
				headers: {'Content-Type': 'application/json'}
			})
		})
	}
	// end::on-create[]

	onUpdate(nlu, updatedNLU) {
		client({
			method: 'PUT',
			path: nlu.entity._links.self.href,
			entity: updatedNLU,
			headers: {
				'Content-Type': 'application/json',
				'If-Match': nlu.headers.Etag
			}
		}).done(response => {
			/* Let the websocket handler update the state */
		}, response => {
			if (response.status.code === 412) {
				alert('DENIED: Unable to update ' + nlu.entity._links.self.href + '. Your copy is stale.');
			}
		});
	}

	onDelete(nlu) {
		client({method: 'DELETE', path: nlu.entity._links.self.href});
	}

	onNavigate(navUri) {
		client({
			method: 'GET',
			path: navUri
		}).then(nluCollection => {
			this.links = nluCollection.entity._links;
			this.page = nluCollection.entity.page;

			return nluCollection.entity._embedded.nlus.map(nlu =>
					client({
						method: 'GET',
						path: nlu._links.self.href
					})
			);
		}).then(nluPromises => {
			return when.all(nluPromises);
		}).done(nlus => {
			this.setState({
				page: this.page,
				nlus: nlus,
				attributes: Object.keys(this.schema.properties),
				pageSize: this.state.pageSize,
				links: this.links
			});
		});
	}

	updatePageSize(pageSize) {
		if (pageSize !== this.state.pageSize) {
			this.loadFromServer(pageSize);
		}
	}

	// tag::websocket-handlers[]
	refreshAndGoToLastPage(message) {
		follow(client, root, [{
			rel: 'nlus',
			params: {size: this.state.pageSize}
		}]).done(response => {
			if (response.entity._links.last !== undefined) {
				this.onNavigate(response.entity._links.last.href);
			} else {
				this.onNavigate(response.entity._links.self.href);
			}
		})
	}

	refreshCurrentPage(message) {
		follow(client, root, [{
			rel: 'nlus',
			params: {
				size: this.state.pageSize,
				page: this.state.page.number
			}
		}]).then(nluCollection => {
			this.links = nluCollection.entity._links;
			this.page = nluCollection.entity.page;

			return nluCollection.entity._embedded.nlus.map(nlu => {
				return client({
					method: 'GET',
					path: nlu._links.self.href
				})
			});
		}).then(nluPromises => {
			return when.all(nluPromises);
		}).then(nlus => {
			this.setState({
				page: this.page,
				nlus: nlus,
				attributes: Object.keys(this.schema.properties),
				pageSize: this.state.pageSize,
				links: this.links
			});
		});
	}
	// end::websocket-handlers[]

	// tag::register-handlers[]
	componentDidMount() {
		this.loadFromServer(this.state.pageSize);
		stompClient.register([
			{route: '/topic/newNLU', callback: this.refreshAndGoToLastPage},
			{route: '/topic/updateNLU', callback: this.refreshCurrentPage},
			{route: '/topic/deleteNLU', callback: this.refreshCurrentPage}
		]);
	}
	// end::register-handlers[]

	render() {
		return (
		<div className="content-wrapper">
      <div className="container-fluid">


        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="#">Table</a>
          </li>
          <li className="breadcrumb-item active">My Table</li>
        </ol>

				<div className="card mb-3">
						<div className="card-header">
							<i className="fa fa-table"></i> Data Table Example
							<Button outline color="primary" onClick={() => this.onDataCellClick(4)}>primary  <i className={this.onDataCellClickCarat(4)}></i></Button>{' '}
							<Button outline color="secondary" onClick={() => this.onDataCellClick(5)} active={this.state.cellSelected.includes(5)}>secondary  <i className={this.onDataCellClickCarat(5)}></i></Button>{' '}
							<Button outline color="success" onClick={() => this.onDataCellClick(6)} active={this.state.cellSelected.includes(6)}>success  <i className={this.onDataCellClickCarat(6)}></i></Button>{' '}
							<Button outline color="info" onClick={() => this.onDataCellClick(7)} active={this.state.cellSelected.includes(7)}>info  <i className={this.onDataCellClickCarat(7)}></i></Button>{' '}
							<Button outline color="warning" onClick={() => this.onDataCellClick(8)} active={this.state.cellSelected.includes(8)}>warning  <i className={this.onDataCellClickCarat(8)}></i></Button>{' '}
							<Button outline color="danger" onClick={() => this.onDataCellClick(9)} active={this.state.cellSelected.includes(9)}>danger  <i className={this.onDataCellClickCarat(9)}></i></Button>{' '}
							<Button outline color="link" onClick={() => this.onDataCellClick(10)} active={this.state.cellSelected.includes(10)}>link  <i className={this.onDataCellClickCarat(10)}></i></Button>
						</div>


						<div className="container">
							<p>Cells Selected: {JSON.stringify(this.state.cellSelected)}</p>
	          </div>


						<div className="card-body">
							<NLUList page={this.state.page}
										  nlus={this.state.nlus}
										  links={this.state.links}
										  pageSize={this.state.pageSize}
										  attributes={this.state.attributes}
										  onNavigate={this.onNavigate}
										  onUpdate={this.onUpdate}
										  onDelete={this.onDelete}
										  updatePageSize={this.updatePageSize}
											cellSelected={this.state.cellSelected}
											onDataCellClick={this.onDataCellClick}
											onDataCellClickCarat={this.onDataCellClickCarat}/>
							</div>
						<div className="card-footer small text-muted">Updated yesterday at 11:59 PM
						</div>
				</div>

				  <footer className="sticky-footer">
				  	<div className="container">
				  		<div className="text-center">
				  			<small>Copyright © Your Website 2017</small>
				  		</div>
				  	</div>
				  </footer>

					<a className="scroll-to-top rounded" href="#page-top">
						<i className="fa fa-angle-up"></i>
					</a>

				  <div className="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
				    <div className="modal-dialog" role="document">
				      <div className="modal-content">
				        <div className="modal-header">
				          <h5 className="modal-title" id="exampleModalLabel">Ready to Leave?</h5>
				          <button className="close" type="button" data-dismiss="modal" aria-label="Close">
				            <span aria-hidden="true">×</span>
				          </button>
				        </div>
				        <div className="modal-body">Select "Logout" below if you are ready to end your current session.</div>
				        <div className="modal-footer">
				          <button className="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
				          <a className="btn btn-primary" href="login.html">Logout</a>
				        </div>
				      </div>
				    </div>
				  </div>
			</div>
		</div>
		)
	}
}

class CreateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		var newNLU = {};
		this.props.attributes.forEach(attribute => {
			newNLU[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
		});
		this.props.onCreate(newNLU);
		this.props.attributes.forEach(attribute => {
			ReactDOM.findDOMNode(this.refs[attribute]).value = ''; // clear out the dialog's inputs
		});
		window.location = "#";
	}

	render() {
		var inputs = this.props.attributes.map(attribute =>
				<p key={attribute}>
					<input type="text" placeholder={attribute} ref={attribute} className="field" />
				</p>
		);
		return (
			<div>
				<a href="#createNLU">Create</a>

				<div id="createNLU" className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Create new nlu</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit}>Create</button>
						</form>
					</div>
				</div>
			</div>
		)
	}
}

class UpdateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		var updatedNLU = {};
		this.props.attributes.forEach(attribute => {
			updatedNLU[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
		});
		this.props.onUpdate(this.props.nlu, updatedNLU);
		window.location = "#";
	}

	render() {
		var inputs = this.props.attributes.map(attribute =>
				<p key={this.props.nlu.entity[attribute]}>
					<input type="text" placeholder={attribute}
						   defaultValue={this.props.nlu.entity[attribute]}
						   ref={attribute} className="field" />
				</p>
		);

		var dialogId = "updateNLU-" + this.props.nlu.entity._links.self.href;

		return (
			<div>
				<a href={"#" + dialogId}>Update</a>

				<div id={dialogId} className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Update an nlu</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit}>Update</button>
						</form>
					</div>
				</div>
			</div>
		)
	}

}

class NLUList extends React.Component {

	constructor(props) {
		super(props);
		this.handleNavFirst = this.handleNavFirst.bind(this);
		this.handleNavPrev = this.handleNavPrev.bind(this);
		this.handleNavNext = this.handleNavNext.bind(this);
		this.handleNavLast = this.handleNavLast.bind(this);
		this.handleInput = this.handleInput.bind(this);
	}

	handleInput(e) {
		e.preventDefault();
		var pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value;
		if (/^[0-9]+$/.test(pageSize)) {
			this.props.updatePageSize(pageSize);
		} else {
			ReactDOM.findDOMNode(this.refs.pageSize).value = pageSize.substring(0, pageSize.length - 1);
		}
	}

	handleNavFirst(e) {
		e.preventDefault();		this.props.onUpdate(this.props.album, updatedAlbum);
		this.props.onNavigate(this.props.links.first.href);
	}

	handleNavPrev(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.prev.href);
	}

	handleNavNext(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.next.href);
	}

	handleNavLast(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.last.href);
	}

	render() {
		var pageInfo = this.props.page.hasOwnProperty("number") ?
			<h3>NLUs - Page {this.props.page.number + 1} of {this.props.page.totalPages}</h3> : null;

		var nlus = this.props.nlus.map(nlu =>
			<NLU key={nlu.entity._links.self.href}
					  nlu={nlu}
					  attributes={this.props.attributes}
					  onUpdate={this.props.onUpdate}
					  onDelete={this.props.onDelete}/>
		);

		var navLinks = [];
//		if ("first" in this.props.links) {
			navLinks.push(<button key="first" onClick={this.handleNavFirst}>&lt;&lt;</button>);
//		}
//		if ("prev" in this.props.links) {
			navLinks.push(<button key="prev" onClick={this.handleNavPrev}>&lt;</button>);
//		}
//		if ("next" in this.props.links) {
			navLinks.push(<button key="next" onClick={this.handleNavNext}>&gt;</button>);
//		}

//		if ("last" in this.props.links) {
			navLinks.push(<button key="last" onClick={this.handleNavLast}>&gt;&gt;</button>);
//		}

		return (
			<div className="table-responsive">
						{pageInfo}
						{navLinks}
					<input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/>
					<table className="table table-bordered"  width="100%" cellspacing="0">
						<thead>
							<tr>
								<th>
									<Button outline color="primary" onClick={() => this.props.onDataCellClick(4)}>item <i className={this.props.onDataCellClickCarat(4)}></i></Button>{' '}
 								</th>
								<th>
									<Button outline color="primary" onClick={() => this.props.onDataCellClick(4)}>itemtext <i className={this.props.onDataCellClickCarat(4)}></i></Button>{' '}
								</th>
								<th>
									<Button outline color="primary" onClick={() => this.props.onDataCellClick(4)}>type <i className={this.props.onDataCellClickCarat(4)}></i></Button>{' '}
								</th>
								<th>
									<Button outline color="primary" onClick={() => this.props.onDataCellClick(4)}>relevance <i className={this.props.onDataCellClickCarat(4)}></i></Button>{' '}
								</th>
								<th>
									<Button outline color="primary" onClick={() => this.props.onDataCellClick(4)}>count <i className={this.props.onDataCellClickCarat(4)}></i></Button>{' '}
								</th>
								<th>
									<Button outline color="primary" onClick={() => this.props.onDataCellClick(4)}>year <i className={this.props.onDataCellClickCarat(4)}></i></Button>{' '}
								</th>
								<th>Update</th>
								<th>Delete</th>
							</tr>
						</thead>
						<tfoot>
							<tr>
							<th>
								<Button outline color="primary" onClick={() => this.props.onDataCellClick(4)}>item <i className={this.props.onDataCellClickCarat(4)}></i></Button>{' '}
							</th>
							<th>
								<Button outline color="primary" onClick={() => this.props.onDataCellClick(4)}>itemtext <i className={this.props.onDataCellClickCarat(4)}></i></Button>{' '}
							</th>
							<th>
								<Button outline color="primary" onClick={() => this.props.onDataCellClick(4)}>type <i className={this.props.onDataCellClickCarat(4)}></i></Button>{' '}
							</th>
							<th>
								<Button outline color="primary" onClick={() => this.props.onDataCellClick(4)}>relevance <i className={this.props.onDataCellClickCarat(4)}></i></Button>{' '}
							</th>
							<th>
								<Button outline color="primary" onClick={() => this.props.onDataCellClick(4)}>count <i className={this.props.onDataCellClickCarat(4)}></i></Button>{' '}
							</th>
							<th>
								<Button outline color="primary" onClick={() => this.props.onDataCellClick(4)}>year <i className={this.props.onDataCellClickCarat(4)}></i></Button>{' '}
							</th>
								<th>Update</th>
								<th>Delete</th>
							</tr>
						</tfoot>
						<tbody>
							{nlus}
						</tbody>
					</table>
				<div>
					{navLinks}
				</div>
			</div>
		)
	}
}

class NLU extends React.Component {

	constructor(props) {
		super(props);
		this.handleDelete = this.handleDelete.bind(this);
		this.handleUpdate = this.handleUpdate.bind(this);
	}

	handleDelete() {
		this.props.onDelete(this.props.nlu);
	}

	handleUpdate() {
		this.props.onUpdate(this.props.nlu);
	}
	render() {
		return (
			<tr>
				<td>{this.props.nlu.entity.item}</td>
				<td>{this.props.nlu.entity.itemtext}</td>
				<td>{this.props.nlu.entity.type}</td>
				<td>{this.props.nlu.entity.relevance}</td>
				<td>{this.props.nlu.entity.count}</td>
				<td>{this.props.nlu.entity.year}</td>
				<td>
					<button onClick={this.handleUpdate}>Update</button>
				</td>
				<td>
					<button onClick={this.handleDelete}>Delete</button>
				</td>
			</tr>
		)
	}
}

class Bar extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div>
				<nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top" id="mainNav">
	        <a className="navbar-brand" href="index.html">Start Bootstrap</a>
	        <button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
	          <span className="navbar-toggler-icon"></span>
	        </button>
	        <div className="collapse navbar-collapse" id="navbarResponsive">
	          <ul className="navbar-nav navbar-sidenav" id="exampleAccordion">
	            <li className="nav-item" data-toggle="tooltip" data-placement="right" title="Dashboard">
	              <a className="nav-link" href="index.html">
	                <i className="fa fa-fw fa-dashboard"></i>
	                <span className="nav-link-text">Dashboard</span>
	              </a>
	            </li>
	            <li className="nav-item" data-toggle="tooltip" data-placement="right" title="Charts">
	              <a className="nav-link" href="charts.html">
	                <i className="fa fa-fw fa-area-chart"></i>
	                <span className="nav-link-text">Charts</span>
	              </a>
	            </li>
	            <li className="nav-item" data-toggle="tooltip" data-placement="right" title="Tables">
	              <a className="nav-link" href="tables.html">
	                <i className="fa fa-fw fa-table"></i>
	                <span className="nav-link-text">Tables</span>
	              </a>
	            </li>
	            <li className="nav-item" data-toggle="tooltip" data-placement="right" title="Components">
	              <a className="nav-link nav-link-collapse collapsed" data-toggle="collapse" href="#collapseComponents" data-parent="#exampleAccordion">
	                <i className="fa fa-fw fa-wrench"></i>
	                <span className="nav-link-text">Components</span>
	              </a>
	              <ul className="sidenav-second-level collapse" id="collapseComponents">
	                <li>
	                  <a href="navbar.html">Navbar</a>
	                </li>
	                <li>
	                  <a href="cards.html">Cards</a>
	                </li>
	              </ul>
	            </li>
	            <li className="nav-item" data-toggle="tooltip" data-placement="right" title="Example Pages">
	              <a className="nav-link nav-link-collapse collapsed" data-toggle="collapse" href="#collapseExamplePages" data-parent="#exampleAccordion">
	                <i className="fa fa-fw fa-file"></i>
	                <span className="nav-link-text">Example Pages</span>
	              </a>
	              <ul className="sidenav-second-level collapse" id="collapseExamplePages">
	                <li>
	                  <a href="login.html">Login Page</a>
	                </li>
	                <li>
	                  <a href="register.html">Registration Page</a>
	                </li>
	                <li>
	                  <a href="forgot-password.html">Forgot Password Page</a>
	                </li>
	                <li>
	                  <a href="blank.html">Blank Page</a>
	                </li>
	              </ul>
	            </li>
	            <li className="nav-item" data-toggle="tooltip" data-placement="right" title="Menu Levels">
	              <a className="nav-link nav-link-collapse collapsed" data-toggle="collapse" href="#collapseMulti" data-parent="#exampleAccordion">
	                <i className="fa fa-fw fa-sitemap"></i>
	                <span className="nav-link-text">Menu Levels</span>
	              </a>
	              <ul className="sidenav-second-level collapse" id="collapseMulti">
	                <li>
	                  <a href="#">Second Level Item</a>
	                </li>
	                <li>
	                  <a href="#">Second Level Item</a>
	                </li>
	                <li>
	                  <a href="#">Second Level Item</a>
	                </li>
	                <li>
	                  <a className="nav-link-collapse collapsed" data-toggle="collapse" href="#collapseMulti2">Third Level</a>
	                  <ul className="sidenav-third-level collapse" id="collapseMulti2">
	                    <li>
	                      <a href="#">Third Level Item</a>
	                    </li>
	                    <li>
	                      <a href="#">Third Level Item</a>
	                    </li>
	                    <li>
	                      <a href="#">Third Level Item</a>
	                    </li>
	                  </ul>
	                </li>
	              </ul>
	            </li>
	            <li className="nav-item" data-toggle="tooltip" data-placement="right" title="Link">
	              <a className="nav-link" href="#">
	                <i className="fa fa-fw fa-link"></i>
	                <span className="nav-link-text">Link</span>
	              </a>
	            </li>
	          </ul>
	          <ul className="navbar-nav sidenav-toggler">
	            <li className="nav-item">
	              <a className="nav-link text-center" id="sidenavToggler">
	                <i className="fa fa-fw fa-angle-left"></i>
	              </a>
	            </li>
	          </ul>
	          <ul className="navbar-nav ml-auto">
	            <li className="nav-item dropdown">
	              <a className="nav-link dropdown-toggle mr-lg-2" id="messagesDropdown" href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
	                <i className="fa fa-fw fa-envelope"></i>
	                <span className="d-lg-none">Messages
	                  <span className="badge badge-pill badge-primary">12 New</span>
	                </span>
	                <span className="indicator text-primary d-none d-lg-block">
	                  <i className="fa fa-fw fa-circle"></i>
	                </span>
	              </a>
	              <div className="dropdown-menu" aria-labelledby="messagesDropdown">
	                <h6 className="dropdown-header">New Messages:</h6>
	                <div className="dropdown-divider"></div>
	                <a className="dropdown-item" href="#">
	                  <strong>David Miller</strong>
	                  <span className="small float-right text-muted">11:21 AM</span>
	                  <div className="dropdown-message small">Hey there! This new version of SB Admin is pretty awesome! These messages clip off when they reach the end of the box so they dont overflow over to the sides!</div>
	                </a>
	                <div className="dropdown-divider"></div>
	                <a className="dropdown-item" href="#">
	                  <strong>Jane Smith</strong>
	                  <span className="small float-right text-muted">11:21 AM</span>
	                  <div className="dropdown-message small">I was wondering if you could meet for an appointment at 3:00 instead of 4:00. Thanks!</div>
	                </a>
	                <div className="dropdown-divider"></div>
	                <a className="dropdown-item" href="#">
	                  <strong>John Doe</strong>
	                  <span className="small float-right text-muted">11:21 AM</span>
	                  <div className="dropdown-message small">I've sent the final files over to you for review. When you're able to sign off of them let me know and we can discuss distribution.</div>
	                </a>
	                <div className="dropdown-divider"></div>
	                <a className="dropdown-item small" href="#">View all messages</a>
	              </div>
	            </li>
	            <li className="nav-item dropdown">
	              <a className="nav-link dropdown-toggle mr-lg-2" id="alertsDropdown" href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
	                <i className="fa fa-fw fa-bell"></i>
	                <span className="d-lg-none">Alerts
	                  <span className="badge badge-pill badge-warning">6 New</span>
	                </span>
	                <span className="indicator text-warning d-none d-lg-block">
	                  <i className="fa fa-fw fa-circle"></i>
	                </span>
	              </a>
	              <div className="dropdown-menu" aria-labelledby="alertsDropdown">
	                <h6 className="dropdown-header">New Alerts:</h6>
	                <div className="dropdown-divider"></div>
	                <a className="dropdown-item" href="#">
	                  <span className="text-success">
	                    <strong>
	                      <i className="fa fa-long-arrow-up fa-fw"></i>Status Update</strong>
	                  </span>
	                  <span className="small float-right text-muted">11:21 AM</span>
	                  <div className="dropdown-message small">This is an automated server response message. All systems are online.</div>
	                </a>
	                <div className="dropdown-divider"></div>
	                <a className="dropdown-item" href="#">
	                  <span className="text-danger">
	                    <strong>
	                      <i className="fa fa-long-arrow-down fa-fw"></i>Status Update</strong>
	                  </span>
	                  <span className="small float-right text-muted">11:21 AM</span>
	                  <div className="dropdown-message small">This is an automated server response message. All systems are online.</div>
	                </a>
	                <div className="dropdown-divider"></div>
	                <a className="dropdown-item" href="#">
	                  <span className="text-success">
	                    <strong>
	                      <i className="fa fa-long-arrow-up fa-fw"></i>Status Update</strong>
	                  </span>
	                  <span className="small float-right text-muted">11:21 AM</span>
	                  <div className="dropdown-message small">This is an automated server response message. All systems are online.</div>
	                </a>
	                <div className="dropdown-divider"></div>
	                <a className="dropdown-item small" href="#">View all alerts</a>
	              </div>
	            </li>
	            <li className="nav-item">
	              <form className="form-inline my-2 my-lg-0 mr-lg-2">
	                <div className="input-group">
	                  <input className="form-control" type="text" placeholder="Search for..."/>
	                  <span className="input-group-btn">
	                    <button className="btn btn-primary" type="button">
	                      <i className="fa fa-search"></i>
	                    </button>
	                  </span>
	                </div>
	              </form>
	            </li>
	            <li className="nav-item">
	              <a className="nav-link" data-toggle="modal" data-target="#exampleModal">
	                <i className="fa fa-fw fa-sign-out"></i>Logout</a>
	            </li>
	          </ul>
	        </div>
	      </nav>
			</div>
		)
	}
}
export default Table;
