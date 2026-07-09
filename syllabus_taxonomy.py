"""
The Nexus - Master Syllabus Taxonomy (v3)
==========================================
Derived directly from the official CAIE syllabus PDFs (2025-2027 cycle for
9702/9701/9700/9231, 2024-25 for 9618, 2023-25 for 9709). Replaces the
hand-typed SYLLABUS dict in generate_topicals.py.

Structure:  SYLLABUS[subject_code][paper_number] = {
                "title": str,
                "topics": { "Topic Name": [keyword, ...] }
            }

Keyword design notes:
  - Multi-word / hyphenated keywords are weighted 2x by the classifier,
    so precise phrases ("simple harmonic motion") beat generic tokens.
  - Keywords are examiner vocabulary taken from the syllabus content
    columns, lowercased. They are matched against each question's own
    text, not the whole page.
  - Mathematics (9709) and Further Maths (9231) keyword coverage is
    intentionally partial: symbolic questions often contain no topic
    words. These subjects are the primary target for the LLM
    classification pass (generate_llm_topics.py).

Paper-number mapping used by the pipeline (variant digit is stripped):
  9702 Physics:  1=MCQ(AS)  2=AS structured  4=A2 structured
  9701 Chem:     1=MCQ(AS)  2=AS structured  4=A2 structured
  9700 Bio:      1=MCQ(AS)  2=AS structured  4=A2 structured
  9618 CompSci:  1=AS theory 2=AS problem-solving 3=A2 theory 4=A2 practical
  9709 Maths:    1=Pure1 3=Pure3 4=Mechanics 5=Prob&Stat1  (2=Pure2,6=P&S2)
  9231 FMaths:   1=FPure1 2=FPure2 3=FMechanics 4=FProb&Stat
"""

# Shared topic sets reused across MCQ (P1) and structured (P2) papers.

_PHYSICS_AS = {
    "Physical Quantities & Units": ["physical quantity", "base unit", "derived unit", "si unit", "homogeneity", "scalar", "vector", "uncertainty", "absolute uncertainty", "percentage uncertainty", "fractional uncertainty", "systematic error", "random error", "precision", "accuracy", "order of magnitude", "prefix", "estimate"],
    "Kinematics": ["displacement", "velocity", "acceleration", "distance", "speed", "equations of motion", "uniform acceleration", "projectile", "free fall", "acceleration of free fall", "displacement-time", "velocity-time", "terminal velocity", "air resistance"],
    "Dynamics": ["newton's first law", "newton's second law", "newton's third law", "linear momentum", "momentum", "rate of change of momentum", "impulse", "conservation of momentum", "elastic collision", "inelastic collision", "mass", "weight", "resultant force", "friction", "drag"],
    "Forces, Density & Pressure": ["turning effect", "moment", "torque of a couple", "couple", "principle of moments", "equilibrium", "coplanar forces", "centre of gravity", "density", "pressure", "hydrostatic", "upthrust", "archimedes"],
    "Work, Energy & Power": ["work done", "kinetic energy", "potential energy", "gravitational potential energy", "elastic potential energy", "conservation of energy", "efficiency", "power", "deriving"],
    "Deformation of Solids": ["tensile", "compressive", "load", "extension", "hooke's law", "spring constant", "limit of proportionality", "elastic limit", "young modulus", "stress", "strain", "elastic deformation", "plastic deformation", "strain energy", "elastic potential energy"],
    "Waves": ["progressive wave", "displacement", "amplitude", "wavelength", "period", "frequency", "wave speed", "phase difference", "transverse", "longitudinal", "intensity", "doppler effect", "electromagnetic spectrum", "polarisation", "malus"],
    "Superposition": ["principle of superposition", "stationary wave", "standing wave", "node", "antinode", "diffraction", "interference", "coherence", "path difference", "two-source interference", "double-slit", "diffraction grating", "fringe"],
    "Electricity": ["electric current", "charge", "coulomb", "charge carrier", "mean drift velocity", "potential difference", "electromotive force", "e.m.f", "resistance", "ohm", "ohm's law", "resistivity", "i-v characteristic", "power", "filament lamp", "thermistor"],
    "D.C. Circuits": ["kirchhoff's first law", "kirchhoff's second law", "series", "parallel", "combined resistance", "potential divider", "potentiometer", "internal resistance", "terminal potential difference", "electromotive force", "e.m.f"],
    "Particle Physics": ["alpha-particle", "alpha particle", "nucleus", "proton number", "nucleon number", "isotope", "nuclide", "radiation", "beta", "gamma", "antiparticle", "quark", "hadron", "baryon", "meson", "lepton", "neutrino", "beta decay", "fundamental particle", "charge quantisation"],
}

_PHYSICS_A2 = {
    "Motion in a Circle": ["radian", "angular displacement", "angular velocity", "angular speed", "uniform circular motion", "centripetal acceleration", "centripetal force"],
    "Gravitational Fields": ["gravitational field", "field of a point mass", "gravitational field strength", "newton's law of gravitation", "gravitational force", "gravitational potential energy", "gravitational potential", "geostationary", "orbit", "escape"],
    "Temperature": ["thermal equilibrium", "temperature", "thermodynamic scale", "kelvin", "absolute zero", "thermometric", "specific heat capacity", "specific latent heat"],
    "Ideal Gases": ["mole", "avogadro", "ideal gas", "equation of state", "pressure", "kinetic theory", "mean square speed", "root-mean-square", "boltzmann", "internal energy"],
    "Thermodynamics": ["first law of thermodynamics", "internal energy", "work done on a gas", "heating", "specific heat"],
    "Oscillations": ["simple harmonic motion", "s.h.m", "angular frequency", "amplitude", "period", "phase", "damping", "damped", "resonance", "forced oscillation", "natural frequency"],
    "Electric Fields": ["electric field", "electric field strength", "coulomb's law", "point charge", "electric potential", "electric potential energy", "uniform field", "permittivity", "equipotential"],
    "Capacitance": ["capacitance", "capacitor", "farad", "parallel plate", "dielectric", "energy stored", "capacitors in series", "capacitors in parallel", "time constant", "exponential decay", "discharge"],
    "Magnetic Fields": ["magnetic field", "magnetic flux density", "tesla", "force on a current", "force on a moving charge", "fleming's left-hand", "hall effect", "hall voltage", "velocity selector", "electromagnetic induction", "magnetic flux", "weber", "faraday's law", "lenz's law", "flux linkage"],
    "Alternating Currents": ["alternating current", "sinusoidal", "peak value", "root-mean-square", "r.m.s", "rectification", "half-wave", "full-wave", "smoothing", "transformer"],
    "Quantum Physics": ["photon", "photon energy", "planck constant", "photoelectric effect", "work function", "threshold frequency", "maximum kinetic energy", "wave-particle duality", "de broglie wavelength", "energy level", "line spectra", "emission", "absorption"],
    "Nuclear Physics": ["mass defect", "mass-energy", "binding energy", "nuclear fission", "nuclear fusion", "radioactive decay", "spontaneous", "random", "decay constant", "half-life", "activity", "becquerel", "count rate"],
    "Medical Physics": ["ultrasound", "piezoelectric", "acoustic impedance", "reflection coefficient", "attenuation", "x-ray", "attenuation coefficient", "computed tomography", "ct scan", "pet scan", "positron", "annihilation", "tracer", "gamma camera"],
    "Astronomy & Cosmology": ["luminosity", "radiant flux intensity", "standard candle", "stefan", "wien", "hubble", "redshift", "doppler redshift", "recession", "big bang", "cosmological"],
}

_CHEM_AS = {
    "Atomic Structure": ["proton", "neutron", "electron", "nucleon", "isotope", "mass spectrometry", "relative atomic mass", "subshell", "orbital", "electronic configuration", "ionisation energy", "successive ionisation"],
    "Atoms, Molecules & Stoichiometry": ["relative atomic mass", "relative molecular mass", "mole", "avogadro", "empirical formula", "molecular formula", "stoichiometry", "limiting reagent", "percentage yield", "concentration", "titration"],
    "Chemical Bonding": ["ionic bond", "covalent bond", "co-ordinate bond", "dative", "metallic bond", "electronegativity", "bond polarity", "dipole", "van der waals", "hydrogen bond", "vsepr", "shape of molecule", "bond angle", "lattice"],
    "States of Matter": ["ideal gas", "pv = nrt", "kinetic theory", "gas", "lattice structure", "giant molecular", "simple molecular", "allotrope"],
    "Chemical Energetics": ["enthalpy", "exothermic", "endothermic", "enthalpy change", "standard conditions", "hess's law", "bond energy", "enthalpy of formation", "enthalpy of combustion", "calorimetry"],
    "Electrochemistry (AS)": ["oxidation number", "redox", "oxidation", "reduction", "half-equation", "oxidising agent", "reducing agent"],
    "Equilibria (AS)": ["reversible", "dynamic equilibrium", "le chatelier", "equilibrium constant", "kc", "kp", "haber", "contact process", "bronsted", "acid", "base", "conjugate", "ph", "strong acid", "weak acid"],
    "Reaction Kinetics (AS)": ["rate of reaction", "activation energy", "boltzmann", "catalyst", "collision", "effective collision"],
    "Chemical Periodicity": ["periodicity", "period 3", "atomic radius", "ionic radius", "melting point", "electrical conductivity", "oxides", "chlorides", "periodic trend"],
    "Group 2": ["group 2", "magnesium", "calcium", "strontium", "barium", "thermal decomposition", "carbonate", "nitrate", "solubility", "reaction with water"],
    "Group 17": ["group 17", "halogen", "chlorine", "bromine", "iodine", "displacement", "disproportionation", "halide", "silver nitrate", "volatility"],
    "Nitrogen & Sulfur": ["nitrogen", "ammonia", "haber", "sulfur", "sulfur dioxide", "acid rain", "environmental"],
    "Introduction to Organic Chemistry": ["functional group", "homologous series", "nomenclature", "structural isomer", "stereoisomer", "cis-trans", "e/z isomer", "chiral", "optical isomer", "enantiomer", "free radical", "electrophile", "nucleophile", "homolytic", "heterolytic", "addition", "substitution", "elimination"],
    "Hydrocarbons (AS)": ["alkane", "alkene", "combustion", "free-radical substitution", "electrophilic addition", "markovnikov", "addition polymerisation", "cracking", "hydrogenation", "bromine water"],
    "Halogen Compounds (AS)": ["halogenoalkane", "nucleophilic substitution", "hydrolysis", "elimination", "sn1", "sn2"],
    "Hydroxy Compounds (AS)": ["alcohol", "primary alcohol", "secondary alcohol", "tertiary alcohol", "oxidation", "esterification", "dehydration"],
    "Carbonyl Compounds (AS)": ["aldehyde", "ketone", "carbonyl", "nucleophilic addition", "2,4-dnp", "tollens", "fehling", "reduction"],
    "Carboxylic Acids & Derivatives (AS)": ["carboxylic acid", "ester", "acyl", "hydrolysis"],
    "Analytical Techniques (AS)": ["infra-red", "infrared spectroscopy", "mass spectrum", "fragmentation", "m/z"],
}

_CHEM_A2 = {
    "Chemical Energetics (A2)": ["lattice energy", "born-haber", "electron affinity", "enthalpy change of atomisation", "enthalpy change of hydration", "enthalpy change of solution", "entropy", "gibbs free energy", "free energy", "feasibility"],
    "Electrochemistry (A2)": ["standard electrode potential", "electrode potential", "cell potential", "electrochemical cell", "e cell", "nernst", "electrolysis", "faraday", "fuel cell"],
    "Equilibria (A2)": ["ka", "kb", "pka", "buffer", "solubility product", "ksp", "common ion", "partition coefficient", "acid-base titration", "indicator"],
    "Reaction Kinetics (A2)": ["rate equation", "order of reaction", "rate constant", "half-life", "rate-determining step", "initial rate", "reaction mechanism"],
    "Group 2 (A2)": ["group 2", "thermal stability", "solubility trend"],
    "Transition Elements": ["transition element", "d-block", "variable oxidation", "complex ion", "ligand", "co-ordination number", "ligand exchange", "colour", "stability constant", "catalysis"],
    "Nitrogen Compounds (A2)": ["amine", "amide", "amino acid", "primary amine", "diazonium", "azo", "zwitterion", "peptide", "protein"],
    "Hydrocarbons & Arenes": ["benzene", "arene", "delocalisation", "electrophilic substitution", "nitration", "friedel-crafts", "phenol"],
    "Carbonyl & Carboxylic (A2)": ["acyl chloride", "ester", "amide formation", "hydroxynitrile"],
    "Polymerisation (A2)": ["condensation polymerisation", "polyester", "polyamide", "repeat unit", "monomer", "hydrolysis of polymer"],
    "Organic Synthesis": ["synthetic route", "reaction pathway", "multistage synthesis", "functional group interconversion"],
    "Analytical Techniques (A2)": ["nmr", "nuclear magnetic resonance", "proton nmr", "carbon-13", "chemical shift", "tms", "chromatography", "rf value", "hplc", "gas chromatography"],
}

_BIO_AS = {
    "Cell Structure": ["microscope", "magnification", "resolution", "eukaryotic", "prokaryotic", "organelle", "nucleus", "mitochondria", "chloroplast", "endoplasmic reticulum", "golgi", "ribosome", "cell surface membrane", "ultrastructure"],
    "Biological Molecules": ["carbohydrate", "monosaccharide", "disaccharide", "polysaccharide", "glycosidic", "starch", "glycogen", "cellulose", "lipid", "triglyceride", "phospholipid", "protein", "amino acid", "peptide bond", "primary structure", "tertiary structure", "biuret", "benedict"],
    "Enzymes": ["enzyme", "active site", "substrate", "catalyst", "activation energy", "induced fit", "competitive inhibitor", "non-competitive", "denaturation", "immobilised enzyme"],
    "Cell Membranes & Transport": ["fluid mosaic", "phospholipid bilayer", "diffusion", "facilitated diffusion", "osmosis", "water potential", "active transport", "endocytosis", "exocytosis"],
    "Mitosis & Cell Cycle": ["mitosis", "cell cycle", "chromosome", "chromatid", "centromere", "interphase", "telomere", "stem cell"],
    "Nucleic Acids & Protein Synthesis": ["dna", "rna", "nucleotide", "double helix", "complementary base", "semi-conservative", "replication", "transcription", "translation", "codon", "messenger rna", "genetic code"],
    "Transport in Plants": ["xylem", "phloem", "transpiration", "translocation", "cohesion-tension", "root pressure", "source", "sink", "companion cell"],
    "Transport in Mammals": ["circulatory system", "artery", "vein", "capillary", "blood", "haemoglobin", "oxygen dissociation", "bohr shift", "tissue fluid", "cardiac cycle", "heart", "atrium", "ventricle"],
    "Gas Exchange": ["gas exchange", "alveoli", "trachea", "bronchiole", "surfactant", "diffusion gradient", "ventilation"],
    "Infectious Diseases": ["pathogen", "cholera", "malaria", "tuberculosis", "hiv", "aids", "transmission", "antibiotic", "antibiotic resistance"],
    "Immunity": ["immune response", "phagocyte", "phagocytosis", "lymphocyte", "b-lymphocyte", "t-lymphocyte", "antibody", "antigen", "vaccination", "immunity", "memory cell", "monoclonal antibody"],
}

_BIO_A2 = {
    "Energy & Respiration": ["respiration", "atp", "glycolysis", "link reaction", "krebs cycle", "oxidative phosphorylation", "electron transport", "mitochondrion", "anaerobic", "lactate", "respiratory quotient", "nad", "fad"],
    "Photosynthesis": ["photosynthesis", "light-dependent", "light-independent", "calvin cycle", "chlorophyll", "photophosphorylation", "rubisco", "gpp", "limiting factor", "photosystem", "thylakoid"],
    "Homeostasis": ["homeostasis", "negative feedback", "set point", "kidney", "nephron", "ultrafiltration", "selective reabsorption", "osmoregulation", "adh", "blood glucose", "insulin", "glucagon", "control of water"],
    "Control & Coordination": ["nervous", "neurone", "action potential", "resting potential", "depolarisation", "synapse", "neurotransmitter", "myelin", "hormone", "endocrine", "plant hormone", "auxin", "gibberellin"],
    "Inheritance": ["meiosis", "genotype", "phenotype", "allele", "dominant", "recessive", "codominant", "monohybrid", "dihybrid", "test cross", "linkage", "epistasis", "chi-squared", "sex linkage"],
    "Selection & Evolution": ["natural selection", "variation", "mutation", "allele frequency", "hardy-weinberg", "genetic drift", "founder effect", "speciation", "isolation", "evolution", "directional selection", "stabilising selection"],
    "Biodiversity & Conservation": ["biodiversity", "species", "ecosystem", "niche", "simpson's index", "classification", "taxonomy", "conservation", "endangered", "sustainable"],
    "Genetic Technology": ["genetic engineering", "recombinant dna", "plasmid", "restriction enzyme", "ligase", "vector", "pcr", "gel electrophoresis", "genetic marker", "gene therapy", "microarray", "genetically modified"],
}

# ─── Computer Science 9618 ────────────────────────────────────────────────────
_CS = {
    "1": {"title": "AS Theory", "topics": {
        "Data Representation": ["binary", "denary", "hexadecimal", "two's complement", "binary coded decimal", "bcd", "ascii", "unicode", "sign and magnitude", "overflow", "logical shift"],
        "Multimedia & Compression": ["bitmap", "vector graphic", "pixel", "resolution", "colour depth", "sample rate", "sample resolution", "sampling", "file size", "lossy", "lossless", "run-length encoding", "compression"],
        "Networks": ["network", "topology", "lan", "wan", "ip address", "mac address", "protocol", "packet", "packet switching", "router", "client-server", "peer-to-peer", "wifi", "bluetooth", "csma", "bit streaming", "fibre-optic", "copper"],
        "Hardware & Logic Gates": ["von neumann", "processor", "primary storage", "ram", "rom", "secondary storage", "hard disk", "solid state", "input device", "output device", "logic gate", "truth table", "and gate", "or gate", "nand", "nor", "xor", "boolean"],
        "Processor & Assembly": ["central processing unit", "arithmetic logic unit", "control unit", "register", "accumulator", "program counter", "memory address register", "fetch-execute", "bus", "interrupt", "assembly language", "opcode", "operand", "addressing mode", "immediate", "direct", "indirect", "indexed"],
        "System Software": ["operating system", "compiler", "interpreter", "assembler", "utility software", "device driver", "language translator", "linker", "loader"],
        "Security, Ethics & Databases": ["encryption", "malware", "phishing", "pharming", "firewall", "authentication", "sql injection", "data integrity", "validation", "verification", "checksum", "parity", "relational database", "primary key", "foreign key", "normalisation", "sql", "select", "entity"],
    }},
    "2": {"title": "AS Problem Solving", "topics": {
        "Algorithm Design & Problem Solving": ["computational thinking", "abstraction", "decomposition", "algorithm", "pseudocode", "flowchart", "trace table", "dry run", "structure chart", "stepwise refinement"],
        "Data Types & Structures": ["data type", "integer", "real", "boolean", "char", "string", "array", "one-dimensional", "two-dimensional", "record", "field"],
        "Programming & Constructs": ["variable", "constant", "assignment", "selection", "iteration", "for loop", "while", "repeat until", "count-controlled", "condition-controlled", "procedure", "function", "parameter", "by value", "by reference", "local variable", "global variable", "string manipulation"],
        "Software Development": ["program development", "waterfall", "iterative", "rapid application", "testing", "test data", "normal", "abnormal", "boundary", "alpha testing", "beta testing", "white-box", "black-box", "maintenance"],
    }},
    "3": {"title": "A2 Theory", "topics": {
        "Advanced Data Representation": ["floating-point", "mantissa", "exponent", "normalisation", "normalised", "precision", "user-defined data type", "record", "enumerated", "pointer", "set"],
        "File Organisation": ["serial file", "sequential file", "random file", "direct access", "hashing", "index", "file access"],
        "Communication & Networking": ["protocol", "tcp/ip", "osi", "http", "ftp", "circuit switching", "packet switching", "network layer"],
        "Hardware & Virtual Machines": ["risc", "cisc", "pipelining", "parallel processing", "sisd", "simd", "misd", "mimd", "massively parallel", "virtual machine", "boolean algebra", "de morgan", "karnaugh map", "half adder", "full adder", "flip-flop", "sr flip-flop", "jk flip-flop"],
        "System Software & Translation": ["scheduling", "round robin", "paging", "segmentation", "virtual memory", "interrupt handling", "lexical analysis", "syntax analysis", "code generation", "backus-naur", "bnf", "reverse polish", "syntax diagram"],
        "Security": ["asymmetric", "symmetric", "public key", "private key", "digital signature", "digital certificate", "ssl", "tls", "quantum cryptography"],
        "Artificial Intelligence": ["artificial intelligence", "machine learning", "deep learning", "neural network", "supervised", "unsupervised", "reinforcement", "back-propagation", "graph", "a* algorithm", "dijkstra", "heuristic"],
    }},
    "4": {"title": "A2 Practical", "topics": {
        "Computational Thinking & Algorithms": ["recursion", "recursive", "base case", "stack overflow", "binary search", "linear search", "insertion sort", "bubble sort", "big o", "abstract data type"],
        "Data Structures": ["linked list", "stack", "queue", "binary tree", "hash table", "pointer", "node", "traversal", "inorder", "preorder", "postorder", "enqueue", "dequeue", "push", "pop"],
        "Programming Paradigms & OOP": ["object-oriented", "class", "object", "attribute", "method", "constructor", "inheritance", "polymorphism", "encapsulation", "getter", "setter", "instance", "declarative", "low-level", "assembly"],
        "File Processing & Exception Handling": ["text file", "binary file", "serialisation", "exception", "exception handling", "try", "catch", "error handling"],
    }},
}

# ─── Mathematics 9709  (keyword coverage partial - LLM pass recommended) ──────
_MATHS = {
    "1": {"title": "Pure Mathematics 1", "topics": {
        "Quadratics": ["quadratic", "completing the square", "discriminant", "roots", "parabola"],
        "Functions": ["function", "domain", "range", "composite function", "inverse function", "one-one", "transformation of graph"],
        "Coordinate Geometry": ["coordinate", "gradient", "midpoint", "straight line", "perpendicular", "circle", "equation of circle", "tangent"],
        "Circular Measure": ["radian", "arc length", "sector", "area of sector"],
        "Trigonometry": ["trigonometry", "sine", "cosine", "tangent", "trigonometric", "identity", "amplitude", "period", "trigonometric equation"],
        "Series": ["arithmetic progression", "geometric progression", "common difference", "common ratio", "sum to infinity", "binomial expansion", "binomial"],
        "Differentiation": ["differentiate", "derivative", "gradient function", "chain rule", "stationary point", "maximum", "minimum", "increasing", "rate of change", "second derivative"],
        "Integration": ["integrate", "integration", "indefinite integral", "definite integral", "area under", "volume of revolution"],
    }},
    "3": {"title": "Pure Mathematics 3", "topics": {
        "Algebra": ["modulus", "polynomial", "remainder theorem", "factor theorem", "partial fractions"],
        "Logarithmic & Exponential": ["logarithm", "exponential", "natural logarithm", "ln", "e^x"],
        "Trigonometry (P3)": ["secant", "cosecant", "cotangent", "double angle", "r sin", "compound angle"],
        "Differentiation (P3)": ["product rule", "quotient rule", "implicit", "parametric", "differentiate"],
        "Integration (P3)": ["integration by parts", "integration by substitution", "trapezium rule", "partial fraction integration"],
        "Numerical Solution": ["iteration", "iterative", "root of equation", "numerical"],
        "Vectors": ["vector", "position vector", "scalar product", "dot product", "unit vector", "line in three dimensions"],
        "Differential Equations": ["differential equation", "separating variables", "general solution", "particular solution"],
        "Complex Numbers": ["complex number", "argand", "modulus-argument", "real part", "imaginary part", "conjugate", "loci"],
    }},
    "4": {"title": "Mechanics", "topics": {
        "Forces & Equilibrium": ["force", "equilibrium", "resultant", "resolve", "friction", "coefficient of friction", "normal contact", "inclined plane", "tension"],
        "Kinematics": ["velocity", "acceleration", "displacement-time", "velocity-time", "constant acceleration"],
        "Momentum": ["momentum", "impulse", "conservation of momentum", "collision"],
        "Newton's Laws": ["newton's second law", "connected particles", "pulley", "equation of motion"],
        "Energy, Work & Power": ["work done", "kinetic energy", "potential energy", "work-energy", "power"],
    }},
    "5": {"title": "Probability & Statistics 1", "topics": {
        "Representation of Data": ["histogram", "stem-and-leaf", "box-and-whisker", "median", "quartile", "mean", "standard deviation", "variance", "cumulative frequency"],
        "Permutations & Combinations": ["permutation", "combination", "arrangement", "factorial"],
        "Probability": ["probability", "mutually exclusive", "independent", "conditional probability", "tree diagram", "venn"],
        "Discrete Random Variables": ["discrete random variable", "probability distribution", "expectation", "expected value", "variance"],
        "Normal Distribution": ["normal distribution", "standardise", "z-value", "continuity correction", "binomial approximation"],
    }},
}

# ─── Further Mathematics 9231  (LLM pass strongly recommended) ────────────────
_FMATHS = {
    "1": {"title": "Further Pure Mathematics 1", "topics": {
        "Roots of Polynomial Equations": ["roots of polynomial", "sum of roots", "product of roots", "symmetric function"],
        "Rational Functions & Graphs": ["rational function", "asymptote", "oblique asymptote", "graph of rational"],
        "Summation of Series": ["summation", "method of differences", "standard result", "sigma"],
        "Matrices": ["matrix", "determinant", "inverse matrix", "transformation matrix", "eigenvalue", "eigenvector"],
        "Polar Coordinates": ["polar coordinate", "polar curve", "area of polar"],
        "Vectors (FP1)": ["vector product", "cross product", "plane", "line and plane", "scalar triple"],
        "Proof by Induction": ["proof by induction", "mathematical induction", "inductive step"],
    }},
    "2": {"title": "Further Pure Mathematics 2", "topics": {
        "Hyperbolic Functions": ["hyperbolic", "sinh", "cosh", "tanh", "inverse hyperbolic"],
        "Matrices (FP2)": ["diagonalisation", "characteristic equation", "cayley-hamilton"],
        "Differentiation (FP2)": ["maclaurin", "differentiate", "arc length", "surface of revolution"],
        "Integration (FP2)": ["reduction formula", "improper integral", "arc length integration"],
        "Complex Numbers (FP2)": ["de moivre", "nth root", "complex exponential", "argand"],
        "Differential Equations (FP2)": ["integrating factor", "second order", "complementary function", "particular integral"],
    }},
    "3": {"title": "Further Mechanics", "topics": {
        "Motion of a Projectile": ["projectile", "trajectory", "range", "greatest height"],
        "Equilibrium of a Rigid Body": ["rigid body", "centre of mass", "toppling", "sliding"],
        "Circular Motion": ["circular motion", "conical pendulum", "vertical circle", "banked"],
        "Hooke's Law": ["hooke's law", "elastic string", "spring", "elastic potential energy", "modulus of elasticity"],
        "Linear Motion under Variable Force": ["variable force", "simple harmonic motion", "s.h.m", "damped"],
        "Momentum (FM)": ["impulse", "restitution", "coefficient of restitution", "oblique impact"],
    }},
    "4": {"title": "Further Probability & Statistics", "topics": {
        "Continuous Random Variables": ["probability density function", "cumulative distribution function", "continuous random variable"],
        "Inference (t-distribution)": ["t-distribution", "confidence interval", "hypothesis test", "unbiased estimate"],
        "Chi-squared Tests": ["chi-squared", "goodness of fit", "contingency table"],
        "Non-parametric Tests": ["wilcoxon", "sign test", "rank test", "non-parametric"],
        "Probability Generating Functions": ["probability generating function", "generating function"],
    }},
}


SYLLABUS = {
    "9702": {
        "1": {"title": "AS Multiple Choice", "topics": _PHYSICS_AS},
        "2": {"title": "AS Structured", "topics": _PHYSICS_AS},
        "4": {"title": "A2 Structured", "topics": _PHYSICS_A2},
    },
    "9701": {
        "1": {"title": "AS Multiple Choice", "topics": _CHEM_AS},
        "2": {"title": "AS Structured", "topics": _CHEM_AS},
        "4": {"title": "A2 Structured", "topics": _CHEM_A2},
    },
    "9700": {
        "1": {"title": "AS Multiple Choice", "topics": _BIO_AS},
        "2": {"title": "AS Structured", "topics": _BIO_AS},
        "4": {"title": "A2 Structured", "topics": _BIO_A2},
    },
    "9618": _CS,
    "9709": _MATHS,
    "9231": _FMATHS,
}


if __name__ == "__main__":
    # quick self-report
    total_topics = total_kw = 0
    for subj, papers in SYLLABUS.items():
        for p, cfg in papers.items():
            n_top = len(cfg["topics"])
            n_kw = sum(len(v) for v in cfg["topics"].values())
            total_topics += n_top
            total_kw += n_kw
            print(f"{subj} P{p}: {n_top:2d} topics, {n_kw:3d} keywords  — {cfg['title']}")
    print(f"\nTOTAL: {total_topics} topics, {total_kw} keywords across "
          f"{sum(len(v) for v in SYLLABUS.values())} papers")
