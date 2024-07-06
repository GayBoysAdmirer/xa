const { Client, GatewayIntentBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, Events, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const { token, ownerId } = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Przechowywanie menedżerów i priorytetowych kanałów
const raidManagers = new Map();
const priorityChannels = new Set();
const priorityRoles = ["1094860225955242115", "1124781716700143717", "1165383754211131473"];
const priorityServerId = "1094726552610156688";

// Lista emoji dla priorytetowego serwera
const priorityEmojis = [
    { id: "1259195576696967238", name: "1a" },
    { id: "1259195010281373727", name: "2a" },
    { id: "1259195594879008768", name: "3a" },
    { id: "1259195005957046313", name: "4a" },
    { id: "1259195620946874408", name: "5a" },
    { id: "1259195002483900416", name: "6a" },
    { id: "1259195746977058976", name: "7a" },
    { id: "1259194998620950630", name: "8a" },
    { id: "1259195767625875486", name: "9a" },
    { id: "1259194995265638530", name: "10a" },
    { id: "1259195801037574287", name: "11a" },
    { id: "1259195299793080391", name: "1w" },
    { id: "1259195030963486802", name: "2w" },
    { id: "1259195323524321330", name: "3w" },
    { id: "1259195027951976538", name: "4w" },
    { id: "1259195388561326251", name: "5w" },
    { id: "1259195023644295333", name: "6w" },
    { id: "1259195416075964518", name: "7w" },
    { id: "1259195020456628274", name: "8w" },
    { id: "1259195017969401908", name: "9w" },
    { id: "1259195482841022556", name: "10w" },
    { id: "1259195013758324787", name: "11w" },
    { id: "1259194991679635557", name: "1m" },
    { id: "1259195887536701460", name: "2m" },
    { id: "1259194988269404275", name: "3m" },
    { id: "1259195926132686899", name: "4m" },
    { id: "1259194984511574108", name: "5m" },
    { id: "1259195976334311495", name: "6m" },
    { id: "1259194981126635621", name: "7m" },
    { id: "1259194978966569053", name: "8m" },
    { id: "1259195995695091783", name: "9m" },
    { id: "1259194975430643742", name: "10m" },
    { id: "1259194973249863774", name: "11m" },
    { id: "1259194972247298108", name: "1x" },
    { id: "1259194970494210149", name: "2x" },
    { id: "1259194968946376825", name: "3x" },
    { id: "1259194967545479188", name: "4x" },
    { id: "1259194966190592144", name: "5x" },
    { id: "1259194964819181628", name: "6x" },
    { id: "1259194963015762121", name: "7x" }
];

// Lista emoji dla reszty serwerów
const defaultEmojis = [
    { id: "1259195576696967238", name: "1a" },
    { id: "1259195010281373727", name: "2a" },
    { id: "1259195594879008768", name: "3a" },
    { id: "1259195005957046313", name: "4a" },
    { id: "1259195620946874408", name: "5a" },
    { id: "1259195002483900416", name: "6a" },
    { id: "1259195746977058976", name: "7a" },
    { id: "1259194998620950630", name: "8a" },
    { id: "1259195767625875486", name: "9a" },
    { id: "1259194995265638530", name: "10a" },
    { id: "1259195801037574287", name: "11a" },
    { id: "1259195299793080391", name: "1w" },
    { id: "1259195030963486802", name: "2w" },
    { id: "1259195323524321330", name: "3w" },
    { id: "1259195027951976538", name: "4w" },
    { id: "1259195388561326251", name: "5w" },
    { id: "1259195023644295333", name: "6w" },
    { id: "1259195416075964518", name: "7w" },
    { id: "1259195020456628274", name: "8w" },
    { id: "1259195017969401908", name: "9w" },
    { id: "1259195482841022556", name: "10w" },
    { id: "1259195013758324787", name: "11w" },
    { id: "1259194991679635557", name: "1m" },
    { id: "1259195887536701460", name: "2m" },
    { id: "1259194988269404275", name: "3m" },
    { id: "1259195926132686899", name: "4m" },
    { id: "1259194984511574108", name: "5m" },
    { id: "1259195976334311495", name: "6m" },
    { id: "1259194981126635621", name: "7m" },
    { id: "1259194978966569053", name: "8m" },
    { id: "1259195995695091783", name: "9m" },
    { id: "1259194975430643742", name: "10m" },
    { id: "1259194973249863774", name: "11m" },
    { id: "1259194972247298108", name: "1x" },
    { id: "1259194970494210149", name: "2x" },
    { id: "1259194968946376825", name: "3x" },
    { id: "1259194967545479188", name: "4x" },
    { id: "1259194966190592144", name: "5x" },
    { id: "1259194964819181628", name: "6x" },
    { id: "1259194963015762121", name: "7x" }
];

client.once('ready', () => {
    console.log(`Zalogowano jako ${client.user.tag}!`);
});

// Funkcja do sprawdzania, czy użytkownik jest menedżerem raidu
function isRaidManager(guildId, userId) {
    if (!raidManagers.has(guildId)) {
        return false;
    }
    return raidManagers.get(guildId).has(userId);
}

// Funkcja do dodawania menedżera raidu
function addRaidManager(guildId, userId) {
    if (!raidManagers.has(guildId)) {
        raidManagers.set(guildId, new Set());
    }
    raidManagers.get(guildId).add(userId);
}

// Funkcja do usuwania menedżera raidu
function removeRaidManager(guildId, userId) {
    if (raidManagers.has(guildId)) {
        raidManagers.get(guildId).delete(userId);
    }
}

// Funkcja do usuwania użytkownika z listy
async function removeUserFromList(message, userId) {
    const embed = message.embeds[0];
    const fields = embed.fields;
    let removed = false;
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].value.includes(`<@${userId}>`)) {
            fields[i].value = '\u200B'; // Usuń użytkownika z tego miejsca
            removed = true;
            break;
        }
    }
    if (removed) {
        await message.edit({ embeds: [embed] });
        return true;
    } else {
        return false;
    }
}

client.on('messageCreate', async message => {
    if (message.content.startsWith('!newraid') || message.content.startsWith('!prioraid')) {
        const isPriorityRaid = message.content.startsWith('!prioraid');
        const args = message.content.match(/"[^"]+"|[^\s]+/g);
        const raidName = args[1].replace(/"/g, '');
        const raidDay = args[2].replace(/"/g, '');
        const raidTime = args[3].replace(/"/g, '');
        const positions = parseInt(args[4]);

        const channelName = `${raidName}-${raidDay}-${raidTime}`.replace(/\s+/g, '-').toLowerCase();
        const formattedRaidName = raidName.toUpperCase();
        
        // Tworzenie nowego kanału
        const raidChannel = await message.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: message.guild.id,
                    allow: [PermissionsBitField.Flags.ViewChannel],
                    deny: [PermissionsBitField.Flags.SendMessages]
                },
                {
                    id: message.author.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels]
                }
            ]
        });

        if (isPriorityRaid) {
            priorityChannels.add(raidChannel.id);
        }

        const embed = new EmbedBuilder()
            .setTitle(`Raid: ${formattedRaidName}`)
            .setDescription(`**When?** ${raidDay} ${raidTime}`)
            .setColor(0xff0000);

        for (let i = 1; i <= positions; i++) {
            embed.addFields({ name: `${i}.`, value: '\u200B', inline: false });
        }

        // Wybierz odpowiednią listę emoji
        const emojis = message.guild.id === priorityServerId ? priorityEmojis : defaultEmojis;

        const actionRows = [];
        for (let i = 0; i < 8; i++) {
            const row = new ActionRowBuilder();
            for (let j = 0; j < 5; j++) {
                const index = i * 5 + j;
                if (index >= 40) break;

                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`join${index + 1}`)
                        .setLabel(' ')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji(emojis[index])
                );
            }
            actionRows.push(row);
        }

        // Przycisk "Wypisz"
        const outRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('out')
                .setLabel('Wypisz')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌')
        );

        // Wyślij embed z listą do nowego kanału
        const embedMessage = await raidChannel.send({ embeds: [embed] });

        // Wyślij przyciski do nowego kanału
        for (const row of actionRows) {
            await raidChannel.send({ components: [row] });
        }
        await raidChannel.send({ components: [outRow] });

        // Zapisz wiadomość z embede
        client.embedMessageId = embedMessage.id;
    } else if (message.content.startsWith('!addmanager')) {
        const args = message.content.split(' ');
        const userId = args[1].replace(/[<@!>]/g, ''); // Usuń znaczniki Discorda

        if (message.author.id === ownerId) {
            addRaidManager(message.guild.id, userId);
            message.reply(`Użytkownik <@${userId}> został dodany jako menedżer raidu.`);
        } else {
            message.reply('Nie masz uprawnień do dodawania menedżerów raidu.');
        }
    } else if (message.content.startsWith('!removemanager')) {
        const args = message.content.split(' ');
        const userId = args[1].replace(/[<@!>]/g, ''); // Usuń znaczniki Discorda

        if (message.author.id === ownerId) {
            removeRaidManager(message.guild.id, userId);
            message.reply(`Użytkownik <@${userId}> został usunięty z menedżerów raidu.`);
        } else {
            message.reply('Nie masz uprawnień do usuwania menedżerów raidu.');
        }
    } else if (message.content.startsWith('!out')) {
        const args = message.content.split(' ');
        const userId = args[1].replace(/[<@!>]/g, ''); // Usuń znaczniki Discorda

        if (isRaidManager(message.guild.id, message.author.id)) {
            const raidChannel = message.channel;
            const raidMessage = await raidChannel.messages.fetch(client.embedMessageId);
            const success = await removeUserFromList(raidMessage, userId);
            if (success) {
                message.reply(`Użytkownik <@${userId}> został usunięty z listy.`);
            } else {
                message.reply('Użytkownik nie jest zapisany na liście.');
            }
        } else {
            message.reply('Nie masz uprawnień do usuwania użytkowników z listy.');
        }
    } else if (message.content.startsWith('!deleteprio')) {
        if (message.guild.id !== priorityServerId) {
            return message.reply('Ta komenda jest dostępna tylko na serwerze o ID 1094726552610156688.');
        }

        priorityChannels.delete(message.channel.id);
        message.reply('Priorytet został usunięty. Teraz każdy może się zapisać.');
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

    const message = await interaction.channel.messages.fetch(client.embedMessageId);
    const embed = message.embeds[0];
    const fields = embed.fields;
    const user = `<@${interaction.user.id}>`;

    if (interaction.customId.startsWith('join')) {
        if (priorityChannels.has(interaction.channelId) && !interaction.member.roles.cache.some(role => priorityRoles.includes(role.id))) {
            return interaction.reply({ content: 'Nie masz priorytetu!', ephemeral: true });
        }

        let alreadyJoined = false;
        let emptyFieldIndex = -1;

        // Sprawdź, czy użytkownik jest już zapisany i znajdź pierwszy wolny slot
        for (let i = 0; i < fields.length; i++) {
            if (fields[i].value.includes(user)) {
                alreadyJoined = true;
                break;
            } else if (fields[i].value === '\u200B' && emptyFieldIndex === -1) {
                emptyFieldIndex = i;
            }
        }

        if (alreadyJoined) {
            await interaction.reply({ content: 'Jesteś już zapisany!', ephemeral: true });
        } else if (emptyFieldIndex !== -1) {
            const emoji = message.guild.id === priorityServerId ? priorityEmojis[parseInt(interaction.customId.replace('join', '')) - 1] : defaultEmojis[parseInt(interaction.customId.replace('join', '')) - 1];
            fields[emptyFieldIndex].value = `${user} <:${emoji.name}:${emoji.id}>`;
            await message.edit({ embeds: [embed] });
            await interaction.deferUpdate();
        } else {
            await interaction.reply({ content: 'Brak wolnych miejsc!', ephemeral: true });
        }
    } else if (interaction.customId === 'out') {
        let removed = false;
        for (let i = 0; i < fields.length; i++) {
            if (fields[i].value.includes(user)) {
                fields[i].value = '\u200B'; // Usuń użytkownika z tego miejsca
                removed = true;
                break;
            }
        }
        if (removed) {
            await message.edit({ embeds: [embed] });
            await interaction.reply({ content: 'Zostałeś wypisany!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Nie jesteś zapisany!', ephemeral: true });
        }
    }
});

client.login(token);
