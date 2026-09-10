/* Formula definitions: symbolic templates, no numeric evaluation. */
(function(root){
  const catalog = {
  "FORMULAS": {
    "circleArea": {
      "name": "Cirklens areal",
      "group": "Geometri",
      "symbol": "A",
      "dimension": "area",
      "equation": "A = (π / 4) · D²",
      "args": {
        "D": {
          "symbol": "D",
          "label": "Diameter",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        [
          "div",
          "π",
          "4"
        ],
        [
          "pow",
          "D",
          "2"
        ]
      ],
      "note": ""
    },
    "cylinderVolume": {
      "name": "Cylinderens rumfang",
      "group": "Geometri",
      "symbol": "V",
      "dimension": "volume",
      "equation": "V = (π / 4) · D² · h",
      "args": {
        "D": {
          "symbol": "D",
          "label": "Diameter",
          "dimension": "length"
        },
        "h": {
          "symbol": "h",
          "label": "Højde",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        [
          "div",
          "π",
          "4"
        ],
        [
          "pow",
          "D",
          "2"
        ],
        "h"
      ],
      "note": ""
    },
    "coneVolume": {
      "name": "Keglens rumfang",
      "group": "Geometri",
      "symbol": "V",
      "dimension": "volume",
      "equation": "V = (1 / 3) · (π / 4) · D² · h",
      "args": {
        "D": {
          "symbol": "D",
          "label": "Diameter",
          "dimension": "length"
        },
        "h": {
          "symbol": "h",
          "label": "Højde",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        [
          "div",
          "1",
          "3"
        ],
        [
          "div",
          "π",
          "4"
        ],
        [
          "pow",
          "D",
          "2"
        ],
        "h"
      ],
      "note": ""
    },
    "frustumVolume": {
      "name": "Keglestubbens rumfang",
      "group": "Geometri",
      "symbol": "V",
      "dimension": "volume",
      "equation": "V = (π · h / 12) · (D² + D · d + d²)",
      "args": {
        "D": {
          "symbol": "D",
          "label": "Stor diameter",
          "dimension": "length"
        },
        "d": {
          "symbol": "d",
          "label": "Lille diameter",
          "dimension": "length"
        },
        "h": {
          "symbol": "h",
          "label": "Højde",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        [
          "div",
          [
            "mul",
            "π",
            "h"
          ],
          "12"
        ],
        [
          "group",
          [
            "add",
            [
              "pow",
              "D",
              "2"
            ],
            [
              "mul",
              "D",
              "d"
            ],
            [
              "pow",
              "d",
              "2"
            ]
          ]
        ]
      ],
      "note": ""
    },
    "boxVolume": {
      "name": "Kassens rumfang",
      "group": "Geometri",
      "symbol": "V",
      "dimension": "volume",
      "equation": "V = L · B · h",
      "args": {
        "L": {
          "symbol": "L",
          "label": "Længde",
          "dimension": "length"
        },
        "B": {
          "symbol": "B",
          "label": "Bredde",
          "dimension": "length"
        },
        "h": {
          "symbol": "h",
          "label": "Højde",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        "L",
        "B",
        "h"
      ],
      "note": ""
    },
    "sphereVolume": {
      "name": "Kuglens rumfang",
      "group": "Geometri",
      "symbol": "V",
      "dimension": "volume",
      "equation": "V = (π / 6) · D³",
      "args": {
        "D": {
          "symbol": "D",
          "label": "Diameter",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        [
          "div",
          "π",
          "6"
        ],
        [
          "pow",
          "D",
          "3"
        ]
      ],
      "note": ""
    },
    "volumeSum": {
      "name": "Sum af rumfang",
      "group": "Geometri",
      "symbol": "V",
      "dimension": "volume",
      "equation": "V = V₁ + V₂",
      "args": {
        "V1": {
          "symbol": "V_1",
          "label": "Første rumfang",
          "dimension": "volume"
        },
        "V2": {
          "symbol": "V_2",
          "label": "Andet rumfang",
          "dimension": "volume"
        }
      },
      "template": [
        "add",
        "V1",
        "V2"
      ],
      "note": "For dele, som ikke overlapper. Indsæt endnu en sum for at tilføje flere dele."
    },
    "volumeDifference": {
      "name": "Forskel i rumfang",
      "group": "Geometri",
      "symbol": "ΔV",
      "dimension": "volume",
      "equation": "ΔV = Vslut − Vstart",
      "args": {
        "end": {
          "symbol": "V_slut",
          "label": "Slutvolumen",
          "dimension": "volume"
        },
        "start": {
          "symbol": "V_start",
          "label": "Startvolumen",
          "dimension": "volume"
        }
      },
      "template": [
        "sub",
        "end",
        "start"
      ],
      "note": ""
    },
    "cylinderMantle": {
      "name": "Cylinderens kappe",
      "group": "Overflade",
      "symbol": "A",
      "dimension": "area",
      "equation": "A = π · D · h",
      "args": {
        "D": {
          "symbol": "D",
          "label": "Diameter",
          "dimension": "length"
        },
        "h": {
          "symbol": "h",
          "label": "Højde",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        "π",
        "D",
        "h"
      ],
      "note": "Kun siden; uden top og bund."
    },
    "cylinderOpen": {
      "name": "Cylinder med bund",
      "group": "Overflade",
      "symbol": "A",
      "dimension": "area",
      "equation": "A = π · D · h + (π / 4) · D²",
      "args": {
        "D": {
          "symbol": "D",
          "label": "Diameter",
          "dimension": "length"
        },
        "h": {
          "symbol": "h",
          "label": "Højde",
          "dimension": "length"
        }
      },
      "template": [
        "add",
        [
          "mul",
          "π",
          "D",
          "h"
        ],
        [
          "mul",
          [
            "div",
            "π",
            "4"
          ],
          [
            "pow",
            "D",
            "2"
          ]
        ]
      ],
      "note": "Åben top, én plan bund."
    },
    "cylinderClosed": {
      "name": "Lukket cylinder",
      "group": "Overflade",
      "symbol": "A",
      "dimension": "area",
      "equation": "A = π · D · h + (π / 2) · D²",
      "args": {
        "D": {
          "symbol": "D",
          "label": "Diameter",
          "dimension": "length"
        },
        "h": {
          "symbol": "h",
          "label": "Højde",
          "dimension": "length"
        }
      },
      "template": [
        "add",
        [
          "mul",
          "π",
          "D",
          "h"
        ],
        [
          "mul",
          [
            "div",
            "π",
            "2"
          ],
          [
            "pow",
            "D",
            "2"
          ]
        ]
      ],
      "note": "Side, top og bund."
    },
    "coneMantle": {
      "name": "Keglens kappe",
      "group": "Overflade",
      "symbol": "A",
      "dimension": "area",
      "equation": "A = (π · D / 2) · √((D / 2)² + h²)",
      "args": {
        "D": {
          "symbol": "D",
          "label": "Diameter",
          "dimension": "length"
        },
        "h": {
          "symbol": "h",
          "label": "Højde",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        [
          "div",
          [
            "mul",
            "π",
            "D"
          ],
          "2"
        ],
        [
          "sqrt",
          [
            "add",
            [
              "pow",
              [
                "div",
                "D",
                "2"
              ],
              "2"
            ],
            [
              "pow",
              "h",
              "2"
            ]
          ]
        ]
      ],
      "note": "Uden den cirkelformede endeflade."
    },
    "coneClosed": {
      "name": "Kegle med endeflade",
      "group": "Overflade",
      "symbol": "A",
      "dimension": "area",
      "equation": "A = (π · D / 2) · √((D / 2)² + h²) + (π / 4) · D²",
      "args": {
        "D": {
          "symbol": "D",
          "label": "Diameter",
          "dimension": "length"
        },
        "h": {
          "symbol": "h",
          "label": "Højde",
          "dimension": "length"
        }
      },
      "template": [
        "add",
        [
          "mul",
          [
            "div",
            [
              "mul",
              "π",
              "D"
            ],
            "2"
          ],
          [
            "sqrt",
            [
              "add",
              [
                "pow",
                [
                  "div",
                  "D",
                  "2"
                ],
                "2"
              ],
              [
                "pow",
                "h",
                "2"
              ]
            ]
          ]
        ],
        [
          "mul",
          [
            "div",
            "π",
            "4"
          ],
          [
            "pow",
            "D",
            "2"
          ]
        ]
      ],
      "note": ""
    },
    "frustumMantle": {
      "name": "Keglestubbens kappe",
      "group": "Overflade",
      "symbol": "A",
      "dimension": "area",
      "equation": "A = (π / 2) · (D + d) · √(h² + ((D − d) / 2)²)",
      "args": {
        "D": {
          "symbol": "D",
          "label": "Stor diameter",
          "dimension": "length"
        },
        "d": {
          "symbol": "d",
          "label": "Lille diameter",
          "dimension": "length"
        },
        "h": {
          "symbol": "h",
          "label": "Højde",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        [
          "div",
          "π",
          "2"
        ],
        [
          "group",
          [
            "add",
            "D",
            "d"
          ]
        ],
        [
          "sqrt",
          [
            "add",
            [
              "pow",
              "h",
              "2"
            ],
            [
              "pow",
              [
                "div",
                [
                  "sub",
                  "D",
                  "d"
                ],
                "2"
              ],
              "2"
            ]
          ]
        ]
      ],
      "note": "Uden endeflader."
    },
    "boxOpen": {
      "name": "Åben kasses overflade",
      "group": "Overflade",
      "symbol": "A",
      "dimension": "area",
      "equation": "A = L · B + 2 · L · h + 2 · B · h",
      "args": {
        "L": {
          "symbol": "L",
          "label": "Længde",
          "dimension": "length"
        },
        "B": {
          "symbol": "B",
          "label": "Bredde",
          "dimension": "length"
        },
        "h": {
          "symbol": "h",
          "label": "Højde",
          "dimension": "length"
        }
      },
      "template": [
        "add",
        [
          "mul",
          "L",
          "B"
        ],
        [
          "mul",
          "2",
          "L",
          "h"
        ],
        [
          "mul",
          "2",
          "B",
          "h"
        ]
      ],
      "note": "Fire sider og bund; uden top."
    },
    "boxClosed": {
      "name": "Lukket kasses overflade",
      "group": "Overflade",
      "symbol": "A",
      "dimension": "area",
      "equation": "A = 2 · (L · B + L · h + B · h)",
      "args": {
        "L": {
          "symbol": "L",
          "label": "Længde",
          "dimension": "length"
        },
        "B": {
          "symbol": "B",
          "label": "Bredde",
          "dimension": "length"
        },
        "h": {
          "symbol": "h",
          "label": "Højde",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        "2",
        [
          "group",
          [
            "add",
            [
              "mul",
              "L",
              "B"
            ],
            [
              "mul",
              "L",
              "h"
            ],
            [
              "mul",
              "B",
              "h"
            ]
          ]
        ]
      ],
      "note": ""
    },
    "sphereArea": {
      "name": "Kuglens overflade",
      "group": "Overflade",
      "symbol": "A",
      "dimension": "area",
      "equation": "A = π · D²",
      "args": {
        "D": {
          "symbol": "D",
          "label": "Diameter",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        "π",
        [
          "pow",
          "D",
          "2"
        ]
      ],
      "note": ""
    },
    "areaSum": {
      "name": "Sum af arealer",
      "group": "Overflade",
      "symbol": "A",
      "dimension": "area",
      "equation": "A = A₁ + A₂",
      "args": {
        "A1": {
          "symbol": "A_1",
          "label": "Første areal",
          "dimension": "area"
        },
        "A2": {
          "symbol": "A_2",
          "label": "Andet areal",
          "dimension": "area"
        }
      },
      "template": [
        "add",
        "A1",
        "A2"
      ],
      "note": "Vælg kun de synlige flader. Fælles endeflader skal ikke tælles med."
    },
    "flow": {
      "name": "Volumenflow fra hastighed",
      "group": "Flow og tid",
      "symbol": "Q_v",
      "dimension": "flow",
      "equation": "Qᵥ = A · v",
      "args": {
        "A": {
          "symbol": "A",
          "label": "Tværsnitsareal",
          "dimension": "area"
        },
        "v": {
          "symbol": "v",
          "label": "Middelhastighed",
          "dimension": "velocity"
        }
      },
      "template": [
        "mul",
        "A",
        "v"
      ],
      "note": "Gælder med middelhastigheden gennem tværsnittet."
    },
    "flowFromVolume": {
      "name": "Volumenflow fra måling",
      "group": "Flow og tid",
      "symbol": "Q_v",
      "dimension": "flow",
      "equation": "Qᵥ = V / t",
      "args": {
        "V": {
          "symbol": "V",
          "label": "Målt volumen",
          "dimension": "volume"
        },
        "t": {
          "symbol": "t",
          "label": "Målt tid",
          "dimension": "time"
        }
      },
      "template": [
        "div",
        "V",
        "t"
      ],
      "note": ""
    },
    "fillTime": {
      "name": "Fyldetid",
      "group": "Flow og tid",
      "symbol": "t",
      "dimension": "time",
      "equation": "t = V / Qᵥ",
      "args": {
        "V": {
          "symbol": "V",
          "label": "Volumen, der skal fyldes",
          "dimension": "volume"
        },
        "Q": {
          "symbol": "Q_v",
          "label": "Netto volumenflow ind",
          "dimension": "flow"
        }
      },
      "template": [
        "div",
        "V",
        "Q"
      ],
      "note": "Konstant positivt nettoflow. Brug restvolumen, hvis beholderen allerede indeholder væske."
    },
    "flowDifference": {
      "name": "Netto volumenflow",
      "group": "Flow og tid",
      "symbol": "Q_v",
      "dimension": "flow",
      "equation": "Qᵥ = Qind − Qud",
      "args": {
        "inflow": {
          "symbol": "Q_ind",
          "label": "Indløb",
          "dimension": "flow"
        },
        "outflow": {
          "symbol": "Q_ud",
          "label": "Udløb",
          "dimension": "flow"
        }
      },
      "template": [
        "sub",
        "inflow",
        "outflow"
      ],
      "note": "Ved fyldning skal indløbet overstige udløbet."
    },
    "velocity": {
      "name": "Hastighed fra flow",
      "group": "Flow og tid",
      "symbol": "v",
      "dimension": "velocity",
      "equation": "v = Qᵥ / A",
      "args": {
        "Q": {
          "symbol": "Q_v",
          "label": "Volumenflow",
          "dimension": "flow"
        },
        "A": {
          "symbol": "A",
          "label": "Tværsnitsareal",
          "dimension": "area"
        }
      },
      "template": [
        "div",
        "Q",
        "A"
      ],
      "note": ""
    },
    "speed": {
      "name": "Hastighed fra strækning",
      "group": "Flow og tid",
      "symbol": "v",
      "dimension": "velocity",
      "equation": "v = s / t",
      "args": {
        "s": {
          "symbol": "s",
          "label": "Strækning",
          "dimension": "length"
        },
        "t": {
          "symbol": "t",
          "label": "Tid",
          "dimension": "time"
        }
      },
      "template": [
        "div",
        "s",
        "t"
      ],
      "note": ""
    },
    "filledVolume": {
      "name": "Volumen fra flow og tid",
      "group": "Flow og tid",
      "symbol": "V",
      "dimension": "volume",
      "equation": "V = Qᵥ · t",
      "args": {
        "Q": {
          "symbol": "Q_v",
          "label": "Volumenflow",
          "dimension": "flow"
        },
        "t": {
          "symbol": "t",
          "label": "Tid",
          "dimension": "time"
        }
      },
      "template": [
        "mul",
        "Q",
        "t"
      ],
      "note": "Konstant volumenflow."
    },
    "mass": {
      "name": "Masse",
      "group": "Masse, tryk og effekt",
      "symbol": "m",
      "dimension": "mass",
      "equation": "m = ρ · V",
      "args": {
        "rho": {
          "symbol": "ρ",
          "label": "Densitet",
          "dimension": "density"
        },
        "V": {
          "symbol": "V",
          "label": "Rumfang",
          "dimension": "volume"
        }
      },
      "template": [
        "mul",
        "rho",
        "V"
      ],
      "note": ""
    },
    "density": {
      "name": "Densitet",
      "group": "Masse, tryk og effekt",
      "symbol": "ρ",
      "dimension": "density",
      "equation": "ρ = m / V",
      "args": {
        "m": {
          "symbol": "m",
          "label": "Masse",
          "dimension": "mass"
        },
        "V": {
          "symbol": "V",
          "label": "Rumfang",
          "dimension": "volume"
        }
      },
      "template": [
        "div",
        "m",
        "V"
      ],
      "note": ""
    },
    "massFlow": {
      "name": "Masseflow",
      "group": "Masse, tryk og effekt",
      "symbol": "Q_m",
      "dimension": "massFlow",
      "equation": "Qₘ = ρ · Qᵥ",
      "args": {
        "rho": {
          "symbol": "ρ",
          "label": "Densitet",
          "dimension": "density"
        },
        "Q": {
          "symbol": "Q_v",
          "label": "Volumenflow",
          "dimension": "flow"
        }
      },
      "template": [
        "mul",
        "rho",
        "Q"
      ],
      "note": ""
    },
    "hydrostatic": {
      "name": "Hydrostatisk overtryk",
      "group": "Masse, tryk og effekt",
      "symbol": "p",
      "dimension": "pressure",
      "equation": "p = ρ · g · h",
      "args": {
        "rho": {
          "symbol": "ρ",
          "label": "Densitet",
          "dimension": "density"
        },
        "g": {
          "symbol": "g",
          "label": "Tyngdeacceleration",
          "dimension": "acceleration"
        },
        "h": {
          "symbol": "h",
          "label": "Væskehøjde",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        "rho",
        "g",
        "h"
      ],
      "note": "Væskens overtryk i forhold til trykket over væskeoverfladen."
    },
    "pressure": {
      "name": "Tryk fra kraft",
      "group": "Masse, tryk og effekt",
      "symbol": "p",
      "dimension": "pressure",
      "equation": "p = F / A",
      "args": {
        "F": {
          "symbol": "F",
          "label": "Kraft",
          "dimension": "force"
        },
        "A": {
          "symbol": "A",
          "label": "Areal",
          "dimension": "area"
        }
      },
      "template": [
        "div",
        "F",
        "A"
      ],
      "note": ""
    },
    "force": {
      "name": "Kraft fra tryk",
      "group": "Masse, tryk og effekt",
      "symbol": "F",
      "dimension": "force",
      "equation": "F = p · A",
      "args": {
        "p": {
          "symbol": "p",
          "label": "Trykforskel",
          "dimension": "pressure"
        },
        "A": {
          "symbol": "A",
          "label": "Areal",
          "dimension": "area"
        }
      },
      "template": [
        "mul",
        "p",
        "A"
      ],
      "note": ""
    },
    "hydraulicPower": {
      "name": "Hydraulisk effekt",
      "group": "Masse, tryk og effekt",
      "symbol": "P",
      "dimension": "power",
      "equation": "P = Δp · Qᵥ",
      "args": {
        "p": {
          "symbol": "Δp",
          "label": "Trykstigning",
          "dimension": "pressure"
        },
        "Q": {
          "symbol": "Q_v",
          "label": "Volumenflow",
          "dimension": "flow"
        }
      },
      "template": [
        "mul",
        "p",
        "Q"
      ],
      "note": ""
    },
    "pumpPower": {
      "name": "Tilført pumpeeffekt",
      "group": "Masse, tryk og effekt",
      "symbol": "P",
      "dimension": "power",
      "equation": "P = ρ · g · Qᵥ · H / η",
      "args": {
        "rho": {
          "symbol": "ρ",
          "label": "Densitet",
          "dimension": "density"
        },
        "g": {
          "symbol": "g",
          "label": "Tyngdeacceleration",
          "dimension": "acceleration"
        },
        "Q": {
          "symbol": "Q_v",
          "label": "Volumenflow",
          "dimension": "flow"
        },
        "H": {
          "symbol": "H",
          "label": "Løftehøjde",
          "dimension": "length"
        },
        "eta": {
          "symbol": "η",
          "label": "Virkningsgrad",
          "dimension": "scalar"
        }
      },
      "template": [
        "div",
        [
          "mul",
          "rho",
          "g",
          "Q",
          "H"
        ],
        "eta"
      ],
      "note": "H er den samlede løftehøjde. η er virkningsgraden som decimaltal. g er tyngdeaccelerationen. Brug SI-enheder."
    },
    "diameter": {
      "name": "Diameter fra radius",
      "group": "Geometri",
      "symbol": "D",
      "dimension": "length",
      "equation": "D = 2 · r",
      "args": {
        "r": {
          "symbol": "r",
          "label": "Radius",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        "2",
        "r"
      ],
      "note": ""
    },
    "rectangleArea": {
      "name": "Rektanglets areal",
      "group": "Geometri",
      "symbol": "A",
      "dimension": "area",
      "equation": "A = L · B",
      "args": {
        "L": {
          "symbol": "L",
          "label": "Længde",
          "dimension": "length"
        },
        "B": {
          "symbol": "B",
          "label": "Bredde",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        "L",
        "B"
      ],
      "note": ""
    },
    "hemisphereVolume": {
      "name": "Halvkuglens rumfang",
      "group": "Geometri",
      "symbol": "V",
      "dimension": "volume",
      "equation": "V = (π / 12) · D³",
      "args": {
        "D": {
          "symbol": "D",
          "label": "Diameter",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        [
          "div",
          "π",
          "12"
        ],
        [
          "pow",
          "D",
          "3"
        ]
      ],
      "note": "En halvkugle som kugleformet endestykke. Højden er D / 2."
    },
    "hemisphereMantle": {
      "name": "Halvkuglens krumme flade",
      "group": "Overflade",
      "symbol": "A",
      "dimension": "area",
      "equation": "A = (π / 2) · D²",
      "args": {
        "D": {
          "symbol": "D",
          "label": "Diameter",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        [
          "div",
          "π",
          "2"
        ],
        [
          "pow",
          "D",
          "2"
        ]
      ],
      "note": "Kun den krumme flade; uden den plane cirkelflade."
    },
    "hemisphereClosed": {
      "name": "Halvkugle med plan flade",
      "group": "Overflade",
      "symbol": "A",
      "dimension": "area",
      "equation": "A = (3 · π / 4) · D²",
      "args": {
        "D": {
          "symbol": "D",
          "label": "Diameter",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        [
          "div",
          [
            "mul",
            "3",
            "π"
          ],
          "4"
        ],
        [
          "pow",
          "D",
          "2"
        ]
      ],
      "note": "Den krumme flade og den plane cirkelflade."
    }
  },
  "SHAPES": {
    "cylinder": {
      "name": "Cylinder",
      "hint": "Tank · beholder",
      "inputs": {
        "D": {
          "symbol": "D",
          "label": "Diameter",
          "dimension": "length"
        },
        "h": {
          "symbol": "h",
          "label": "Højde",
          "dimension": "length"
        }
      },
      "volume": "cylinderVolume",
      "crossSection": "circleArea",
      "surfaces": {
        "mantle": [
          "Kun kappe",
          "cylinderMantle"
        ],
        "open": [
          "Åben top + bund",
          "cylinderOpen"
        ],
        "closed": [
          "Lukket",
          "cylinderClosed"
        ]
      },
      "surfaceDefault": "open",
      "body": "cylinderMantle",
      "faces": {
        "top": {
          "label": "Top",
          "kind": "circle",
          "dimensions": [
            "D"
          ],
          "direction": -1,
          "join": true,
          "formula": "circleArea",
          "args": {
            "D": "D"
          }
        },
        "bottom": {
          "label": "Bund",
          "kind": "circle",
          "dimensions": [
            "D"
          ],
          "direction": 1,
          "join": true,
          "formula": "circleArea",
          "args": {
            "D": "D"
          }
        }
      }
    },
    "cone": {
      "name": "Kegle",
      "hint": "Spids · keglebund",
      "inputs": {
        "D": {
          "symbol": "D",
          "label": "Diameter",
          "dimension": "length"
        },
        "h": {
          "symbol": "h",
          "label": "Højde",
          "dimension": "length"
        }
      },
      "volume": "coneVolume",
      "crossSection": "circleArea",
      "surfaces": {
        "mantle": [
          "Kun kappe",
          "coneMantle"
        ],
        "closed": [
          "Med endeflade",
          "coneClosed"
        ]
      },
      "surfaceDefault": "mantle",
      "body": "coneMantle",
      "faces": {
        "base": {
          "label": "Plan endeflade",
          "kind": "circle",
          "dimensions": [
            "D"
          ],
          "direction": -1,
          "join": true,
          "formula": "circleArea",
          "args": {
            "D": "D"
          }
        }
      }
    },
    "frustum": {
      "name": "Keglestub",
      "hint": "Konisk overgang",
      "inputs": {
        "D": {
          "symbol": "D",
          "label": "Stor diameter",
          "dimension": "length"
        },
        "d": {
          "symbol": "d",
          "label": "Lille diameter",
          "dimension": "length"
        },
        "h": {
          "symbol": "h",
          "label": "Højde",
          "dimension": "length"
        }
      },
      "volume": "frustumVolume",
      "surfaces": {
        "mantle": [
          "Kun kappe",
          "frustumMantle"
        ]
      },
      "surfaceDefault": "mantle",
      "body": "frustumMantle",
      "faces": {
        "top": {
          "label": "Stor endeflade",
          "kind": "circle",
          "dimensions": [
            "D"
          ],
          "direction": -1,
          "join": true,
          "formula": "circleArea",
          "args": {
            "D": "D"
          }
        },
        "bottom": {
          "label": "Lille endeflade",
          "kind": "circle",
          "dimensions": [
            "d"
          ],
          "direction": 1,
          "join": true,
          "formula": "circleArea",
          "args": {
            "D": "d"
          }
        }
      }
    },
    "box": {
      "name": "Kasse",
      "hint": "Bassin · kar",
      "inputs": {
        "L": {
          "symbol": "L",
          "label": "Længde",
          "dimension": "length"
        },
        "B": {
          "symbol": "B",
          "label": "Bredde",
          "dimension": "length"
        },
        "h": {
          "symbol": "h",
          "label": "Højde",
          "dimension": "length"
        }
      },
      "volume": "boxVolume",
      "surfaces": {
        "open": [
          "Åben top + bund",
          "boxOpen"
        ],
        "closed": [
          "Lukket",
          "boxClosed"
        ]
      },
      "surfaceDefault": "open",
      "faces": {
        "top": {
          "label": "Top",
          "kind": "rectangle",
          "dimensions": [
            "L",
            "B"
          ],
          "direction": -1,
          "join": true,
          "formula": "rectangleArea",
          "args": {
            "L": "L",
            "B": "B"
          }
        },
        "bottom": {
          "label": "Bund",
          "kind": "rectangle",
          "dimensions": [
            "L",
            "B"
          ],
          "direction": 1,
          "join": true,
          "formula": "rectangleArea",
          "args": {
            "L": "L",
            "B": "B"
          }
        },
        "front": {
          "label": "Forside",
          "kind": "rectangle",
          "dimensions": [
            "L",
            "h"
          ],
          "direction": 0,
          "join": false,
          "formula": "rectangleArea",
          "args": {
            "L": "L",
            "B": "h"
          }
        },
        "back": {
          "label": "Bagside",
          "kind": "rectangle",
          "dimensions": [
            "L",
            "h"
          ],
          "direction": 0,
          "join": false,
          "formula": "rectangleArea",
          "args": {
            "L": "L",
            "B": "h"
          }
        },
        "left": {
          "label": "Venstre side",
          "kind": "rectangle",
          "dimensions": [
            "B",
            "h"
          ],
          "direction": 0,
          "join": false,
          "formula": "rectangleArea",
          "args": {
            "L": "B",
            "B": "h"
          }
        },
        "right": {
          "label": "Højre side",
          "kind": "rectangle",
          "dimensions": [
            "B",
            "h"
          ],
          "direction": 0,
          "join": false,
          "formula": "rectangleArea",
          "args": {
            "L": "B",
            "B": "h"
          }
        }
      }
    },
    "sphere": {
      "name": "Kugle",
      "hint": "Kuglebeholder",
      "inputs": {
        "D": {
          "symbol": "D",
          "label": "Diameter",
          "dimension": "length"
        }
      },
      "volume": "sphereVolume",
      "crossSection": "circleArea",
      "surfaces": {
        "closed": [
          "Hele kuglen",
          "sphereArea"
        ]
      },
      "surfaceDefault": "closed",
      "body": "sphereArea",
      "faces": {}
    },
    "pipe": {
      "name": "Rør",
      "hint": "Tværsnit · indhold",
      "inputs": {
        "D": {
          "symbol": "D",
          "label": "Indvendig diameter",
          "dimension": "length"
        },
        "h": {
          "symbol": "L",
          "label": "Rørlængde",
          "dimension": "length"
        }
      },
      "volume": "cylinderVolume",
      "crossSection": "circleArea",
      "surfaces": {
        "mantle": [
          "Indvendig kappe",
          "cylinderMantle"
        ]
      },
      "surfaceDefault": "mantle",
      "body": "cylinderMantle",
      "faces": {
        "top": {
          "label": "Ende 1",
          "kind": "circle",
          "dimensions": [
            "D"
          ],
          "direction": -1,
          "join": true,
          "formula": "circleArea",
          "args": {
            "D": "D"
          }
        },
        "bottom": {
          "label": "Ende 2",
          "kind": "circle",
          "dimensions": [
            "D"
          ],
          "direction": 1,
          "join": true,
          "formula": "circleArea",
          "args": {
            "D": "D"
          }
        }
      }
    },
    "hemisphere": {
      "name": "Halvkugle",
      "hint": "Kuglespids · endestykke",
      "inputs": {
        "D": {
          "symbol": "D",
          "label": "Diameter",
          "dimension": "length"
        }
      },
      "volume": "hemisphereVolume",
      "crossSection": "circleArea",
      "surfaces": {
        "mantle": [
          "Kun krum flade",
          "hemisphereMantle"
        ],
        "closed": [
          "Med plan flade",
          "hemisphereClosed"
        ]
      },
      "surfaceDefault": "closed",
      "body": "hemisphereMantle",
      "faces": {
        "base": {
          "label": "Plan samleflade",
          "kind": "circle",
          "dimensions": [
            "D"
          ],
          "direction": 1,
          "join": true,
          "formula": "circleArea",
          "args": {
            "D": "D"
          }
        }
      }
    }
  },
  "DIMENSIONS": {
    "scalar": {
      "name": "Forhold",
      "unit": "—"
    },
    "length": {
      "name": "Længde",
      "unit": "m"
    },
    "area": {
      "name": "Areal",
      "unit": "m²"
    },
    "volume": {
      "name": "Rumfang",
      "unit": "m³"
    },
    "time": {
      "name": "Tid",
      "unit": "s"
    },
    "velocity": {
      "name": "Hastighed",
      "unit": "m/s"
    },
    "acceleration": {
      "name": "Acceleration",
      "unit": "m/s²"
    },
    "flow": {
      "name": "Volumenflow",
      "unit": "m³/s"
    },
    "mass": {
      "name": "Masse",
      "unit": "kg"
    },
    "density": {
      "name": "Densitet",
      "unit": "kg/m³"
    },
    "massFlow": {
      "name": "Masseflow",
      "unit": "kg/s"
    },
    "pressure": {
      "name": "Tryk",
      "unit": "Pa"
    },
    "force": {
      "name": "Kraft",
      "unit": "N"
    },
    "power": {
      "name": "Effekt",
      "unit": "W"
    }
  }
};
  if(typeof module === "object" && module.exports) module.exports = catalog;
  else root.PPCatalog = catalog;
})(typeof globalThis !== "undefined" ? globalThis : this);
