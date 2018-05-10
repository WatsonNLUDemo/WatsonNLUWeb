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

const root = '/api/nlus/search';


class NLUItems extends React.Component {

	constructor(props) {
		super(props);
		this.state = {nlus: [], cellSelected: [], attributes: [], sortBy: "year,desc", searchBy:'findByitemContainingIgnoreCaseAndItemtextContainingIgnoreCase', page: 1, item: 'Entities', itemtext: '', itemTextInput: '', pageSize: 8, sort:"year,desc", links: {}};
		this.updatePageSize = this.updatePageSize.bind(this);
		this.onNavigate = this.onNavigate.bind(this);
		this.refreshCurrentPage = this.refreshCurrentPage.bind(this);
		this.refreshAndGoToLastPage = this.refreshAndGoToLastPage.bind(this);
		this.onDataCellClick = this.onDataCellClick.bind(this);
		this.onDataCellClickCarat = this.onDataCellClickCarat.bind(this);
	}

	onDataCellClick(selected) {
		var mySortBy = 'year,desc';
    const index = this.state.cellSelected.indexOf(selected);
    if (index < 0) {
						if (selected == 6){ //year
							mySortBy = 'year,asc';
							}
						if (selected == 5){ //count
							mySortBy = 'count,asc';
						}
						if (selected ==4){ //relevance
							mySortBy = 'relevance,asc';
						}
						if (selected == 3){ //type
							mySortBy = 'type,asc';
						}
						if (selected == 2){ //itemtext
							mySortBy = 'itemtext,asc';
						}
						if (selected == 1){ //item
							mySortBy = 'item,asc';
						}

						if (selected == 7){ //item
							mySortBy = 'sentiment,asc';
						}
						if (selected == 8){ //item
							mySortBy = 'anger,asc';
						}
						if (selected == 9){ //item
							mySortBy = 'fear,asc';
						}
						if (selected == 10){ //item
							mySortBy = 'joy,asc';
						}
						if (selected == 11){ //item
							mySortBy = 'sadness,asc';
						}
						if (selected == 12){ //item
							mySortBy = 'disgust,asc';
						}

			this.state.cellSelected.push(selected);
    } else {

				if (selected == 6){ //year
					mySortBy = 'year,desc';
					}
				if (selected == 5){ //count
					mySortBy = 'count,desc';
				}
				if (selected ==4){ //relevance
					mySortBy = 'relevance,desc';
				}
				if (selected == 3){ //type
					mySortBy = 'type,desc';
				}
				if (selected == 2){ //itemtext
					mySortBy = 'itemtext,desc';
				}
				if (selected == 1){ //item
					mySortBy = 'item,desc';
				}

				if (selected == 7){ //item
					mySortBy = 'sentiment,desc';
				}
				if (selected == 8){ //item
					mySortBy = 'anger,desc';
				}
				if (selected == 9){ //item
					mySortBy = 'fear,desc';
				}
				if (selected == 10){ //item
					mySortBy = 'joy,desc';
				}
				if (selected == 11){ //item
					mySortBy = 'sadness,desc';
				}
				if (selected == 12){ //item
					mySortBy = 'disgust,desc';
				}
      this.state.cellSelected.splice(index, 1);
    }
    this.setState({ cellSelected: [...this.state.cellSelected] });
		this.setState({ sortBy: mySortBy });
		this.loadFromServer(this.state.itemtext, this.state.pageSize, mySortBy);
  }

  onDataCellClickCarat(selected) {
    const index = this.state.cellSelected.indexOf(selected);
    if (index < 0) {
      return( "fa fa-caret-down") ;
    } else {
      return( "fa fa-caret-up") ;
    }
  }

	loadFromServer(itemTextUpdate, pageSize, pageSortUpdate) {
//this.state.item = this.props.itemParameter

		follow(client, root, [
				{rel: this.state.searchBy, params: {size: pageSize, sort:pageSortUpdate, item:this.props.itemParameter, itemtext: itemTextUpdate}}] //itemText}}]
		).then(nluCollection => {
				return client({
					method: 'GET',
					path: "api/profile/nlus",
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
				sort: pageSortUpdate,
				itemtext: itemTextUpdate,
				links: this.links
			});
//			console.log("props.nlus[0].entity.itemtext = " + this.props.nlus[0].entity.itemtext);
		});
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
				itemTextInput: this.state.itemTextInput,
				links: this.links
			});
		});
	}

	updatePageSize(itemTextUpdate, pageSizeUpdate, pageSortUpdate, searchByUpdate) {
			this.loadFromServer(itemTextUpdate, pageSizeUpdate, pageSortUpdate);
	}
	// tag::websocket-handlers[]
	refreshAndGoToLastPage(message) {
		follow(client, root, [{
			rel: 'nlus',
			params: {size: this.state.pageSize, itemtext: this.state.itemTextInput}
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
				itemtext: this.state.itemTextInput,
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
				itemtext: this.state.itemTextInput,
				links: this.links
			});

		});
	}

	// end::websocket-handlers[]
	// tag::register-handlers[]
	componentDidMount() {
		this.loadFromServer(this.state.itemTextInput, this.state.pageSize, this.state.sortBy);
		stompClient.register([
			{route: '/topic/newNlu', callback: this.refreshAndGoToLastPage},
			{route: '/topic/updateNlu', callback: this.refreshCurrentPage},
			{route: '/topic/deleteNlu', callback: this.refreshCurrentPage}
		]);
	}
	// end::register-handlers[]
	//	<p>Cells Selected: {JSON.stringify(this.state.cellSelected)}</p>
	render() {
		return (
		<div className="content-wrapper">
      <div className="container-fluid">
				<div className="card mb-3">
					<div className="card-header">
						<i className="fa fa-bar-chart"></i>Charts - {this.props.itemParameter}</div>
					<div className="card-body">
	          <ChartDataList page={this.state.page}
	                  nlus={this.state.nlus}
	                  links={this.state.links}
	                  pageSize={this.state.pageSize}
	                  sortBy={this.state.sortBy}
	                  searchBy={this.state.searchBy}
	                  itemTextInput={this.state.itemTextInput}
	                  attributes={this.state.attributes}
	                  onNavigate={this.onNavigate}
	                  onUpdate={this.onUpdate}
	                  onDelete={this.onDelete}
	                  updatePageSize={this.updatePageSize}
	                  cellSelected={this.state.cellSelected}
	                  onDataCellClick={this.onDataCellClick}
	                  onDataCellClickCarat={this.onDataCellClickCarat}/>
					</div>
					<div className="card-footer small text-muted">{this.props.itemParameter} Updated yesterday at 11:59 PM</div>
				</div>
				<div className="card mb-3">
						<div className="card-header">
							<i className="fa fa-table"></i> Entity Data
						</div>
						<div className="container">
						</div>
						<div className="card-body">
							<NluList page={this.state.page}
										  nlus={this.state.nlus}
										  links={this.state.links}
										  pageSize={this.state.pageSize}
											sortBy={this.state.sortBy}
											searchBy={this.state.searchBy}
											itemTextInput={this.state.itemTextInput}
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

class NluList extends React.Component {

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
		var itemTextInput = ReactDOM.findDOMNode(this.refs.itemTextInput).value;
		if (/^[0-9]+$/.test(pageSize)) {
			this.props.updatePageSize(itemTextInput, pageSize, this.props.sortBy, this.props.searchBy);
		} else {
			ReactDOM.fin
			dDOMNode(this.refs.pageSize).value = pageSize.substring(0, pageSize.length - 1);
		}
	}

	handleNavFirst(e) {
		e.preventDefault();
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
			<div>Page {this.props.page.number + 1} of {this.props.page.totalPages}</div> : null;
		var nlus = this.props.nlus.map(nlu =>
			<Nlu key={nlu.entity._links.self.href}
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
					Data Set Size	<input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/>
					Search <input ref="itemTextInput" defaultValue={this.props.itemTextInput} onInput={this.handleInput}/>
					<table className="table table-bordered"  width="100%" cellspacing="0">
						<thead>
							<tr>
							<th>
								<Button outline color="primary" onClick={() => this.props.onDataCellClick(1)}>Item <i className={this.props.onDataCellClickCarat(1)}></i></Button>{' '}
							</th>
							<th>
								<Button outline color="primary" onClick={() => this.props.onDataCellClick(2)}>Itemtext <i className={this.props.onDataCellClickCarat(2)}></i></Button>{' '}
							</th>
							<th>
								<Button outline color="primary" onClick={() => this.props.onDataCellClick(3)}>Type <i className={this.props.onDataCellClickCarat(3)}></i></Button>{' '}
							</th>
							<th>
								<Button outline color="primary" onClick={() => this.props.onDataCellClick(4)}>Relevance <i className={this.props.onDataCellClickCarat(4)}></i></Button>{' '}
							</th>
							<th>
								<Button outline color="primary" onClick={() => this.props.onDataCellClick(5)}>Count <i className={this.props.onDataCellClickCarat(5)}></i></Button>{' '}
							</th>
							<th>
								<Button outline color="primary" onClick={() => this.props.onDataCellClick(6)}>Year <i className={this.props.onDataCellClickCarat(6)}></i></Button>{' '}
							</th>
							<th>
								<Button outline color="primary" onClick={() => this.props.onDataCellClick(7)}>Sentiment <i className={this.props.onDataCellClickCarat(6)}></i></Button>{' '}
							</th>
							<th>
								<Button outline color="primary" onClick={() => this.props.onDataCellClick(8)}>Anger <i className={this.props.onDataCellClickCarat(6)}></i></Button>{' '}
							</th>
							<th>
								<Button outline color="primary" onClick={() => this.props.onDataCellClick(9)}>Fear <i className={this.props.onDataCellClickCarat(6)}></i></Button>{' '}
							</th>
							<th>
								<Button outline color="primary" onClick={() => this.props.onDataCellClick(10)}>Joy <i className={this.props.onDataCellClickCarat(6)}></i></Button>{' '}
							</th>
							<th>
								<Button outline color="primary" onClick={() => this.props.onDataCellClick(11)}>Sadness <i className={this.props.onDataCellClickCarat(6)}></i></Button>{' '}
							</th>
							<th>
								<Button outline color="primary" onClick={() => this.props.onDataCellClick(12)}>Disgust <i className={this.props.onDataCellClickCarat(6)}></i></Button>{' '}
							</th>
							</tr>
						</thead>
						<tfoot>
							<tr>
  							<th>Item</th>
  							<th>Itemtext</th>
  							<th>Type</th>
  							<th>Relevance</th>
  							<th>Count</th>
  							<th>Year</th>
								<th>Sentiment</th>
								<th>Anger</th>
								<th>Fear</th>
								<th>Joy</th>
								<th>Sadness</th>
								<th>Disgust</th>
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

class Nlu extends React.Component {

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
				<td>{this.props.nlu.entity.sentiment}</td>
				<td>{this.props.nlu.entity.anger}</td>
				<td>{this.props.nlu.entity.fear}</td>
				<td>{this.props.nlu.entity.joy}</td>
				<td>{this.props.nlu.entity.sadness}</td>
				<td>{this.props.nlu.entity.disgust}</td>
			</tr>
		)
	}
}

class ChartDataList extends React.Component {

	constructor(props) {
		super(props);
	}
	render() {
    var myBarChart = {
        labels: [],
        datasets: [{ label: "Count by ItemText", backgroundColor: "rgba(2,117,216,1)", borderColor: "rgba(2,117,216,1)", data: [],  backgroundColor: ['#007fff', '#dc3545', '#ffc107', '#28a745', '#800080', '#FF00FF','#0000FF','#00FFFF','#00FF00',' 	#FFFF00','#FF0000',' 	#000000',' 	#808080','#C0C0C0','#77777777','#55555555','#aaaaaaaa','#6b89af','#ff7a30','#809030'], }]
      };
      var myBarChartOptions = {
        options: {
          scales: {
            xAxes: [{
              time: {
                unit: 'month'
              },
              gridLines: {
                display: false
              },
              ticks: {
                maxTicksLimit: 100
              }
            }],
            yAxes: [{
              ticks: {
                min: 0,
                max: 15000,
                maxTicksLimit: 100
              },
              gridLines: {
                display: true
              }
            }],
          },
          legend: {
            display: false
          }
        }
      };
      var myYearAreaChart = {
        labels: [],
        datasets: [{
          label: "Count by Year",
          lineTension: 0.3,
          backgroundColor: "rgba(2,117,216,0.2)",
          borderColor: "rgba(2,117,216,1)",
          pointRadius: 5,
          pointBackgroundColor: "rgba(2,117,216,1)",
          pointBorderColor: "rgba(255,255,255,0.8)",
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgba(2,117,216,1)",
          pointHitRadius: 20,
          pointBorderWidth: 2,
          data: [],
        }
      ]
      };
      var myYearAreaChartOptions = {
        options: {
          scales: {
            xAxes: [{
              time: {
                unit: 'date'
              },
              gridLines: {
                display: false
              },
              ticks: {
                maxTicksLimit: 100
              }
            }],
            yAxes: [{
              ticks: {
                min: 0,
                max: 40000,
                maxTicksLimit: 100
              },
              gridLines: {
                color: "rgba(0, 0, 0, .125)",
              }
            }],
          },
          legend: {
            display: false
          }
        }
      };
		var nlus = this.props.nlus.map(nlu =>
			<ChartData key={nlu.entity._links.self.href}
					  nlu={nlu}
					  attributes={this.props.attributes}
            barChart={myBarChart}
            lineChart={myYearAreaChart}
            />
		);
		return (
            <div>
							{nlus}

              <div className="row">
                <div className="col-sm-6 my-auto">
                  <Bar data={myBarChart} width={100} height={50} options={myBarChartOptions} />
                </div>
                <div className="col-sm-6 my-auto">
                  <Line data={myYearAreaChart} width={100} height={50} options={myYearAreaChartOptions}/>
                </div>
              </div>
            </div>
		)
	}
}

class ChartData extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
    this.props.barChart.labels.push(this.props.nlu.entity.itemtext);
    this.props.barChart.datasets[0].data.push(this.props.nlu.entity.count);
    this.props.lineChart.labels.push(this.props.nlu.entity.year);
    this.props.lineChart.datasets[0].data.push(this.props.nlu.entity.count);
		return (
      <div>
      </div>
  	);
	}
}

export default NLUItems;
