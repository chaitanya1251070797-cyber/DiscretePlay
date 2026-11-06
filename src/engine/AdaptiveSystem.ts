import { StudentTelemetry, AdaptiveSettings } from '../types/learning';

export class AdaptiveEngine {
  static evaluate(telemetry: StudentTelemetry): AdaptiveSettings {
    const errorCount = telemetry.incorrectAnswers;
    const correctCount = telemetry.correctAnswers;
    const hintsUsed = telemetry.hintsUsed;
    
    // Check for repetitive mistakes
    const maxRepetition = Object.values(telemetry.repeatedMistakes).reduce(
      (max, count) => Math.max(max, count),
      0
    );

    const hasSevereStruggle = maxRepetition >= 2 || (errorCount > 3 && correctCount <= 1);
    const hasConsistentSuccess = correctCount >= 3 && errorCount === 0 && hintsUsed === 0;

    if (hasSevereStruggle) {
      return {
        difficulty: 'guided',
        explanationDepth: 'scaffolded',
        hintsAvailable: true,
        simplifiedRemediationActive: true,
        scaffoldingRemoved: false
      };
    }

    if (hasConsistentSuccess) {
      return {
        difficulty: 'advanced',
        explanationDepth: 'rigorous',
        hintsAvailable: false, // Scaffold removal
        simplifiedRemediationActive: false,
        scaffoldingRemoved: true
      };
    }

    // Default standard progression
    return {
      difficulty: 'standard',
      explanationDepth: 'intermediate',
      hintsAvailable: true,
      simplifiedRemediationActive: false,
      scaffoldingRemoved: false
    };
  }

  static getMasteryLevel(telemetry: StudentTelemetry, conceptId: string): {
    isMastered: boolean;
    score: number;
    feedback: string;
  } {
    const stage5Done = telemetry.stageCompleted['INDEPENDENT_APPLICATION'] === true;
    const errors = telemetry.incorrectAnswers;
    const hints = telemetry.hintsUsed;

    // Strict criterion: Concept is mastered ONLY if stage 5 is completed independently (max 1 hint, low errors)
    if (stage5Done && hints <= 1 && errors <= 2) {
      return {
        isMastered: true,
        score: Math.max(80, 100 - (errors * 5) - (hints * 10)),
        feedback: 'Concept fully mastered! You demonstrated independent problem solving without reliance on scaffolding.'
      };
    }

    if (stage5Done) {
      return {
        isMastered: false,
        score: 65,
        feedback: 'Challenge finished, but heavy hint assistance was needed. Try once more independently to secure mastery!'
      };
    }

    const completedCount = Object.values(telemetry.stageCompleted).filter(Boolean).length;
    const progressScore = Math.min(60, completedCount * 15);

    return {
      isMastered: false,
      score: progressScore,
      feedback: 'In progress. Advance through the learning stages to unlock the formal revelation and independent challenge.'
    };
  }
}

