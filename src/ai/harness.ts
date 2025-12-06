
import { generateGamingWrapped } from './flows/generate-gaming-wrapped';
import { devGames } from './dev-games';
import { z } from 'zod';
import { GenerateGamingWrappedInput } from './flows/generate-gaming-wrapped';

const cardType = process.argv[2] as any;
const gameTitle = process.argv[3];

const game = devGames.find(g => g.title === gameTitle);

if (!game) {
    console.error(`Game ${gameTitle} not found`);
    process.exit(1);
}

const input: GenerateGamingWrappedInput = {
    games: [game],
};

generateGamingWrapped(input).then(wrapped => {
    const card = wrapped.cards.find(c => c.type === cardType);
    if (!card) {
        console.error(`Card ${cardType} not found`);
        process.exit(1);
    }
    console.log(JSON.stringify(card, null, 2));
});
