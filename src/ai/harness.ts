
import { devGames } from './dev-games';
import {
	CARD_TYPES,
	generateGamingWrapped,
	type CardType,
	type GenerateGamingWrappedInput,
} from './flows/generate-gaming-wrapped';

const [cardTypeArg, gameTitle] = process.argv.slice(2);

if (!cardTypeArg || !gameTitle) {
	console.error('Usage: npm run dev:harness -- <cardType> <gameTitle>');
	console.error(`Valid card types: ${CARD_TYPES.join(', ')}`);
	process.exit(1);
}

if (!CARD_TYPES.includes(cardTypeArg as CardType)) {
	console.error(`Unknown card type "${cardTypeArg}".`);
	console.error(`Valid card types: ${CARD_TYPES.join(', ')}`);
	process.exit(1);
}

const cardType = cardTypeArg as CardType;

const game = devGames.find(g => g.title === gameTitle);

if (!game) {
	console.error(`Game "${gameTitle}" not found in devGames.`);
	console.error('Available game titles:');
	for (const g of devGames) {
		console.error(`- ${g.title}`);
	}
	process.exit(1);
}

const input: GenerateGamingWrappedInput = {
	games: [game],
};

generateGamingWrapped(input).then(wrapped => {
	const card = wrapped.cards.find(c => c.type === cardType);
	if (!card) {
		console.error(`Card type "${cardType}" not found in wrapped output.`);
		console.error(
			`Available card types in this run: ${wrapped.cards.map(c => c.type).join(', ')}`
		);
		process.exit(1);
	}
	console.log(JSON.stringify(card, null, 2));
});
