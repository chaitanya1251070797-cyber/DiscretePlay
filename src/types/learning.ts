export type LearningStage = 
  | 'DISCOVER'
  | 'EXPERIMENT'
  | 'GUIDED_REASONING'
  | 'MATHEMATICAL_REVELATION'
  | 'INDEPENDENT_APPLICATION';

export type TeachingInteractionMode = 
  | 'THINK'
  | 'HINT'
  | 'EXPLAIN'
  | 'VISUALIZE';

export type GameId = 
  | 'tower-of-hanoi'
  | 'minesweeper-logic'
  | 'maze-graph'
  | 'caesar-cipher'
  | 'nim-combinatorics'
  | 'knights-tour';

export interface MathematicalConcept {
  id: string;
  name: string;
  category: 'Recursion' | 'Logic' | 'Graph Theory' | 'Number Theory & Cryptography' | 'Combinatorics & Game Theory';
  simpleExplanation: string;
  formalDefinition: string;
  formulas: {
    label: string;
    latex: string;
    explanation: string;
  }[];
  rosenReference: {
    edition: string;
    chapter: string;
    section: string;
    topic: string;
    citation: string;
    excerpt: string;
  };
  gameConnection: string;
  realWorldApplications: string[];
}

export interface ThinkPrompt {
  id: string;
  question: string;
  contextHint?: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  triggeredOn?: string;
}

export interface HintItem {
  id: string;
  tier: 1 | 2 | 3; // 1: subtle nudge, 2: structural clue, 3: mathematical insight
  title: string;
  content: string;
  formulaSnippet?: string;
}

export interface ExplanationEntry {
  id: string;
  title: string;
  context: 'valid_move' | 'invalid_move' | 'pattern_discovered' | 'strategic_subgoal';
  shortSummary: string;
  detailedMath: string;
  rosenNote?: string;
  timestamp: number;
}

export interface StageChallenge {
  id: string;
  title: string;
  objective: string;
  stage: LearningStage;
  allowedHints: number;
  initialStateConfig: any;
  completionCondition: (state: any, telemetry: StudentTelemetry) => boolean;
  completionMessage: string;
}

export interface StudentTelemetry {
  movesCount: number;
  correctAnswers: number;
  incorrectAnswers: number;
  hintsUsed: number;
  timeTakenSec: number;
  repeatedMistakes: Record<string, number>;
  masteredConcepts: string[];
  stageCompleted: Record<string, boolean>;
}

export interface AdaptiveSettings {
  difficulty: 'guided' | 'standard' | 'advanced';
  explanationDepth: 'scaffolded' | 'intermediate' | 'rigorous';
  hintsAvailable: boolean;
  simplifiedRemediationActive: boolean;
  scaffoldingRemoved: boolean;
}

export interface GameDefinition {
  id: GameId;
  title: string;
  subtitle: string;
  tagline: string;
  category: MathematicalConcept['category'];
  concept: MathematicalConcept;
  stages: {
    [key in LearningStage]: {
      title: string;
      description: string;
      learningGoal: string;
      tasks: string[];
    };
  };
  thinkPrompts: ThinkPrompt[];
  hints: HintItem[];
  independentChallengeGoal: string;
}

export interface KnowledgeNode {
  id: string;
  title: string;
  category: MathematicalConcept['category'];
  gameId: GameId;
  prerequisites: string[];
  rosenSection: string;
  description: string;
  status: 'locked' | 'available' | 'in_progress' | 'mastered';
}
