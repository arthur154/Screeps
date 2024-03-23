// IMPORTANT NOTES:
// Spawns should have a shouldSendNotifications boolean memory value set to true when created

// TODO:
// Should we have spawn roles? Spawns with minerals in the room? Multiple vs. 1 engery source? Etc.

function getBodyParts(spawn, role) {
	if (spawn.room.energyCapacityAvailable <= 300 && spawn.room.energyAvailable > 200) {
		return [WORK,CARRY,MOVE]; // 200 cost
	}
	switch (role) {
		case 'upgrader':
			if (spawn.room.energyCapacityAvailable <= 550 && spawn.room.energyAvailable > 300) {
				return [WORK,CARRY,CARRY,MOVE,MOVE]; // 300 cost
			}
			if (spawn.room.energyCapacityAvailable <= 800 && spawn.room.energyAvailable > 700) {
				return [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE]; // 700 cost
			}
			break;
		case 'harvester':
			if (spawn.room.energyCapacityAvailable <= 550 && spawn.room.energyAvailable > 300) {
				return [WORK,WORK,CARRY,CARRY,MOVE,MOVE]; // 300 cost
			}
			if (spawn.room.energyCapacityAvailable <= 800 && spawn.room.energyAvailable > 700) {
				return [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE]; // 700 cost
			}
			break;
		case 'builder':
			if (spawn.room.energyCapacityAvailable <= 550 && spawn.room.energyAvailable > 300) {
				return [WORK,CARRY,CARRY,MOVE,MOVE]; // 300 cost
			}
			if (spawn.room.energyCapacityAvailable <= 800 && spawn.room.energyAvailable > 700) {
				return [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE]; // 700 cost
			}
			break;
		default:
			throw new Error('Role ' + role + ' not supported in manager.creep.getBodyParts');
	}

	// console.log(`Unsupportted energyCapacityAvailable ${spawn.room.energyCapacityAvailable} size in room ${spawn.room.name}`)
}

function getTargetCreepCounts(spawn) {
	switch (spawn.room.controller.level) {
		case 0:
			return { harvester: 2, upgrader: 2, builder: 0 };
		case 1:
			return { harvester: 2, upgrader: 2, builder: 1 };
		case 2:
			return { harvester: 2, upgrader: 2, builder: 2 };
		case 3:
		case 4:
		case 5:
		case 6:
		case 7:
		case 8:
			return { harvester: 2, upgrader: 3, builder: 3 };
		default:
			throw new Error('Controller level ' + spawn.room.controller.level + ' not supported in manager.creep.getTargetCreepCounts');
	}
}

function spawnCreeps(spawn) {
	// Short cuircit if we are already spawning a creep
	if (spawn.spawning) {
		return;
	}

	var creepsInSpawnRoom = spawn.room.find(FIND_MY_CREEPS);
	
	var harvestersInSpawnRoom = _.filter(creepsInSpawnRoom, (creep) => creep.memory.role === 'harvester');

	// Emergency scenario - no harvesters and no ability to spawn a harvester
	if (harvestersInSpawnRoom.length === 0 && spawn.room.energyCapacityAvailable < 200) {
		if (spawn.memory.shouldSendNotifications) {
			Game.notify(`No havesters in room ${spawn.room.name} and not enough energy to spawn!`);
			spawn.memory.shouldSendNotifications = false;
		}
		console.log(`No havesters in room ${spawn.room.name} and not enough energy to spawn!`);
		return;
	}

	// Target number of creeps based on spawn.room.controller.level
	var targetCreepCounts = getTargetCreepCounts(spawn);
	// console.log(`Target creep counts in room ${spawn.room.name} ${targetCreepCounts.harvester}  ${targetCreepCounts.upgrader}  ${targetCreepCounts.builder}`);

	var bodyParts = undefined;
	var role = undefined;
	if (harvestersInSpawnRoom.length < targetCreepCounts.harvester) {
		role = 'harvester';
		bodyParts = getBodyParts(spawn, role);
	}
	else if (_.filter(creepsInSpawnRoom, (creep) => creep.memory.role === 'upgrader').length < targetCreepCounts.upgrader) {
		role = 'upgrader';
		bodyParts = getBodyParts(spawn, role);
	}
	else if (_.filter(creepsInSpawnRoom, (creep) => creep.memory.role === 'builder').length < targetCreepCounts.builder) {
		role = 'builder';
		bodyParts = getBodyParts(spawn, role);
	}

	if (bodyParts) {
	    var newName = role + Game.time;
		var defaultMemory = {memory: {role: role}};
		var spawnResult = spawn.spawnCreep(bodyParts, newName, defaultMemory);
		console.log(`Spawn result ${spawnResult == 0 ? 'successful' : `unsuccessful (code: ${spawnResult})`} (name:${newName} role:${role} body:[${bodyParts}])`);
	}
}

var creepManager = {
    manageCreeps: function() {
		for(var name in Memory.creeps) {
			if(!Game.creeps[name]) {
					delete Memory.creeps[name];
					console.log('Clearing non-existing creep memory:', name);
				}
		}
		
		var spawn = Game.spawns['Carthage'];
		spawnCreeps(spawn);
	}
};

module.exports = creepManager;