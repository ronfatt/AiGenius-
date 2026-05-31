import type { BattleQuestion, BattleResult, Pet } from "./types";

export function scoreQuizBattle(input: {
  pet: Pet;
  questions: BattleQuestion[];
  answers: string[];
}): BattleResult {
  const correct = input.questions.filter(
    (question, index) => question.answer === input.answers[index],
  ).length;
  const accuracy = input.questions.length > 0 ? correct / input.questions.length : 0;
  const petBonus = (input.pet.focus + input.pet.wisdom) / 250;
  const score = Math.round((accuracy + petBonus) * 100);
  const won = score >= 70;

  return {
    won,
    score,
    xpEarned: won ? 90 : 35,
    coinsEarned: won ? 25 : 8,
  };
}
