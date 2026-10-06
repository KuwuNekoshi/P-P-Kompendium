/* SRO catalogue transcribed from the 22 supplied pages; qualifications are visible with each formula. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.PPCatalog=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){return {
  "FORMULAS": {
    "knownResistance": {
      "name": "Modstand · kendt værdi",
      "group": "Elektricitet",
      "symbol": "R",
      "dimension": "resistance",
      "args": {
        "R": {
          "symbol": "R",
          "label": "Modstand",
          "dimension": "resistance"
        }
      },
      "template": "R",
      "note": "Værdien kan bruges som en selvstændig reference i andre formler.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037329.jpg"
      },
      "hidden": true
    },
    "knownVoltage": {
      "name": "Forsyningsspænding · kendt værdi",
      "group": "Elektricitet",
      "symbol": "U",
      "dimension": "voltage",
      "args": {
        "U": {
          "symbol": "U",
          "label": "Spænding",
          "dimension": "voltage"
        }
      },
      "template": "U",
      "note": "",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037329.jpg"
      },
      "hidden": true
    },
    "ohm": {
      "name": "Ohms lov",
      "group": "Elektricitet",
      "symbol": "U",
      "dimension": "voltage",
      "args": {
        "R": {
          "symbol": "R",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "I": {
          "symbol": "I",
          "label": "Strøm",
          "dimension": "current"
        }
      },
      "template": [
        "mul",
        "R",
        "I"
      ],
      "note": "Gælder en ohmsk modstand. Isolér I eller R efter behov.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037329.jpg"
      }
    },
    "powerUI": {
      "name": "Elektrisk effekt · U og I",
      "group": "Elektricitet",
      "symbol": "P",
      "dimension": "power",
      "args": {
        "U": {
          "symbol": "U",
          "label": "Spænding",
          "dimension": "voltage"
        },
        "I": {
          "symbol": "I",
          "label": "Strøm",
          "dimension": "current"
        }
      },
      "template": [
        "mul",
        "U",
        "I"
      ],
      "note": "DC eller en rent resistiv belastning. Brug trefaseformlen til en trefaset motor.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037329.jpg"
      }
    },
    "powerUR": {
      "name": "Elektrisk effekt · U og R",
      "group": "Elektricitet",
      "symbol": "P",
      "dimension": "power",
      "args": {
        "U": {
          "symbol": "U",
          "label": "Spænding",
          "dimension": "voltage"
        },
        "R": {
          "symbol": "R",
          "label": "Modstand",
          "dimension": "resistance"
        }
      },
      "template": [
        "div",
        [
          "pow",
          "U",
          "2"
        ],
        "R"
      ],
      "note": "Gælder en ohmsk modstand.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037329.jpg"
      }
    },
    "powerRI": {
      "name": "Elektrisk effekt · R og I",
      "group": "Elektricitet",
      "symbol": "P",
      "dimension": "power",
      "args": {
        "R": {
          "symbol": "R",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "I": {
          "symbol": "I",
          "label": "Strøm",
          "dimension": "current"
        }
      },
      "template": [
        "mul",
        "R",
        [
          "pow",
          "I",
          "2"
        ]
      ],
      "note": "",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037329.jpg"
      }
    },
    "series2": {
      "name": "2 modstande i serie",
      "group": "Elektricitet",
      "symbol": "R_samlet",
      "dimension": "resistance",
      "args": {
        "R1": {
          "symbol": "R_1",
          "label": "Modstand 1",
          "dimension": "resistance"
        },
        "R2": {
          "symbol": "R_2",
          "label": "Modstand 2",
          "dimension": "resistance"
        }
      },
      "template": [
        "add",
        "R1",
        "R2"
      ],
      "note": "Samme strøm gennem modstandene. Spændingsfaldene summeres.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037330.jpg"
      }
    },
    "parallel2": {
      "name": "2 modstande i parallel",
      "group": "Elektricitet",
      "symbol": "R_samlet",
      "dimension": "resistance",
      "args": {
        "R1": {
          "symbol": "R_1",
          "label": "Modstand 1",
          "dimension": "resistance"
        },
        "R2": {
          "symbol": "R_2",
          "label": "Modstand 2",
          "dimension": "resistance"
        }
      },
      "template": [
        "div",
        "1",
        [
          "add",
          [
            "div",
            "1",
            "R1"
          ],
          [
            "div",
            "1",
            "R2"
          ]
        ]
      ],
      "note": "Samme spænding over grenene. Grenstrømmene summeres. Modstandene skal være positive.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037330.jpg"
      }
    },
    "series3": {
      "name": "3 modstande i serie",
      "group": "Elektricitet",
      "symbol": "R_samlet",
      "dimension": "resistance",
      "args": {
        "R1": {
          "symbol": "R_1",
          "label": "Modstand 1",
          "dimension": "resistance"
        },
        "R2": {
          "symbol": "R_2",
          "label": "Modstand 2",
          "dimension": "resistance"
        },
        "R3": {
          "symbol": "R_3",
          "label": "Modstand 3",
          "dimension": "resistance"
        }
      },
      "template": [
        "add",
        "R1",
        "R2",
        "R3"
      ],
      "note": "Samme strøm gennem modstandene. Spændingsfaldene summeres.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037330.jpg"
      }
    },
    "parallel3": {
      "name": "3 modstande i parallel",
      "group": "Elektricitet",
      "symbol": "R_samlet",
      "dimension": "resistance",
      "args": {
        "R1": {
          "symbol": "R_1",
          "label": "Modstand 1",
          "dimension": "resistance"
        },
        "R2": {
          "symbol": "R_2",
          "label": "Modstand 2",
          "dimension": "resistance"
        },
        "R3": {
          "symbol": "R_3",
          "label": "Modstand 3",
          "dimension": "resistance"
        }
      },
      "template": [
        "div",
        "1",
        [
          "add",
          [
            "div",
            "1",
            "R1"
          ],
          [
            "div",
            "1",
            "R2"
          ],
          [
            "div",
            "1",
            "R3"
          ]
        ]
      ],
      "note": "Samme spænding over grenene. Grenstrømmene summeres. Modstandene skal være positive.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037330.jpg"
      }
    },
    "voltageSum": {
      "name": "Spændingsfald i serie",
      "group": "Elektricitet",
      "symbol": "U_samlet",
      "dimension": "voltage",
      "args": {
        "U1": {
          "symbol": "U_1",
          "label": "Spændingsfald 1",
          "dimension": "voltage"
        },
        "U2": {
          "symbol": "U_2",
          "label": "Spændingsfald 2",
          "dimension": "voltage"
        },
        "U3": {
          "symbol": "U_3",
          "label": "Spændingsfald 3",
          "dimension": "voltage"
        }
      },
      "template": [
        "add",
        "U1",
        "U2",
        "U3"
      ],
      "note": "",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037330.jpg"
      }
    },
    "currentSum": {
      "name": "Grenstrømme i parallel",
      "group": "Elektricitet",
      "symbol": "I_samlet",
      "dimension": "current",
      "args": {
        "I1": {
          "symbol": "I_1",
          "label": "Grenstrøm 1",
          "dimension": "current"
        },
        "I2": {
          "symbol": "I_2",
          "label": "Grenstrøm 2",
          "dimension": "current"
        },
        "I3": {
          "symbol": "I_3",
          "label": "Grenstrøm 3",
          "dimension": "current"
        }
      },
      "template": [
        "add",
        "I1",
        "I2",
        "I3"
      ],
      "note": "",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037330.jpg"
      }
    },
    "voltageDivider": {
      "name": "Spændingsdeler",
      "group": "Elektricitet",
      "symbol": "U_2",
      "dimension": "voltage",
      "args": {
        "U": {
          "symbol": "U",
          "label": "Spænding",
          "dimension": "voltage"
        },
        "R1": {
          "symbol": "R_1",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R2": {
          "symbol": "R_2",
          "label": "Modstand",
          "dimension": "resistance"
        }
      },
      "template": [
        "mul",
        "U",
        [
          "div",
          "R2",
          [
            "add",
            "R1",
            "R2"
          ]
        ]
      ],
      "note": "Udledt fra Ohms lov for to seriemodstande uden ekstra belastning på udgangen.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037330.jpg"
      }
    },
    "syncSpeed": {
      "name": "Synkront omdrejningstal",
      "group": "Motorer",
      "symbol": "n_s",
      "dimension": "rotationRate",
      "args": {
        "f": {
          "symbol": "f",
          "label": "Frekvens",
          "dimension": "frequency",
          "value": "50"
        },
        "p": {
          "symbol": "p",
          "label": "Antal polpar",
          "dimension": "scalar",
          "value": "2"
        }
      },
      "template": [
        "div",
        "f",
        "p"
      ],
      "note": "p er antal polpar: 1 polpar = 2 poler. Med resultat i omdr./min svarer formlen til nₛ = 60 · f / p.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037331.jpg"
      }
    },
    "motorSpeed": {
      "name": "Motorens omdrejningstal med slip",
      "group": "Motorer",
      "symbol": "n",
      "dimension": "rotationRate",
      "args": {
        "ns": {
          "symbol": "n_s",
          "label": "Synkront omdrejningstal",
          "dimension": "rotationRate",
          "unit": "rpm"
        },
        "S": {
          "symbol": "S",
          "label": "Slip",
          "dimension": "scalar",
          "unit": "percent"
        }
      },
      "template": [
        "mul",
        "ns",
        [
          "sub",
          "1",
          "S"
        ]
      ],
      "note": "Slip indtastes som procent eller decimal efter dit enhedsvalg.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037331.jpg"
      }
    },
    "motorSlip": {
      "name": "Slip i asynkronmotor",
      "group": "Motorer",
      "symbol": "S",
      "dimension": "scalar",
      "args": {
        "ns": {
          "symbol": "n_s",
          "label": "Synkront omdrejningstal",
          "dimension": "rotationRate",
          "unit": "rpm"
        },
        "n": {
          "symbol": "n",
          "label": "Omdrejningstal ved belastning",
          "dimension": "rotationRate",
          "unit": "rpm"
        }
      },
      "template": [
        "div",
        [
          "sub",
          "ns",
          "n"
        ],
        "ns"
      ],
      "note": "Nævneren er det synkrone omdrejningstal nₛ. Ved normal motordrift er 0 ≤ n ≤ nₛ.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037331.jpg"
      },
      "resultUnit": "percent"
    },
    "threePhasePower": {
      "name": "Optagen effekt · trefaset motor",
      "group": "Motorer",
      "symbol": "P_1",
      "dimension": "power",
      "args": {
        "U": {
          "symbol": "U_net",
          "label": "Netspænding mellem faser",
          "dimension": "voltage"
        },
        "I": {
          "symbol": "I_norm",
          "label": "Linjestrøm",
          "dimension": "current"
        },
        "cos": {
          "symbol": "cosφ",
          "label": "Effektfaktor cos φ",
          "dimension": "scalar"
        }
      },
      "template": [
        "mul",
        [
          "sqrt",
          "3"
        ],
        "U",
        "I",
        "cos"
      ],
      "note": "Symmetrisk trefaset belastning. Angiv cos φ som faktor, fx 0,82, ikke vinklen i grader.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037331.jpg"
      }
    },
    "shaftPower": {
      "name": "Afgiven effekt · akseleffekt",
      "group": "Motorer",
      "symbol": "P_2",
      "dimension": "power",
      "args": {
        "P1": {
          "symbol": "P_1",
          "label": "Optagen effekt",
          "dimension": "power"
        },
        "eta": {
          "symbol": "η",
          "label": "Virkningsgrad",
          "dimension": "scalar",
          "unit": "percent"
        }
      },
      "template": [
        "mul",
        "P1",
        "eta"
      ],
      "note": "Virkningsgraden ligger mellem 0 og 1 (0–100 %).",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037331.jpg"
      }
    },
    "efficiency": {
      "name": "Motorens virkningsgrad",
      "group": "Motorer",
      "symbol": "η",
      "dimension": "scalar",
      "args": {
        "P2": {
          "symbol": "P_2",
          "label": "Akseleffekt",
          "dimension": "power"
        },
        "P1": {
          "symbol": "P_1",
          "label": "Optagen effekt",
          "dimension": "power"
        }
      },
      "template": [
        "div",
        "P2",
        "P1"
      ],
      "note": "",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037331.jpg"
      },
      "resultUnit": "percent"
    },
    "starPower": {
      "name": "Effekt i stjerne ved samme netspænding",
      "group": "Motorer",
      "symbol": "P_Y",
      "dimension": "power",
      "args": {
        "Pdelta": {
          "symbol": "P_Δ",
          "label": "Effekt i trekant",
          "dimension": "power"
        }
      },
      "template": [
        "div",
        "Pdelta",
        "3"
      ],
      "note": "Sammenligning ved samme netspænding og samme viklingsimpedans. Ikke en generel regel for mærkeeffekten ved to forskellige mærkespændinger.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037332.jpg"
      }
    },
    "starCurrent": {
      "name": "Linjestrøm i stjerne ved samme netspænding",
      "group": "Motorer",
      "symbol": "I_Y",
      "dimension": "current",
      "args": {
        "Idelta": {
          "symbol": "I_Δ",
          "label": "Linjestrøm i trekant",
          "dimension": "current"
        }
      },
      "template": [
        "div",
        "Idelta",
        "3"
      ],
      "note": "For samme netspænding og viklingsimpedans; typisk sammenligning ved start.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037332.jpg"
      }
    },
    "startDelta": {
      "name": "Startstrøm · trekant, skolens skøn",
      "group": "Motorer",
      "symbol": "I_start",
      "dimension": "current",
      "args": {
        "I": {
          "symbol": "I_norm",
          "label": "Normalstrøm",
          "dimension": "current"
        },
        "k": {
          "symbol": "k",
          "label": "Startfaktor",
          "dimension": "scalar",
          "value": "6"
        }
      },
      "template": [
        "mul",
        "k",
        "I"
      ],
      "note": "Skolens opgaver bruger normalt k = 6. Virkelig startstrøm afhænger af motoren; noterne angiver cirka 3–7 gange normalstrømmen.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037332.jpg"
      }
    },
    "startStar": {
      "name": "Startstrøm · stjerne, skolens skøn",
      "group": "Motorer",
      "symbol": "I_start",
      "dimension": "current",
      "args": {
        "I": {
          "symbol": "I_norm",
          "label": "Normalstrøm",
          "dimension": "current"
        },
        "k": {
          "symbol": "k",
          "label": "Startfaktor",
          "dimension": "scalar",
          "value": "2"
        }
      },
      "template": [
        "mul",
        "k",
        "I"
      ],
      "note": "Skolens opgaver bruger normalt k = 2, når trekantstart regnes som 6 gange normalstrømmen.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037332.jpg"
      }
    },
    "starWindingVoltage": {
      "name": "Stjerne · spænding over en vikling",
      "group": "Motorer",
      "symbol": "U_fase",
      "dimension": "voltage",
      "args": {
        "U": {
          "symbol": "U_net",
          "label": "Netspænding mellem faser",
          "dimension": "voltage"
        }
      },
      "template": [
        "div",
        "U",
        [
          "sqrt",
          "3"
        ]
      ],
      "note": "På et 400 V net får hver stjernekoblet vikling ca. 230 V. Den korrekte driftskobling afhænger af mærkepladen.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037341.jpg"
      }
    },
    "deltaWindingCurrent": {
      "name": "Trekant · strøm i en vikling",
      "group": "Motorer",
      "symbol": "I_fase",
      "dimension": "current",
      "args": {
        "I": {
          "symbol": "I_net",
          "label": "Linjestrøm",
          "dimension": "current"
        }
      },
      "template": [
        "div",
        "I",
        [
          "sqrt",
          "3"
        ]
      ],
      "note": "I trekant er viklingsspændingen lig netspændingen; linjestrømmen er √3 gange viklingsstrømmen.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037342.jpg"
      }
    },
    "pt100": {
      "name": "Pt100 · skolens lineære model",
      "group": "Måleteknik",
      "symbol": "R",
      "dimension": "resistance",
      "args": {
        "t": {
          "symbol": "t",
          "label": "Temperatur",
          "dimension": "temperature",
          "unit": "C"
        }
      },
      "template": [
        "add",
        [
          "mul",
          "0.3865",
          "t"
        ],
        "100"
      ],
      "note": "Skolens model R = 100 + 0,3865 · t bruges her, især 0–100 °C. Den er en tilnærmelse og er ikke den fulde IEC-kurve. Temperaturen i selve formlen er i °C.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037332.jpg"
      }
    },
    "temperatureTransmitter": {
      "name": "Temperatur fra transmitterens signal",
      "group": "Måleteknik",
      "symbol": "t",
      "dimension": "temperature",
      "args": {
        "low": {
          "symbol": "t_lav",
          "label": "Nedre målegrænse",
          "dimension": "temperature",
          "unit": "C"
        },
        "high": {
          "symbol": "t_høj",
          "label": "Øvre målegrænse",
          "dimension": "temperature",
          "unit": "C"
        },
        "I": {
          "symbol": "I",
          "label": "Målt signal",
          "dimension": "current",
          "unit": "mA"
        },
        "Il": {
          "symbol": "I_lav",
          "label": "Nedre signalgrænse",
          "dimension": "current",
          "unit": "mA",
          "value": "4"
        },
        "Ih": {
          "symbol": "I_høj",
          "label": "Øvre signalgrænse",
          "dimension": "current",
          "unit": "mA",
          "value": "20"
        }
      },
      "template": [
        "add",
        "low",
        [
          "mul",
          [
            "div",
            [
              "sub",
              "I",
              "Il"
            ],
            [
              "sub",
              "Ih",
              "Il"
            ]
          ],
          [
            "sub",
            "high",
            "low"
          ]
        ]
      ],
      "note": "Lineær transmitter. Øvre grænse skal være større end nedre grænse. Isolér I for at finde signalet ud fra procesværdien.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037332.jpg"
      },
      "resultUnit": "C"
    },
    "pressureTransmitter": {
      "name": "Tryk fra transmitterens signal",
      "group": "Måleteknik",
      "symbol": "p",
      "dimension": "pressure",
      "args": {
        "low": {
          "symbol": "p_lav",
          "label": "Nedre målegrænse",
          "dimension": "pressure",
          "unit": "bar"
        },
        "high": {
          "symbol": "p_høj",
          "label": "Øvre målegrænse",
          "dimension": "pressure",
          "unit": "bar"
        },
        "I": {
          "symbol": "I",
          "label": "Målt signal",
          "dimension": "current",
          "unit": "mA"
        },
        "Il": {
          "symbol": "I_lav",
          "label": "Nedre signalgrænse",
          "dimension": "current",
          "unit": "mA",
          "value": "4"
        },
        "Ih": {
          "symbol": "I_høj",
          "label": "Øvre signalgrænse",
          "dimension": "current",
          "unit": "mA",
          "value": "20"
        }
      },
      "template": [
        "add",
        "low",
        [
          "mul",
          [
            "div",
            [
              "sub",
              "I",
              "Il"
            ],
            [
              "sub",
              "Ih",
              "Il"
            ]
          ],
          [
            "sub",
            "high",
            "low"
          ]
        ]
      ],
      "note": "Lineær transmitter. Øvre grænse skal være større end nedre grænse. Isolér I for at finde signalet ud fra procesværdien.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037333.jpg"
      },
      "resultUnit": "bar"
    },
    "signalPercent": {
      "name": "Signalets procent af området",
      "group": "Måleteknik",
      "symbol": "x",
      "dimension": "scalar",
      "args": {
        "I": {
          "symbol": "I",
          "label": "Målt signal",
          "dimension": "current",
          "unit": "mA"
        },
        "Il": {
          "symbol": "I_lav",
          "label": "Nedre signalgrænse",
          "dimension": "current",
          "unit": "mA",
          "value": "4"
        },
        "Ih": {
          "symbol": "I_høj",
          "label": "Øvre signalgrænse",
          "dimension": "current",
          "unit": "mA",
          "value": "20"
        }
      },
      "template": [
        "div",
        [
          "sub",
          "I",
          "Il"
        ],
        [
          "sub",
          "Ih",
          "Il"
        ]
      ],
      "note": "",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037333.jpg"
      },
      "resultUnit": "percent"
    },
    "signalError": {
      "name": "Fejlprocent · i forhold til forventet signal",
      "group": "Måleteknik",
      "symbol": "f",
      "dimension": "scalar",
      "args": {
        "measured": {
          "symbol": "I_målt",
          "label": "Målt signal",
          "dimension": "current",
          "unit": "mA"
        },
        "expected": {
          "symbol": "I_forventet",
          "label": "Forventet signal",
          "dimension": "current",
          "unit": "mA"
        }
      },
      "template": [
        "div",
        [
          "sub",
          "measured",
          "expected"
        ],
        "expected"
      ],
      "note": "Fortegnet viser, om målingen er over eller under forventet værdi. Nævneren er forventet værdi, ikke hele måleområdet.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037333.jpg"
      },
      "resultUnit": "percent"
    },
    "spanError": {
      "name": "Fejlprocent · i forhold til signalspænd",
      "group": "Måleteknik",
      "symbol": "f_span",
      "dimension": "scalar",
      "args": {
        "measured": {
          "symbol": "I_målt",
          "label": "Målt signal",
          "dimension": "current",
          "unit": "mA"
        },
        "expected": {
          "symbol": "I_forventet",
          "label": "Forventet signal",
          "dimension": "current",
          "unit": "mA"
        },
        "Il": {
          "symbol": "I_lav",
          "label": "Nedre signalgrænse",
          "dimension": "current",
          "unit": "mA",
          "value": "4"
        },
        "Ih": {
          "symbol": "I_høj",
          "label": "Øvre signalgrænse",
          "dimension": "current",
          "unit": "mA",
          "value": "20"
        }
      },
      "template": [
        "div",
        [
          "sub",
          "measured",
          "expected"
        ],
        [
          "sub",
          "Ih",
          "Il"
        ]
      ],
      "note": "Supplerende variant: fejl i procent af signalspændet. Vælg den reference, opgaven angiver.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037333.jpg"
      },
      "resultUnit": "percent"
    },
    "combinedError2": {
      "name": "Summa fejl · 2 bidrag",
      "group": "Måleteknik",
      "symbol": "f_sum",
      "dimension": "scalar",
      "args": {
        "f1": {
          "symbol": "f_1",
          "label": "Fejlbidrag 1",
          "dimension": "scalar",
          "unit": "percent"
        },
        "f2": {
          "symbol": "f_2",
          "label": "Fejlbidrag 2",
          "dimension": "scalar",
          "unit": "percent"
        }
      },
      "template": [
        "sqrt",
        [
          "add",
          [
            "pow",
            "f1",
            "2"
          ],
          [
            "pow",
            "f2",
            "2"
          ]
        ]
      ],
      "note": "Kvadratsum for uafhængige bidrag angivet på samme relative grundlag. Ikke en sum af værst tænkelige grænsefejl.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037333.jpg"
      },
      "resultUnit": "percent"
    },
    "combinedError3": {
      "name": "Summa fejl · 3 bidrag",
      "group": "Måleteknik",
      "symbol": "f_sum",
      "dimension": "scalar",
      "args": {
        "f1": {
          "symbol": "f_1",
          "label": "Fejlbidrag 1",
          "dimension": "scalar",
          "unit": "percent"
        },
        "f2": {
          "symbol": "f_2",
          "label": "Fejlbidrag 2",
          "dimension": "scalar",
          "unit": "percent"
        },
        "f3": {
          "symbol": "f_3",
          "label": "Fejlbidrag 3",
          "dimension": "scalar",
          "unit": "percent"
        }
      },
      "template": [
        "sqrt",
        [
          "add",
          [
            "pow",
            "f1",
            "2"
          ],
          [
            "pow",
            "f2",
            "2"
          ],
          [
            "pow",
            "f3",
            "2"
          ]
        ]
      ],
      "note": "Kvadratsum for uafhængige bidrag angivet på samme relative grundlag. Ikke en sum af værst tænkelige grænsefejl.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037333.jpg"
      },
      "resultUnit": "percent"
    },
    "boyle": {
      "name": "Tryk og volumen · Boyles lov",
      "group": "Pneumatik",
      "symbol": "V_2",
      "dimension": "volume",
      "args": {
        "p1": {
          "symbol": "p_1",
          "label": "Absolut starttryk",
          "dimension": "pressure",
          "unit": "bar"
        },
        "V1": {
          "symbol": "V_1",
          "label": "Startvolumen",
          "dimension": "volume",
          "unit": "L"
        },
        "p2": {
          "symbol": "p_2",
          "label": "Absolut sluttryk",
          "dimension": "pressure",
          "unit": "bar"
        }
      },
      "template": [
        "div",
        [
          "mul",
          "p1",
          "V1"
        ],
        "p2"
      ],
      "note": "Konstant temperatur og samme gasmængde. Brug absolut tryk, ikke manometertryk.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037334.jpg"
      },
      "resultUnit": "L"
    },
    "absolutePressure": {
      "name": "Fra overtryk til absolut tryk",
      "group": "Pneumatik",
      "symbol": "p_abs",
      "dimension": "pressure",
      "args": {
        "p": {
          "symbol": "p_over",
          "label": "Overtryk",
          "dimension": "pressure",
          "unit": "bar"
        },
        "pa": {
          "symbol": "p_atm",
          "label": "Atmosfæretryk",
          "dimension": "pressure",
          "unit": "bar",
          "value": "1.01325"
        }
      },
      "template": [
        "add",
        "p",
        "pa"
      ],
      "note": "Supplerende omregning til Boyles lov. Brug opgavens atmosfæretryk.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037334.jpg"
      },
      "resultUnit": "bar"
    },
    "pistonArea": {
      "name": "Stemplets tværsnitsareal",
      "group": "Pneumatik",
      "symbol": "A",
      "dimension": "area",
      "args": {
        "D": {
          "symbol": "D",
          "label": "Stempeldiameter",
          "dimension": "length",
          "unit": "mm"
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
        "pages": [],
        "triangles": [],
        "image": "1000037334.jpg"
      }
    },
    "rodArea": {
      "name": "Ringareal på stempelstangssiden",
      "group": "Pneumatik",
      "symbol": "A_ring",
      "dimension": "area",
      "args": {
        "D": {
          "symbol": "D",
          "label": "Stempeldiameter",
          "dimension": "length",
          "unit": "mm"
        },
        "d": {
          "symbol": "d",
          "label": "Stempelstangens diameter",
          "dimension": "length",
          "unit": "mm"
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
        ]
      ],
      "note": "Udledt fra cirkelarealet. Kræver 0 ≤ d < D.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037334.jpg"
      }
    },
    "cylinderForce": {
      "name": "Cylinderens teoretiske kraft",
      "group": "Pneumatik",
      "symbol": "F",
      "dimension": "force",
      "args": {
        "p": {
          "symbol": "Δp",
          "label": "Trykforskel over stemplet",
          "dimension": "pressure",
          "unit": "bar"
        },
        "A": {
          "symbol": "A",
          "label": "Virksomt stempelareal",
          "dimension": "area"
        }
      },
      "template": [
        "mul",
        "p",
        "A"
      ],
      "note": "Uden friktion. Brug trykforskellen mellem kamrene; for fri udluftning på modsatte side er det normalt overtrykket.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037334.jpg"
      }
    },
    "weight": {
      "name": "Tyngdekraft fra en masse",
      "group": "Pneumatik",
      "symbol": "F",
      "dimension": "force",
      "args": {
        "m": {
          "symbol": "m",
          "label": "Masse",
          "dimension": "mass"
        },
        "g": {
          "symbol": "g",
          "label": "Tyngdeacceleration",
          "dimension": "acceleration",
          "value": "9.81"
        }
      },
      "template": [
        "mul",
        "m",
        "g"
      ],
      "note": "",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037334.jpg"
      }
    },
    "liftMass": {
      "name": "Masse i ligevægt med cylinderen",
      "group": "Pneumatik",
      "symbol": "m",
      "dimension": "mass",
      "args": {
        "p": {
          "symbol": "Δp",
          "label": "Trykforskel",
          "dimension": "pressure",
          "unit": "bar"
        },
        "A": {
          "symbol": "A",
          "label": "Stempelareal",
          "dimension": "area"
        },
        "g": {
          "symbol": "g",
          "label": "Tyngdeacceleration",
          "dimension": "acceleration",
          "value": "9.81"
        }
      },
      "template": [
        "div",
        [
          "mul",
          "p",
          "A"
        ],
        "g"
      ],
      "note": "Statisk, ideel ligevægt: Δp · A = m · g.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037334.jpg"
      }
    },
    "windingTemperature": {
      "name": "Viklingstemperatur fra modstand",
      "group": "Motorer",
      "symbol": "t_2",
      "dimension": "temperature",
      "args": {
        "R1": {
          "symbol": "R_1",
          "label": "Kold viklingsmodstand",
          "dimension": "resistance"
        },
        "R2": {
          "symbol": "R_2",
          "label": "Varm viklingsmodstand",
          "dimension": "resistance"
        },
        "t1": {
          "symbol": "t_1",
          "label": "Kold viklingstemperatur",
          "dimension": "temperature",
          "unit": "C"
        },
        "k": {
          "symbol": "k",
          "label": "Materialekonstant",
          "dimension": "scalar",
          "value": "235"
        }
      },
      "template": [
        "sub",
        [
          "mul",
          [
            "div",
            "R2",
            "R1"
          ],
          [
            "add",
            "k",
            "t1"
          ]
        ],
        "k"
      ],
      "note": "Modstandsmetoden. k = 235 for kobber, 225 for aluminium. Temperaturerne bruges i °C.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037336.jpg"
      },
      "resultUnit": "C"
    },
    "windingRise": {
      "name": "Temperaturstigning over omgivelserne",
      "group": "Motorer",
      "symbol": "Δt",
      "dimension": "temperatureChange",
      "args": {
        "R1": {
          "symbol": "R_1",
          "label": "Kold viklingsmodstand",
          "dimension": "resistance"
        },
        "R2": {
          "symbol": "R_2",
          "label": "Varm viklingsmodstand",
          "dimension": "resistance"
        },
        "t1": {
          "symbol": "t_1",
          "label": "Kold viklingstemperatur",
          "dimension": "temperature",
          "unit": "C"
        },
        "ta": {
          "symbol": "t_a",
          "label": "Omgivelser ved varm måling",
          "dimension": "temperature",
          "unit": "C"
        },
        "k": {
          "symbol": "k",
          "label": "Materialekonstant",
          "dimension": "scalar",
          "value": "235"
        }
      },
      "template": [
        "sub",
        [
          "add",
          [
            "mul",
            [
              "div",
              [
                "sub",
                "R2",
                "R1"
              ],
              "R1"
            ],
            [
              "add",
              "k",
              "t1"
            ]
          ],
          "t1"
        ],
        "ta"
      ],
      "note": "Rettet fortegn: omgivelsernes temperatur tₐ trækkes fra. Notens sidste + tₐ er en fejl. k = 235 for kobber og 225 for aluminium.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037336.jpg"
      }
    },
    "errorDirect": {
      "name": "Reguleringsafvigelse · direkte",
      "group": "Regulering",
      "symbol": "e",
      "dimension": "scalar",
      "args": {
        "PV": {
          "symbol": "PV",
          "label": "Procesværdi",
          "dimension": "scalar",
          "unit": "percent"
        },
        "SP": {
          "symbol": "SP",
          "label": "Setpunkt",
          "dimension": "scalar",
          "unit": "percent"
        }
      },
      "template": [
        "sub",
        "PV",
        "SP"
      ],
      "note": "Normaliserede værdier i % af samme måleområde. Direkte virkning: stigende PV giver stigende udgang, når SP er fast.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037346.jpg"
      }
    },
    "errorReverse": {
      "name": "Reguleringsafvigelse · invers",
      "group": "Regulering",
      "symbol": "e",
      "dimension": "scalar",
      "args": {
        "PV": {
          "symbol": "PV",
          "label": "Procesværdi",
          "dimension": "scalar",
          "unit": "percent"
        },
        "SP": {
          "symbol": "SP",
          "label": "Setpunkt",
          "dimension": "scalar",
          "unit": "percent"
        }
      },
      "template": [
        "sub",
        "SP",
        "PV"
      ],
      "note": "Invers virkning: stigende PV giver faldende udgang, når SP er fast.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037350.jpg"
      }
    },
    "proportional": {
      "name": "P-led · proportionalbidrag",
      "group": "Regulering",
      "symbol": "P_bidrag",
      "dimension": "scalar",
      "args": {
        "Kp": {
          "symbol": "K_p",
          "label": "Proportionalforstærkning",
          "dimension": "scalar"
        },
        "e": {
          "symbol": "e",
          "label": "Reguleringsafvigelse",
          "dimension": "scalar",
          "unit": "percent"
        }
      },
      "template": [
        "mul",
        "Kp",
        "e"
      ],
      "note": "Brug samme normaliserede grundlag for PV og SP. Referér til direkte eller invers afvigelse.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037346.jpg"
      },
      "resultUnit": "percent"
    },
    "integralStep": {
      "name": "I-led · ét tidsinterval",
      "group": "Regulering",
      "symbol": "I_ny",
      "dimension": "scalar",
      "args": {
        "old": {
          "symbol": "I_før",
          "label": "Hidtidigt I-bidrag",
          "dimension": "scalar",
          "unit": "percent"
        },
        "Kp": {
          "symbol": "K_p",
          "label": "Forstærkning",
          "dimension": "scalar"
        },
        "e": {
          "symbol": "e",
          "label": "Afvigelse",
          "dimension": "scalar",
          "unit": "percent"
        },
        "dt": {
          "symbol": "Δt",
          "label": "Tidsinterval",
          "dimension": "time"
        },
        "Ti": {
          "symbol": "T_i",
          "label": "Integraltid",
          "dimension": "time"
        }
      },
      "template": [
        "add",
        "old",
        [
          "div",
          [
            "mul",
            "Kp",
            "e",
            "dt"
          ],
          "Ti"
        ]
      ],
      "note": "Supplerende diskret regnetrin (rektangelmetoden), ikke en fuld regulator. Tᵢ skal være positiv.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037346.jpg"
      },
      "resultUnit": "percent"
    },
    "derivativeStep": {
      "name": "D-led · ændring over ét interval",
      "group": "Regulering",
      "symbol": "D_bidrag",
      "dimension": "scalar",
      "args": {
        "Kp": {
          "symbol": "K_p",
          "label": "Forstærkning",
          "dimension": "scalar"
        },
        "Td": {
          "symbol": "T_d",
          "label": "Differentialtid",
          "dimension": "time"
        },
        "e": {
          "symbol": "e_nu",
          "label": "Nuværende afvigelse",
          "dimension": "scalar",
          "unit": "percent"
        },
        "old": {
          "symbol": "e_før",
          "label": "Forrige afvigelse",
          "dimension": "scalar",
          "unit": "percent"
        },
        "dt": {
          "symbol": "Δt",
          "label": "Tidsinterval",
          "dimension": "time"
        }
      },
      "template": [
        "div",
        [
          "mul",
          "Kp",
          "Td",
          [
            "sub",
            "e",
            "old"
          ]
        ],
        "dt"
      ],
      "note": "Supplerende diskret forskelskvotient på afvigelsen. Reelle regulatorer kan filtrere D-leddet eller bruge PV i stedet.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037346.jpg"
      },
      "resultUnit": "percent"
    },
    "pidSum": {
      "name": "PID · saml bidragene",
      "group": "Regulering",
      "symbol": "u",
      "dimension": "scalar",
      "args": {
        "bias": {
          "symbol": "u_0",
          "label": "Grundudgang",
          "dimension": "scalar",
          "unit": "percent",
          "value": "50"
        },
        "P": {
          "symbol": "P",
          "label": "P-bidrag",
          "dimension": "scalar",
          "unit": "percent"
        },
        "I": {
          "symbol": "I",
          "label": "I-bidrag",
          "dimension": "scalar",
          "unit": "percent"
        },
        "D": {
          "symbol": "D",
          "label": "D-bidrag",
          "dimension": "scalar",
          "unit": "percent"
        }
      },
      "template": [
        "add",
        "bias",
        "P",
        "I",
        "D"
      ],
      "note": "Teoretisk sum før udgangsbegrænsning. En udgang uden for 0–100 % skal begrænses i den virkelige regulator.",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037346.jpg"
      },
      "resultUnit": "percent"
    },
    "shortCircuit": {
      "name": "Kortsluttede målepunkter",
      "group": "Elektricitet",
      "symbol": "R_samlet",
      "dimension": "resistance",
      "args": {},
      "template": "0",
      "note": "",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037330.jpg"
      },
      "hidden": true
    },
    "mesh3": {
      "name": "Eliminér knudepunkt med 3 grene",
      "group": "Elektricitet",
      "symbol": "R",
      "dimension": "resistance",
      "args": {
        "a": {
          "symbol": "R_a",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "b": {
          "symbol": "R_b",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R1": {
          "symbol": "R_1",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R2": {
          "symbol": "R_2",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R3": {
          "symbol": "R_3",
          "label": "Modstand",
          "dimension": "resistance"
        }
      },
      "template": [
        "mul",
        "a",
        "b",
        [
          "add",
          [
            "div",
            "1",
            "R1"
          ],
          [
            "div",
            "1",
            "R2"
          ],
          [
            "div",
            "1",
            "R3"
          ]
        ]
      ],
      "note": "Udledt af Kirchhoffs love (stjerne-net-omformning).",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037330.jpg"
      },
      "hidden": true
    },
    "mesh4": {
      "name": "Eliminér knudepunkt med 4 grene",
      "group": "Elektricitet",
      "symbol": "R",
      "dimension": "resistance",
      "args": {
        "a": {
          "symbol": "R_a",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "b": {
          "symbol": "R_b",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R1": {
          "symbol": "R_1",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R2": {
          "symbol": "R_2",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R3": {
          "symbol": "R_3",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R4": {
          "symbol": "R_4",
          "label": "Modstand",
          "dimension": "resistance"
        }
      },
      "template": [
        "mul",
        "a",
        "b",
        [
          "add",
          [
            "div",
            "1",
            "R1"
          ],
          [
            "div",
            "1",
            "R2"
          ],
          [
            "div",
            "1",
            "R3"
          ],
          [
            "div",
            "1",
            "R4"
          ]
        ]
      ],
      "note": "Udledt af Kirchhoffs love (stjerne-net-omformning).",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037330.jpg"
      },
      "hidden": true
    },
    "mesh5": {
      "name": "Eliminér knudepunkt med 5 grene",
      "group": "Elektricitet",
      "symbol": "R",
      "dimension": "resistance",
      "args": {
        "a": {
          "symbol": "R_a",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "b": {
          "symbol": "R_b",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R1": {
          "symbol": "R_1",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R2": {
          "symbol": "R_2",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R3": {
          "symbol": "R_3",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R4": {
          "symbol": "R_4",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R5": {
          "symbol": "R_5",
          "label": "Modstand",
          "dimension": "resistance"
        }
      },
      "template": [
        "mul",
        "a",
        "b",
        [
          "add",
          [
            "div",
            "1",
            "R1"
          ],
          [
            "div",
            "1",
            "R2"
          ],
          [
            "div",
            "1",
            "R3"
          ],
          [
            "div",
            "1",
            "R4"
          ],
          [
            "div",
            "1",
            "R5"
          ]
        ]
      ],
      "note": "Udledt af Kirchhoffs love (stjerne-net-omformning).",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037330.jpg"
      },
      "hidden": true
    },
    "mesh6": {
      "name": "Eliminér knudepunkt med 6 grene",
      "group": "Elektricitet",
      "symbol": "R",
      "dimension": "resistance",
      "args": {
        "a": {
          "symbol": "R_a",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "b": {
          "symbol": "R_b",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R1": {
          "symbol": "R_1",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R2": {
          "symbol": "R_2",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R3": {
          "symbol": "R_3",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R4": {
          "symbol": "R_4",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R5": {
          "symbol": "R_5",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R6": {
          "symbol": "R_6",
          "label": "Modstand",
          "dimension": "resistance"
        }
      },
      "template": [
        "mul",
        "a",
        "b",
        [
          "add",
          [
            "div",
            "1",
            "R1"
          ],
          [
            "div",
            "1",
            "R2"
          ],
          [
            "div",
            "1",
            "R3"
          ],
          [
            "div",
            "1",
            "R4"
          ],
          [
            "div",
            "1",
            "R5"
          ],
          [
            "div",
            "1",
            "R6"
          ]
        ]
      ],
      "note": "Udledt af Kirchhoffs love (stjerne-net-omformning).",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037330.jpg"
      },
      "hidden": true
    },
    "mesh7": {
      "name": "Eliminér knudepunkt med 7 grene",
      "group": "Elektricitet",
      "symbol": "R",
      "dimension": "resistance",
      "args": {
        "a": {
          "symbol": "R_a",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "b": {
          "symbol": "R_b",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R1": {
          "symbol": "R_1",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R2": {
          "symbol": "R_2",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R3": {
          "symbol": "R_3",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R4": {
          "symbol": "R_4",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R5": {
          "symbol": "R_5",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R6": {
          "symbol": "R_6",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R7": {
          "symbol": "R_7",
          "label": "Modstand",
          "dimension": "resistance"
        }
      },
      "template": [
        "mul",
        "a",
        "b",
        [
          "add",
          [
            "div",
            "1",
            "R1"
          ],
          [
            "div",
            "1",
            "R2"
          ],
          [
            "div",
            "1",
            "R3"
          ],
          [
            "div",
            "1",
            "R4"
          ],
          [
            "div",
            "1",
            "R5"
          ],
          [
            "div",
            "1",
            "R6"
          ],
          [
            "div",
            "1",
            "R7"
          ]
        ]
      ],
      "note": "Udledt af Kirchhoffs love (stjerne-net-omformning).",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037330.jpg"
      },
      "hidden": true
    },
    "mesh8": {
      "name": "Eliminér knudepunkt med 8 grene",
      "group": "Elektricitet",
      "symbol": "R",
      "dimension": "resistance",
      "args": {
        "a": {
          "symbol": "R_a",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "b": {
          "symbol": "R_b",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R1": {
          "symbol": "R_1",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R2": {
          "symbol": "R_2",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R3": {
          "symbol": "R_3",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R4": {
          "symbol": "R_4",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R5": {
          "symbol": "R_5",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R6": {
          "symbol": "R_6",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R7": {
          "symbol": "R_7",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R8": {
          "symbol": "R_8",
          "label": "Modstand",
          "dimension": "resistance"
        }
      },
      "template": [
        "mul",
        "a",
        "b",
        [
          "add",
          [
            "div",
            "1",
            "R1"
          ],
          [
            "div",
            "1",
            "R2"
          ],
          [
            "div",
            "1",
            "R3"
          ],
          [
            "div",
            "1",
            "R4"
          ],
          [
            "div",
            "1",
            "R5"
          ],
          [
            "div",
            "1",
            "R6"
          ],
          [
            "div",
            "1",
            "R7"
          ],
          [
            "div",
            "1",
            "R8"
          ]
        ]
      ],
      "note": "Udledt af Kirchhoffs love (stjerne-net-omformning).",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037330.jpg"
      },
      "hidden": true
    },
    "mesh9": {
      "name": "Eliminér knudepunkt med 9 grene",
      "group": "Elektricitet",
      "symbol": "R",
      "dimension": "resistance",
      "args": {
        "a": {
          "symbol": "R_a",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "b": {
          "symbol": "R_b",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R1": {
          "symbol": "R_1",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R2": {
          "symbol": "R_2",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R3": {
          "symbol": "R_3",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R4": {
          "symbol": "R_4",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R5": {
          "symbol": "R_5",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R6": {
          "symbol": "R_6",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R7": {
          "symbol": "R_7",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R8": {
          "symbol": "R_8",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R9": {
          "symbol": "R_9",
          "label": "Modstand",
          "dimension": "resistance"
        }
      },
      "template": [
        "mul",
        "a",
        "b",
        [
          "add",
          [
            "div",
            "1",
            "R1"
          ],
          [
            "div",
            "1",
            "R2"
          ],
          [
            "div",
            "1",
            "R3"
          ],
          [
            "div",
            "1",
            "R4"
          ],
          [
            "div",
            "1",
            "R5"
          ],
          [
            "div",
            "1",
            "R6"
          ],
          [
            "div",
            "1",
            "R7"
          ],
          [
            "div",
            "1",
            "R8"
          ],
          [
            "div",
            "1",
            "R9"
          ]
        ]
      ],
      "note": "Udledt af Kirchhoffs love (stjerne-net-omformning).",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037330.jpg"
      },
      "hidden": true
    },
    "mesh10": {
      "name": "Eliminér knudepunkt med 10 grene",
      "group": "Elektricitet",
      "symbol": "R",
      "dimension": "resistance",
      "args": {
        "a": {
          "symbol": "R_a",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "b": {
          "symbol": "R_b",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R1": {
          "symbol": "R_1",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R2": {
          "symbol": "R_2",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R3": {
          "symbol": "R_3",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R4": {
          "symbol": "R_4",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R5": {
          "symbol": "R_5",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R6": {
          "symbol": "R_6",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R7": {
          "symbol": "R_7",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R8": {
          "symbol": "R_8",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R9": {
          "symbol": "R_9",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R10": {
          "symbol": "R_10",
          "label": "Modstand",
          "dimension": "resistance"
        }
      },
      "template": [
        "mul",
        "a",
        "b",
        [
          "add",
          [
            "div",
            "1",
            "R1"
          ],
          [
            "div",
            "1",
            "R2"
          ],
          [
            "div",
            "1",
            "R3"
          ],
          [
            "div",
            "1",
            "R4"
          ],
          [
            "div",
            "1",
            "R5"
          ],
          [
            "div",
            "1",
            "R6"
          ],
          [
            "div",
            "1",
            "R7"
          ],
          [
            "div",
            "1",
            "R8"
          ],
          [
            "div",
            "1",
            "R9"
          ],
          [
            "div",
            "1",
            "R10"
          ]
        ]
      ],
      "note": "Udledt af Kirchhoffs love (stjerne-net-omformning).",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037330.jpg"
      },
      "hidden": true
    },
    "mesh11": {
      "name": "Eliminér knudepunkt med 11 grene",
      "group": "Elektricitet",
      "symbol": "R",
      "dimension": "resistance",
      "args": {
        "a": {
          "symbol": "R_a",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "b": {
          "symbol": "R_b",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R1": {
          "symbol": "R_1",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R2": {
          "symbol": "R_2",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R3": {
          "symbol": "R_3",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R4": {
          "symbol": "R_4",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R5": {
          "symbol": "R_5",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R6": {
          "symbol": "R_6",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R7": {
          "symbol": "R_7",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R8": {
          "symbol": "R_8",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R9": {
          "symbol": "R_9",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R10": {
          "symbol": "R_10",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R11": {
          "symbol": "R_11",
          "label": "Modstand",
          "dimension": "resistance"
        }
      },
      "template": [
        "mul",
        "a",
        "b",
        [
          "add",
          [
            "div",
            "1",
            "R1"
          ],
          [
            "div",
            "1",
            "R2"
          ],
          [
            "div",
            "1",
            "R3"
          ],
          [
            "div",
            "1",
            "R4"
          ],
          [
            "div",
            "1",
            "R5"
          ],
          [
            "div",
            "1",
            "R6"
          ],
          [
            "div",
            "1",
            "R7"
          ],
          [
            "div",
            "1",
            "R8"
          ],
          [
            "div",
            "1",
            "R9"
          ],
          [
            "div",
            "1",
            "R10"
          ],
          [
            "div",
            "1",
            "R11"
          ]
        ]
      ],
      "note": "Udledt af Kirchhoffs love (stjerne-net-omformning).",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037330.jpg"
      },
      "hidden": true
    },
    "mesh12": {
      "name": "Eliminér knudepunkt med 12 grene",
      "group": "Elektricitet",
      "symbol": "R",
      "dimension": "resistance",
      "args": {
        "a": {
          "symbol": "R_a",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "b": {
          "symbol": "R_b",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R1": {
          "symbol": "R_1",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R2": {
          "symbol": "R_2",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R3": {
          "symbol": "R_3",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R4": {
          "symbol": "R_4",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R5": {
          "symbol": "R_5",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R6": {
          "symbol": "R_6",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R7": {
          "symbol": "R_7",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R8": {
          "symbol": "R_8",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R9": {
          "symbol": "R_9",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R10": {
          "symbol": "R_10",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R11": {
          "symbol": "R_11",
          "label": "Modstand",
          "dimension": "resistance"
        },
        "R12": {
          "symbol": "R_12",
          "label": "Modstand",
          "dimension": "resistance"
        }
      },
      "template": [
        "mul",
        "a",
        "b",
        [
          "add",
          [
            "div",
            "1",
            "R1"
          ],
          [
            "div",
            "1",
            "R2"
          ],
          [
            "div",
            "1",
            "R3"
          ],
          [
            "div",
            "1",
            "R4"
          ],
          [
            "div",
            "1",
            "R5"
          ],
          [
            "div",
            "1",
            "R6"
          ],
          [
            "div",
            "1",
            "R7"
          ],
          [
            "div",
            "1",
            "R8"
          ],
          [
            "div",
            "1",
            "R9"
          ],
          [
            "div",
            "1",
            "R10"
          ],
          [
            "div",
            "1",
            "R11"
          ],
          [
            "div",
            "1",
            "R12"
          ]
        ]
      ],
      "note": "Udledt af Kirchhoffs love (stjerne-net-omformning).",
      "source": {
        "pages": [],
        "triangles": [],
        "image": "1000037330.jpg"
      },
      "hidden": true
    }
  },
  "SHAPES": {},
  "DIMENSIONS": {
    "scalar": {
      "name": "Forhold / procent",
      "unit": "tal"
    },
    "voltage": {
      "name": "Spænding",
      "unit": "V"
    },
    "current": {
      "name": "Strøm",
      "unit": "A"
    },
    "resistance": {
      "name": "Modstand",
      "unit": "Ω"
    },
    "frequency": {
      "name": "Frekvens",
      "unit": "Hz"
    },
    "power": {
      "name": "Effekt",
      "unit": "W"
    },
    "rotationRate": {
      "name": "Omdrejningstal",
      "unit": "omdr./s"
    },
    "temperature": {
      "name": "Temperatur",
      "unit": "°C"
    },
    "temperatureChange": {
      "name": "Temperaturforskel",
      "unit": "K"
    },
    "pressure": {
      "name": "Tryk",
      "unit": "Pa"
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
    "force": {
      "name": "Kraft",
      "unit": "N"
    },
    "mass": {
      "name": "Masse",
      "unit": "kg"
    },
    "acceleration": {
      "name": "Acceleration",
      "unit": "m/s²"
    },
    "time": {
      "name": "Tid",
      "unit": "s"
    }
  },
  "SCHOOL_SOURCE": {
    "title": "SRO · brugerens formelsamling",
    "images": 22
  },
  "UNIT_GUIDE": []
};});
