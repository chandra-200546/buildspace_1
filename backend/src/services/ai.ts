const reviewSnippets = [
  "Architecture is clean, but modular boundaries can be sharper.",
  "Code quality is strong; consider stricter linting for consistency.",
  "Project design is practical and production-oriented."
];

const mentorResponses = [
  "Prioritize a measurable KPI next week and instrument tracking.",
  "Ship one user-facing improvement and one backend reliability fix.",
  "Add proof-of-work to your README: benchmark, screenshot, and changelog."
];

export function generateMockAIReview(prompt: string) {
  const seed = prompt.length % reviewSnippets.length;

  return {
    codeQuality: reviewSnippets[seed],
    suggestions: [
      "Break larger components into feature modules.",
      "Improve edge-case handling for empty and loading states.",
      "Add caching for repeated feed queries."
    ],
    improvements: [
      "Introduce optimistic UI updates for likes and bookmarks.",
      "Add role-based route protection middleware.",
      "Write integration tests for critical flows."
    ],
    bugDetections: [
      "Potential duplicate submission if request retries are not deduped.",
      "Missing URL validation can allow malformed links.",
      "Image fallback handling should avoid broken previews."
    ],
    performanceTips: [
      "Use pagination cursors for large feed loads.",
      "Memoize expensive list rendering on the client.",
      "Index project status and createdAt for faster explore queries."
    ]
  };
}

export function generateMockMentorResponse(prompt: string) {
  const seed = prompt.length % mentorResponses.length;
  return `${mentorResponses[seed]} Next concrete step: ${prompt.slice(0, 40)}...`;
}
