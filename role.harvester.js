function getEnergySourceIndex(creep) {
    // TODO: Get source based on current usage
    // var energySourceIndex = creep.memory['energySourceIndex'];
    // if (!energySourceIndex) {
    //     energySourceIndex = 0;
    // }
    // return energySourceIndex;
    return 0;
}

// Creep state: DEPOSITING
function depositEnergy(creep, depositTargets) {
    // Nothing to deposit
    if (creep.store.getUsedCapacity() === 0) {
        creep.say('🔄 go to H');
        creep.memory['currentActionState'] = 'GOING_TO_HARVEST';
    }
    // TODO: We can probably get a small efficiency bump by having the creeps try to deposit extensions first
    // TODO: Find closest deposit (might have to be careful with deposits right next to eachother)
    else if(creep.transfer(depositTargets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.say('🔄 go to D');
        creep.memory['currentActionState'] = 'GOING_TO_DEPOSIT';
        creep.moveTo(depositTargets[0], {visualizePathStyle: {stroke: '#ffffff'}});
    }
    // TODO: Check for unexpected return values
}

// Creep state: HARVESTING
function harvestEnergySource(creep, energySources) {
    if(creep.store.getFreeCapacity() > 0) {
        var energySourceIndex = getEnergySourceIndex(creep);
        var energySource = energySources[energySourceIndex];

        if (energySource.energy > 0) {
            creep.harvest(energySource);
        }
        else  {
            // TODO: Need to test this logic
            // If we've collected < 30% of what we can hold, then let's just hang around until the energy refreshes
            if (creep.store.getUsedCapacity() / creep.store.getCapacity() > 0.3) {
                creep.say('🔄 go to D');
                creep.memory['currentActionState'] = 'GOING_TO_DEPOSIT';
            }
            else {
                creep.say('🔄 waiting');
            }
        }
    }
    else {
        creep.say('🔄 go to D');
        creep.memory['currentActionState'] = 'GOING_TO_DEPOSIT';
    }
}

// Creep state: GOING_TO_HARVEST
function moveCreepToEnergySource(creep, energySources) {
    var energySourceIndex = getEnergySourceIndex(creep);

    if(creep.harvest(energySources[energySourceIndex]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(energySources[energySourceIndex], {visualizePathStyle: {stroke: '#ffaa00'}});
    }
    else {
        creep.say('🔄 harvest E');
        creep.memory['currentActionState'] = 'HARVESTING';
    }
    // TODO: Check for unexpected return values
}

// Creep state: GOING_TO_DEPOSIT
function moveCreepToEnergyDeposit(creep, depositTargets) {
    if(creep.transfer(depositTargets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(depositTargets[0], {visualizePathStyle: {stroke: '#ffffff'}});
    }
    else {
        creep.say('🔄 deposit E');
        creep.memory['currentActionState'] = 'DEPOSITING';
    }
    // TODO: Check for unexpected return values
}

// GOING_TO_HARVEST -> HARVESTING
// HARVESTING -> GOING_TO_DEPOSIT
// GOING_TO_DEPOSIT -> DEPOSITING
// DEPOSITING -> GOING_TO_HARVEST || GOING_TO_DEPOSIT
var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var currentActionState = creep.memory['currentActionState'];
        if (creep.memory['currentActionState'] === undefined) {
            currentActionState = 'GOING_TO_HARVEST';
            creep.memory['currentActionState'] = 'GOING_TO_HARVEST';
        }

        var energySources = creep.room.find(FIND_SOURCES); // FIND_SOURCES_ACTIVE
        var depositTargets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        switch (currentActionState) {
            case 'GOING_TO_HARVEST':
                moveCreepToEnergySource(creep, energySources);
                break;
            case 'HARVESTING':
                harvestEnergySource(creep, energySources);
                break;
            case 'GOING_TO_DEPOSIT':
                moveCreepToEnergyDeposit(creep, depositTargets);
                break;
            case 'DEPOSITING':
                depositEnergy(creep, depositTargets);
                break;
            default:
                throw new Error(`Controller level ${spawn.room.controller.level} not supported in manager.creep.getTargetCreepCounts`);
        }
	}
};

module.exports = roleHarvester;