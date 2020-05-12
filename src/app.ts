import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { Actor, MreArgumentError } from '@microsoft/mixed-reality-extension-sdk';
import { UserInternal } from '@microsoft/mixed-reality-extension-sdk/built/user/userInternal';

const labelColour = {r: 1, g: 1, b : 1};
const textColour = {r: .5, g: .5, b : 1};
const spacing : number = 0.2;

export default class NumberConverter {
	private assets: MRE.AssetContainer;

	private lblDecimal : Actor;
	private lblOctal : Actor;
	private lblHex : Actor;


	private textDecimal : Actor;
	private textOctal : Actor;
	private textHex : Actor;


	private btnDecimal : Actor;
	private btnOctal : Actor;
	private btnHex : Actor;


	

	constructor(private context: MRE.Context, private baseUrl: string) {
		this.context.onStarted(() => this.started());
	}

	private async started() {
		this.assets = new MRE.AssetContainer(this.context);
		// Labels
		this.textDecimal = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Label-Decimal',
				transform: {
					app: { position: { x: -spacing, y: 0.5, z: 0 } }
				},
				text: {
					contents:"Decimal:",
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
					contents:"Octal:",
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
		const buttonMesh = this.assets.createBoxMesh('button', spacing * padding , spacing * padding, depth);
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

	private async onBtnDecimal(user : MRE.User, repeat : boolean = false){
		let resp = await user.prompt("Please enter a decimal value." + (repeat? "\nMake sure to press the ok button.\nHitting enter may not submit correctly." : ""), true);
		if(!resp.submitted){ this.onBtnDecimal(user, true); return}
		this.updateValues(this.parse(resp));
	}
	private  async  onBtnOctal(user : MRE.User, repeat : boolean = false){
		let resp = await user.prompt("Please enter an octal value." + (repeat? "\nMake sure to press the ok button.\nHitting enter may not submit correctly." : ""), true);
		if(!resp.submitted){ this.onBtnOctal(user, true); return}
		this.updateValues(this.parse(resp, 8));
	}
	private  async  onBtnHex(user : MRE.User, repeat : boolean = false){
		let resp = await user.prompt("Please enter a hexadecimal value." + (repeat? "\nMake sure to press the ok button.\nHitting enter may not submit correctly." : ""), true);
		if(!resp.submitted){ this.onBtnHex(user, true); return}
		this.updateValues(this.parse(resp, 16));
	}

	private parse(resp : MRE.DialogResponse, base? : number) : number {
		let data : string = resp.text;
		if(data == undefined){
			console.log("input data was undefined! response submitted ? " + resp.submitted);
			return 0;
		} 
		data.trim();
		if(!base){
			// assume decimal
			return parseInt(data);
		}
		if(base === 8){
			// octal parse
			return parseInt(data, 8);
		}
		if(base === 16){
			// hex parse
			return parseInt(data, 16);
		}
		return 0;
	}

	private updateValues(decNum : number){
		this.textDecimal.text.contents = decNum.toString();
		this.textOctal.text.contents = decNum.toString(8);
		this.textHex.text.contents = decNum.toString(16).toUpperCase();
	}
}
