/*
BACKLOG


DONE
- use item
- equip/unequip item
- buy/sell item (always from player POV)

AMELIO
// TODO check if can equip ? (level, type...)
// TODO better item identificator for removal. Current : removes one item with same name
*/


var player = null;
var shop = null;

$(document).ready(function() {
	init();
});

function init() {
	initPlayer();

	shopInit();

	rivets.bind($('#mainContainer'), {player: player, shop: shop});

}

function initPlayer() {
	player = new Player(playerStats);
	player.backpack.push(new Item_Entity(allItemsByName.get('Potion simple')[0]));
	player.backpack.push(new Equipment_Entity(allEquipmentsByName.get('sword')[0]));
	player.backpack.push(new Equipment_Entity(allEquipmentsByName.get('boots')[0]));
}

/**
	description: fills shop inventory with objects from the shopData's objects names string list
*/
function shopInit() {
	let shopInventory = [];
	for (let i = 0; i < shopData.itemsList.length; i++) {
		shopInventory.push(new Item_Entity(allItemsByName.get(shopData.itemsList[i])[0]));
	}
	for (let i = 0; i < shopData.equipmentsList.length; i++) {
		shopInventory.push(new Equipment_Entity(allEquipmentsByName.get(shopData.equipmentsList[i])[0]));
	}
	shopData.inventory = shopInventory;
	shop = new Shop_Entity(shopData);
}













var shopData = {
	name: 'Invulnerable Vagrant',
	vendorName: 'Pumat Sols',
	itemsList: ['Potion simple', 'Potion simple', 'Potion simple'],
	equipmentsList: ['boots'],
	inventory: [], // should be filled AFTER 'player' variable instanciation
}


class Shop_Entity {
    constructor(data) {
    	this.name = data.name;
		this.vendorName = data.vendorName;
		this.itemsList = data.itemsList;
		this.equipmentsList = data.equipmentsList;
		this.inventory = data.inventory;
	}
}















var playerStats = {
	name : 'Héros',
	level : 1,
	maxHp: 55,
	hp: 32,
	ac : 13,
	str : 16,
	const : 15,
	intel : 8,
	dex : 11,
	luck : 13,
	equipped : null,
	backpack : [],
	skills: [],
	money: 500
}

var allItems = [
	{
		name: 'Potion simple',
		description: 'Une belle description de Potion simple',
		isAvailableInFight: true,
		buyingPrice: 40,
		sellingPrice: 16,
		iconPath: '',
		quantity: 3,
		doEffect: function() {
			player.hp += 20;
			if(player.hp > player.maxHp) {
				player.hp = player.maxHp;
			}
			this.quantity--;
			if(this.quantity == 0) {
				for(let i=0; i<player.backpack.length; i++) {
					let item = player.backpack[i];
						if(item.quantity == 0) {
							player.backpack.splice(i,1);
						}
				}
			}
		}
	}
];
var allItemsByName = makeMapByAttrFromList(allItems, 'name');
var allEquipments = [
	{
		name: 'sword',
		type: 'weapon',//weapon, shield, helmet, armor, boots, gloves, skill, item
		isEquipped: false,
		description: 'a double edge whort sword',
		icon: 'img/icons/weapon.png',
		isUseOnTouch: false,
		buyingPrice: 40,
		sellingPrice: 16,
		hitChance: 4, // +4 to roll
		damageDice: '2d6',
		maxHp: 	22,
		hp: 	0,
		ac: 	0,
		str: 	0,
		const: 	0,
		intel: 	0,
		dex: 	0,
		luck: 	0
	},
	{
		name: 'boots',
		type: 'boots',//weapon, shield, helmet, armor, boots, gloves, skill, item
		isEquipped: false,
		description: 'some leather boots',
		icon: 'img/icons/boots.png',
		isUseOnTouch: false,
		buyingPrice: 25,
		sellingPrice: 5,
		damage: null,
		maxHp: 	0,
		hp: 	0,
		ac: 	0,
		str: 	0,
		const: 	0,
		intel: 	0,
		dex: 	11,
		luck: 	0,
	}
];
var allEquipmentsByName = makeMapByAttrFromList(allEquipments, 'name');











/* * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * */
function doToggleEquipment(it) {
	console.log('- - - doToggleEquipment : ', it.isEquipped);
	// unequip if already equipped
	if(it.isEquipped) {
		it.isEquipped = false;
	
		refreshPlayerStats();
		return;
	}
	// check if anything already equipped in that slot ("type")
	for (let i = 0; i < player.backpack.length; i++) {
		let bpItem = player.backpack[i];
		if(
			bpItem.isEquipped
			&& bpItem.type == it.type
		) {
			// unequip previous then equip new
			bpItem.isEquipped = false;
			break;
		}
	}
	// TODO check if can equip ? (level, type...)
	it.isEquipped = true;
	refreshPlayerStats();
}



function refreshPlayerStats() {
	console.log('refreshPlayerStats');
	let bonusesToApply = {
		maxHp: 0,
		hp: 0,
		ac: 0,
		str: 0,
		const: 0,
		intel: 0,
		dex: 0,
		luck: 0
	}

	for(let i=0; i<player.backpack.length; i++) {
		let item = player.backpack[i];
		if(!item.isEquipped) {
			continue;
		}
		for(let key in bonusesToApply) {
			if(item[key] && item[key] != 0) {
				bonusesToApply[key] += item[key];
			}
		}

	console.log('item.isEquipped : ', item.isEquipped);
	console.log('bonusesToApply : ', bonusesToApply);
	}
	// applying bonuses
	player.maxHp = player.root_maxHp + bonusesToApply.maxHp;
	player.ac = player.root_ac + bonusesToApply.ac;
	player.str = player.root_str + bonusesToApply.str;
	player.const = player.root_const + bonusesToApply.const;
	player.intel = player.root_intel + bonusesToApply.intel;
	player.dex = player.root_dex + bonusesToApply.dex;
	player.luck = player.root_luck + bonusesToApply.luck;
}











var testEnemy = {
	name: 'rabbit',
	ac: 13,
	hpMax: 50,
	hp: 50,
	const: 8
};



function computeAttack(who) {
	// ROLL FOR AC
	let hitRoll = rolls('1d20')
	let playerHitChanceBonus = Math.floor(player.dex/4);
	hitRoll += playerHitChanceBonus;

	if(hitRoll >= testEnemy.ac) {
		let attackDmg = 0;
		for(let i=0; i<player.backpack.length; i++) {
			let item = player.backpack[i];
			if(
				item.isEquipped
				&& item.damageDice != null
			) {
				attackDmg += rolls(item.damageDice);
			}
		}
		if(attackDmg == 0) {
			attackDmg += rolls('1d4');
		}
		// who's stats (already with equipped items modifiers) 

		testEnemy.hp -= attackDmg;
		if(testEnemy.hp <= 0) {
			testEnemy.hp = 0;
		}
	}
	// if hits, ROLL FOR DAMAGE
		// who's "weapon.damageDice"
		// if no weapon, "1d4"

}





/* * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * */
class Character {
    constructor(data) {
        this.name = data.name;
        this.level = data.level;
        this.hp = data.hp;
        this.maxHp = data.maxHp;
        this.ac = data.ac;
        this.str = data.str;
        this.const = data.const;
        this.intel = data.intel;
        this.dex = data.dex;
        this.luck = data.luck;
        this.root_maxHp = data.maxHp;
		this.root_ac = data.ac;
		this.root_str = data.str;
		this.root_const = data.const;
		this.root_intel = data.intel;
		this.root_dex = data.dex;
		this.root_luck = data.luck;
        this.backpack = data.backpack;
        this.money = data.money;
    }
}

class Player extends Character {
    constructor(data) {
        super(data);
        this.skills = data.skills;
    }
}

class BuyAndSell_Methods {
    constructor(data) {
    	this.sellingPrice = data.sellingPrice;
    	this.buyingPrice = data.buyingPrice;
    }
    buy() {
        if(player.money < this.buyingPrice) {
        	return;
        }
        player.money -= this.buyingPrice;
        player.backpack.push(this);
    }
    sell() {
        player.money += this.sellingPrice;
        // TODO better item identificator for removal. Current : removes one item with same name
        player.backpack.splice(player.backpack.findIndex(it => it.name == this.name), 1);
    }
}


class Item_Entity extends BuyAndSell_Methods {
    constructor(data) {
        super(data);
    	this.name = data.name;
		this.description = data.description;
		this.isAvailableInFight = data.isAvailableInFight;
		this.iconPath = data.iconPath;
		this.quantity = data.quantity;
		// methods
		this.doEffect = data.doEffect;
	}
}


class Equipment_Entity extends BuyAndSell_Methods {
    constructor(data) {
        super(data);
    	this.type = data.type
		this.name = data.name
		this.iconPath = data.iconPath
		this.description = data.description
		this.damageDice = data.damageDice
		this.maxHp = data.maxHp
		this.hp = data.hp
		this.ac = data.ac
		this.str = data.str
		this.const = data.const
		this.intel = data.intel
		this.dex = data.dex
		this.luck = data.luck
		this.isEquipment = true;
		this.isEquipped = false;
	}

    toggleEquipment(event, rivetsBinding) {
        doToggleEquipment(rivetsBinding.eq);
    }
	
}















/* * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeMapByAttrFromList(list, attrName) {
	if(!attrName) {
		attrName = 'name';
	}
	let tempMap = new Map();
	for (var i = 0; i < list.length; i++) {
		let elem = list[i];
		if(tempMap.get(elem[attrName]) != null) {
			let tempList = tempMap.get(elem[attrName]);
			tempList.push(elem);
			tempMap.set(elem[attrName], tempList);
		} else {
			tempMap.set(elem[attrName], [elem]);
		}
	}
	return tempMap;
}

/** 
@str : must be ex: 3d6+6 
*/
function rollsWithMod(str, mod) {
	if(mod == undefined) {
		return rolls(str);
	}
	let r1 = rolls(str);
	let r2 = rolls(str);
	
	let res = r1 > r2 ? mod ? r1 : r2 : mod ? r2 : r1;
	let debugMsg = 'Rolling ' + str + ' with ';
	debugMsg += mod ? 'advantage' : 'disadvantage';
	debugMsg += ' -> ' + res;
	return res
}
function rolls(str) {
	if(str.split('d') != null && str.split('d').length != 2) {
		return null;
	}
	let result = 0;
	let staticBonus = 0;
	let nbDice = parseInt(str.split('d')[0]);
	let mods = str.split('d')[1];
	let typeDice = mods.split('+')[0];
	if(mods.split('+').length == 2) {
		staticBonus = parseInt(mods.split('+')[1]);
	}
	for(let i=0; i<nbDice; i++) {
		result += getRandomInt(1, typeDice);
	}
	result += staticBonus;
	return result;
}

function roll(d) {
	return getRandomInt(1, d);
}