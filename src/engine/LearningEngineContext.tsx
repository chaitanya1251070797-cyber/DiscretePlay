import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  LearningStage, 
  TeachingInteractionMode, 
  GameId, 
  GameDefinition, 
  ThinkPrompt, 
  HintItem, 
  ExplanationEntry, 
  StudentTelemetry, 
  AdaptiveSettings,
  MathematicalConcept
} from '../types/learning';
import { AdaptiveEngine } from './AdaptiveSystem';
import confetti from 'canvas-confetti';

interface LearningEngineContextType {
  // Game & Navigation
  currentGameId: GameId;
  currentGame: GameDefinition;
  switchGame: (gameId: GameId) => void;
  
  // Learning Stages
  currentStage: LearningStage;
  setStage: (stage: LearningStage) => void;
  advanceStage: () => void;
  canAdvanceStage: boolean;
  stageProgressPercent: number;

  // Contextual Teaching Panel
  interactionMode: TeachingInteractionMode;
  setInteractionMode: (mode: TeachingInteractionMode) => void;
  
  // Teaching Modalities Content
  currentThinkPrompt: ThinkPrompt | null;
  submitThinkAnswer: (optionIndex: number) => { isCorrect: boolean; explanation: string };
  dismissThinkPrompt: () => void;

  availableHints: HintItem[];
  revealedHints: HintItem[];
  revealNextHint: () => HintItem | null;

  recentExplanations: ExplanationEntry[];
  addExplanation: (
    title: string, 
    shortSummary: string, 
    detailedMath: string, 
    context?: ExplanationEntry['context'],
    rosenNote?: string
  ) => void;
  clearExplanations: () => void;

  // Telemetry & Adaptivity
  telemetry: StudentTelemetry;
  adaptiveSettings: AdaptiveSettings;
  recordAction: (isValid: boolean, mistakeKey?: string, explanationText?: string) => void;
  resetGameTelemetry: () => void;

  // Concept & Knowledge
  activeConcept: MathematicalConcept;
  allMasteredConcepts: string[];
  markConceptMastered: (conceptId: string) => void;

  // Modals
  isRosenModalOpen: boolean;
  setRosenModalOpen: (open: boolean) => void;
  isKnowledgeGraphOpen: boolean;
  setKnowledgeGraphOpen: (open: boolean) => void;
  isCelebrationOpen: boolean;
  setCelebrationOpen: (open: boolean) => void;
  lastMasteredNodeId: string | null;

  // Live Game State hook for custom visualizers
  sharedGameState: any;
  updateSharedGameState: (state: any) => void;
}

const LearningEngineContext = createContext<LearningEngineContextType | undefined>(undefined);

const STAGES_ORDER: LearningStage[] = [
  'DISCOVER',
  'EXPERIMENT',
  'GUIDED_REASONING',
  'MATHEMATICAL_REVELATION',
  'INDEPENDENT_APPLICATION'
];

interface ProviderProps {
  children: ReactNode;
  gameRegistry: Record<GameId, GameDefinition>;
  initialGameId?: GameId;
}

export const LearningEngineProvider: React.FC<ProviderProps> = ({
  children,
  gameRegistry,
  initialGameId = 'tower-of-hanoi'
}) => {
  const [currentGameId, setCurrentGameId] = useState<GameId>(initialGameId);
  const currentGame = gameRegistry[currentGameId];

  const [currentStage, setCurrentStage] = useState<LearningStage>('DISCOVER');
  const [interactionMode, setInteractionMode] = useState<TeachingInteractionMode>('EXPLAIN');

  // Modals
  const [isRosenModalOpen, setRosenModalOpen] = useState(false);
  const [isKnowledgeGraphOpen, setKnowledgeGraphOpen] = useState(false);
  const [isCelebrationOpen, setCelebrationOpen] = useState(false);
  const [lastMasteredNodeId, setLastMasteredNodeId] = useState<string | null>(null);

  // Teaching items
  const [currentThinkPrompt, setCurrentThinkPrompt] = useState<ThinkPrompt | null>(null);
  const [revealedHints, setRevealedHints] = useState<HintItem[]>([]);
  const [recentExplanations, setRecentExplanations] = useState<ExplanationEntry[]>([]);

  // Telemetry
  const [telemetry, setTelemetry] = useState<StudentTelemetry>({
    movesCount: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    hintsUsed: 0,
    timeTakenSec: 0,
    repeatedMistakes: {},
    masteredConcepts: [],
    stageCompleted: {
      DISCOVER: false,
      EXPERIMENT: false,
      GUIDED_REASONING: false,
      MATHEMATICAL_REVELATION: false,
      INDEPENDENT_APPLICATION: false
    }
  });

  const [adaptiveSettings, setAdaptiveSettings] = useState<AdaptiveSettings>({
    difficulty: 'standard',
    explanationDepth: 'intermediate',
    hintsAvailable: true,
    simplifiedRemediationActive: false,
    scaffoldingRemoved: false
  });

  const [allMasteredConcepts, setAllMasteredConcepts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('discreteplay_mastered');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Shared game state for visualizer sync
  const [sharedGameState, setSharedGameState] = useState<any>(null);

  // Timer tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(prev => ({ ...prev, timeTakenSec: prev.timeTakenSec + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update adaptive profile whenever telemetry changes
  useEffect(() => {
    const newSettings = AdaptiveEngine.evaluate(telemetry);
    setAdaptiveSettings(newSettings);
  }, [telemetry]);

  // Handle game switch
  const switchGame = useCallback((gameId: GameId) => {
    setCurrentGameId(gameId);
    setCurrentStage('DISCOVER');
    setInteractionMode('EXPLAIN');
    setRevealedHints([]);
    setCurrentThinkPrompt(null);
    setRecentExplanations([]);
    setSharedGameState(null);
    setTelemetry({
      movesCount: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      hintsUsed: 0,
      timeTakenSec: 0,
      repeatedMistakes: {},
      masteredConcepts: allMasteredConcepts,
      stageCompleted: {
        DISCOVER: false,
        EXPERIMENT: false,
        GUIDED_REASONING: false,
        MATHEMATICAL_REVELATION: false,
        INDEPENDENT_APPLICATION: false
      }
    });
  }, [allMasteredConcepts]);

  // Stage changes
  const setStage = useCallback((stage: LearningStage) => {
    setCurrentStage(stage);
    if (stage === 'MATHEMATICAL_REVELATION') {
      setInteractionMode('VISUALIZE');
    } else if (stage === 'GUIDED_REASONING') {
      setInteractionMode('THINK');
    }
  }, []);

  const advanceStage = useCallback(() => {
    const currentIndex = STAGES_ORDER.indexOf(currentStage);
    // Mark current stage completed
    setTelemetry(prev => ({
      ...prev,
      stageCompleted: {
        ...prev.stageCompleted,
        [currentStage]: true
      }
    }));

    if (currentIndex < STAGES_ORDER.length - 1) {
      const next = STAGES_ORDER[currentIndex + 1];
      setStage(next);
    }
  }, [currentStage, setStage]);

  const stageProgressPercent = ((STAGES_ORDER.indexOf(currentStage) + 1) / STAGES_ORDER.length) * 100;
  const canAdvanceStage = true; // Governed by stage objectives

  // Explanation dispatch
  const addExplanation = useCallback((
    title: string,
    shortSummary: string,
    detailedMath: string,
    context: ExplanationEntry['context'] = 'valid_move',
    rosenNote?: string
  ) => {
    const entry: ExplanationEntry = {
      id: Math.random().toString(36).substring(7),
      title,
      shortSummary,
      detailedMath,
      context,
      rosenNote,
      timestamp: Date.now()
    };
    setRecentExplanations(prev => [entry, ...prev.slice(0, 7)]);
  }, []);

  const clearExplanations = useCallback(() => {
    setRecentExplanations([]);
  }, []);

  // Hint handling
  const availableHints = currentGame.hints || [];

  const revealNextHint = useCallback(() => {
    const unrevealed = availableHints.filter(h => !revealedHints.some(r => r.id === h.id));
    if (unrevealed.length === 0) return null;

    const nextHint = unrevealed[0];
    setRevealedHints(prev => [...prev, nextHint]);
    setTelemetry(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    setInteractionMode('HINT');
    return nextHint;
  }, [availableHints, revealedHints]);

  // Think prompt handling
  const submitThinkAnswer = useCallback((optionIndex: number) => {
    if (!currentThinkPrompt) return { isCorrect: false, explanation: 'No active question' };
    const option = currentThinkPrompt.options[optionIndex];
    if (!option) return { isCorrect: false, explanation: 'Invalid selection' };

    if (option.isCorrect) {
      setTelemetry(prev => ({ ...prev, correctAnswers: prev.correctAnswers + 1 }));
      addExplanation(
        'Insight Verified!',
        option.explanation,
        'Active reasoning reinforced the invariant and mathematical structure.',
        'strategic_subgoal'
      );
    } else {
      setTelemetry(prev => ({ ...prev, incorrectAnswers: prev.incorrectAnswers + 1 }));
      addExplanation(
        'Conceptual Clarification',
        option.explanation,
        'Carefully examine the preconditions and invariants governing this state.',
        'invalid_move'
      );
    }
    return { isCorrect: option.isCorrect, explanation: option.explanation };
  }, [currentThinkPrompt, addExplanation]);

  const dismissThinkPrompt = useCallback(() => {
    setCurrentThinkPrompt(null);
  }, []);

  // Action recording
  const recordAction = useCallback((isValid: boolean, mistakeKey?: string, explanationText?: string) => {
    setTelemetry(prev => {
      const nextMistakes = { ...prev.repeatedMistakes };
      if (!isValid && mistakeKey) {
        nextMistakes[mistakeKey] = (nextMistakes[mistakeKey] || 0) + 1;
      }
      return {
        ...prev,
        movesCount: prev.movesCount + 1,
        incorrectAnswers: !isValid ? prev.incorrectAnswers + 1 : prev.incorrectAnswers,
        repeatedMistakes: nextMistakes
      };
    });

    if (!isValid && explanationText) {
      addExplanation('Rule Constraint Encountered', explanationText, 'Every mathematical system enforces rigorous operational constraints.', 'invalid_move');
    }
  }, [addExplanation]);

  const resetGameTelemetry = useCallback(() => {
    setTelemetry(prev => ({
      ...prev,
      movesCount: 0,
      hintsUsed: 0,
      timeTakenSec: 0,
      repeatedMistakes: {}
    }));
  }, []);

  // Concept mastery
  const markConceptMastered = useCallback((conceptId: string) => {
    if (!allMasteredConcepts.includes(conceptId)) {
      const updated = [...allMasteredConcepts, conceptId];
      setAllMasteredConcepts(updated);
      try {
        localStorage.setItem('discreteplay_mastered', JSON.stringify(updated));
      } catch {}
    }
    setLastMasteredNodeId(conceptId);
    setCelebrationOpen(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, [allMasteredConcepts]);

  const updateSharedGameState = useCallback((state: any) => {
    setSharedGameState(state);
  }, []);

  return (
    <LearningEngineContext.Provider
      value={{
        currentGameId,
        currentGame,
        switchGame,
        currentStage,
        setStage,
        advanceStage,
        canAdvanceStage,
        stageProgressPercent,
        interactionMode,
        setInteractionMode,
        currentThinkPrompt,
        submitThinkAnswer,
        dismissThinkPrompt,
        availableHints,
        revealedHints,
        revealNextHint,
        recentExplanations,
        addExplanation,
        clearExplanations,
        telemetry,
        adaptiveSettings,
        recordAction,
        resetGameTelemetry,
        activeConcept: currentGame.concept,
        allMasteredConcepts,
        markConceptMastered,
        isRosenModalOpen,
        setRosenModalOpen,
        isKnowledgeGraphOpen,
        setKnowledgeGraphOpen,
        isCelebrationOpen,
        setCelebrationOpen,
        lastMasteredNodeId,
        sharedGameState,
        updateSharedGameState
      }}
    >
      {children}
    </LearningEngineContext.Provider>
  );
};

export const useLearningEngine = () => {
  const context = useContext(LearningEngineContext);
  if (!context) {
    throw new Error('useLearningEngine must be used within a LearningEngineProvider');
  }
  return context;
};

