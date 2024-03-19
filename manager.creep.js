// function spawnCreeps(spawn, role, targetCount) {
//     var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == 'role');
// 	console.log('role: ' + harvesters.length);
	
// 	if (creeps.length < targetCount) {
// 		var newName = role + Game.time;
// 		console.log('Spawning new ' + role + ':': ' + newName);
// 		switch (role) {
// 		    case 'harvester':
// 		    case 'upgrader':
// 		    case 'builder':
// 		        spawn.spawnCreep([WORK,CARRY,MOVE], newName, {memory: {role: role}});
// 		    default:
// 		        throw new Error('Role ' + role + ' not supported in manager.creep.spawnCreeps');
// 		}
		
// 	}
// }

var creepManager = {
    manageCreeps: function() {
		for(var name in Memory.creeps) {
			if(!Game.creeps[name]) {
					delete Memory.creeps[name];
					console.log('Clearing non-existing creep memory:', name);
				}
		}
		
// 		var spawn = Game.spawns['Carthage'];
// 		spawnCreeps(spawn,'harvester', 2);
// 		spawnCreeps(spawn,'upgrader', 2);
// 		spawnCreeps(spawn,'builder', 2);
			
		var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
// 		console.log('Harvesters: ' + harvesters.length);
		
		var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
// 		console.log('Upgraders: ' + harvesters.length);
		
		var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
// 		console.log('Upgraders: ' + harvesters.length);
		
		if(harvesters.length < 2) {
			var newName = 'Harvester' + Game.time;
			console.log('Spawning new harvester: ' + newName);
			Game.spawns['Carthage'].spawnCreep([WORK,CARRY,MOVE], newName, 
				{memory: {role: 'harvester'}});
		}
		
		if(upgraders.length < 2) {
			var newName = 'Upgrader' + Game.time;
			console.log('Spawning new upgrader: ' + newName);
			Game.spawns['Carthage'].spawnCreep([WORK,CARRY,CARRY,MOVE,MOVE], newName, {memory: {role: 'upgrader'}});
		}
		
		if(builders.length < 2) {
			var newName = 'Builder' + Game.time;
			console.log('Spawning new builder: ' + newName);
			Game.spawns['Carthage'].spawnCreep([WORK,CARRY,MOVE], newName, {memory: {role: 'builder'}});
		}
		
		if(Game.spawns['Carthage'].spawning) { 
			var spawningCreep = Game.creeps[Game.spawns['Carthage'].spawning.name];
			Game.spawns['Carthage'].room.visual.text(
				'🛠️' + spawningCreep.memory.role,
				Game.spawns['Carthage'].pos.x + 1, 
				Game.spawns['Carthage'].pos.y, 
				{align: 'left', opacity: 0.8});
		}
	}
};

module.exports = creepManager;