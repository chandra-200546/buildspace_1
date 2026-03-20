type ScoreInput = {
  tagsCount: number;
  hasLiveDemo: boolean;
  hasGithub: boolean;
  updatesCount: number;
  collaboratorsCount: number;
};

export function generateProjectScore(input: ScoreInput) {
  const qualityScore = Math.min(100, 55 + input.tagsCount * 4 + (input.hasLiveDemo ? 14 : 0));
  const innovationScore = Math.min(100, 50 + input.collaboratorsCount * 8 + input.tagsCount * 3);
  const complexityScore = Math.min(100, 48 + input.updatesCount * 7 + (input.hasGithub ? 12 : 0));
  const overallScore = Math.round((qualityScore + innovationScore + complexityScore) / 3);

  return { qualityScore, innovationScore, complexityScore, overallScore };
}
