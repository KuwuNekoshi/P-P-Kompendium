/* Offline symbolic formula catalogue. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.PPCatalog=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){return {
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
      "note": "",
      "source": {
        "pages": [
          3,
          9
        ],
        "triangles": [
          "T5"
        ]
      }
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
      "note": "",
      "source": {
        "pages": [
          3,
          9
        ],
        "triangles": [
          "T6"
        ]
      }
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
      "note": "",
      "source": {
        "pages": [
          3,
          9
        ],
        "triangles": [
          "T7"
        ]
      }
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
      "note": "",
      "source": {
        "pages": [
          3
        ],
        "triangles": []
      }
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
      "note": "",
      "source": {
        "pages": [
          3,
          9
        ],
        "triangles": [
          "T6"
        ]
      }
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
      "note": "",
      "source": {
        "pages": [
          3
        ],
        "triangles": []
      }
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
      "note": "Kun siden; uden top og bund.",
      "source": {
        "pages": [
          3,
          10
        ],
        "triangles": [
          "T10"
        ]
      }
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
      "note": "Uden den cirkelformede endeflade.",
      "source": {
        "pages": [
          3,
          10
        ],
        "triangles": [
          "T11"
        ]
      }
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
      "note": "Uden endeflader.",
      "source": {
        "pages": [
          3
        ],
        "triangles": []
      }
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
      "note": "",
      "source": {
        "pages": [
          3
        ],
        "triangles": []
      }
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
      "note": "Med middelhastighed i m/s og areal i m² fås m³/s. Skolens faktor k omregner kun tidsenheden; gang med 3600 for m³/h.",
      "source": {
        "pages": [
          4,
          12
        ],
        "triangles": [
          "T28"
        ]
      }
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
      "note": "",
      "source": {
        "pages": [
          4,
          10
        ],
        "triangles": [
          "T14"
        ]
      }
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
      "note": "Konstant volumenflow.",
      "source": {
        "pages": [
          4,
          11
        ],
        "triangles": [
          "T25"
        ]
      }
    },
    "mass": {
      "name": "Masse",
      "group": "Masse og tankvægt",
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
      "note": "m er massen i kg, når V er i m³ og ρ i kg/m³. Til selve tankmaterialet vælges Tankens egenvægt (T9).",
      "source": {
        "pages": [
          3,
          9
        ],
        "triangles": [
          "T2"
        ]
      }
    },
    "density": {
      "name": "Densitet",
      "group": "Masse og tankvægt",
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
      "note": "",
      "source": {
        "pages": [
          2,
          9
        ],
        "triangles": [
          "T2"
        ]
      }
    },
    "massFlow": {
      "name": "Masseflow",
      "group": "Masse og tankvægt",
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
      "note": "ρ i kg/m³ og Qᵥ i m³/s giver Qₘ i kg/s. Brug samme volumen- og tidsenheder.",
      "source": {
        "pages": [
          4,
          12
        ],
        "triangles": [
          "T29"
        ]
      }
    },
    "hydrostatic": {
      "name": "Hydrostatisk overtryk",
      "group": "Pumper og tryk",
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
      "note": "Væskens overtryk i forhold til trykket over væskeoverfladen.",
      "source": {
        "pages": [
          4,
          11
        ],
        "triangles": [
          "T23"
        ]
      }
    },
    "pressure": {
      "name": "Tryk fra kraft",
      "group": "Pumper og tryk",
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
      "group": "Pumper og tryk",
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
      "note": "",
      "source": {
        "pages": [
          4,
          11
        ],
        "triangles": [
          "T22"
        ]
      }
    },
    "hydraulicPower": {
      "name": "Hydraulisk effekt",
      "group": "Pumper og tryk",
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
      "group": "Pumper og tryk",
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
          "label": "Samlet løftehøjde og modstand",
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
      "note": "H er den samlede løftehøjde. η er virkningsgraden som decimaltal. g er tyngdeaccelerationen. Brug SI-enheder.",
      "source": {
        "pages": [
          5,
          11,
          12
        ],
        "triangles": [
          "T27",
          "T30"
        ]
      }
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
      "note": "",
      "source": {
        "pages": [
          3,
          9
        ],
        "triangles": [
          "T3"
        ]
      }
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
    },
    "tankMass": {
      "name": "Tankens egenvægt",
      "group": "Masse og tankvægt",
      "symbol": "m_tank",
      "dimension": "mass",
      "equation": "mₜₐₙₖ = Aplade · tplade · ρmateriale",
      "args": {
        "A": {
          "symbol": "A_plade",
          "label": "Pladeareal fra valgte flader",
          "dimension": "area"
        },
        "thickness": {
          "symbol": "t_plade",
          "label": "Pladetykkelse",
          "dimension": "length"
        },
        "rho": {
          "symbol": "ρ_mat",
          "label": "Materialets massefylde",
          "dimension": "density"
        }
      },
      "template": [
        "mul",
        "A",
        "thickness",
        "rho"
      ],
      "note": "Tankmaterialets masse uden væske, ben, studs og andet udstyr. Ens materiale og pladetykkelse; figurernes arealer er baseret på indvendige mål og krumme flader behandles som tynd plade. t_plade er tykkelse, ikke tid. Brug m og kg/m³ for kg; med ton/m³ fås ton.",
      "source": {
        "pages": [
          3,
          10
        ],
        "triangles": [
          "T9"
        ]
      }
    },
    "plateVolume": {
      "name": "Pladematerialets rumfang",
      "group": "Masse og tankvægt",
      "symbol": "V_mat",
      "dimension": "volume",
      "equation": "Vmateriale = Aplade · tplade",
      "args": {
        "A": {
          "symbol": "A_plade",
          "label": "Pladeareal fra valgte flader",
          "dimension": "area"
        },
        "thickness": {
          "symbol": "t_plade",
          "label": "Pladetykkelse",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        "A",
        "thickness"
      ],
      "note": "Flad plade: A · t. Ved krumme tankvægge med indvendige mål er dette en tilnærmelse for tynd plade.",
      "source": {
        "pages": [
          3,
          10
        ],
        "triangles": [
          "T9"
        ]
      }
    },
    "plateThickness": {
      "name": "Pladetykkelse fra masse",
      "group": "Masse og tankvægt",
      "symbol": "t_plade",
      "dimension": "length",
      "equation": "tplade = m / (Aplade · ρmateriale)",
      "args": {
        "m": {
          "symbol": "m_tank",
          "label": "Tankmaterialets masse",
          "dimension": "mass"
        },
        "A": {
          "symbol": "A_plade",
          "label": "Pladeareal fra valgte flader",
          "dimension": "area"
        },
        "rho": {
          "symbol": "ρ_mat",
          "label": "Materialets massefylde",
          "dimension": "density"
        }
      },
      "template": [
        "div",
        "m",
        [
          "mul",
          "A",
          "rho"
        ]
      ],
      "note": "",
      "source": {
        "pages": [
          3,
          10
        ],
        "triangles": [
          "T9"
        ]
      }
    },
    "massSum": {
      "name": "Sum af masser",
      "group": "Masse og tankvægt",
      "symbol": "m_samlet",
      "dimension": "mass",
      "equation": "msamlet = m₁ + m₂",
      "args": {
        "m1": {
          "symbol": "m_1",
          "label": "Første masse",
          "dimension": "mass"
        },
        "m2": {
          "symbol": "m_2",
          "label": "Anden masse",
          "dimension": "mass"
        }
      },
      "template": [
        "add",
        "m1",
        "m2"
      ],
      "note": "Brug fx separate delmasser, hvis tankdele har forskelligt materiale eller forskellig pladetykkelse.",
      "source": {
        "pages": [
          3
        ],
        "triangles": []
      }
    },
    "filledTankMass": {
      "name": "Tank med indhold",
      "group": "Masse og tankvægt",
      "symbol": "m_total",
      "dimension": "mass",
      "equation": "mtotal = mtank + ρvæske · Vvæske",
      "args": {
        "tank": {
          "symbol": "m_tank",
          "label": "Tankens egenvægt",
          "dimension": "mass"
        },
        "rho": {
          "symbol": "ρ_væske",
          "label": "Væskens massefylde",
          "dimension": "density"
        },
        "V": {
          "symbol": "V_væske",
          "label": "Faktisk væskevolumen",
          "dimension": "volume"
        }
      },
      "template": [
        "add",
        "tank",
        [
          "mul",
          "rho",
          "V"
        ]
      ],
      "note": "Egenvægt plus indhold. Vælg det faktiske væskevolumen ved delvis fyldning; tankens fulde geometriske rumfang bruges kun ved fuld tank.",
      "source": {
        "pages": [
          3
        ],
        "triangles": [
          "T2",
          "T9"
        ]
      }
    },
    "massFromFlow": {
      "name": "Masse fra flow og tid",
      "group": "Masse og tankvægt",
      "symbol": "m",
      "dimension": "mass",
      "equation": "m = Qₘ · t",
      "args": {
        "Q": {
          "symbol": "Q_m",
          "label": "Masseflow",
          "dimension": "massFlow"
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
      "note": "Konstant masseflow.",
      "source": {
        "pages": [
          4,
          11
        ],
        "triangles": [
          "T26"
        ]
      }
    },
    "circumference": {
      "name": "Cirklens omkreds",
      "group": "Geometri",
      "symbol": "O",
      "dimension": "length",
      "equation": "O = π · D",
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
        "D"
      ],
      "note": "",
      "source": {
        "pages": [
          3,
          9
        ],
        "triangles": [
          "T1"
        ]
      }
    },
    "rectanglePerimeter": {
      "name": "Rektanglets omkreds",
      "group": "Geometri",
      "symbol": "O",
      "dimension": "length",
      "equation": "O = 2 · (L + B)",
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
        "2",
        [
          "add",
          "L",
          "B"
        ]
      ],
      "note": "",
      "source": {
        "pages": [
          3
        ],
        "triangles": []
      }
    },
    "triangleArea": {
      "name": "Trekantens areal",
      "group": "Geometri",
      "symbol": "A",
      "dimension": "area",
      "equation": "A = ½ · g · h",
      "args": {
        "g": {
          "symbol": "g",
          "label": "Grundlinje",
          "dimension": "length"
        },
        "h": {
          "symbol": "h",
          "label": "Vinkelret højde",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        [
          "div",
          "1",
          "2"
        ],
        "g",
        "h"
      ],
      "note": "",
      "source": {
        "pages": [
          3,
          9
        ],
        "triangles": [
          "T4"
        ]
      }
    },
    "prismVolume": {
      "name": "Prismets rumfang",
      "group": "Geometri",
      "symbol": "V",
      "dimension": "volume",
      "equation": "V = G · h",
      "args": {
        "G": {
          "symbol": "G",
          "label": "Grundfladeareal",
          "dimension": "area"
        },
        "h": {
          "symbol": "h",
          "label": "Længde vinkelret på grundfladen",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        "G",
        "h"
      ],
      "note": "Ens tværsnit langs hele længden. Grundfladen kan fx være en trekant eller et rektangel.",
      "source": {
        "pages": [
          3,
          9
        ],
        "triangles": [
          "T6"
        ]
      }
    },
    "pyramidVolume": {
      "name": "Pyramidens rumfang",
      "group": "Geometri",
      "symbol": "V",
      "dimension": "volume",
      "equation": "V = ⅓ · G · h",
      "args": {
        "G": {
          "symbol": "G",
          "label": "Grundfladeareal",
          "dimension": "area"
        },
        "h": {
          "symbol": "h",
          "label": "Vinkelret højde",
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
        "G",
        "h"
      ],
      "note": "",
      "source": {
        "pages": [
          3,
          9
        ],
        "triangles": [
          "T8"
        ]
      }
    },
    "pyramidFrustumVolume": {
      "name": "Pyramidestubbens rumfang",
      "group": "Geometri",
      "symbol": "V",
      "dimension": "volume",
      "equation": "V = (h / 3) · (G + g + √(G · g))",
      "args": {
        "G": {
          "symbol": "G",
          "label": "Stort endefladeareal",
          "dimension": "area"
        },
        "g": {
          "symbol": "g",
          "label": "Lille endefladeareal",
          "dimension": "area"
        },
        "h": {
          "symbol": "h",
          "label": "Vinkelret højde",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        [
          "div",
          "h",
          "3"
        ],
        [
          "add",
          "G",
          "g",
          [
            "sqrt",
            [
              "mul",
              "G",
              "g"
            ]
          ]
        ]
      ],
      "note": "Parallelle, ligedannede endeflader fra samme pyramide.",
      "source": {
        "pages": [
          3
        ],
        "triangles": []
      }
    },
    "slantHeight": {
      "name": "Skrå højde",
      "group": "Geometri",
      "symbol": "s",
      "dimension": "length",
      "equation": "s = √(r² + h²)",
      "args": {
        "r": {
          "symbol": "r",
          "label": "Vandret afstand til kanten",
          "dimension": "length"
        },
        "h": {
          "symbol": "h",
          "label": "Vinkelret højde",
          "dimension": "length"
        }
      },
      "template": [
        "sqrt",
        [
          "add",
          [
            "pow",
            "r",
            "2"
          ],
          [
            "pow",
            "h",
            "2"
          ]
        ]
      ],
      "note": "Kegle: r er radius. Pyramide: brug grundfladens apoteme, dvs. afstanden fra midten til sidens midtpunkt.",
      "source": {
        "pages": [
          3,
          10
        ],
        "triangles": [
          "T11"
        ]
      }
    },
    "frustumSlantHeight": {
      "name": "Skrå højde på en stub",
      "group": "Geometri",
      "symbol": "s",
      "dimension": "length",
      "equation": "s = √((R − r)² + h²)",
      "args": {
        "R": {
          "symbol": "R",
          "label": "Stor radius eller apoteme",
          "dimension": "length"
        },
        "r": {
          "symbol": "r",
          "label": "Lille radius eller apoteme",
          "dimension": "length"
        },
        "h": {
          "symbol": "h",
          "label": "Vinkelret højde",
          "dimension": "length"
        }
      },
      "template": [
        "sqrt",
        [
          "add",
          [
            "pow",
            [
              "sub",
              "R",
              "r"
            ],
            "2"
          ],
          [
            "pow",
            "h",
            "2"
          ]
        ]
      ],
      "note": "",
      "source": {
        "pages": [
          3
        ],
        "triangles": []
      }
    },
    "boxMantle": {
      "name": "Kassens fire sider",
      "group": "Overflade",
      "symbol": "A",
      "dimension": "area",
      "equation": "A = 2 · (L + B) · h",
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
          "add",
          "L",
          "B"
        ],
        "h"
      ],
      "note": "Kun de fire sider, uden top og bund. Dette er kassens Ofl.A i samlingen.",
      "source": {
        "pages": [
          3
        ],
        "triangles": []
      }
    },
    "coneMantleSlant": {
      "name": "Keglekappe fra skrå højde",
      "group": "Overflade",
      "symbol": "A",
      "dimension": "area",
      "equation": "A = π · r · s",
      "args": {
        "r": {
          "symbol": "r",
          "label": "Radius",
          "dimension": "length"
        },
        "s": {
          "symbol": "s",
          "label": "Skrå højde",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        "π",
        "r",
        "s"
      ],
      "note": "",
      "source": {
        "pages": [
          3,
          10
        ],
        "triangles": [
          "T11"
        ]
      }
    },
    "pyramidMantle": {
      "name": "Pyramidens sideflader",
      "group": "Overflade",
      "symbol": "A",
      "dimension": "area",
      "equation": "A = ½ · s · b · N",
      "args": {
        "s": {
          "symbol": "s",
          "label": "Skrå højde på en sideflade",
          "dimension": "length"
        },
        "b": {
          "symbol": "b",
          "label": "Grundlinje på en sideflade",
          "dimension": "length"
        },
        "N": {
          "symbol": "N",
          "label": "Antal ens sideflader",
          "dimension": "scalar"
        }
      },
      "template": [
        "mul",
        [
          "div",
          "1",
          "2"
        ],
        "s",
        "b",
        "N"
      ],
      "note": "Regelmæssig pyramide med ens trekantede sideflader. Grundfladen er ikke med.",
      "source": {
        "pages": [
          3
        ],
        "triangles": []
      }
    },
    "pyramidFrustumMantle": {
      "name": "Pyramidestubbens sideflader",
      "group": "Overflade",
      "symbol": "A",
      "dimension": "area",
      "equation": "A = s · (L + l) / 2 · N",
      "args": {
        "s": {
          "symbol": "s",
          "label": "Skrå højde på en sideflade",
          "dimension": "length"
        },
        "L": {
          "symbol": "L",
          "label": "Stor parallel side",
          "dimension": "length"
        },
        "l": {
          "symbol": "l",
          "label": "Lille parallel side",
          "dimension": "length"
        },
        "N": {
          "symbol": "N",
          "label": "Antal ens sideflader",
          "dimension": "scalar"
        }
      },
      "template": [
        "mul",
        "s",
        [
          "div",
          [
            "add",
            "L",
            "l"
          ],
          "2"
        ],
        "N"
      ],
      "note": "Regelmæssig stub med ens trapezformede sideflader; uden endeflader.",
      "source": {
        "pages": [
          3
        ],
        "triangles": []
      }
    },
    "velocityChange": {
      "name": "Hastighedsændring",
      "group": "Bevægelse og mekanik",
      "symbol": "Δv",
      "dimension": "velocity",
      "equation": "Δv = a · t",
      "args": {
        "a": {
          "symbol": "a",
          "label": "Konstant acceleration",
          "dimension": "acceleration"
        },
        "t": {
          "symbol": "t",
          "label": "Tid",
          "dimension": "time"
        }
      },
      "template": [
        "mul",
        "a",
        "t"
      ],
      "note": "",
      "source": {
        "pages": [
          4,
          10
        ],
        "triangles": [
          "T12"
        ]
      }
    },
    "acceleration": {
      "name": "Acceleration",
      "group": "Bevægelse og mekanik",
      "symbol": "a",
      "dimension": "acceleration",
      "equation": "a = (vslut − vstart) / t",
      "args": {
        "end": {
          "symbol": "v_slut",
          "label": "Sluthastighed",
          "dimension": "velocity"
        },
        "start": {
          "symbol": "v_start",
          "label": "Starthastighed",
          "dimension": "velocity"
        },
        "t": {
          "symbol": "t",
          "label": "Tidsinterval",
          "dimension": "time"
        }
      },
      "template": [
        "div",
        [
          "sub",
          "end",
          "start"
        ],
        "t"
      ],
      "note": "",
      "source": {
        "pages": [
          2,
          10
        ],
        "triangles": [
          "T12"
        ]
      }
    },
    "finalVelocity": {
      "name": "Sluthastighed",
      "group": "Bevægelse og mekanik",
      "symbol": "v_slut",
      "dimension": "velocity",
      "equation": "vslut = vstart + a · t",
      "args": {
        "start": {
          "symbol": "v_start",
          "label": "Starthastighed",
          "dimension": "velocity"
        },
        "a": {
          "symbol": "a",
          "label": "Konstant acceleration",
          "dimension": "acceleration"
        },
        "t": {
          "symbol": "t",
          "label": "Tid",
          "dimension": "time"
        }
      },
      "template": [
        "add",
        "start",
        [
          "mul",
          "a",
          "t"
        ]
      ],
      "note": "",
      "source": {
        "pages": [
          10
        ],
        "triangles": [
          "T12"
        ]
      }
    },
    "distance": {
      "name": "Strækning ved konstant hastighed",
      "group": "Bevægelse og mekanik",
      "symbol": "s",
      "dimension": "length",
      "equation": "s = v · t",
      "args": {
        "v": {
          "symbol": "v",
          "label": "Hastighed",
          "dimension": "velocity"
        },
        "t": {
          "symbol": "t",
          "label": "Tid",
          "dimension": "time"
        }
      },
      "template": [
        "mul",
        "v",
        "t"
      ],
      "note": "",
      "source": {
        "pages": [
          4,
          10
        ],
        "triangles": [
          "T14"
        ]
      }
    },
    "acceleratedDistance": {
      "name": "Strækning fra stilstand",
      "group": "Bevægelse og mekanik",
      "symbol": "s",
      "dimension": "length",
      "equation": "s = ½ · a · t²",
      "args": {
        "a": {
          "symbol": "a",
          "label": "Konstant acceleration",
          "dimension": "acceleration"
        },
        "t": {
          "symbol": "t",
          "label": "Tid",
          "dimension": "time"
        }
      },
      "template": [
        "mul",
        [
          "div",
          "1",
          "2"
        ],
        "a",
        [
          "pow",
          "t",
          "2"
        ]
      ],
      "note": "Starthastigheden er nul. a er den aktuelle acceleration; kun ved frit fald bruges g.",
      "source": {
        "pages": [
          4,
          10
        ],
        "triangles": [
          "T15"
        ]
      }
    },
    "generalDistance": {
      "name": "Strækning med starthastighed",
      "group": "Bevægelse og mekanik",
      "symbol": "s",
      "dimension": "length",
      "equation": "s = vstart · t + ½ · a · t²",
      "args": {
        "v": {
          "symbol": "v_start",
          "label": "Starthastighed",
          "dimension": "velocity"
        },
        "a": {
          "symbol": "a",
          "label": "Konstant acceleration",
          "dimension": "acceleration"
        },
        "t": {
          "symbol": "t",
          "label": "Tid",
          "dimension": "time"
        }
      },
      "template": [
        "add",
        [
          "mul",
          "v",
          "t"
        ],
        [
          "mul",
          [
            "div",
            "1",
            "2"
          ],
          "a",
          [
            "pow",
            "t",
            "2"
          ]
        ]
      ],
      "note": "",
      "source": {
        "pages": [
          10
        ],
        "triangles": [
          "T15"
        ]
      }
    },
    "speedFromDistance": {
      "name": "Fart fra acceleration og strækning",
      "group": "Bevægelse og mekanik",
      "symbol": "v",
      "dimension": "velocity",
      "equation": "v = √(2 · a · s)",
      "args": {
        "a": {
          "symbol": "a",
          "label": "Konstant acceleration",
          "dimension": "acceleration"
        },
        "s": {
          "symbol": "s",
          "label": "Strækning",
          "dimension": "length"
        }
      },
      "template": [
        "sqrt",
        [
          "mul",
          "2",
          "a",
          "s"
        ]
      ],
      "note": "Fra stilstand, uden retningsskift. a · s skal være ikke-negativ.",
      "source": {
        "pages": [
          4
        ],
        "triangles": []
      }
    },
    "newtonForce": {
      "name": "Kraft fra masse og acceleration",
      "group": "Bevægelse og mekanik",
      "symbol": "F",
      "dimension": "force",
      "equation": "F = m · a",
      "args": {
        "m": {
          "symbol": "m",
          "label": "Masse",
          "dimension": "mass"
        },
        "a": {
          "symbol": "a",
          "label": "Acceleration",
          "dimension": "acceleration"
        }
      },
      "template": [
        "mul",
        "m",
        "a"
      ],
      "note": "",
      "source": {
        "pages": [
          4,
          11
        ],
        "triangles": [
          "T19"
        ]
      }
    },
    "gravityForce": {
      "name": "Tyngdekraft",
      "group": "Bevægelse og mekanik",
      "symbol": "F_g",
      "dimension": "force",
      "equation": "Fᵍ = m · g",
      "args": {
        "m": {
          "symbol": "m",
          "label": "Masse",
          "dimension": "mass"
        },
        "g": {
          "symbol": "g",
          "label": "Tyngdeacceleration",
          "dimension": "acceleration"
        }
      },
      "template": [
        "mul",
        "m",
        "g"
      ],
      "note": "Kraft i newton. Tankens egenvægt i kg findes under T9; vælg m som reference hertil.",
      "source": {
        "pages": [
          4,
          11
        ],
        "triangles": [
          "T19"
        ]
      }
    },
    "frictionForce": {
      "name": "Friktionskraft",
      "group": "Bevægelse og mekanik",
      "symbol": "F_f",
      "dimension": "force",
      "equation": "Ff = μ · Fnormal",
      "args": {
        "mu": {
          "symbol": "μ",
          "label": "Friktionskoefficient",
          "dimension": "scalar"
        },
        "F": {
          "symbol": "F_N",
          "label": "Normalkraft",
          "dimension": "force"
        }
      },
      "template": [
        "mul",
        "mu",
        "F"
      ],
      "note": "Glidefriktion eller maksimal statisk friktion med den relevante koefficient.",
      "source": {
        "pages": [
          11
        ],
        "triangles": [
          "T20"
        ]
      }
    },
    "massMoment": {
      "name": "Massemoment (T13)",
      "group": "Bevægelse og mekanik",
      "symbol": "M_m",
      "dimension": "massMoment",
      "equation": "Mmasse = m · r",
      "args": {
        "m": {
          "symbol": "m",
          "label": "Masse",
          "dimension": "mass"
        },
        "r": {
          "symbol": "r",
          "label": "Vinkelret arm",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        "m",
        "r"
      ],
      "note": "Samlingens kg·m er masse gange arm. Drejningsmoment i N·m bruger kraft gange arm, eller m · g · r for tyngdekraft.",
      "source": {
        "pages": [
          10
        ],
        "triangles": [
          "T13"
        ]
      }
    },
    "torque": {
      "name": "Drejningsmoment",
      "group": "Bevægelse og mekanik",
      "symbol": "M",
      "dimension": "torque",
      "equation": "M = F · r",
      "args": {
        "F": {
          "symbol": "F",
          "label": "Kraft",
          "dimension": "force"
        },
        "r": {
          "symbol": "r",
          "label": "Vinkelret momentarm",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        "F",
        "r"
      ],
      "note": "Kraft i N og vinkelret arm i m giver N·m.",
      "source": {
        "pages": [
          4
        ],
        "triangles": []
      }
    },
    "work": {
      "name": "Arbejde",
      "group": "Bevægelse og mekanik",
      "symbol": "W",
      "dimension": "energy",
      "equation": "W = F · s",
      "args": {
        "F": {
          "symbol": "F",
          "label": "Kraft langs bevægelsen",
          "dimension": "force"
        },
        "s": {
          "symbol": "s",
          "label": "Strækning",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        "F",
        "s"
      ],
      "note": "Konstant kraft i bevægelsens retning; brug kraftens komponent langs bevægelsen.",
      "source": {
        "pages": [
          4,
          11
        ],
        "triangles": [
          "T18"
        ]
      }
    },
    "kineticEnergy": {
      "name": "Kinetisk energi",
      "group": "Bevægelse og mekanik",
      "symbol": "E_kin",
      "dimension": "energy",
      "equation": "Ekin = ½ · m · v²",
      "args": {
        "m": {
          "symbol": "m",
          "label": "Masse",
          "dimension": "mass"
        },
        "v": {
          "symbol": "v",
          "label": "Hastighed",
          "dimension": "velocity"
        }
      },
      "template": [
        "mul",
        [
          "div",
          "1",
          "2"
        ],
        "m",
        [
          "pow",
          "v",
          "2"
        ]
      ],
      "note": "",
      "source": {
        "pages": [
          4,
          11
        ],
        "triangles": [
          "T16"
        ]
      }
    },
    "potentialEnergy": {
      "name": "Potentiel energi",
      "group": "Bevægelse og mekanik",
      "symbol": "E_pot",
      "dimension": "energy",
      "equation": "Epot = m · g · h",
      "args": {
        "m": {
          "symbol": "m",
          "label": "Masse",
          "dimension": "mass"
        },
        "g": {
          "symbol": "g",
          "label": "Tyngdeacceleration",
          "dimension": "acceleration"
        },
        "h": {
          "symbol": "h",
          "label": "Højde over valgt nulniveau",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        "m",
        "g",
        "h"
      ],
      "note": "",
      "source": {
        "pages": [
          4,
          11
        ],
        "triangles": [
          "T17"
        ]
      }
    },
    "energySum": {
      "name": "Sum af energier",
      "group": "Bevægelse og mekanik",
      "symbol": "E_total",
      "dimension": "energy",
      "equation": "Etotal = E₁ + E₂",
      "args": {
        "E1": {
          "symbol": "E_1",
          "label": "Første energi",
          "dimension": "energy"
        },
        "E2": {
          "symbol": "E_2",
          "label": "Anden energi",
          "dimension": "energy"
        }
      },
      "template": [
        "add",
        "E1",
        "E2"
      ],
      "note": "",
      "source": {
        "pages": [
          4
        ],
        "triangles": []
      }
    },
    "powerFromEnergy": {
      "name": "Effekt fra energi og tid",
      "group": "Bevægelse og mekanik",
      "symbol": "P",
      "dimension": "power",
      "equation": "P = E / t",
      "args": {
        "E": {
          "symbol": "E",
          "label": "Energi eller arbejde",
          "dimension": "energy"
        },
        "t": {
          "symbol": "t",
          "label": "Tid",
          "dimension": "time"
        }
      },
      "template": [
        "div",
        "E",
        "t"
      ],
      "note": "J og s giver W. kJ og s giver kW.",
      "source": {
        "pages": [
          4,
          7,
          11,
          13
        ],
        "triangles": [
          "T21",
          "T37"
        ]
      }
    },
    "energyFromPower": {
      "name": "Energi fra effekt og tid",
      "group": "Bevægelse og mekanik",
      "symbol": "E",
      "dimension": "energy",
      "equation": "E = P · t",
      "args": {
        "P": {
          "symbol": "P",
          "label": "Konstant effekt",
          "dimension": "power"
        },
        "t": {
          "symbol": "t",
          "label": "Tid",
          "dimension": "time"
        }
      },
      "template": [
        "mul",
        "P",
        "t"
      ],
      "note": "",
      "source": {
        "pages": [
          11,
          13
        ],
        "triangles": [
          "T21",
          "T37"
        ]
      }
    },
    "headFromPressure": {
      "name": "Løftehøjde fra trykforskel",
      "group": "Pumper og tryk",
      "symbol": "H",
      "dimension": "length",
      "equation": "H = Δp / (ρ · g)",
      "args": {
        "p": {
          "symbol": "Δp",
          "label": "Trykforskel",
          "dimension": "pressure"
        },
        "rho": {
          "symbol": "ρ",
          "label": "Væskens massefylde",
          "dimension": "density"
        },
        "g": {
          "symbol": "g",
          "label": "Tyngdeacceleration",
          "dimension": "acceleration"
        }
      },
      "template": [
        "div",
        "p",
        [
          "mul",
          "rho",
          "g"
        ]
      ],
      "note": "Δp i Pa og ρ i kg/m³ giver m væskesøjle.",
      "source": {
        "pages": [
          5,
          11
        ],
        "triangles": [
          "T23"
        ]
      }
    },
    "dynamicVelocity": {
      "name": "Hastighed fra dynamisk trykhøjde",
      "group": "Pumper og tryk",
      "symbol": "v",
      "dimension": "velocity",
      "equation": "v = √(2 · g · Hdyn)",
      "args": {
        "g": {
          "symbol": "g",
          "label": "Tyngdeacceleration",
          "dimension": "acceleration"
        },
        "H": {
          "symbol": "H_dyn",
          "label": "Dynamisk trykhøjde",
          "dimension": "length"
        }
      },
      "template": [
        "sqrt",
        [
          "mul",
          "2",
          "g",
          "H"
        ]
      ],
      "note": "Ideel sammenhæng mellem hastighed og dynamisk trykhøjde, uden yderligere tab.",
      "source": {
        "pages": [
          4,
          11
        ],
        "triangles": [
          "T24"
        ]
      }
    },
    "dynamicHead": {
      "name": "Dynamisk trykhøjde",
      "group": "Pumper og tryk",
      "symbol": "H_dyn",
      "dimension": "length",
      "equation": "Hdyn = v² / (2 · g)",
      "args": {
        "v": {
          "symbol": "v",
          "label": "Hastighed",
          "dimension": "velocity"
        },
        "g": {
          "symbol": "g",
          "label": "Tyngdeacceleration",
          "dimension": "acceleration"
        }
      },
      "template": [
        "div",
        [
          "pow",
          "v",
          "2"
        ],
        [
          "mul",
          "2",
          "g"
        ]
      ],
      "note": "",
      "source": {
        "pages": [
          4,
          11
        ],
        "triangles": [
          "T24"
        ]
      }
    },
    "totalHeadSuction": {
      "name": "Samlet løftehøjde med sugehøjde",
      "group": "Pumper og tryk",
      "symbol": "H_total",
      "dimension": "length",
      "equation": "Htotal = H + Hm + Hi + Hs",
      "args": {
        "H": {
          "symbol": "H",
          "label": "Løftehøjde",
          "dimension": "length"
        },
        "Hm": {
          "symbol": "H_m",
          "label": "Modstand i rør",
          "dimension": "length"
        },
        "Hi": {
          "symbol": "H_i",
          "label": "Indløbsmodstand",
          "dimension": "length"
        },
        "Hs": {
          "symbol": "H_s",
          "label": "Suge- eller tilløbshøjde",
          "dimension": "length"
        }
      },
      "template": [
        "add",
        "H",
        "Hm",
        "Hi",
        "Hs"
      ],
      "note": "Hs er positiv sugehøjde, når pumpen ligger over indløbets væskeoverflade. Alle led i m væskesøjle; samme højdeforskel må ikke tælles to gange.",
      "source": {
        "pages": [
          5
        ],
        "triangles": []
      }
    },
    "totalHeadInlet": {
      "name": "Samlet løftehøjde med tilløbstryk",
      "group": "Pumper og tryk",
      "symbol": "H_total",
      "dimension": "length",
      "equation": "Htotal = H + Hm + Hi − Hs",
      "args": {
        "H": {
          "symbol": "H",
          "label": "Løftehøjde",
          "dimension": "length"
        },
        "Hm": {
          "symbol": "H_m",
          "label": "Modstand i rør",
          "dimension": "length"
        },
        "Hi": {
          "symbol": "H_i",
          "label": "Indløbsmodstand",
          "dimension": "length"
        },
        "Hs": {
          "symbol": "H_s",
          "label": "Suge- eller tilløbshøjde",
          "dimension": "length"
        }
      },
      "template": [
        "sub",
        [
          "add",
          "H",
          "Hm",
          "Hi"
        ],
        "Hs"
      ],
      "note": "Hs er en positiv tilløbstrykhøjde, der hjælper pumpen, og derfor trækkes fra. Alle led i m væskesøjle; samme højdeforskel må ikke tælles to gange.",
      "source": {
        "pages": [
          5
        ],
        "triangles": []
      }
    },
    "theoreticalPumpPower": {
      "name": "Teoretisk pumpeeffekt fra volumenflow",
      "group": "Pumper og tryk",
      "symbol": "P_teo",
      "dimension": "power",
      "equation": "Pteo = ρ · Qᵥ · g · H",
      "args": {
        "rho": {
          "symbol": "ρ",
          "label": "Væskens massefylde",
          "dimension": "density"
        },
        "Q": {
          "symbol": "Q_v",
          "label": "Volumenflow",
          "dimension": "flow"
        },
        "g": {
          "symbol": "g",
          "label": "Tyngdeacceleration",
          "dimension": "acceleration"
        },
        "H": {
          "symbol": "H_total",
          "label": "Samlet løftehøjde",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        "rho",
        "Q",
        "g",
        "H"
      ],
      "note": "",
      "source": {
        "pages": [
          5
        ],
        "triangles": []
      }
    },
    "massPumpPower": {
      "name": "Teoretisk pumpeeffekt fra masseflow",
      "group": "Pumper og tryk",
      "symbol": "P_teo",
      "dimension": "power",
      "equation": "Pteo = Qₘ · g · H",
      "args": {
        "Q": {
          "symbol": "Q_m",
          "label": "Masseflow",
          "dimension": "massFlow"
        },
        "g": {
          "symbol": "g",
          "label": "Tyngdeacceleration",
          "dimension": "acceleration"
        },
        "H": {
          "symbol": "H_total",
          "label": "Samlet løftehøjde",
          "dimension": "length"
        }
      },
      "template": [
        "mul",
        "Q",
        "g",
        "H"
      ],
      "note": "",
      "source": {
        "pages": [
          5,
          11
        ],
        "triangles": [
          "T27"
        ]
      }
    },
    "inputPower": {
      "name": "Tilført effekt med virkningsgrad",
      "group": "Pumper og tryk",
      "symbol": "P_ind",
      "dimension": "power",
      "equation": "Pind = Pnyttig / η",
      "args": {
        "P": {
          "symbol": "P_nyttig",
          "label": "Nyttig eller teoretisk effekt",
          "dimension": "power"
        },
        "eta": {
          "symbol": "η",
          "label": "Virkningsgrad som decimaltal",
          "dimension": "scalar"
        }
      },
      "template": [
        "div",
        "P",
        "eta"
      ],
      "note": "Fx 80 % skrives 0,80. Virkningsgraden er større end 0 og højst 1.",
      "source": {
        "pages": [
          5,
          8,
          12
        ],
        "triangles": [
          "T30"
        ]
      }
    },
    "efficiency": {
      "name": "Virkningsgrad",
      "group": "Pumper og tryk",
      "symbol": "η",
      "dimension": "scalar",
      "equation": "η = Pnyttig / Pind",
      "args": {
        "out": {
          "symbol": "P_nyttig",
          "label": "Nyttig effekt",
          "dimension": "power"
        },
        "input": {
          "symbol": "P_ind",
          "label": "Tilført effekt",
          "dimension": "power"
        }
      },
      "template": [
        "div",
        "out",
        "input"
      ],
      "note": "Resultatet er et decimaltal; gang med 100 for procent.",
      "source": {
        "pages": [
          12
        ],
        "triangles": [
          "T30"
        ]
      }
    },
    "diameterGearRatio": {
      "name": "Udveksling fra diametre",
      "group": "Faststoftransport",
      "symbol": "f",
      "dimension": "scalar",
      "equation": "f = Dstor / Dlille",
      "args": {
        "large": {
          "symbol": "D_stor",
          "label": "Stor remskivediameter",
          "dimension": "length"
        },
        "small": {
          "symbol": "D_lille",
          "label": "Lille remskivediameter",
          "dimension": "length"
        }
      },
      "template": [
        "div",
        "large",
        "small"
      ],
      "note": "",
      "source": {
        "pages": [
          6,
          12
        ],
        "triangles": [
          "T31"
        ]
      }
    },
    "toothGearRatio": {
      "name": "Udveksling fra tandantal",
      "group": "Faststoftransport",
      "symbol": "f",
      "dimension": "scalar",
      "equation": "f = Zstor / Zlille",
      "args": {
        "large": {
          "symbol": "Z_stor",
          "label": "Tandantal på stort hjul",
          "dimension": "scalar"
        },
        "small": {
          "symbol": "Z_lille",
          "label": "Tandantal på lille hjul",
          "dimension": "scalar"
        }
      },
      "template": [
        "div",
        "large",
        "small"
      ],
      "note": "",
      "source": {
        "pages": [
          6,
          12
        ],
        "triangles": [
          "T32"
        ]
      }
    },
    "speedGearRatio": {
      "name": "Udveksling fra omdrejningstal",
      "group": "Faststoftransport",
      "symbol": "f",
      "dimension": "scalar",
      "equation": "f = nhurtig / nlangsom",
      "args": {
        "fast": {
          "symbol": "n_hurtig",
          "label": "Hurtigt omdrejningstal",
          "dimension": "rotationRate"
        },
        "slow": {
          "symbol": "n_langsom",
          "label": "Langsomt omdrejningstal",
          "dimension": "rotationRate"
        }
      },
      "template": [
        "div",
        "fast",
        "slow"
      ],
      "note": "",
      "source": {
        "pages": [
          6,
          12
        ],
        "triangles": [
          "T33"
        ]
      }
    },
    "gearedSpeed": {
      "name": "Omdrejningstal efter gear",
      "group": "Faststoftransport",
      "symbol": "n_ud",
      "dimension": "rotationRate",
      "equation": "nud = nind / f",
      "args": {
        "n": {
          "symbol": "n_ind",
          "label": "Omdrejningstal før gear",
          "dimension": "rotationRate"
        },
        "f": {
          "symbol": "f",
          "label": "Udvekslingsforhold",
          "dimension": "scalar"
        }
      },
      "template": [
        "div",
        "n",
        "f"
      ],
      "note": "Reduktionsgear: f = nind / nud. Brug samme tidsenhed for begge omdrejningstal.",
      "source": {
        "pages": [
          6,
          12
        ],
        "triangles": [
          "T33"
        ]
      }
    },
    "beltDrivenSpeed": {
      "name": "Drevet remskives omdrejningstal",
      "group": "Faststoftransport",
      "symbol": "n_2",
      "dimension": "rotationRate",
      "equation": "n₂ = D₁ · n₁ / D₂",
      "args": {
        "D1": {
          "symbol": "D_1",
          "label": "Drivende diameter",
          "dimension": "length"
        },
        "n1": {
          "symbol": "n_1",
          "label": "Drivende omdrejningstal",
          "dimension": "rotationRate"
        },
        "D2": {
          "symbol": "D_2",
          "label": "Drevet diameter",
          "dimension": "length"
        }
      },
      "template": [
        "div",
        [
          "mul",
          "D1",
          "n1"
        ],
        "D2"
      ],
      "note": "Remtræk uden slip.",
      "source": {
        "pages": [
          6
        ],
        "triangles": []
      }
    },
    "toothDrivenSpeed": {
      "name": "Drevet tandhjuls omdrejningstal",
      "group": "Faststoftransport",
      "symbol": "n_2",
      "dimension": "rotationRate",
      "equation": "n₂ = Z₁ · n₁ / Z₂",
      "args": {
        "Z1": {
          "symbol": "Z_1",
          "label": "Drivende tandantal",
          "dimension": "scalar"
        },
        "n1": {
          "symbol": "n_1",
          "label": "Drivende omdrejningstal",
          "dimension": "rotationRate"
        },
        "Z2": {
          "symbol": "Z_2",
          "label": "Drevet tandantal",
          "dimension": "scalar"
        }
      },
      "template": [
        "div",
        [
          "mul",
          "Z1",
          "n1"
        ],
        "Z2"
      ],
      "note": "",
      "source": {
        "pages": [
          6
        ],
        "triangles": []
      }
    },
    "beltSpeed": {
      "name": "Transportbåndets hastighed",
      "group": "Faststoftransport",
      "symbol": "v",
      "dimension": "velocity",
      "equation": "v = π · D · n",
      "args": {
        "D": {
          "symbol": "D",
          "label": "Drivtromlens diameter",
          "dimension": "length"
        },
        "n": {
          "symbol": "n",
          "label": "Drivtromlens omdrejningstal",
          "dimension": "rotationRate"
        }
      },
      "template": [
        "mul",
        "π",
        "D",
        "n"
      ],
      "note": "D i m og n i omdr./s giver m/s. Ved n i omdr./min fås m/min.",
      "source": {
        "pages": [
          6,
          12
        ],
        "triangles": [
          "T34"
        ]
      }
    },
    "bucketFlow": {
      "name": "Kopelevatorens volumenflow",
      "group": "Faststoftransport",
      "symbol": "Q_v",
      "dimension": "flow",
      "equation": "Qᵥ = Vkop · Nmeter · v · η",
      "args": {
        "V": {
          "symbol": "V_kop",
          "label": "Rumfang pr. kop",
          "dimension": "volume"
        },
        "N": {
          "symbol": "N_meter",
          "label": "Antal kopper pr. meter",
          "dimension": "countPerLength"
        },
        "v": {
          "symbol": "v",
          "label": "Bånd- eller kædehastighed",
          "dimension": "velocity"
        },
        "eta": {
          "symbol": "η",
          "label": "Fyldningsgrad som decimaltal",
          "dimension": "scalar"
        }
      },
      "template": [
        "mul",
        "V",
        "N",
        "v",
        "eta"
      ],
      "note": "SI: m³, kopper/m og m/s giver m³/s. Skolens k er alene omregning af tidsenheden.",
      "source": {
        "pages": [
          6
        ],
        "triangles": []
      }
    },
    "screwFlow": {
      "name": "Sneglens volumenflow",
      "group": "Faststoftransport",
      "symbol": "Q_v",
      "dimension": "flow",
      "equation": "Qᵥ = (π / 4) · (D² − d²) · s · n · η",
      "args": {
        "D": {
          "symbol": "D",
          "label": "Sneglens yderdiameter",
          "dimension": "length"
        },
        "d": {
          "symbol": "d",
          "label": "Akslens diameter",
          "dimension": "length"
        },
        "s": {
          "symbol": "s",
          "label": "Stigning pr. omdrejning",
          "dimension": "length"
        },
        "n": {
          "symbol": "n",
          "label": "Omdrejningstal",
          "dimension": "rotationRate"
        },
        "eta": {
          "symbol": "η",
          "label": "Fyldningsgrad som decimaltal",
          "dimension": "scalar"
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
          "sub",
          [
            "pow",
            "D",
            "2"
          ],
          [
            "pow",
            "d",
            "2"
          ]
        ],
        "s",
        "n",
        "eta"
      ],
      "note": "D > d. SI: n i omdr./s giver m³/s. Skolens n i omdr./min og faktor 60 giver m³/h.",
      "source": {
        "pages": [
          6
        ],
        "triangles": []
      }
    },
    "screwDiameter": {
      "name": "Sneglens yderdiameter fra flow",
      "group": "Faststoftransport",
      "symbol": "D",
      "dimension": "length",
      "equation": "D = √(d² + 4 · Qᵥ / (π · s · n · η))",
      "args": {
        "d": {
          "symbol": "d",
          "label": "Akslens diameter",
          "dimension": "length"
        },
        "Q": {
          "symbol": "Q_v",
          "label": "Volumenflow",
          "dimension": "flow"
        },
        "s": {
          "symbol": "s",
          "label": "Stigning",
          "dimension": "length"
        },
        "n": {
          "symbol": "n",
          "label": "Omdrejningstal",
          "dimension": "rotationRate"
        },
        "eta": {
          "symbol": "η",
          "label": "Fyldningsgrad som decimaltal",
          "dimension": "scalar"
        }
      },
      "template": [
        "sqrt",
        [
          "add",
          [
            "pow",
            "d",
            "2"
          ],
          [
            "div",
            [
              "mul",
              "4",
              "Q"
            ],
            [
              "mul",
              "π",
              "s",
              "n",
              "eta"
            ]
          ]
        ]
      ],
      "note": "Brug Qᵥ i m³/s og n i omdr./s.",
      "source": {
        "pages": [
          6
        ],
        "triangles": []
      }
    },
    "redlerFlow": {
      "name": "Redlerens volumenflow",
      "group": "Faststoftransport",
      "symbol": "Q_v",
      "dimension": "flow",
      "equation": "Qᵥ = A · v · η",
      "args": {
        "A": {
          "symbol": "A",
          "label": "Samlet tværsnitsareal",
          "dimension": "area"
        },
        "v": {
          "symbol": "v",
          "label": "Kædehastighed",
          "dimension": "velocity"
        },
        "eta": {
          "symbol": "η",
          "label": "Fyldningsgrad som decimaltal",
          "dimension": "scalar"
        }
      },
      "template": [
        "mul",
        "A",
        "v",
        "eta"
      ],
      "note": "SI: A i m² og v i m/s giver m³/s.",
      "source": {
        "pages": [
          6
        ],
        "triangles": []
      }
    },
    "temperatureDifference": {
      "name": "Temperaturændring",
      "group": "Varmelære",
      "symbol": "ΔT",
      "dimension": "temperatureChange",
      "equation": "ΔT = Tslut − Tstart",
      "args": {
        "end": {
          "symbol": "T_slut",
          "label": "Sluttemperatur",
          "dimension": "temperature"
        },
        "start": {
          "symbol": "T_start",
          "label": "Starttemperatur",
          "dimension": "temperature"
        }
      },
      "template": [
        "sub",
        "end",
        "start"
      ],
      "note": "Brug samme temperaturskala. Ved opvarmning er ΔT positiv. Ved køling kan den afgivne varmes størrelse bruge Tstart − Tslut.",
      "source": {
        "pages": [
          8
        ],
        "triangles": []
      }
    },
    "heatingEnergy": {
      "name": "Varmeenergi ved temperaturændring",
      "group": "Varmelære",
      "symbol": "q",
      "dimension": "energy",
      "equation": "q = m · cₚ · ΔT",
      "args": {
        "m": {
          "symbol": "m",
          "label": "Masse",
          "dimension": "mass"
        },
        "cp": {
          "symbol": "c_p",
          "label": "Specifik varmekapacitet",
          "dimension": "heatCapacity"
        },
        "dT": {
          "symbol": "ΔT",
          "label": "Temperaturændring",
          "dimension": "temperatureChange"
        }
      },
      "template": [
        "mul",
        "m",
        "cp",
        "dT"
      ],
      "note": "Ingen faseændring, konstant specifik varmekapacitet. SI: cₚ i J/(kg·K) giver J eller W. Skolens kJ/(kg·K) giver kJ eller kW. En temperaturforskel på 1 °C er 1 K.",
      "source": {
        "pages": [
          7,
          12
        ],
        "triangles": [
          "T35"
        ]
      }
    },
    "temperatureFromHeat": {
      "name": "Temperaturændring fra varmeenergi",
      "group": "Varmelære",
      "symbol": "ΔT",
      "dimension": "temperatureChange",
      "equation": "ΔT = q / (m · cₚ)",
      "args": {
        "q": {
          "symbol": "q",
          "label": "Varmeenergi",
          "dimension": "energy"
        },
        "m": {
          "symbol": "m",
          "label": "Masse",
          "dimension": "mass"
        },
        "cp": {
          "symbol": "c_p",
          "label": "Specifik varmekapacitet",
          "dimension": "heatCapacity"
        }
      },
      "template": [
        "div",
        "q",
        [
          "mul",
          "m",
          "cp"
        ]
      ],
      "note": "Ingen faseændring, konstant specifik varmekapacitet. SI: cₚ i J/(kg·K) giver J eller W. Skolens kJ/(kg·K) giver kJ eller kW. En temperaturforskel på 1 °C er 1 K.",
      "source": {
        "pages": [
          7
        ],
        "triangles": [
          "T35"
        ]
      }
    },
    "massFromHeat": {
      "name": "Masse fra varmeenergi",
      "group": "Varmelære",
      "symbol": "m",
      "dimension": "mass",
      "equation": "m = q / (cₚ · ΔT)",
      "args": {
        "q": {
          "symbol": "q",
          "label": "Varmeenergi",
          "dimension": "energy"
        },
        "cp": {
          "symbol": "c_p",
          "label": "Specifik varmekapacitet",
          "dimension": "heatCapacity"
        },
        "dT": {
          "symbol": "ΔT",
          "label": "Temperaturændring",
          "dimension": "temperatureChange"
        }
      },
      "template": [
        "div",
        "q",
        [
          "mul",
          "cp",
          "dT"
        ]
      ],
      "note": "Ingen faseændring, konstant specifik varmekapacitet. SI: cₚ i J/(kg·K) giver J eller W. Skolens kJ/(kg·K) giver kJ eller kW. En temperaturforskel på 1 °C er 1 K.",
      "source": {
        "pages": [
          7
        ],
        "triangles": [
          "T35"
        ]
      }
    },
    "capacityFromHeat": {
      "name": "Specifik varmekapacitet fra varmeenergi",
      "group": "Varmelære",
      "symbol": "c_p",
      "dimension": "heatCapacity",
      "equation": "cₚ = q / (m · ΔT)",
      "args": {
        "q": {
          "symbol": "q",
          "label": "Varmeenergi",
          "dimension": "energy"
        },
        "m": {
          "symbol": "m",
          "label": "Masse",
          "dimension": "mass"
        },
        "dT": {
          "symbol": "ΔT",
          "label": "Temperaturændring",
          "dimension": "temperatureChange"
        }
      },
      "template": [
        "div",
        "q",
        [
          "mul",
          "m",
          "dT"
        ]
      ],
      "note": "Ingen faseændring, konstant specifik varmekapacitet. SI: cₚ i J/(kg·K) giver J eller W. Skolens kJ/(kg·K) giver kJ eller kW. En temperaturforskel på 1 °C er 1 K.",
      "source": {
        "pages": [
          7
        ],
        "triangles": [
          "T35"
        ]
      }
    },
    "phaseEnergy": {
      "name": "Varmeenergi ved faseændring",
      "group": "Varmelære",
      "symbol": "q",
      "dimension": "energy",
      "equation": "q = m · Hf",
      "args": {
        "m": {
          "symbol": "m",
          "label": "Masse",
          "dimension": "mass"
        },
        "H": {
          "symbol": "H_f",
          "label": "Specifik faseændringsenergi",
          "dimension": "specificEnergy"
        }
      },
      "template": [
        "mul",
        "m",
        "H"
      ],
      "note": "Kun faseændringen. Brug Hf ved stoffets aktuelle tryk og temperatur. J/kg giver J; kJ/kg giver kJ.",
      "source": {
        "pages": [
          12
        ],
        "triangles": [
          "T36"
        ]
      }
    },
    "heatFlowPower": {
      "name": "Varmeeffekt ved gennemstrømning",
      "group": "Varmelære",
      "symbol": "P",
      "dimension": "power",
      "equation": "P = Qₘ · cₚ · ΔT",
      "args": {
        "Q": {
          "symbol": "Q_m",
          "label": "Produktets masseflow",
          "dimension": "massFlow"
        },
        "cp": {
          "symbol": "c_p",
          "label": "Specifik varmekapacitet",
          "dimension": "heatCapacity"
        },
        "dT": {
          "symbol": "ΔT",
          "label": "Temperaturændring",
          "dimension": "temperatureChange"
        }
      },
      "template": [
        "mul",
        "Q",
        "cp",
        "dT"
      ],
      "note": "Ingen faseændring, konstant specifik varmekapacitet. SI: cₚ i J/(kg·K) giver J eller W. Skolens kJ/(kg·K) giver kJ eller kW. En temperaturforskel på 1 °C er 1 K.",
      "source": {
        "pages": [
          7,
          8,
          13
        ],
        "triangles": [
          "T38"
        ]
      }
    },
    "temperatureFromPower": {
      "name": "Temperaturændring fra varmeeffekt",
      "group": "Varmelære",
      "symbol": "ΔT",
      "dimension": "temperatureChange",
      "equation": "ΔT = P / (Qₘ · cₚ)",
      "args": {
        "P": {
          "symbol": "P",
          "label": "Varmeeffekt",
          "dimension": "power"
        },
        "Q": {
          "symbol": "Q_m",
          "label": "Masseflow",
          "dimension": "massFlow"
        },
        "cp": {
          "symbol": "c_p",
          "label": "Specifik varmekapacitet",
          "dimension": "heatCapacity"
        }
      },
      "template": [
        "div",
        "P",
        [
          "mul",
          "Q",
          "cp"
        ]
      ],
      "note": "Ingen faseændring, konstant specifik varmekapacitet. SI: cₚ i J/(kg·K) giver J eller W. Skolens kJ/(kg·K) giver kJ eller kW. En temperaturforskel på 1 °C er 1 K.",
      "source": {
        "pages": [
          7
        ],
        "triangles": [
          "T38"
        ]
      }
    },
    "massFlowFromHeat": {
      "name": "Masseflow fra varmeeffekt",
      "group": "Varmelære",
      "symbol": "Q_m",
      "dimension": "massFlow",
      "equation": "Qₘ = P / (cₚ · ΔT)",
      "args": {
        "P": {
          "symbol": "P",
          "label": "Varmeeffekt",
          "dimension": "power"
        },
        "cp": {
          "symbol": "c_p",
          "label": "Specifik varmekapacitet",
          "dimension": "heatCapacity"
        },
        "dT": {
          "symbol": "ΔT",
          "label": "Temperaturændring",
          "dimension": "temperatureChange"
        }
      },
      "template": [
        "div",
        "P",
        [
          "mul",
          "cp",
          "dT"
        ]
      ],
      "note": "Ingen faseændring, konstant specifik varmekapacitet. SI: cₚ i J/(kg·K) giver J eller W. Skolens kJ/(kg·K) giver kJ eller kW. En temperaturforskel på 1 °C er 1 K.",
      "source": {
        "pages": [
          7
        ],
        "triangles": [
          "T38"
        ]
      }
    },
    "capacityFromPower": {
      "name": "Specifik varmekapacitet fra varmeeffekt",
      "group": "Varmelære",
      "symbol": "c_p",
      "dimension": "heatCapacity",
      "equation": "cₚ = P / (Qₘ · ΔT)",
      "args": {
        "P": {
          "symbol": "P",
          "label": "Varmeeffekt",
          "dimension": "power"
        },
        "Q": {
          "symbol": "Q_m",
          "label": "Masseflow",
          "dimension": "massFlow"
        },
        "dT": {
          "symbol": "ΔT",
          "label": "Temperaturændring",
          "dimension": "temperatureChange"
        }
      },
      "template": [
        "div",
        "P",
        [
          "mul",
          "Q",
          "dT"
        ]
      ],
      "note": "Ingen faseændring, konstant specifik varmekapacitet. SI: cₚ i J/(kg·K) giver J eller W. Skolens kJ/(kg·K) giver kJ eller kW. En temperaturforskel på 1 °C er 1 K.",
      "source": {
        "pages": [
          7
        ],
        "triangles": [
          "T38"
        ]
      }
    },
    "phasePower": {
      "name": "Effekt ved faseændring",
      "group": "Varmelære",
      "symbol": "P",
      "dimension": "power",
      "equation": "P = Qₘ · Hf",
      "args": {
        "Q": {
          "symbol": "Q_m",
          "label": "Masseflow",
          "dimension": "massFlow"
        },
        "H": {
          "symbol": "H_f",
          "label": "Specifik faseændringsenergi",
          "dimension": "specificEnergy"
        }
      },
      "template": [
        "mul",
        "Q",
        "H"
      ],
      "note": "Kun faseændringen. Qₘ i kg/s og Hf i J/kg giver W.",
      "source": {
        "pages": [
          13
        ],
        "triangles": [
          "T39"
        ]
      }
    },
    "fuelFlow": {
      "name": "Brændselsforbrug fra effekt",
      "group": "Varmelære",
      "symbol": "Q_brændsel",
      "dimension": "massFlow",
      "equation": "Qbrændsel = Pind / Hbrændværdi",
      "args": {
        "P": {
          "symbol": "P_ind",
          "label": "Tilført effekt før tab",
          "dimension": "power"
        },
        "H": {
          "symbol": "H_brændværdi",
          "label": "Brændværdi",
          "dimension": "specificEnergy"
        }
      },
      "template": [
        "div",
        "P",
        "H"
      ],
      "note": "Indsæt først virkningsgraden i Pind, hvis du kun kender nyttig varmeeffekt. W og J/kg giver kg/s.",
      "source": {
        "pages": [
          8
        ],
        "triangles": []
      }
    },
    "mixTemperature": {
      "name": "Blandingstemperatur",
      "group": "Varmelære",
      "symbol": "T_bl",
      "dimension": "temperature",
      "equation": "Tbl = (cₚ₁ · m₁ · T₁ + cₚ₂ · m₂ · T₂) / (cₚ₁ · m₁ + cₚ₂ · m₂)",
      "args": {
        "cp1": {
          "symbol": "c_p1",
          "label": "Første specifikke varmekapacitet",
          "dimension": "heatCapacity"
        },
        "m1": {
          "symbol": "m_1",
          "label": "Første masse",
          "dimension": "mass"
        },
        "T1": {
          "symbol": "T_1",
          "label": "Første temperatur",
          "dimension": "temperature"
        },
        "cp2": {
          "symbol": "c_p2",
          "label": "Anden specifikke varmekapacitet",
          "dimension": "heatCapacity"
        },
        "m2": {
          "symbol": "m_2",
          "label": "Anden masse",
          "dimension": "mass"
        },
        "T2": {
          "symbol": "T_2",
          "label": "Anden temperatur",
          "dimension": "temperature"
        }
      },
      "template": [
        "div",
        [
          "add",
          [
            "mul",
            "cp1",
            "m1",
            "T1"
          ],
          [
            "mul",
            "cp2",
            "m2",
            "T2"
          ]
        ],
        [
          "add",
          [
            "mul",
            "cp1",
            "m1"
          ],
          [
            "mul",
            "cp2",
            "m2"
          ]
        ]
      ],
      "note": "Ingen varmetab, faseændring eller blandingsvarme; konstante varmekapaciteter. Begge temperaturer på samme skala: K eller °C. Resultatet får samme skala.",
      "source": {
        "pages": [
          7
        ],
        "triangles": []
      }
    },
    "mixCapacity": {
      "name": "Blandingens specifikke varmekapacitet",
      "group": "Varmelære",
      "symbol": "c_pbl",
      "dimension": "heatCapacity",
      "equation": "cₚbl = (cₚ₁ · m₁ + cₚ₂ · m₂) / (m₁ + m₂)",
      "args": {
        "cp1": {
          "symbol": "c_p1",
          "label": "Første specifikke varmekapacitet",
          "dimension": "heatCapacity"
        },
        "m1": {
          "symbol": "m_1",
          "label": "Første masse",
          "dimension": "mass"
        },
        "cp2": {
          "symbol": "c_p2",
          "label": "Anden specifikke varmekapacitet",
          "dimension": "heatCapacity"
        },
        "m2": {
          "symbol": "m_2",
          "label": "Anden masse",
          "dimension": "mass"
        }
      },
      "template": [
        "div",
        [
          "add",
          [
            "mul",
            "cp1",
            "m1"
          ],
          [
            "mul",
            "cp2",
            "m2"
          ]
        ],
        [
          "add",
          "m1",
          "m2"
        ]
      ],
      "note": "Massevægtet middel ved konstante specifikke varmekapaciteter.",
      "source": {
        "pages": [
          7
        ],
        "triangles": []
      }
    },
    "mixComponentMass": {
      "name": "Komponentmasse fra blandingens varmeindhold",
      "group": "Varmelære",
      "symbol": "m_1",
      "dimension": "mass",
      "equation": "m₁ = qtotal / (cₚbl · Tᵣbl) − m₂",
      "args": {
        "q": {
          "symbol": "q_total",
          "label": "Varmeindhold fra fælles reference",
          "dimension": "energy"
        },
        "cp": {
          "symbol": "c_pbl",
          "label": "Blandingens specifikke varmekapacitet",
          "dimension": "heatCapacity"
        },
        "T": {
          "symbol": "T_rbl",
          "label": "Blandingens temperatur over referencen",
          "dimension": "temperatureChange"
        },
        "m2": {
          "symbol": "m_2",
          "label": "Anden masse",
          "dimension": "mass"
        }
      },
      "template": [
        "sub",
        [
          "div",
          "q",
          [
            "mul",
            "cp",
            "T"
          ]
        ],
        "m2"
      ],
      "note": "Skolens qtotal og temperatur skal være målt relativt til samme temperaturreference. Ikke en vilkårlig tilført varmemængde.",
      "source": {
        "pages": [
          7
        ],
        "triangles": []
      }
    },
    "waterHeatExchanger": {
      "name": "Varmemediets masseflow i varmeveksler",
      "group": "Varmelære",
      "symbol": "Q_medie",
      "dimension": "massFlow",
      "equation": "Qmedie = (Qprodukt · cₚprodukt · ΔTprodukt) / (cₚmedie · ΔTmedie · η)",
      "args": {
        "Q": {
          "symbol": "Q_produkt",
          "label": "Produktets masseflow",
          "dimension": "massFlow"
        },
        "cp": {
          "symbol": "c_p",
          "label": "Specifik varmekapacitet",
          "dimension": "heatCapacity"
        },
        "dT": {
          "symbol": "ΔT",
          "label": "Temperaturændring",
          "dimension": "temperatureChange"
        },
        "cpm": {
          "symbol": "c_pm",
          "label": "Mediets specifikke varmekapacitet",
          "dimension": "heatCapacity"
        },
        "dTm": {
          "symbol": "ΔT_medie",
          "label": "Mediets temperaturfald, positivt",
          "dimension": "temperatureChange"
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
          "Q",
          "cp",
          "dT"
        ],
        [
          "mul",
          "cpm",
          "dTm",
          "eta"
        ]
      ],
      "note": "Varmebalance uden faseændring. Brug positive temperaturændringer for optaget og afgivet varmes størrelse og samme energienheder.",
      "source": {
        "pages": [
          8
        ],
        "triangles": [
          "T38"
        ]
      }
    },
    "steamHeatPower": {
      "name": "Varmeeffekt fra damp og kondensat",
      "group": "Varmelære",
      "symbol": "P_nyttig",
      "dimension": "power",
      "equation": "Pnyttig = (Gₘ · Hf + Lₘ · cₚ · ΔT) · η",
      "args": {
        "G": {
          "symbol": "G_m",
          "label": "Dampens masseflow",
          "dimension": "massFlow"
        },
        "H": {
          "symbol": "H_f",
          "label": "Kondensationsenergi",
          "dimension": "specificEnergy"
        },
        "L": {
          "symbol": "L_m",
          "label": "Kondensatets masseflow",
          "dimension": "massFlow"
        },
        "cp": {
          "symbol": "c_p",
          "label": "Specifik varmekapacitet",
          "dimension": "heatCapacity"
        },
        "dT": {
          "symbol": "ΔT_kond",
          "label": "Kondensatets temperaturfald, positivt",
          "dimension": "temperatureChange"
        },
        "eta": {
          "symbol": "η",
          "label": "Virkningsgrad",
          "dimension": "scalar"
        }
      },
      "template": [
        "mul",
        [
          "add",
          [
            "mul",
            "G",
            "H"
          ],
          [
            "mul",
            "L",
            "cp",
            "dT"
          ]
        ],
        "eta"
      ],
      "note": "Faseændring plus efterfølgende afkøling af kondensatet. Damp og kondensat har normalt samme masseflow ved stationær, fuldstændig kondensation.",
      "source": {
        "pages": [
          8
        ],
        "triangles": [
          "T38",
          "T39"
        ]
      }
    },
    "innerDiameter": {
      "name": "Indvendig diameter fra udvendig",
      "group": "Geometri",
      "symbol": "D_indre",
      "dimension": "length",
      "equation": "Dindre = Dydre − 2 · tradial",
      "args": {
        "D": {
          "symbol": "D_ydre",
          "label": "Udvendig diameter",
          "dimension": "length"
        },
        "t": {
          "symbol": "t_radial",
          "label": "Radial godstykkelse pr. side",
          "dimension": "length"
        }
      },
      "template": [
        "sub",
        "D",
        [
          "mul",
          "2",
          "t"
        ]
      ],
      "note": "Diameteren måles fra side til side, så tykkelsen trækkes fra to gange. Dydre skal være større end 2 · tradial. På cylinder, rør og kugledele er tradial vægtykkelsen. På skrå vægge bruges tykkelsen i diameterretningen ved samme endeflade."
    },
    "outerDiameter": {
      "name": "Udvendig diameter fra indvendig",
      "group": "Geometri",
      "symbol": "D_ydre",
      "dimension": "length",
      "equation": "Dydre = Dindre + 2 · tradial",
      "args": {
        "D": {
          "symbol": "D_indre",
          "label": "Indvendig diameter",
          "dimension": "length"
        },
        "t": {
          "symbol": "t_radial",
          "label": "Radial godstykkelse pr. side",
          "dimension": "length"
        }
      },
      "template": [
        "add",
        "D",
        [
          "mul",
          "2",
          "t"
        ]
      ],
      "note": "På skrå vægge er den radiale tykkelse i diameterretningen ikke det samme som pladetykkelsen vinkelret på væggen."
    },
    "radialThickness": {
      "name": "Radial godstykkelse på skrå væg",
      "group": "Geometri",
      "symbol": "t_radial",
      "dimension": "length",
      "equation": "tradial = tplade · s / h",
      "args": {
        "t": {
          "symbol": "t_plade",
          "label": "Pladetykkelse vinkelret på væggen",
          "dimension": "length"
        },
        "s": {
          "symbol": "s",
          "label": "Skrå længde ved kendt væghældning",
          "dimension": "length"
        },
        "h": {
          "symbol": "h",
          "label": "Tilhørende aksial højde",
          "dimension": "length"
        }
      },
      "template": [
        "div",
        [
          "mul",
          "t",
          "s"
        ],
        "h"
      ],
      "note": "Parallelle, rette vægsider. s og h beskriver samme væghældning. Den radiale afstand er målt ved samme tværsnitsplan. Brug ikke en ukendt indvendig diameter til at definere sin egen omregning."
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
    },
    "energy": {
      "name": "Energi",
      "unit": "J"
    },
    "torque": {
      "name": "Drejningsmoment",
      "unit": "N·m"
    },
    "massMoment": {
      "name": "Massemoment",
      "unit": "kg·m"
    },
    "rotationRate": {
      "name": "Omdrejningstal",
      "unit": "omdr./s"
    },
    "countPerLength": {
      "name": "Antal pr. længde",
      "unit": "1/m"
    },
    "temperature": {
      "name": "Temperatur",
      "unit": "K"
    },
    "temperatureChange": {
      "name": "Temperaturforskel",
      "unit": "K"
    },
    "heatCapacity": {
      "name": "Specifik varmekapacitet",
      "unit": "J/(kg·K)"
    },
    "specificEnergy": {
      "name": "Specifik energi",
      "unit": "J/kg"
    }
  },
  "SCHOOL_SOURCE": {
    "title": "Formelsamling · Industri- og procesoperatøruddannelsen · P&P",
    "school": "EUC-Nordvestsjælland, Processkolen i Kalundborg",
    "date": "14-02-2017",
    "pages": 13
  },
  "UNIT_GUIDE": [
    [
      "Pladetykkelse",
      "mm → m",
      "÷ 1000",
      "Fx 3 mm = 0,003 m"
    ],
    [
      "Massefylde",
      "ton/m³ → kg/m³",
      "× 1000",
      "1 ton/m³ = 1 kg/L = 1 g/cm³ = 1000 kg/m³"
    ],
    [
      "Masse",
      "kg → ton",
      "÷ 1000",
      "A i m² · t i m · ρ i kg/m³ giver kg"
    ],
    [
      "Volumenflow",
      "L/min → m³/h",
      "× 0,06",
      "Omregning fra samlingens side 13"
    ],
    [
      "Volumenflow",
      "m³/s → m³/h",
      "× 3600",
      "m³/h → m³/s: divider med 3600"
    ],
    [
      "Masseflow",
      "kg/s → ton/h",
      "× 3,6",
      "kg/s → kg/h: gang med 3600"
    ],
    [
      "Omdrejningstal",
      "omdr./min → omdr./s",
      "÷ 60",
      "SI-formler for bånd og snegl bruger omdr./s"
    ],
    [
      "Tryk",
      "kPa → Pa",
      "× 1000",
      "ρ i kg/m³ og g i m/s² kræver Δp i Pa"
    ],
    [
      "Energi og effekt",
      "kJ → J · kW → W",
      "× 1000",
      "cₚ i kJ/(kg·K) giver kJ eller kW; SI bruger J/(kg·K)"
    ],
    [
      "Energi",
      "kWh → kJ",
      "× 3600",
      "1 kWh = 3 600 000 J"
    ],
    [
      "Effekt",
      "hk → W",
      "≈ × 736",
      "Samlingens afrundede omregningsfaktor"
    ],
    [
      "Temperaturændring",
      "Δ°C → ΔK",
      "Samme tal",
      "Gælder forskelle, ikke absolutte temperaturer"
    ]
  ]
};});
