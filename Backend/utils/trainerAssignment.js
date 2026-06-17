const User = require('../models/User');

const assignTrainerToMember = async (memberId, preferredTrainerId = null) => {
  const member = await User.findById(memberId);
  if (!member) {
    throw new Error('Member not found');
  }

  if (member.role !== 'member') {
    throw new Error('Trainer assignment is only allowed for members');
  }

  let trainer = null;

  if (preferredTrainerId) {
    trainer = await User.findOne({ _id: preferredTrainerId, role: 'trainer' });
    if (!trainer) {
      throw new Error('Trainer not found');
    }
  } else {
    const trainers = await User.find({ role: 'trainer' }).select('_id assignedMembers');
    if (!trainers.length) {
      return { member, trainer: null };
    }

    trainer = trainers.reduce((lowestLoadTrainer, currentTrainer) => {
      if (!lowestLoadTrainer) {
        return currentTrainer;
      }

      const currentLoad = Array.isArray(currentTrainer.assignedMembers)
        ? currentTrainer.assignedMembers.length
        : 0;
      const lowestLoad = Array.isArray(lowestLoadTrainer.assignedMembers)
        ? lowestLoadTrainer.assignedMembers.length
        : 0;

      return currentLoad < lowestLoad ? currentTrainer : lowestLoadTrainer;
    }, null);

    trainer = await User.findById(trainer._id);
  }

  if (member.assignedTrainer && member.assignedTrainer.toString() !== trainer._id.toString()) {
    await User.findByIdAndUpdate(member.assignedTrainer, {
      $pull: { assignedMembers: member._id }
    });
  }

  member.assignedTrainer = trainer._id;
  await member.save();

  await User.findByIdAndUpdate(trainer._id, {
    $addToSet: { assignedMembers: member._id }
  });

  return { member, trainer };
};

const unassignTrainerFromMember = async (memberId) => {
  const member = await User.findById(memberId);
  if (!member) {
    return null;
  }

  if (member.assignedTrainer) {
    await User.findByIdAndUpdate(member.assignedTrainer, {
      $pull: { assignedMembers: member._id }
    });
  }

  member.assignedTrainer = null;
  await member.save();
  return member;
};

module.exports = {
  assignTrainerToMember,
  unassignTrainerFromMember,
};
