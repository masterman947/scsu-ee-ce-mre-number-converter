"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const MRE = __importStar(require("@microsoft/mixed-reality-extension-sdk"));
const labelColour = { r: 1, g: 1, b: 1 };
const textColour = { r: .5, g: .5, b: 1 };
const spacing = 0.2;
class NumberConverter {
    constructor(context, baseUrl) {
        this.context = context;
        this.baseUrl = baseUrl;
        this.context.onStarted(() => this.started());
    }
    async started() {
        this.assets = new MRE.AssetContainer(this.context);
        // Labels
        this.textDecimal = MRE.Actor.Create(this.context, {
            actor: {
                name: 'Label-Decimal',
                transform: {
                    app: { position: { x: -spacing, y: 0.5, z: 0 } }
                },
                text: {
                    contents: "Decimal:",
                    anchor: MRE.TextAnchorLocation.MiddleRight,
                    color: labelColour,
                    height: 0.45
                }
            }
        });
        this.lblOctal = MRE.Actor.Create(this.context, {
            actor: {
                name: 'Label-Octal',
                transform: {
                    app: { position: { x: -spacing, y: 0, z: 0 } }
                },
                text: {
                    contents: "Octal:",
                    anchor: MRE.TextAnchorLocation.MiddleRight,
                    color: labelColour,
                    height: 0.45
                }
            }
        });
        this.lblHex = MRE.Actor.Create(this.context, {
            actor: {
                name: 'Label-Hex',
                transform: {
                    app: { position: { x: -spacing, y: -0.5, z: 0 } }
                },
                text: {
                    contents: "Hex:",
                    anchor: MRE.TextAnchorLocation.MiddleRight,
                    color: labelColour,
                    height: 0.45
                }
            }
        });
        // Texts
        this.textDecimal = MRE.Actor.Create(this.context, {
            actor: {
                name: 'Text-Decimal',
                transform: {
                    app: { position: { x: spacing, y: 0.5, z: 0 } }
                },
                text: {
                    contents: "",
                    anchor: MRE.TextAnchorLocation.MiddleLeft,
                    color: textColour,
                    height: 0.45
                }
            }
        });
        this.textOctal = MRE.Actor.Create(this.context, {
            actor: {
                name: 'Text-Octal',
                transform: {
                    app: { position: { x: spacing, y: 0, z: 0 } }
                },
                text: {
                    contents: "",
                    anchor: MRE.TextAnchorLocation.MiddleLeft,
                    color: textColour,
                    height: 0.45
                }
            }
        });
        this.textHex = MRE.Actor.Create(this.context, {
            actor: {
                name: 'Text-Hex',
                transform: {
                    app: { position: { x: spacing, y: -0.5, z: 0 } }
                },
                text: {
                    contents: "",
                    anchor: MRE.TextAnchorLocation.MiddleLeft,
                    color: textColour,
                    height: 0.45
                }
            }
        });
        this.updateValues(0);
        // Buttons
        const depth = 0.1;
        const padding = 0.89;
        const buttonMesh = this.assets.createBoxMesh('button', spacing * padding, spacing * padding, depth);
        this.btnDecimal = MRE.Actor.Create(this.context, {
            actor: {
                name: "Button-Decimal",
                appearance: { meshId: buttonMesh.id },
                collider: { geometry: { shape: MRE.ColliderType.Auto } },
                transform: {
                    local: { position: { x: 0, y: 0.5, z: 0 } }
                }
            }
        });
        this.btnOctal = MRE.Actor.Create(this.context, {
            actor: {
                name: "Button-Octal",
                appearance: { meshId: buttonMesh.id },
                collider: { geometry: { shape: MRE.ColliderType.Auto } },
                transform: {
                    local: { position: { x: 0, y: 0, z: 0 } }
                }
            }
        });
        this.btnHex = MRE.Actor.Create(this.context, {
            actor: {
                name: "Button-Hex",
                appearance: { meshId: buttonMesh.id },
                collider: { geometry: { shape: MRE.ColliderType.Auto } },
                transform: {
                    local: { position: { x: 0, y: -0.5, z: 0 } }
                }
            }
        });
        // Button Logic
        this.btnDecimal.setBehavior(MRE.ButtonBehavior)
            .onClick(user => this.onBtnDecimal(user));
        this.btnOctal.setBehavior(MRE.ButtonBehavior)
            .onClick(user => this.onBtnOctal(user));
        this.btnHex.setBehavior(MRE.ButtonBehavior)
            .onClick(user => this.onBtnHex(user));
    }
    async onBtnDecimal(user, repeat = false) {
        let resp = await user.prompt("Please enter a decimal value." + (repeat ? "\nMake sure to press the ok button.\nHitting enter may not submit correctly." : ""), true);
        if (!resp.submitted) {
            this.onBtnDecimal(user, true);
            return;
        }
        this.updateValues(this.parse(resp));
    }
    async onBtnOctal(user, repeat = false) {
        let resp = await user.prompt("Please enter an octal value." + (repeat ? "\nMake sure to press the ok button.\nHitting enter may not submit correctly." : ""), true);
        if (!resp.submitted) {
            this.onBtnOctal(user, true);
            return;
        }
        this.updateValues(this.parse(resp, 8));
    }
    async onBtnHex(user, repeat = false) {
        let resp = await user.prompt("Please enter a hexadecimal value." + (repeat ? "\nMake sure to press the ok button.\nHitting enter may not submit correctly." : ""), true);
        if (!resp.submitted) {
            this.onBtnHex(user, true);
            return;
        }
        this.updateValues(this.parse(resp, 16));
    }
    parse(resp, base) {
        let data = resp.text;
        if (data == undefined) {
            console.log("input data was undefined! response submitted ? " + resp.submitted);
            return 0;
        }
        data.trim();
        if (!base) {
            // assume decimal
            return parseInt(data);
        }
        if (base === 8) {
            // octal parse
            return parseInt(data, 8);
        }
        if (base === 16) {
            // hex parse
            return parseInt(data, 16);
        }
        return 0;
    }
    updateValues(decNum) {
        this.textDecimal.text.contents = decNum.toString();
        this.textOctal.text.contents = decNum.toString(8);
        this.textHex.text.contents = decNum.toString(16).toUpperCase();
    }
}
exports.default = NumberConverter;
//# sourceMappingURL=app.js.map