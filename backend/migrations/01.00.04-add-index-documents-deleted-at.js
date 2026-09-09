'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addIndex('documents', ['deleted_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('documents', ['deleted_at']);
  },
};
