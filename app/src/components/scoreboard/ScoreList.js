import React from 'react';

class ScoreList extends React.Component {
	state = {
		id: ''
	};

	renderList(players) {
		return (
			<li key={players._id}>
				<p>{players.name}</p>
				<p>{players.score} pts.</p>
			</li>
		);
	}

	render() {
		const { sorting } = this.props;

		return (
			<div>
				<div className="sorting-block">
					<button onClick={() => sorting('name')}>Sort by name</button>
					<button onClick={() => sorting('score')}>Sort by score</button>
				</div>

				<ul className="score-list">{this.props.players.map(players => this.renderList(players))}</ul>
				<form className="add-form" onSubmit={this.handleSubmit}>
					<input
						required
						name="name"
						ref={name => (this.name = name)}
						type="text"
						placeholder="Player name"
					/>

					<input
						required
						name="score"
						ref={score => (this.score = score)}
						type="number"
						placeholder="Score"
					/>

					<button type="submit">Add</button>
				</form>
			</div>
		);
	}

	handleSubmit = event => {
		event.preventDefault();
		const { addPlayer } = this.props;

		addPlayer(this.name.value, this.score.value);
		this.name.value = '';
		this.score.value = '';
	};
}

export default ScoreList;
