import React from 'react'
import ReactDOM, { render } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import Application from './Application';


class App extends React.Component {
			render() {
				return (
		  <BrowserRouter>
		    <Application />
		  </BrowserRouter>
		);
	}
}

ReactDOM.render(
		<App />,
	document.getElementById('react')
)
