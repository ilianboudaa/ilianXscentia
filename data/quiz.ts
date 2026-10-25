import { QuizQuestion, Perfume } from "@/types";

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    title: "Quel univers sensoriel éveille instantanément votre émotion ?",
    subtitle:
      "Fermez les yeux et laissez votre mémoire olfactive choisir l'atmosphère idéale.",
    options: [
      {
        label: "L'or chaud de la vanille & des épices douces",
        description:
          "Une atmosphère enveloppante, rassurante et profondément sensuelle de vanille bourbon et caramel.",
        preferredFamilies: ["vanille", "gourmande"],
        vanillaScore: 100,
      },
      {
        label: "Un jardin secret de fleurs rares à la rosée du matin",
        description:
          "Des brassées de roses fraîches, de jasmin nocturne et d'iris poudré sous une lumière douce.",
        preferredFamilies: ["florale"],
        vanillaScore: 30,
      },
      {
        label: "La pénombre noble d'une bibliothèque en bois ciré",
        description:
          "Santal sacré de Mysore, cèdre de l'Atlas, cuir patiné et volutes d'encens ténébreux.",
        preferredFamilies: ["boisee", "ambree"],
        vanillaScore: 20,
      },
      {
        label: "La brise cristalline d'un rivage méditerranéen",
        description:
          "Agrumes de Calabre éclatants, feuilles de figuier froissées et néroli pur baigné d'azur.",
        preferredFamilies: ["fraiche"],
        vanillaScore: 10,
      },
    ],
  },
  {
    id: 2,
    title: "À quel moment de votre vie souhaitez-vous porter cette création ?",
    subtitle: "Chaque parfum SCENTIA possède sa propre signature temporelle.",
    options: [
      {
        label: "Pour les soirées inoubliables & la séduction",
        description:
          "Un sillage magnétique, envoûtant et inoubliable qui marque les esprits.",
        preferredFamilies: ["vanille", "ambree", "boisee"],
        vanillaScore: 80,
      },
      {
        label: "Comme une signature intime de chaque jour",
        description:
          "Un voile soyeux, élégant et réconfortant qui devient votre seconde peau.",
        preferredFamilies: ["florale", "fraiche", "vanille"],
        vanillaScore: 50,
      },
      {
        label: "Pour des instants de célébration et de rayonnement",
        description:
          "Une explosion lumineuse et solaire de joie, d'assurance et d'opulence.",
        preferredFamilies: ["florale", "gourmande"],
        vanillaScore: 70,
      },
      {
        label: "Pour un moment de calme méditatif et de bien-être",
        description:
          "La pureté des muscs blancs et des bois sacrés pour apaiser l'esprit.",
        preferredFamilies: ["fraiche", "boisee"],
        vanillaScore: 15,
      },
    ],
  },
  {
    id: 3,
    title: "Quelle intensité et quel sillage recherchez-vous ?",
    subtitle: "De l'élégance chuchotée à la présence royale inoubliable.",
    options: [
      {
        label: "Sillage hypnotique & puissance de tenue (Extrait)",
        description:
          "Une présence affirmée qui précède votre arrivée et flotte longtemps après votre départ.",
        preferredFamilies: ["vanille", "ambree", "boisee"],
        vanillaScore: 90,
      },
      {
        label: "Sillage équilibré & élégance raffinée",
        description:
          "Une aura remarquable à distance de conversation, sans jamais envahir l'espace.",
        preferredFamilies: ["florale", "vanille", "gourmande"],
        vanillaScore: 60,
      },
      {
        label: "Sillage intime & murmure de peau",
        description:
          "Une douceur subtile perceptible uniquement par ceux qui s'approchent au plus près.",
        preferredFamilies: ["fraiche", "florale"],
        vanillaScore: 25,
      },
    ],
  },
  {
    id: 4,
    title: "Quelle est votre relation intime avec la Vanille ?",
    subtitle: "La vanille est l'or noir et le cœur historique de notre Maison.",
    options: [
      {
        label: "Passion absolue : je veux une vanille riche, profonde et noire",
        description:
          "Gousses charnues de Madagascar, tonka dorée et rondeur gourmande enivrante.",
        preferredFamilies: ["vanille", "gourmande"],
        vanillaScore: 100,
      },
      {
        label: "J'aime la vanille mariée aux fleurs blanches ou aux bois",
        description:
          "Une touche suave et soyeuse qui adoucit un bouquet de jasmin ou un bois de santal.",
        preferredFamilies: ["vanille", "florale", "boisee"],
        vanillaScore: 75,
      },
      {
        label: "Je préfère une vanille discrète, presque vaporeuse",
        description:
          "Un soupçon de douceur en fond sans empiéter sur la fraîcheur.",
        preferredFamilies: ["florale", "fraiche"],
        vanillaScore: 40,
      },
      {
        label:
          "Je recherche plutôt des notes fraîches, vertes ou cuirées sans sucre",
        description:
          "Une composition axée sur la pureté minérale, les agrumes ou le cuir noble.",
        preferredFamilies: ["fraiche", "boisee", "ambree"],
        vanillaScore: 0,
      },
    ],
  },
  {
    id: 5,
    title: "Quel accord gustatif ou matière noble vous fait le plus vibrer ?",
    subtitle: "Les matières d'exception choisies par nos nez parfumeurs.",
    options: [
      {
        label: "Caramel au beurre salé, amande douce & tonka",
        description: "La gourmandise parisienne la plus pure et réconfortante.",
        preferredFamilies: ["gourmande", "vanille"],
        vanillaScore: 95,
      },
      {
        label: "Iris de Florence, rose de mai & poudre de riz",
        description:
          "Le velouté des boudoirs royaux et des soieries précieuses.",
        preferredFamilies: ["florale"],
        vanillaScore: 30,
      },
      {
        label: "Oud sauvage, safran rouge & cuir vieilli",
        description: "Le magnétisme ténébreux et aristocratique de l'Orient.",
        preferredFamilies: ["boisee", "ambree"],
        vanillaScore: 10,
      },
      {
        label: "Feuille de figuier, bergamote de Calabre & fleur d'oranger",
        description:
          "La vibration joyeuse et lumineuse des vergers ensoleillés.",
        preferredFamilies: ["fraiche", "florale"],
        vanillaScore: 20,
      },
    ],
  },
];

export function calculateQuizResults(
  answers: number[],
  perfumes: Perfume[],
): {
  topPerfumes: Perfume[];
  primaryFamily: string;
  vanillaAffinity: number;
} {
  // answers is an array of chosen option indices for each question
  const familyScores: Record<string, number> = {
    vanille: 0,
    florale: 0,
    boisee: 0,
    ambree: 0,
    fraiche: 0,
    gourmande: 0,
  };

  let totalVanilla = 0;
  let answerCount = 0;

  answers.forEach((optIdx, qIdx) => {
    const question = QUIZ_QUESTIONS[qIdx];
    if (question && question.options[optIdx]) {
      const opt = question.options[optIdx];
      opt.preferredFamilies.forEach((f) => {
        familyScores[f] = (familyScores[f] || 0) + 10;
      });
      totalVanilla += opt.vanillaScore;
      answerCount++;
    }
  });

  const vanillaAffinity =
    answerCount > 0 ? Math.round(totalVanilla / answerCount) : 50;

  // Determine top family
  let primaryFamily = "vanille";
  let maxScore = -1;
  Object.entries(familyScores).forEach(([fam, sc]) => {
    if (sc > maxScore) {
      maxScore = sc;
      primaryFamily = fam;
    }
  });

  // Score all perfumes
  const scoredPerfumes = perfumes.map((perfume) => {
    let score = 0;
    // Family match
    if (perfume.family === primaryFamily) score += 40;
    if (familyScores[perfume.family]) score += familyScores[perfume.family] * 2;

    // Vanilla match
    if (perfume.isVanillaCollection) {
      score += (vanillaAffinity / 100) * 35;
    } else {
      score += ((100 - vanillaAffinity) / 100) * 20;
    }

    // Bestseller bonus
    if (perfume.isBestseller) score += 5;

    return { perfume, score };
  });

  scoredPerfumes.sort((a, b) => b.score - a.score);

  return {
    topPerfumes: scoredPerfumes.slice(0, 3).map((s) => s.perfume),
    primaryFamily,
    vanillaAffinity,
  };
}
