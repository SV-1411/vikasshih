// A compact offline dictionary for instant, low-bandwidth lookups.
// Add or modify entries over time as needed.
export type OfflineEntry = {
  definition: string;
  partOfSpeech?: string;
  example?: string;
};

export const OFFLINE_DICTIONARY: Record<string, OfflineEntry> = {
  // General academic / STEM terms
  "analysis": { definition: "Careful study of something to understand its parts and relationships.", partOfSpeech: "noun", example: "Data analysis reveals the trend." },
  "algorithm": { definition: "A step-by-step procedure to solve a problem or perform a task.", partOfSpeech: "noun", example: "The sorting algorithm runs in O(n log n)." },
  "approximate": { definition: "Close to the actual value but not exact.", partOfSpeech: "adjective", example: "Use an approximate answer when exact data is missing." },
  "assertion": { definition: "A confident statement of fact or belief.", partOfSpeech: "noun" },
  "attenuate": { definition: "To reduce in force, effect, or value.", partOfSpeech: "verb", example: "Filters attenuate high-frequency noise." },
  "brittle": { definition: "Hard but likely to break or crack easily.", partOfSpeech: "adjective" },
  "buoyancy": { definition: "Upward force on an object in a fluid, making it seem lighter.", partOfSpeech: "noun" },
  "catalyst": { definition: "A substance that speeds up a chemical reaction without being used up.", partOfSpeech: "noun" },
  "compress": { definition: "To press into a smaller space; to reduce size or volume.", partOfSpeech: "verb" },
  "condense": { definition: "To change from gas to liquid; to make something more concentrated.", partOfSpeech: "verb" },
  "conduction": { definition: "Heat transfer through direct contact of particles.", partOfSpeech: "noun" },
  "convection": { definition: "Heat transfer by movement of a fluid (liquid or gas).", partOfSpeech: "noun" },
  "density": { definition: "Mass per unit volume of a substance.", partOfSpeech: "noun", example: "Water density is about 1000 kg/m³." },
  "derive": { definition: "To obtain something from a source, often by reasoning or calculation.", partOfSpeech: "verb" },
  "dimensionless": { definition: "A quantity without units, often a ratio.", partOfSpeech: "adjective" },
  "drag": { definition: "A resistive force on an object moving through a fluid.", partOfSpeech: "noun" },
  "elastic": { definition: "Able to return to original shape after being stretched or compressed.", partOfSpeech: "adjective" },
  "empirical": { definition: "Based on observation or experiment, not just theory.", partOfSpeech: "adjective" },
  "equilibrium": { definition: "A balanced state with no net change.", partOfSpeech: "noun" },
  "erosion": { definition: "Gradual wearing away of material by wind, water, or other forces.", partOfSpeech: "noun" },
  "evaluate": { definition: "To assess or judge the value, quality, or performance.", partOfSpeech: "verb" },
  "fluid": { definition: "A substance that flows, like a liquid or gas.", partOfSpeech: "noun" },
  "friction": { definition: "Resistance when two surfaces move against each other.", partOfSpeech: "noun" },
  "gradient": { definition: "Rate of change of a quantity with respect to distance.", partOfSpeech: "noun" },
  "hypothesis": { definition: "A testable idea or explanation based on limited evidence.", partOfSpeech: "noun" },
  "iterate": { definition: "To repeat steps to improve a result.", partOfSpeech: "verb" },
  "laminar": { definition: "Smooth fluid flow in parallel layers with little mixing.", partOfSpeech: "adjective" },
  "magnitude": { definition: "The size or amount of something.", partOfSpeech: "noun" },
  "mass": { definition: "Amount of matter in an object.", partOfSpeech: "noun" },
  "momentum": { definition: "Quantity of motion (mass × velocity).", partOfSpeech: "noun" },
  "negligible": { definition: "So small that it can be ignored.", partOfSpeech: "adjective" },
  "optimize": { definition: "To make the best or most effective use of something.", partOfSpeech: "verb" },
  "oscillation": { definition: "Regular back-and-forth motion.", partOfSpeech: "noun" },
  "precision": { definition: "How consistent or repeatable a measurement is.", partOfSpeech: "noun" },
  "pressure": { definition: "Force applied per unit area.", partOfSpeech: "noun", example: "Tire pressure is measured in psi or bar." },
  "resolve": { definition: "To find a solution; or to separate a signal into components.", partOfSpeech: "verb" },
  "resistance": { definition: "Opposition to motion or flow (e.g., electrical or fluid).", partOfSpeech: "noun" },
  "shear": { definition: "A force that causes parts of a material to slide past each other.", partOfSpeech: "noun" },
  "spectrum": { definition: "A range of values, often frequencies or wavelengths.", partOfSpeech: "noun" },
  "stability": { definition: "Ability to remain steady or resist change.", partOfSpeech: "noun" },
  "stagnation": { definition: "A state of no movement; in fluids, a point where velocity is zero.", partOfSpeech: "noun" },
  "strain": { definition: "Deformation per unit length in a material.", partOfSpeech: "noun" },
  "stress": { definition: "Internal force per unit area within materials.", partOfSpeech: "noun" },
  "turbulent": { definition: "Chaotic, irregular fluid flow with mixing.", partOfSpeech: "adjective" },
  "velocity": { definition: "Speed with direction.", partOfSpeech: "noun" },
  "viscosity": { definition: "A fluid's resistance to flow (" + 'thickness' + ").", partOfSpeech: "noun" },
  "vortex": { definition: "A spinning, spiraling flow around a center.", partOfSpeech: "noun" },
  "yield": { definition: "To give way under force; in materials, the point where permanent deformation begins.", partOfSpeech: "verb" },
  // Common academic vocabulary
  "context": { definition: "The situation or background that helps explain something.", partOfSpeech: "noun" },
  "contrast": { definition: "To compare to show differences; or the difference itself.", partOfSpeech: "verb" },
  "derive (math)": { definition: "To obtain a formula or result using rules of calculus or algebra.", partOfSpeech: "verb" },
  "interpret": { definition: "To explain the meaning of information or actions.", partOfSpeech: "verb" },
  "summarize": { definition: "To give a short statement of the main points.", partOfSpeech: "verb" }
};
