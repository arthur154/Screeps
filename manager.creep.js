// IMPORTANT NOTES:
// Spawns should have a shouldSendNotifications boolean memory value set to true when created

// TODO:
// Should we have spawn roles? Spawns with minerals in the room? Multiple vs. 1 engery source? Etc.

// TODO: Add function description
function getWorkerBodyParts(spawn) {
	// Target energy usage = 70% total energy capacity in the room
	var targetEnergyUsage = spawn.room.energyCapacityAvailable * 0.7;

	if (spawn.room.energyAvailable > targetEnergyUsage) {
		targetEnergyUsage = spawn.room.energyAvailable;
	}

	// The ideal base body parts are [WORK,CARRY,CARRY,MOVE,MOVE] which is 300 energy
	var idealBaseBodyCount = Math.floor(targetEnergyUsage / 300);

	var idealBaseBody = [];
	if (idealBaseBodyCount > 0) {
		idealBaseBody = [].concat(...Array(idealBaseBodyCount).fill([WORK,CARRY,CARRY,MOVE,MOVE]));
	}

	// Each extension built, provides 50 base engery
	if (targetEnergyUsage % 300 >= 250) { 
		// console.log(`${idealBaseBodyCount} base body parts with an additional [WORK,CARRY,CARRY,MOVE] body parts needed`);
		return idealBaseBody.concat([WORK,CARRY,CARRY,MOVE]); 
	}
	if (targetEnergyUsage % 300 >= 200) { 
		// console.log(`${idealBaseBodyCount} base body parts with an additional [WORK,CARRY,MOVE] body parts needed`);
		return idealBaseBody.concat([WORK,CARRY,MOVE]); 
	}
	if (targetEnergyUsage % 300 >= 150) { 
		// console.log(`${idealBaseBodyCount} base body parts with an additional [WORK,CARRY] body parts needed`);
		return idealBaseBody.concat([WORK,CARRY]); 
	}
	if (targetEnergyUsage % 300 >= 100) { 
		// console.log(`${idealBaseBodyCount} base body parts with an additional [WORK] body part needed`);
		return idealBaseBody.concat([WORK]); 
	}
	if (targetEnergyUsage % 300 >= 50) { 
		// console.log(`${idealBaseBodyCount} base body parts with an additional [CARRY] body part needed`);
		return idealBaseBody.concat([CARRY]); 
	}
	
	// console.log(`No additional body parts needed`);
	return idealBaseBody;
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
			// return { harvester: 3, upgrader: 3, builder: 3 };

			// Temporary - we don't have anything to build rn
			return { harvester: 4, upgrader: 3, builder: 0 };
		default:
			throw new Error(`Controller level ${spawn.room.controller.level} not supported in manager.creep.getTargetCreepCounts`);
	}
}

function spawnCreeps(spawn) {
	// Short cuircit if we are already spawning a creep
	if (spawn.spawning) {
		return;
	}

	var creepsInSpawnRoom = spawn.room.find(FIND_MY_CREEPS);	
	var harvestersInSpawnRoom = _.filter(creepsInSpawnRoom, (creep) => creep.memory.role === 'harvester');

	// Target number of creeps based on spawn.room.controller.level
	var targetCreepCounts = getTargetCreepCounts(spawn);
	// console.log(`Target creep counts in room ${spawn.room.name} ${targetCreepCounts.harvester}  ${targetCreepCounts.upgrader}  ${targetCreepCounts.builder}`);

	var role = undefined;
	var bodyParts = getWorkerBodyParts(spawn);
	if (harvestersInSpawnRoom.length < targetCreepCounts.harvester) {
		role = 'harvester';
	}
	else if (_.filter(creepsInSpawnRoom, (creep) => creep.memory.role === 'upgrader').length < targetCreepCounts.upgrader) {
		role = 'upgrader';
	}
	else if (_.filter(creepsInSpawnRoom, (creep) => creep.memory.role === 'builder').length < targetCreepCounts.builder) {
		role = 'builder';
	}
	else {
		// console.log('All target creep values reached');
		return;
	}

	var newName = role + Game.time;
	var defaultMemory = {memory: {role: role}};
	var spawnResult = spawn.spawnCreep(bodyParts, newName, defaultMemory);
	if (spawnResult === OK) {
		console.log(`Started spawn for (name:${newName} role:${role} body:[${bodyParts}])`);
	}
	else if (spawnResult === ERR_NOT_ENOUGH_ENERGY) {
		// console.log(`Failed to spawn role:${role} in room ${spawn.room.name} (energy:${spawn.room.energyAvailable}/${spawn.room.energyCapacityAvailable})`);
		if (role === 'harvester') {
			if (harvestersInSpawnRoom.length === 1) {
				console.log(`WARN: Spawn harvester in room ${spawn.room.name} failed and there is not enough energy to create a second harvester`);
			}
			else if (harvestersInSpawnRoom.length === 0) {
				// Panic
				throw new Error(`Spawn harvester in room ${spawn.room.name} failed and there is not enough energy to create a harvester`);
			}
		}
	}
	else {
		var spawnResultDesc = '?'
		if (spawnResult === ERR_NOT_OWNER) { spawnResultDesc = 'ERR_NOT_OWNER'; }
		else if (spawnResult === ERR_NAME_EXISTS) { spawnResultDesc = 'ERR_NAME_EXISTS'; }
		else if (spawnResult === ERR_BUSY) { spawnResultDesc = 'ERR_BUSY'; }
		else if (spawnResult === ERR_INVALID_ARGS) { spawnResultDesc = 'ERR_INVALID_ARGS'; }
		else if (spawnResult === ERR_RCL_NOT_ENOUGH) { spawnResultDesc = 'ERR_RCL_NOT_ENOUGH'; }
		throw new Error(`Spawn creep in room ${spawn.room.name} failed with spawnCreepResult: ${spawnResult} (${spawnResultDesc})`);
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