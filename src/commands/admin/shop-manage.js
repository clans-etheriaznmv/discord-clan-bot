const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop-manage')
    .setDescription('Gestionar items de la tienda')
    .addSubcommand(subcommand =>
      subcommand
        .setName('agregar')
        .setDescription('Agregar un item a la tienda')
        .addStringOption(option =>
          option.setName('nombre')
            .setDescription('Nombre del item')
            .setRequired(true)
        )
        .addNumberOption(option =>
          option.setName('precio')
            .setDescription('Precio del item en puntos')
            .setRequired(true)
            .setMinValue(1)
        )
        .addStringOption(option =>
          option.setName('descripcion')
            .setDescription('Descripción del item')
            .setRequired(false)
        )
    ),
  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'agregar') {
        const itemName = interaction.options.getString('nombre');
        const price = interaction.options.getNumber('precio');
        const description = interaction.options.getString('descripcion') || 'Sin descripción';

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('✅ Item Añadido a la Tienda')
          .addFields(
            { name: 'Nombre', value: itemName, inline: true },
            { name: 'Precio', value: `${price} puntos`, inline: true },
            { name: 'Descripción', value: description }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Error en shop-manage:', error);
      await interaction.reply({
        content: '❌ Ocurrió un error al gestionar la tienda.',
        ephemeral: true,
      });
    }
  },
};
