/*
*	@filename	Quest.js
*	@author		isid0re
*	@desc		Miscellaneous quest tasks for leveling
*/

var Quest = {
	preReqs: function () {
		if (Pather.accessToAct(2) && !me.staff && !me.horadricstaff) { // horadric staff
			if (!me.amulet) {
				if (!isIncluded("SoloLeveling/Scripts/amulet.js")) {
					include("SoloLeveling/Scripts/amulet.js");
				}

				for (let getAmmy = 0; getAmmy < 5; getAmmy++) {
					amulet();

					if (me.amulet) {
						break;
					}
				}
			}

			if (!me.shaft) {
				if (!isIncluded("SoloLeveling/Scripts/staff.js")) {
					include("SoloLeveling/Scripts/staff.js");
				}

				for (let getStaff = 0; getStaff < 5; getStaff++) {
					staff();

					if (me.shaft) {
						break;
					}
				}
			}
		}

		if (Pather.accessToAct(3) && !me.travincal && !me.khalimswill) { // khalim's will
			if (!me.eye) {
				if (!isIncluded("SoloLeveling/Scripts/eye.js")) {
					include("SoloLeveling/Scripts/eye.js");
				}

				for (let getEye = 0; getEye < 5; getEye++) {
					eye();

					if (me.eye) {
						break;
					}
				}
			}

			if (!me.heart) {
				if (!isIncluded("SoloLeveling/Scripts/heart.js")) {
					include("SoloLeveling/Scripts/heart.js");
				}

				for (let getHeart = 0; getHeart < 5; getHeart++) {
					heart();

					if (me.heart) {
						break;
					}
				}
			}

			if (!me.brain) {
				if (!isIncluded("SoloLeveling/Scripts/brain.js")) {
					include("SoloLeveling/Scripts/brain.js");
				}

				for (let getBrain = 0; getBrain < 5; getBrain++) {
					brain();

					if (me.brain) {
						break;
					}
				}
			}
		}
	},

	cubeItems: function (outcome, ...classids) {
		if (me.getItem(outcome) || outcome === 91 && me.horadricstaff || outcome === 174 && me.travincal) {
			return true;
		}

		if (!me.inTown) {
			Town.goToTown();
		}

		if (outcome === 91) {
			me.overhead('cubing staff');
		} else if (outcome === 174) {
			me.overhead('cubing flail');
		}

		Town.doChores();
		Town.openStash();

		if (me.findItems(-1, -1, 6)) {
			Cubing.emptyCube();
		}

		let cubingItem;

		for (let classid of classids) {
			cubingItem = me.getItem(classid);

			if (!cubingItem || !Storage.Cube.MoveTo(cubingItem)) {
				return false;
			}
		}

		while (!Cubing.openCube()) {
			delay(1 + me.ping * 2);
			Packet.flash(me.gid);
		}

		let wantedItem;
		let tick = getTickCount();

		while (getTickCount() - tick < 5000) {
			if (Cubing.openCube()) {
				transmute();
				delay(750 + me.ping);

				wantedItem = me.getItem(outcome);

				if (wantedItem) {
					Storage.Inventory.MoveTo(wantedItem);
					me.cancel();

					break;
				}
			}
		}

		me.cancel();

		return me.getItem(outcome);
	},

	placeStaff: function () {
		let tick = getTickCount();
		let orifice = getUnit(2, 152);
		let hstaff = me.staff;

		if (me.horadricstaff) {
			return true;
		}

		if (!orifice) {
			return false;
		}

		if (!hstaff) {
			Quest.cubeItems(91, 92, 521);
		}

		if (hstaff) {
			if (hstaff.location !== 3) {
				if (!me.inTown) {
					Town.goToTown();
				}

				if (Storage.Inventory.CanFit(hstaff)) {
					if (hstaff.location === 6) {
						Cubing.openCube();
					}

					Storage.Inventory.MoveTo(hstaff);
				} else {
					Town.clearJunk();
					Town.organizeInventory();

					if (hstaff.location === 6) {
						Cubing.openCube();
					}

					Storage.Inventory.MoveTo(hstaff);
				}

				me.cancel();
				Pather.usePortal(null, me.name);
			}
		}

		Pather.moveToPreset(me.area, 2, 152);
		Misc.openChest(orifice);

		if (!hstaff) {
			if (getTickCount() - tick < 500) {
				delay(500 + me.ping);
			}

			return false;
		}

		hstaff.toCursor();
		submitItem();
		delay(750 + me.ping);

		return true;
	},

	tyraelTomb: function () {
		Pather.moveTo(22629, 15714);
		Pather.moveTo(22609, 15707);
		Pather.moveTo(22579, 15704);
		Pather.moveTo(22577, 15649, 10);
		Pather.moveTo(22577, 15609, 10);

		let tyrael = getUnit(1, NPC.Tyrael);

		if (!tyrael) {
			return false;
		}

		for (let talk = 0; talk < 3; talk += 1) {
			if (getDistance(me, tyrael) > 3) {
				Pather.moveToUnit(tyrael);
			}

			tyrael.interact();
			delay(1000 + me.ping);
			me.cancel();

			if (Pather.getPortal(null)) {
				me.cancel();
				break;
			}
		}

		if (!me.inTown) {
			Town.goToTown();
		}

		return true;
	},

	stashItem: function (classid) {
		if (!me.getItem(classid)) {
			return false;
		}

		if (!me.inTown) {
			Town.goToTown();
		}

		let questItem = me.getItem(classid);
		Town.move("stash");
		Town.openStash();

		while (questItem.location !== 7) {
			Storage.Stash.MoveTo(questItem);
			delay(1 + me.ping);

			questItem = me.getItem(classid);
		}

		return true;
	},

	collectItem: function (classid, chestID) {
		if (me.getItem(classid)) {
			return true;
		}

		if (chestID !== undefined) {
			let chest = getUnit(2, chestID);

			if (!chest) {
				return false;
			}

			Misc.openChest(chest);
		}

		let questItem;
		let tick = getTickCount();

		while (getTickCount() - tick < 2000) {
			questItem = getUnit(4, classid);

			if (questItem) {
				break;
			}

			delay(100 + me.ping);
		}

		if (Storage.Inventory.CanFit(questItem)) {
			Pickit.pickItem(questItem);
		} else {
			Town.clearJunk();
			Town.organizeInventory();
			Pickit.pickItem(questItem);
			Pickit.pickItems();
		}

		return me.getItem(classid);
	},

	equipItem: function (item, loc) {
		let newitem = me.getItem(item);
		me.cancel();

		if (newitem) {
			if (newitem.location === 7) {
				Town.move("stash");
				delay(250 + me.ping);
				Town.openStash();
				Storage.Inventory.MoveTo(newitem);
				me.cancel();
			}

			if (!Item.equip(newitem, loc)) {
				Pickit.pickItems();
				print("ÿc9SoloLevelingÿc0: failed to equip item.(Quest.equipItem)");
			}
		} else {
			print("ÿc9SoloLevelingÿc0: Lost item before trying to equip it. (Quest.equipItem)");
		}

		if (me.itemoncursor) {
			let olditem = getUnit(100);

			if (olditem) {
				if (Storage.Inventory.CanFit(olditem)) {
					print("ÿc9SoloLevelingÿc0: Keeping weapon");

					Storage.Inventory.MoveTo(olditem);
				} else {
					me.cancel();
					print("ÿc9SoloLevelingÿc0: No room to keep weapon");

					olditem.drop();
				}
			}
		}

		delay(750 + me.ping);

		return true;
	},

	smashSomething: function (smashable) {
		let something, tool;

		switch (smashable) {
		case 404:
			something = getUnit(2, 404);
			tool = 174;

			break;
		case 376:
			something = getUnit(2, 376);
			tool = 90;

			break;
		}

		if (Item.getEquippedItem(4).classid !== tool) {
			return false;
		}

		while (me.getItem(tool)) {
			Pather.moveToUnit(something, 0, 0, Config.ClearType, false);
			Skill.cast(0, 0, something);
			something.interact();

			delay(750 + me.ping);
		}

		return !me.getItem(tool);
	},

	characterRespec: function () {// Akara reset for build change
		if (me.respec) {
			return true;
		}

		if (me.charlvl === SetUp.respecOne || me.charlvl === SetUp.respecTwo()) {
			Precast.doPrecast(true);
			Town.goToTown(1);
			me.overhead('time to respec');
			Town.npcInteract("akara");
			delay(10 + me.ping * 2);

			if (!Misc.useMenu(0x2ba0) || !Misc.useMenu(3401)) {
				return false;
			}

			delay(750 + me.ping * 2);
			Town.clearBelt();
			delay(250 + me.ping);
			let script = getScript("default.dbj");
			script.stop();
			load("default.dbj");
			Item.autoEquip();
		}

		return true;
	},

	Status: function (name) {
		let quest = false;

		switch (name.toLowerCase()) {
		case "den": //den
			if (Misc.checkQuest(1, 0)) {
				quest = true;
			}

			break;
		case "bloodraven": //bloodaraven
			if (Misc.checkQuest(2, 0)) {
				quest = true;
			}

			break;
		case "smith": //tools of the trade
			if (Misc.checkQuest(3, 0) || Misc.checkQuest(3, 1)) {
				quest = true;
			}

			break;
		case "tristam": //tristam
			if (Misc.checkQuest(4, 0)) {
				quest = true;
			}

			break;
		case "countess": //countess
			if (Misc.checkQuest(5, 0)) {
				quest = true;
			}

			break;
		case "andariel": //andy
			if (Misc.checkQuest(7, 0)) {
				quest = true;
			}

			break;
		case "cube": //cube
			if (me.getItem(549)) {
				quest = true;
			}

			break;
		case "radament": //radament
			if (Misc.checkQuest(9, 0)) {
				quest = true;
			}

			break;
		case "staff": //staff
			if (me.getItem(92) || me.getItem(91) || Misc.checkQuest(10, 0)) {
				quest = true;
			}

			break;
		case "amulet": //ammy
			if (me.getItem(521) || me.getItem(91) || Misc.checkQuest(11, 0)) {
				quest = true;
			}

			break;
		case "summoner": //summoner
			if (Misc.checkQuest(13, 0)) {
				quest = true;
			}

			break;
		case "duriel": //duriel
			if (Misc.checkQuest(15, 0)) {
				quest = true;
			}

			break;
		case "eye": // eye
			if (me.getItem(553) || me.getItem(174) || Misc.checkQuest(18, 0)) {
				quest = true;
			}

			break;
		case "lamessen": // lamessen tome
			if (Misc.checkQuest(17, 0)) {
				quest = true;
			}

			break;
		case "heart": //heart
			if (me.getItem(554) || me.getItem(174) || Misc.checkQuest(18, 0)) {
				quest = true;
			}

			break;
		case "brain": //brain
			if (me.getItem(555) || me.getItem(174) || Misc.checkQuest(18, 0)) {
				quest = true;
			}

			break;
		case "gidbinn": //gidbinn
			if (Misc.checkQuest(19, 0)) {
				quest = true;
			}

			break;
		case "travincal": //travincal
			if (Misc.checkQuest(18, 0)) {
				quest = true;
			}

			break;
		case "mephisto": //mephisto
			if (Misc.checkQuest(23, 0)) {
				quest = true;
			}

			break;
		case "izual": // izzy
			if (Misc.checkQuest(25, 0)) {
				quest = true;
			}

			break;
		case "diablo": //diablo
			if (Misc.checkQuest(26, 0)) {
				quest = true;
			}

			break;
		case "hellforge": // hellforge
			if (Misc.checkQuest(27, 0)) {
				quest = true;
			}

			break;
		case "shenk": // shenk
			if (Misc.checkQuest(35, 0) || Misc.checkQuest(35, 1)) {
				quest = true;
			}

			break;
		case "savebarby": //barbies
			if (Misc.checkQuest(36, 0)) {
				quest = true;
			}

			break;
		case "anya": //anya
			if (Misc.checkQuest(37, 0)) {
				quest = true;
			}

			break;
		case "ancients": //ancients
			if (Misc.checkQuest(39, 0)) {
				quest = true;
			}

			break;
		case "baal": //baal
			if (Misc.checkQuest(40, 0)) {
				quest = true;
			}

			break;
		case "cows": //cows
			if (Misc.checkQuest(4, 10)) {
				quest = true;
			}

			break;
		default:
			quest = false;

			break;
		}

		return quest;
	},
};
