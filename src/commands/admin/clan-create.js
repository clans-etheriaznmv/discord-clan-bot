const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Clan = require('../../models/Clan');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clan-create')
    .setDescription('Crear un nuevo clan')
    .addStringOption(option =>
      option.setName('nombre')
        .setDescription('Nombre del clan')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('descripcion')
        .setDescription('Descripción del clan')
        .setRequired(false)
    ),
  async execute(interaction) {
    try {
      const clanName = interaction.options.getString('nombre');
      const description = interaction.options.getString('descripcion') || 'Sin descripción';

      // Validar nombre único
      const existingClan = await Clan.findOne({ name: clanName });
      if (existingClan) {
        return interaction.reply({
          content: '❌ Ya existe un clan con ese nombre.',
          ephemeral: true,
        });
      }

      // Crear clan
      const newClan = new Clan({
        name: clanName,
        leader: interaction.user.id,
        members: [
          {
            userId: interaction.user.id,
            username: interaction.user.username,
          },
        ],
        description: description,
      });

      await newClan.save();

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Clan Creado')
        .addFields(
          { name: 'Nombre', value: clanName, inline: true },
          { name: 'Líder', value: interaction.user.username, inline: true },
          { name: 'Miembros', value: '1', inline: true },
          { name: 'Descripción', value: description }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error en clan-create:', error);
      await interaction.reply({
        content: '❌ Ocurrió un error al crear el clan.',
        ephemeral: true,
      });
    }
  },
};
