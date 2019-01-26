const Score = require('./models/Score');

module.exports = async function seed() {
	let count = await Score.countDocuments().exec();
	if (!count) {
		await seedScoreboard();
	}
};

async function seedScoreboard() {
	return Score.insertMany([
		{
			name: 'Rock',
			score: 12
		},
		{
			name: 'Michael',
			score: 32
		},
		{
			name: 'Roger',
			score: 43
		},
		{
			name: 'Ben',
			score: 1
		},
		{
			name: 'Creep',
			score: 23
		},
		{
			name: 'Rocket',
			score: 99
		},
		{
			name: 'Sabonis',
			score: 123
		}
	]);
}