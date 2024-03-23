function spawnCreeps(spawn, role, targetCount) {
    var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == role);
	
	var currentRoleCount = 0;
	if (spawn.memory['role:' + role + ':count']) {
		currentRoleCount = spawn.memory['role:' + role + ':count'];
	}
	else {
		spawn.memory['role:' + role + ':count'] = 0;
	}

	// console.log(role + ' (targetCount: ' + targetCount + ')');
    // console.log(role + ' (currentRoleCount: ' + currentRoleCount + ')');

	// if (spawn.memory['energy:' + role + ':count']) {

	// }

	if (creeps.length < targetCount) {
		var newName = role + Game.time;
		// var newName = role + currentRoleCount;
		console.log('Spawning new ' + role + ':' + newName);
		var defaultMemory = {memory: {role: role, spawnCount: currentRoleCount}};
		switch (role) {
			case 'upgrader':
				spawn.spawnCreep([WORK,CARRY,CARRY,MOVE,MOVE], newName, defaultMemory);
				break;
			case 'harvester':
				spawn.spawnCreep([WORK,CARRY,MOVE], newName, defaultMemory);
				break;
			case 'bigHarvester':
				spawn.spawnCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], newName, defaultMemory);
				break;
			case 'builder':
				spawn.spawnCreep([WORK,CARRY,MOVE], newName, defaultMemory);
				break;
			default:
				throw new Error('Role ' + role + ' not supported in manager.creep.spawnCreeps');
		}
		spawn.memory['role:' + role + ':count'] = currentRoleCount++;
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
		spawnCreeps(spawn,'bigHarvester', 1);
		spawnCreeps(spawn,'harvester', 2);
		spawnCreeps(spawn,'upgrader', 2);
		spawnCreeps(spawn,'builder', 3);
	}
};

module.exports = creepManager;