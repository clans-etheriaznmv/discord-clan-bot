const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Clan = require('../../models/Clan');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clans-points-add')
    .setDescription('Añadir puntos a un clan')
    .addStringOption(option =>
      option.setName('clan')
        .setDescription('Nombre del clan')
        .setRequired(true)
    )
    .addNumberOption(option =>
      option.setName('cantidad')
        .setDescription('Cantidad de puntos a añadir')
        .setRequired(true)
        .setMinValue(1)
    ),
  async execute(interaction) {
    try {
      const clanName = interaction.options.getString('clan');
      const points = interaction.options.getNumber('cantidad');

      // Buscar clan
      const clan = await Clan.findOne({ name: clanName });
      if (!clan) {
        return interaction.reply({
          content: '❌ Clan no encontrado.',
          ephemeral: true,
        });
      }

      const oldPoints = clan.points;
      clan.points += points;

      await clan.save();

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('✅ Puntos Añadidos')
        .addFields(
          { name: 'Clan', value: clanName, inline: true },
          { name: 'Puntos Añadidos', value: `+${points}`, inline: true },
          { name: 'Puntos Anteriores', value: oldPoints.toString(), inline: true },
          { name: 'Puntos Actuales', value: clan.points.toString(), inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error en clans-points-add:', error);
      await interaction.reply({
        content: '❌ Ocurrió un error al añadir los puntos.',
        ephemeral: true,
      });
    }
  },
};
