import fitz  # PyMuPDF
import os
import re
import json

# Unified Source of Truth for 9618, 9702, and 9701
SYLLABUS = {
    "9618": {
        "1": {
            "title": "AS Level Theory",
            "topics": {
                "Data Representation": ["binary", "hexadecimal", "two's complement", "bcd", "binary coded decimal", "ascii", "unicode", "sampling", "sampling rate", "sampling resolution", "colour depth", "image resolution", "run-length encoding", "rle", "lossy", "lossless", "pixel", "bitmap", "vector graphic"],
                "Networking": ["topology", "packet", "router", "ip address", "mac address", "client-server", "peer-to-peer", "dns", "url", "tcp/ip", "ethernet", "csma/cd", "lan", "wan", "switch", "gateway", "bit streaming", "ipv4", "ipv6", "subnet", "public ip", "private ip", "copper cable", "fibre-optic"],
                "Hardware & Processors": ["von neumann", "alu", "control unit", "register", "program counter", "fetch-execute", "interrupt", "bus", "address bus", "data bus", "control bus", "usb", "hdmi", "vga", "ssd", "hdd", "ram", "rom", "cache", "solid state", "optical disk", "magnetic disk", "sensor", "actuator"],
                "Logic Gates": ["logic gate", "truth table", "boolean expression", "nand", "nor", "xor", "logic circuit", "and gate", "or gate", "not gate", "logic statement"],
                "Assembly Language": ["assembly", "opcode", "operand", "mnemonic", "addressing mode", "immediate addressing", "direct addressing", "indirect addressing", "indexed addressing", "ldd", "sto", "add", "inc", "cmp", "jmp", "ldx"],
                "System Software": ["operating system", "compiler", "interpreter", "assembler", "utility software", "disk formatter", "virus checker", "defragmentation", "backup software", "library program", "dll", "linker", "loader", "hardware driver"],
                "Security, Privacy & Ethics": ["encryption", "malware", "phishing", "firewall", "validation", "verification", "copyright", "open source", "shareware", "freeware", "commercial software", "data privacy", "data security", "authentication", "authorization", "password", "biometric", "spyware", "virus", "pharming", "parity check", "checksum", "echo check", "check digit"],
                "Databases": ["relational database", "primary key", "foreign key", "entity-relationship", "erd", "normalization", "1nf", "2nf", "3nf", "sql", "select", "ddl", "dml", "insert into", "update", "flat file", "compound key", "referential integrity", "data dictionary"]
            }
        },
        "2": {
            "title": "AS Problem Solving",
            "topics": {
                "Algorithm Design": ["pseudocode", "flowchart", "stepwise refinement", "trace table", "identifier", "assignment", "iteration", "selection", "structure chart", "sequence", "conditional statement", "loop", "while", "repeat until", "for loop"],
                "Data Structures": ["1d array", "2d array", "abstract data type", "record", "text file", "read file", "write file", "append file", "file handling", "index"],
                "Programming Concepts": ["procedure", "function", "by value", "by reference", "local variable", "global variable", "ide", "debugging", "syntax error", "logic error", "run-time error", "parameter", "return value", "constant", "variable scope"],
                "Software Development": ["software lifecycle", "waterfall", "agile", "black-box testing", "white-box testing", "stub", "dry run", "alpha testing", "beta testing", "acceptance testing", "integration testing", "iterative", "rapid application development", "rad"]
            }
        },
        "3": {
            "title": "A Level Advanced Theory",
            "topics": {
                "Advanced Data Representation": ["floating point", "mantissa", "exponent", "normalized form", "normalisation", "underflow", "overflow", "precision", "accuracy", "rounding", "truncation"],
                "Advanced Networking": ["osi model", "packet switching", "circuit switching", "cryptography", "digital signature", "digital certificate", "asymmetric encryption", "symmetric encryption", "public key", "private key", "quantum cryptography"],
                "Hardware & Virtual Machines": ["risc", "cisc", "pipelining", "multicore", "virtual machine", "boolean algebra", "karnaugh map", "k-map", "half adder", "full adder", "flip-flop", "sr flip-flop", "jk flip-flop", "sisd", "simd", "misd", "mimd", "cluster computing", "supercomputer", "de morgan"],
                "Advanced System Software": ["scheduling", "multiprogramming", "paging", "segmentation", "spooling", "lexical analysis", "syntax analysis", "code generation", "bnf", "rpn", "process scheduling", "round robin", "shortest job", "first come first served", "memory management", "virtual memory", "thrashing", "reverse polish notation", "syntax diagram", "optimization"],
                "Artificial Intelligence": ["artificial intelligence", "machine learning", "deep learning", "neural network", "a* algorithm", "heuristic", "dijkstra", "expert system", "knowledge base", "inference engine", "rule base", "reinforcement learning", "supervised learning", "unsupervised learning", "back-propagation"]
            }
        },
        "4": {
            "title": "A Level Practical",
            "topics": {
                "Algorithms & Recursion": ["recursion", "recursive", "base case", "binary search", "linear search", "insertion sort", "bubble sort", "winding", "unwinding", "general case", "call stack"],
                "OOP & Paradigms": ["object-oriented", "class", "object", "inheritance", "polymorphism", "encapsulation", "method", "constructor", "declarative programming", "instantiation", "getter", "setter", "private attribute", "public attribute", "facts", "rules", "goal", "backtracking", "prolog"],
                "Data Structures & Files": ["linked list", "stack", "queue", "binary tree", "hash table", "exception handling", "serial file", "sequential file", "random file", "node", "pointer", "null pointer", "root", "leaf", "inorder", "preorder", "postorder", "hashing", "collision", "synonym", "try", "catch", "push", "pop", "enqueue", "dequeue"]
            }
        }
    },
    "9702": {
        "1": {
            "title": "AS Level Theory (MCQ)",
            "topics": {
                "Physical Quantities & Units": ["base unit", "derived unit", "si unit", "scalar", "vector", "uncertainty", "absolute uncertainty", "percentage uncertainty", "systematic error", "random error", "homogeneity", "precision", "accuracy", "cathode-ray oscilloscope", "cro"],
                "Kinematics": ["displacement", "velocity", "acceleration", "kinematic equation", "projectile", "free fall", "speed-time graph", "displacement-time graph", "terminal velocity", "constant acceleration", "air resistance"],
                "Dynamics": ["newton's first law", "newton's second law", "newton's third law", "momentum", "rate of change of momentum", "impulse", "conservation of momentum", "elastic collision", "inelastic collision", "mass", "weight", "friction", "drag force"],
                "Forces, Density & Pressure": ["centre of gravity", "moment", "torque", "couple", "equilibrium", "coplanar forces", "density", "pressure", "hydrostatic pressure", "upthrust", "archimedes", "viscous drag"],
                "Work, Energy & Power": ["work done", "kinetic energy", "potential energy", "gravitational potential energy", "elastic potential energy", "efficiency", "conservation of energy", "power", "useful power", "driving force"],
                "Deformation of Solids": ["compressive", "tensile", "spring constant", "hooke's law", "stress", "strain", "young modulus", "elastic deformation", "plastic deformation", "elastic limit", "limit of proportionality", "strain energy"],
                "Waves & Superposition": ["progressive wave", "transverse wave", "longitudinal wave", "amplitude", "wavelength", "frequency", "period", "phase difference", "intensity", "doppler effect", "electromagnetic spectrum", "polarisation", "malus's law", "principle of superposition", "stationary wave", "standing wave", "node", "antinode", "diffraction", "interference", "coherence", "young's double-slit", "diffraction grating", "fringe width", "path difference", "fringe separation"],
                "Electricity & D.C. Circuits": ["electric current", "charge", "quantised", "coulomb", "drift velocity", "potential difference", "electromotive force", "e.m.f", "resistance", "ohm", "resistivity", "i-v characteristic", "ohm's law", "kirchhoff's first law", "kirchhoff's second law", "series circuit", "parallel circuit", "potential divider", "potentiometer", "internal resistance", "terminal p.d", "galvanometer"],
                "Particle Physics": ["alpha particle", "beta particle", "gamma radiation", "isotope", "nucleon", "hadron", "lepton", "quark", "antimatter", "positron", "beta decay", "neutrino", "weak interaction", "strong interaction", "flavour"]
            }
        },
        "2": {
            "title": "AS Level Structured",
            "topics": {
                "Physical Quantities & Units": ["base unit", "derived unit", "si unit", "scalar", "vector", "uncertainty", "absolute uncertainty", "percentage uncertainty", "systematic error", "random error", "homogeneity", "precision", "accuracy", "cathode-ray oscilloscope", "cro"],
                "Kinematics": ["displacement", "velocity", "acceleration", "kinematic equation", "projectile", "free fall", "speed-time graph", "displacement-time graph", "terminal velocity", "constant acceleration", "air resistance"],
                "Dynamics": ["newton's first law", "newton's second law", "newton's third law", "momentum", "rate of change of momentum", "impulse", "conservation of momentum", "elastic collision", "inelastic collision", "mass", "weight", "friction", "drag force"],
                "Forces, Density & Pressure": ["centre of gravity", "moment", "torque", "couple", "equilibrium", "coplanar forces", "density", "pressure", "hydrostatic pressure", "upthrust", "archimedes", "viscous drag"],
                "Work, Energy & Power": ["work done", "kinetic energy", "potential energy", "gravitational potential energy", "elastic potential energy", "efficiency", "conservation of energy", "power", "useful power", "driving force"],
                "Deformation of Solids": ["compressive", "tensile", "spring constant", "hooke's law", "stress", "strain", "young modulus", "elastic deformation", "plastic deformation", "elastic limit", "limit of proportionality", "strain energy"],
                "Waves & Superposition": ["progressive wave", "transverse wave", "longitudinal wave", "amplitude", "wavelength", "frequency", "period", "phase difference", "intensity", "doppler effect", "electromagnetic spectrum", "polarisation", "malus's law", "principle of superposition", "stationary wave", "standing wave", "node", "antinode", "diffraction", "interference", "coherence", "young's double-slit", "diffraction grating", "fringe width", "path difference", "fringe separation"],
                "Electricity & D.C. Circuits": ["electric current", "charge", "quantised", "coulomb", "drift velocity", "potential difference", "electromotive force", "e.m.f", "resistance", "ohm", "resistivity", "i-v characteristic", "ohm's law", "kirchhoff's first law", "kirchhoff's second law", "series circuit", "parallel circuit", "potential divider", "potentiometer", "internal resistance", "terminal p.d", "galvanometer"],
                "Particle Physics": ["alpha particle", "beta particle", "gamma radiation", "isotope", "nucleon", "hadron", "lepton", "quark", "antimatter", "positron", "beta decay", "neutrino", "weak interaction", "strong interaction", "flavour"]
            }
        },
        "4": {
            "title": "A Level Structured",
            "topics": {
                "Motion in a Circle & Gravitation": ["radian", "angular velocity", "angular displacement", "centripetal acceleration", "centripetal force", "uniform circular motion", "gravitational field strength", "newton's law of gravitation", "point mass", "gravitational potential", "escape velocity", "orbit", "geostationary", "kepler"],
                "Thermal Physics & Ideal Gases": ["thermal energy", "thermal equilibrium", "thermodynamic scale", "kelvin", "absolute zero", "specific heat capacity", "specific latent heat", "melting", "boiling", "evaporation", "ideal gas", "equation of state", "pv = nrt", "avogadro constant", "kinetic theory", "brownian motion", "root-mean-square", "mean square speed", "boltzmann constant", "first law of thermodynamics", "internal energy", "isothermal", "adiabatic"],
                "Oscillations": ["simple harmonic motion", "s.h.m", "angular frequency", "restoring force", "damping", "resonance", "natural frequency", "forced oscillation", "amplitude-frequency graph"],
                "Electric & Magnetic Fields": ["electric field strength", "uniform electric field", "coulomb's law", "electric potential", "permittivity", "point charge", "equipotential", "magnetic flux density", "tesla", "hall effect", "hall voltage", "fleming's left-hand", "force on a moving charge", "velocity selector", "electromagnetic induction", "magnetic flux", "weber", "faraday's law", "lenz's law"],
                "Capacitance & Alternating Current": ["capacitance", "farad", "capacitor", "dielectric", "series and parallel capacitors", "time constant", "exponential discharge", "alternating current", "a.c.", "peak current", "r.m.s", "rectification", "half-wave", "full-wave", "smoothing", "transformer"],
                "Quantum & Nuclear Physics": ["photon", "planck constant", "particulate nature", "photoelectric effect", "work function", "threshold frequency", "stopping potential", "de broglie", "wave-particle duality", "energy level", "emission spectrum", "absorption spectrum", "band theory", "mass defect", "mass excess", "binding energy", "atomic mass unit", "nuclear fission", "nuclear fusion", "radioactive decay", "decay constant", "half-life", "activity", "becquerel"],
                "Medical Physics & Cosmology": ["ultrasound", "piezoelectric", "acoustic impedance", "intensity reflection coefficient", "attenuation", "x-ray", "radiograph", "contrast media", "ct scan", "positron emission tomography", "pet scan", "annihilation", "tracer", "luminosity", "radiant flux", "standard candle", "wien's displacement law", "stefan-boltzmann", "hubble's law", "redshift", "big bang", "expanding universe"]
            }
        }
    },
    "9701": {
        "1": {
            "title": "AS Level Theory (MCQ)",
            "topics": {
                "Physical: Atoms, Bonding & Stoichiometry": ["isotope", "nucleon", "stoichiometry", "empirical formula", "molecular formula", "avogadro", "ionic bond", "covalent bond", "metallic bond", "intermolecular force", "van der waals", "hydrogen bond", "dipole", "electronegativity", "dot-and-cross", "sp3", "sp2", "ideal gas", "pv=nrt", "lattice"],
                "Physical: Energetics & Kinetics": ["enthalpy", "exothermic", "endothermic", "activation energy", "hess's law", "bond energy", "calorimetry", "rate of reaction", "collision theory", "catalyst", "boltzmann distribution"],
                "Physical: Equilibria & Electrochemistry": ["reversible reaction", "dynamic equilibrium", "le chatelier", "kc", "kp", "haber process", "contact process", "bronsted-lowry", "weak acid", "weak base", "oxidation number", "redox", "half-equation", "electrolysis"],
                "Inorganic: Periodicity & Groups 2/17": ["periodicity", "atomic radius", "ionization energy", "melting point", "electrical conductivity", "magnesium", "calcium", "barium", "strontium", "thermal decomposition", "halogen", "chlorine", "bromine", "iodine", "displacement reaction", "disproportionation", "nitrogen", "sulfur", "ammonia"],
                "Organic: Intro & Hydrocarbons": ["alkane", "alkene", "functional group", "homologous series", "isomerism", "stereoisomerism", "chiral", "optical isomer", "free-radical substitution", "electrophilic addition", "markovnikov", "cracking", "carbocation", "inductive effect"],
                "Organic: Halogens, Hydroxy & Carbonyls": ["halogenoalkane", "nucleophilic substitution", "sn1", "sn2", "elimination reaction", "alcohol", "primary alcohol", "secondary alcohol", "tertiary alcohol", "oxidation of alcohol", "aldehyde", "ketone", "nucleophilic addition", "tollens", "fehling", "2,4-dnp", "iodoform"],
                "Organic: Carboxylic, Nitrogen & Polymers": ["carboxylic acid", "ester", "esterification", "hydrolysis", "primary amine", "nitrile", "addition polymerisation", "polyalkene", "repeat unit", "monomer"]
            }
        },
        "2": {
            "title": "AS Level Structured",
            "topics": {
                "Physical: Atoms, Bonding & Stoichiometry": ["isotope", "nucleon", "stoichiometry", "empirical formula", "molecular formula", "avogadro", "ionic bond", "covalent bond", "metallic bond", "intermolecular force", "van der waals", "hydrogen bond", "dipole", "electronegativity", "dot-and-cross", "sp3", "sp2", "ideal gas", "pv=nrt", "lattice"],
                "Physical: Energetics & Kinetics": ["enthalpy", "exothermic", "endothermic", "activation energy", "hess's law", "bond energy", "calorimetry", "rate of reaction", "collision theory", "catalyst", "boltzmann distribution"],
                "Physical: Equilibria & Electrochemistry": ["reversible reaction", "dynamic equilibrium", "le chatelier", "kc", "kp", "haber process", "contact process", "bronsted-lowry", "weak acid", "weak base", "oxidation number", "redox", "half-equation", "electrolysis"],
                "Inorganic: Periodicity & Groups 2/17": ["periodicity", "atomic radius", "ionization energy", "melting point", "electrical conductivity", "magnesium", "calcium", "barium", "strontium", "thermal decomposition", "halogen", "chlorine", "bromine", "iodine", "displacement reaction", "disproportionation", "nitrogen", "sulfur", "ammonia"],
                "Organic: Intro & Hydrocarbons": ["alkane", "alkene", "functional group", "homologous series", "isomerism", "stereoisomerism", "chiral", "optical isomer", "free-radical substitution", "electrophilic addition", "markovnikov", "cracking", "carbocation", "inductive effect"],
                "Organic: Halogens, Hydroxy & Carbonyls": ["halogenoalkane", "nucleophilic substitution", "sn1", "sn2", "elimination reaction", "alcohol", "primary alcohol", "secondary alcohol", "tertiary alcohol", "oxidation of alcohol", "aldehyde", "ketone", "nucleophilic addition", "tollens", "fehling", "2,4-dnp", "iodoform"],
                "Organic: Carboxylic, Nitrogen & Polymers": ["carboxylic acid", "ester", "esterification", "hydrolysis", "primary amine", "nitrile", "addition polymerisation", "polyalkene", "repeat unit", "monomer"]
            }
        },
        "4": {
            "title": "A Level Structured",
            "topics": {
                "Further Physical: Thermodynamics & Kinetics": ["born-haber", "lattice energy", "electron affinity", "enthalpy change of hydration", "enthalpy change of solution", "entropy", "gibbs free energy", "delta g", "spontaneous", "rate equation", "order of reaction", "rate constant", "half-life", "rate-determining step"],
                "Further Physical: Equilibria & Electrochemistry": ["partition coefficient", "kpc", "acid dissociation constant", "ka", "pka", "ph", "buffer solution", "solubility product", "ksp", "common ion effect", "standard electrode potential", "standard cell potential", "nernst equation", "faraday constant", "q=it", "f=le"],
                "Further Inorganic: Transition Elements": ["transition element", "variable oxidation state", "complex ion", "ligand", "dative bond", "coordination number", "geometry", "degenerate", "splitting", "colour", "visible spectrum", "d-d transition", "stability constant", "kstab"],
                "Further Organic: Arenes & Derivatives": ["arene", "benzene", "delocalised", "electrophilic substitution", "friedel-crafts", "phenol", "acidity of phenol", "directing effect", "halogenoarene", "acyl chloride"],
                "Further Organic: Nitrogen Compounds & Polymers": ["amine", "basicity", "phenylamine", "diazotisation", "azo dye", "amide", "polyamide", "polyester", "amino acid", "zwitterion", "peptide bond", "protein", "isoelectric point", "condensation polymerisation", "degradable polymer"],
                "Analytical Techniques (NMR & Chromatography)": ["chromatography", "retention time", "rf value", "nuclear magnetic resonance", "nmr", "chemical shift", "splitting pattern", "spin-spin coupling", "doublet", "triplet", "quartet", "integration", "d2o exchange", "mass spectrometry", "m+ peak", "m+1 peak", "m+2 peak"]
            }
        }
    }
}

PAPERS_DIR = "./public/papers"
OUTPUT_JSON = "./public/topicals_db.json"

def build_topical_database():
    database = {}
    for subj_code, subj_data in SYLLABUS.items():
        database[subj_code] = {}
        for p_num, p_data in subj_data.items():
            database[subj_code][p_num] = {
                "title": p_data["title"],
                "topics": {t: [] for t in p_data["topics"].keys()}
            }

    print("Starting STRICT CAIE PDF analysis...\n")

    if not os.path.exists(PAPERS_DIR):
        print(f"Error: Could not find directory {PAPERS_DIR}")
        return

    question_pattern = re.compile(r'(?m)^\s*([1-9][0-9]*)(?:\s|\n|\()')

    for filename in os.listdir(PAPERS_DIR):
        if not filename.endswith(".pdf") or "_qp_" not in filename:
            continue

        filepath = os.path.join(PAPERS_DIR, filename)
        parts = filename.replace(".pdf", "").split("_")

        if len(parts) < 4: continue

        subject_code = parts[0]
        season_year = parts[1]
        paper_variant = parts[3]
        paper_num = paper_variant[0]

        if subject_code not in SYLLABUS or paper_num not in SYLLABUS[subject_code]:
            continue

        keywords_map = SYLLABUS[subject_code][paper_num]["topics"]

        try:
            doc = fitz.open(filepath)
        except Exception as e:
            print(f"Failed to read {filename}: {e}")
            continue

        questions_found = 0

        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text("text").lower()

            matches = question_pattern.findall(text)

            if not matches:
                continue

            for topic, keywords in keywords_map.items():
                if any(kw in text for kw in keywords):
                    page_entry = {
                        "paper_id": filename,
                        "season_year": season_year,
                        "variant": paper_variant,
                        "page_number": page_num + 1,
                        "questions": list(set(matches))
                    }

                    if page_entry not in database[subject_code][paper_num]["topics"][topic]:
                        database[subject_code][paper_num]["topics"][topic].append(page_entry)
                        questions_found += len(set(matches))

        doc.close()
        print(f"Processed: {filename} ({subject_code} Paper {paper_num}) - Found {questions_found} questions.")

    # Clean out any empty topics
    for subj_code in list(database.keys()):
        for p_num in list(database[subj_code].keys()):
            topics = database[subj_code][p_num]["topics"]
            database[subj_code][p_num]["topics"] = {k: v for k, v in topics.items() if len(v) > 0}

    with open(OUTPUT_JSON, "w") as f:
        json.dump(database, f, indent=2)

    print(f"\nSuccess! Optimized multi-subject database saved to {OUTPUT_JSON}")

if __name__ == "__main__":
    build_topical_database()