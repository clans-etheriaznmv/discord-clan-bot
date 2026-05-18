const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Clan = require('../../models/Clan');
const User = require('../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clans-member-add')
    .setDescription('Añadir un miembro a un clan')
    .addStringOption(option =>
      option.setName('clan')
        .setDescription('Nombre del clan')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a añadir')
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      const clanName = interaction.options.getString('clan');
      const targetUser = interaction.options.getUser('usuario');

      // Buscar clan
      const clan = await Clan.findOne({ name: clanName });
      if (!clan) {
        return interaction.reply({
          content: '❌ Clan no encontrado.',
          ephemeral: true,
        });
      }

      // Verificar que el comando lo ejecuta el líder
      if (clan.leader !== interaction.user.id) {
        return interaction.reply({
          content: '❌ Solo el líder del clan puede añadir miembros.',
          ephemeral: true,
        });
      }

      // Verificar que no esté ya en el clan
      const isMember = clan.members.some(m => m.userId === targetUser.id);
      if (isMember) {
        return interaction.reply({
          content: '❌ Este usuario ya es miembro del clan.',
          ephemeral: true,
        });
      }

      // Añadir miembro
      clan.members.push({
        userId: targetUser.id,
        username: targetUser.username,
      });

      // Actualizar clan del usuario
      let user = await User.findOne({ userId: targetUser.id });
      if (!user) {
        user = new User({
          userId: targetUser.id,
          username: targetUser.username,
          clan: clanName,
        });
      } else {
        user.clan = clanName;
      }

      await clan.save();
      await user.save();

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Miembro Añadido')
        .addFields(
          { name: 'Clan', value: clanName, inline: true },
          { name: 'Nuevo Miembro', value: targetUser.username, inline: true },
          { name: 'Total de Miembros', value: clan.members.length.toString(), inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error en clans-member-add:', error);
      await interaction.reply({
        content: '❌ Ocurrió un error al añadir el miembro.',
        ephemeral: true,
      });
    }
  },
};
