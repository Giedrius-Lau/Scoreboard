import React, { Component } from 'react';

import ScoreList from './ScoreList';
import spinnerImg from '../../img/spinner.svg';

class ScoreBoard extends Component {
	constructor() {
		super();
		this.state = {
			score: [],
			sort: '',
			error: '',
			success: '',
			spinner: ''
		};

		this.sorting = this.sorting.bind(this);
	}

	render() {
		const { score, error, success, spinner } = this.state;

		return (
			<div className="score-list">
				<div className="container">
					{!error && <ScoreList players={score} sorting={this.sorting} addPlayer={this.addPlayer} />}
					{error && <div className="box box-error">{error}</div>}
					{success && <div className="box box-success">{success}</div>}
					{spinner && (
						<div className="box">
							<img alt="spinning-wheel" className="spinning-wheel" src={spinnerImg} />
						</div>
					)}
				</div>
			</div>
		);
	}

	componentDidMount() {
		this.loadScoreList();
	}

	loadScoreList() {
		this.fetchFunction(`/api/score?sort=${this.state.sort}`);
	}

	sorting(newSort) {
		let sort = this.state.sort;
		if (sort) {
			if (sort[0] !== '-') {
				if (sort === newSort) {
					newSort = '-' + newSort;
				}
			}
		}

		this.setState({
			sort: newSort,
			spinner: true
		});

		this.fetchFunction(`/api/score?sort=${newSort}`);
	}

	fetchFunction = url => {
		this.setState({
			spinner: true
		});
		fetch(url, {
			credentials: 'same-origin',
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(response => response.json())
			.then(response => {
				if (!response.length) {
					this.setState({
						error: 'No score found.',
						spinner: false
					});
					return;
				}
				this.setState({
					score: response,
					error: '',
					spinner: false
				});
			})
			.catch(() => {
				this.setState({
					error: "Can't find any score list.",
					spinner: false
				});
			});
	};

	addPlayer = async (name, score) => {
		await fetch('/api/score', {
			credentials: 'same-origin',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name,
				score
			})
		})
			.then(res => {
				if (!res) {
					this.setState({
						error: 'No data found.'
					});
					return;
				}
				if (res.status === 201) {
					this.setState({
						success: 'Successfully added player',
						spinner: false
					});
				}
			})
			.catch(() => {
				this.setState({
					error: 'Error occurred while adding player',
					spinner: false
				});
			});

		this.loadScoreList();
	};
}

export default ScoreBoard;
