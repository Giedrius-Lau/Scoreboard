import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import ScoreBoard from './components/scoreboard/ScoreBoard';
import { AnimatedRoute } from 'react-router-transition';

import './styles/app.css';

class App extends Component {
	render() {
		return (
			<Router>
				<div className="App">
					<AnimatedRoute
						path="/"
						exact
						component={ScoreBoard}
						runOnMount={true}
						atEnter={{ offset: -100 }}
						atLeave={{ offset: 0 }}
						atActive={{ offset: 0 }}
						mapStyles={styles => ({
							transform: `translateY(${styles.offset}%)`
						})}
					/>
				</div>
			</Router>
		);
	}
}

export default App;
