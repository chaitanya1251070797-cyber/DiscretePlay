import { GameDefinition } from '../../types/learning';

export const caesarGameDefinition: GameDefinition = {
  id: 'caesar-cipher',
  title: 'Caesar Cipher & Modulo Ring',
  subtitle: 'Modular Arithmetic, Congruences & Cryptography',
  tagline: 'Wrap the alphabet around the clock ring Z_26 and unlock the algebraic foundation of modern ciphers.',
  category: 'Number Theory & Cryptography',
  concept: {
    id: 'modular-arithmetic',
    name: 'Modular Arithmetic & The Ring Z_26 in Cryptography',
    category: 'Number Theory & Cryptography',
    simpleExplanation: 'Letters A through Z map to numbers 0 through 25. Shifting letters by key k wraps around when exceeding 25, exactly like hours on a clock! This is Modular Arithmetic: arithmetic on equivalence classes modulo 26.',
    formalDefinition: 'Let a, b in Z and m in Z^+. We say a is congruent to b modulo m, written a = b (mod m), if m divides (a - b). For alphabet size m = 26, the Caesar encryption function is E_k(x) = (x + k) mod 26, and decryption is D_k(y) = (y - k) mod 26 = (y + (26 - k)) mod 26, where k in Z_{26} is the additive key.',
    formulas: [
      {
        label: 'Encryption Function',
        latex: 'E_k(x) = (x + k) \\pmod{26}, \\quad x \\in \\{0, 1, \\dots, 25\\}',
        explanation: 'Each plaintext letter index x is translated by shift key k in the cyclic group (Z_26, +).'
      },
      {
        label: 'Decryption via Additive Inverse',
        latex: 'D_k(y) = (y - k) \\pmod{26} = (y + (26 - k)) \\pmod{26}',
        explanation: 'Decryption adds the additive inverse -k = 26 - k mod 26, undoing the encryption shift without negative indices.'
      }
    ],
    rosenReference: {
      edition: '8th Edition',
      chapter: 'Chapter 4: Number Theory and Cryptography',
      section: 'Section 4.1: Divisibility and Modular Arithmetic & Section 4.6: Cryptography',
      topic: 'Classical Cryptography: The Caesar Cipher',
      citation: 'Kenneth H. Rosen, Discrete Mathematics and Its Applications',
      excerpt: 'Julius Caesar used a shift cipher to protect messages to his generals. Each letter is replaced by the letter standing three positions further down in the alphabet. Mathematically, we assign the integer value p to each letter from 0 (A) to 25 (Z). The encryption function is f(p) = (p + k) mod 26. Decryption is performed by finding f^{-1}(c) = (c - k) mod 26.'
    },
    gameConnection: 'When you adjust shift k from 3 to 4, the entire alphabet wheel rotates. Shifting Z (25) by 1 yields (25 + 1) mod 26 = 26 mod 26 = 0, which corresponds to A!',
    realWorldApplications: [
      'Symmetric key ciphers (AES substitution-permutation boxes / S-Boxes)',
      'Hash tables and hash functions (index = hash(key) mod capacity)',
      'Circular buffers in operating systems and streaming queues',
      'Check digits in ISBN-10, credit cards (Luhn algorithm), and UPC barcodes'
    ]
  },
  stages: {
    DISCOVER: {
      title: 'Discover: Letter Shifting',
      description: 'Observe a scrambled ancient quote. Use the interactive slider to shift the letters and discover readable words.',
      learningGoal: 'Realize that encryption is a uniform letter-by-letter substitution rule.',
      tasks: [
        'Adjust the shift key slider k',
        'Watch the ciphertext characters update dynamically',
        'Find the shift value where "KHOOR" becomes "HELLO"'
      ]
    },
    EXPERIMENT: {
      title: 'Experiment: The Boundary Wrap-Around',
      description: 'Observe what happens when shifting past the letter "Z" (position 25).',
      learningGoal: 'Discover that 25 + 1 does not produce an error; it loops seamlessly back to index 0 (A).',
      tasks: [
        'Shift the word "XYZ" by k = 3',
        'Confirm that X(23)+3 = 26 = 0 (A), Y(24)+3 = 27 = 1 (B), Z(25)+3 = 28 = 2 (C)',
        'Identify the cyclic clock nature of the 26-element set'
      ]
    },
    GUIDED_REASONING: {
      title: 'Guided Reasoning: Formulating Modulo',
      description: 'Connect clock arithmetic to modular congruence equations.',
      learningGoal: 'Formulate the mathematical expression E(x) = (x + k) mod 26 and compute additive inverse.',
      tasks: [
        'Answer the modular calculation question for x = 24 and k = 5',
        'Deduce how to invert a shift of +7 without negative numbers',
        'Confirm that subtracting 7 is identical to adding 19 mod 26'
      ]
    },
    MATHEMATICAL_REVELATION: {
      title: 'Mathematical Revelation: Cyclic Group Z_26 & Cryptanalysis',
      description: 'Explore congruence modulo m, modular rings, and frequency analysis from Rosen Chapter 4.',
      learningGoal: 'Understand algebraic structure of Z_26 and vulnerability of shift ciphers to brute-force.',
      tasks: [
        'Inspect the interactive 26-hour clock wheel',
        'Review the letter frequency distribution comparison (E is most frequent at 12.7%)',
        'Read Kenneth H. Rosen 8th Edition Section 4.6 Cryptography'
      ]
    },
    INDEPENDENT_APPLICATION: {
      title: 'Independent Application: Crack the Unknown Ciphertext',
      description: 'Decipher a mystery intercepted message where key k is unknown. Use frequency analysis and modular inverse arithmetic.',
      learningGoal: 'Independently break the cipher and verify the mathematical key without hints.',
      tasks: [
        'Analyze letter frequencies of ciphertext',
        'Calculate candidate shift k from peak frequency',
        'Successfully decrypt the secret transmission'
      ]
    }
  },
  thinkPrompts: [
    {
      id: 'caesar-wrap-think',
      question: 'Letter "W" is at position 22. If we apply an encryption shift of k = 8, what is the resulting letter, and what is the underlying modular arithmetic equation?',
      contextHint: 'Calculate (22 + 8) mod 26.',
      options: [
        {
          text: 'Letter "E" at index 4, because (22 + 8) mod 26 = 30 mod 26 = 4.',
          isCorrect: true,
          explanation: 'Excellent! 30 divided by 26 leaves a remainder of 4. Since 4 corresponds to E (A=0, B=1, C=2, D=3, E=4), W becomes E!'
        },
        {
          text: 'Letter "D" at index 3, because 30 - 26 = 4 and we subtract 1.',
          isCorrect: false,
          explanation: 'Index 4 maps directly to E in 0-indexed systems (0:A, 1:B, 2:C, 3:D, 4:E).'
        },
        {
          text: 'It is an out-of-bounds invalid operation because 30 > 25.',
          isCorrect: false,
          explanation: 'Modular arithmetic never goes out of bounds; the ring Z_26 wraps seamlessly like a 26-hour clock!'
        }
      ]
    }
  ],
  hints: [
    {
      id: 'caesar-hint-1',
      tier: 1,
      title: 'Index Mapping',
      content: 'Always convert letters to 0-based indices: A=0, B=1, ..., Y=24, Z=25.'
    },
    {
      id: 'caesar-hint-2',
      tier: 2,
      title: 'Reversing a Shift',
      content: 'To undo a shift of k = 7, you can either subtract 7 (mod 26) or add (26 - 7) = +19 (mod 26). Both produce the exact same equivalence class!'
    },
    {
      id: 'caesar-hint-3',
      tier: 3,
      title: 'Frequency Analysis',
      content: 'In standard English, the letter "E" is overwhelmingly the most frequent letter (~12.7%). Find the most common letter in the ciphertext and set it equal to (E + k) mod 26 = (4 + k) mod 26.',
      formulaSnippet: 'k = (\\text{index}(\\text{most\\_frequent}) - 4) \\pmod{26}'
    }
  ],
  independentChallengeGoal: 'Decipher the intercepted message by finding unknown key k using frequency analysis and modular inverses.'
};

