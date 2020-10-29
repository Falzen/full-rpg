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
var settings = {
	showById: {
		playerStats: false,
		inventory: false,
		shop: false
	}
};



var shopData = {
	name: 'Invulnerable Vagrant',
	vendorName: 'Pumat Sols',
	itemsList: ['Potion simple', 'Potion simple', 'Potion simple'],
	equipmentsList: ['boots'],
	inventory: [], // should be filled AFTER 'player' variable instanciation
};






$(document).ready(function() {
	init();
});

function init() {
	initPlayer();

	shopInit();

	rivets.bind($('#mainContainer'), {settings: settings, player: player, shop: shop});
	navigateTo('Inn');
	

}

function initPlayer() {
	player = new Player(playerStats);
	player.backpack.push(new Item_Entity(allItemsByName.get('Potion simple')[0]));
	player.backpack.push(new Equipment_Entity(allEquipmentsByName.get('sword')[0]));
	player.backpack.push(new Equipment_Entity(allEquipmentsByName.get('boots')[0]));
	makeIterableStats()
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
	console.log('shop : ', shop);
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
	stats: {
		hp: 32,
		maxHp: 55,
		ac : 13,
		str : 16,
		const : 15,
		intel : 8,
		dex : 11,
		luck : 13
	},
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
		doEffect: function(event, rivetsBinding) {
			player.stats.hp.value += 20;
			if(player.stats.hp.value > player.stats.maxHp.value) {
				player.stats.hp.value = player.stats.maxHp.value;
			}
			player.backpack.splice(rivetsBinding.index, 1);
			makeIterableStats();
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
		bonuses: {
			maxHp: 	22,
			hp: 	0,
			ac: 	0,
			str: 	0,
			const: 	0,
			intel: 	0,
			dex: 	0,
			luck: 	0
		}
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
		damageDice: null,
		bonuses: {
			maxHp: 	0,
			hp: 	0,
			ac: 	0,
			str: 	0,
			const: 	0,
			intel: 	0,
			dex: 	2,
			luck: 	0
		}
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

	// remove bonuses
	let shouldBeFullHealth = player.stats.hp.value > player.stats.maxHp.root;
	for(let key in player.stats) {
		if(key == 'hp') continue;
		player.stats[key].value = player.stats[key].root;
		player.stats[key].totalBonus = 0;
	}
	if(shouldBeFullHealth) {
		player.stats.hp.value = player.stats.maxHp.root;
	}

	for(let i=0; i<player.backpack.length; i++) {
		let item = player.backpack[i];
		if(!item.isEquipped) {
			continue;
		}
		for(let key in player.stats) {
			if(item.bonuses[key] && item.bonuses[key] != 0) {
				player.stats[key].totalBonus += item.bonuses[key];
				console.log(key + ' bonus: ' + player.stats[key].totalBonus);
			}
		}
		console.log('item.isEquipped : ', item.isEquipped);
	}

	// applying bonuses
	for(let key in player.stats) {
		player.stats[key].value += player.stats[key].totalBonus;
	}
	makeIterableStats();
}

function makeIterableStats() {
	let iterableStats = [];
	for(let key in player.stats) {
		let oneIterableStat = {
			name: player.stats[key].name,
			value: player.stats[key].value,
			root: player.stats[key].root,
			totalBonus: player.stats[key].totalBonus
		};
		iterableStats.push(oneIterableStat);
	}
	player.iterableStats = iterableStats;
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

function navigateTo(name) {
	/*
	settings = {
	showById: {
		playerStats: true,
		inventory: true,
		shop: true
	}
	*/
	settings.showById.playerStats = false;
	settings.showById.inventory = false;
	settings.showById.shop = false;
	$('.destination').removeClass('is-selected');
	$('.'+name).addClass('is-selected');
	
	switch(name) {
		case 'Inn':
			settings.showById.playerStats = true;
			settings.showById.inventory = true;
		break;

		case 'Shop':
			settings.showById.shop = true;
			settings.showById.playerStats = true;
			settings.showById.inventory = true;
		break;

		case 'City':
		break;

	}
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
        this.stats = {
        	hp: {
        		name: 'hp',
        		value: data.stats.hp,
        		root: data.stats.hp,
        		totalBonus: 0,
        	},
        	maxHp: {
        		name: 'maxHp',
        		value: data.stats.maxHp,
        		root: data.stats.maxHp,
        		totalBonus: 0
        	},
			ac: {
				name: 'ac',
				value: data.stats.ac,
				root: data.stats.ac,
				totalBonus: 0
			},
			str: {
				name: 'str',
				value: data.stats.str,
				root: data.stats.str,
				totalBonus: 0
			},
			const: {
				name: 'const',
				value: data.stats.const,
				root: data.stats.const,
				totalBonus: 0
			},
			intel: {
				name: 'intel',
				value: data.stats.intel,
				root: data.stats.intel,
				totalBonus: 0
			},
			dex: {
				name: 'dex',
				value: data.stats.dex,
				root: data.stats.dex,
				totalBonus: 0
			},
			luck: {
				name: 'luck',
				value: data.stats.luck,
				root: data.stats.luck,
				totalBonus: 0
			},
        };
        this.iterableStats = [];
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
    buy(event, rivetsBinding) {
    	console.log('buy()');
    	let elem = rivetsBinding.eq ? rivetsBinding.eq : rivetsBinding.it;
    	let buyingPrice = elem.buyingPrice;
        if(player.money < buyingPrice) {
        	return;
        }
        player.money = parseInt(player.money) - parseInt(buyingPrice);
        var boughtElement = shop.inventory.splice(rivetsBinding.index, 1);
        player.backpack.push(boughtElement[0]);
    }
    sell(event, rivetsBinding) {
    	console.log('sell()');
    	let elem = rivetsBinding.eq ? rivetsBinding.eq : rivetsBinding.it;
    	if(elem.isEquipped) {
    		elem.isEquipped = false;
    		refreshPlayerStats();
    	}

        player.money += elem.sellingPrice;
        var soldElement = player.backpack.splice(rivetsBinding.index, 1);
        shop.inventory.push(soldElement[0]);

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
		this.doEffect = data.doEffect;
	}
    doEffect(event, rivetsBinding) {
    	this.doEffect(event, rivetsBinding);
	}
}


class Equipment_Entity extends BuyAndSell_Methods {
    constructor(data) {
    	console.log('data.bonuses : ', data.bonuses);
        super(data);
    	this.type = data.type;
		this.name = data.name;
		this.iconPath = data.iconPath;
		this.description = data.description;
		this.damageDice = data.damageDice;
		this.bonuses = {
			maxHp : data.bonuses.maxHp,
			hp : data.bonuses.hp,
			ac : data.bonuses.ac,
			str : data.bonuses.str,
			const : data.bonuses.const,
			intel : data.bonuses.intel,
			dex : data.bonuses.dex,
			luck : data.bonuses.luck,
		};
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