const express = require("express");
const {
    Client,
    GatewayIntentBits,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    Events,
    EmbedBuilder,
    PermissionsBitField,
    ChannelType,
} = require("discord.js");
const fs = require("fs");


const app = express();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Przechowywanie menedżerów i priorytetowych kanałów
const raidManagers = new Map();
let priorityChannels = new Set();
const priorityRoles = [
    "1094860225955242115",
    "1124781716700143717",
    "1165383754211131473",
];
const priorityServerId = "1094726552610156688";
// Lista emoji dla priorytetowego serwera
const priorityEmojis = [
    { id: "1095004009414283314", name: "archsp1" },
    { id: "1095004578967199865", name: "archsp2" },
    { id: "1095004662832300042", name: "archsp3" },
    { id: "1095004747955712166", name: "archsp4" },
    { id: "1095004811168071710", name: "archsp5" },
    { id: "1095004890213920890", name: "archsp6" },
    { id: "1095004995700662354", name: "archsp7" },
    { id: "1095005054529966181", name: "archsp8" },
    { id: "1095005137229066410", name: "archsp9" },
    { id: "1095005196758810704", name: "archsp10" },
    { id: "1255666385288167444", name: "archsp11" },
    { id: "1095001073854468147", name: "warsp1" },
    { id: "1095003184189149315", name: "warsp2" },
    { id: "1095003271069958164", name: "warsp3" },
    { id: "1095003348123525150", name: "warsp4" },
    { id: "1095003429748875395", name: "warsp5" },
    { id: "1095003529732694147", name: "warsp6" },
    { id: "1095003599211348049", name: "warsp7" },
    { id: "1095003674327138375", name: "warsp8" },
    { id: "1095003772272525454", name: "warsp9" },
    { id: "1095003866677923972", name: "warsp10" },
    { id: "1255664534719303781", name: "warsp11" },
    { id: "1095006313462911016", name: "magsp1" },
    { id: "1095006395025334272", name: "magsp2" },
    { id: "1095006452797677619", name: "magsp3" },
    { id: "1095006513061437440", name: "magsp4" },
    { id: "1095006831396528240", name: "magsp5" },
    { id: "1095006900141182996", name: "magsp6" },
    { id: "1095006969099722892", name: "magsp7" },
    { id: "1095007030466596975", name: "magsp8" },
    { id: "1095007124381241434", name: "magsp9" },
    { id: "1095007187866222683", name: "magsp10" },
    { id: "1255665297235513464", name: "magsp11" },
    { id: "1095007263372083340", name: "mswsp1" },
    { id: "1095007371920691252", name: "mswsp2" },
    { id: "1095007440749203518", name: "mswsp3" },
    { id: "1095007501516275782", name: "mswsp4" },
    { id: "1255667075054043166", name: "mswsp11" },
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
    { id: "1259194963015762121", name: "7x" },
];

client.once("ready", () => {
    console.log(`Zalogowano jako ${client.user.tag}!`);
    loadRaidManagers();
    loadRaidLists(); // Load raid lists when bot starts
});


client.on("messageCreate", async (message) => {
    try {
        if (
            message.content.startsWith("!newraid") ||
            message.content.startsWith("!prioraid")
        ) {
            const isPriorityRaid = message.content.startsWith("!prioraid");
            const args = message.content.match(/"[^"]+"|[^\s]+/g);
            const raidName = args[1].replace(/"/g, "");
            const raidDay = args[2].replace(/"/g, "");
            const raidTime = args[3].replace(/"/g, "");
            const positions = parseInt(args[4]);
            const akt = isPriorityRaid ? args[5]?.replace(/"/g, "") : null; // Nowy argument akt tylko dla !prioraid

            const channelName = `${raidName}-${raidDay}-${raidTime}`
                .replace(/\s+/g, "-")
                .toLowerCase();
            const formattedRaidName = raidName.toUpperCase();

            // Ustawienie kategorii tylko dla !prioraid na priorytetowym serwerze
            let parentId;
            if (isPriorityRaid && message.guild.id === priorityServerId) {
                if (akt === "a8") {
                    parentId = "1199378967300419725"; // ID kategorii dla "a8"
                } else if (akt === "pollu") {
                    parentId = "1126289273780441190"; // ID kategorii dla "pollu"
                } else if (akt === "arma") {
                    parentId = "1126289273780441190"; // ID kategorii dla "arma"
                } else if (akt === "carma") {
                    parentId = "1139537965111054496"; // ID kategorii dla "carma"
                } else {
                    parentId = "1094734625298976899"; // Domyślne ID kategorii dla priorytetowego serwera
                }
            }

            // Tworzenie nowego kanału
            const raidChannel = await message.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: parentId || undefined, // Ustawienie kategorii tylko dla priorytetowych kanałów
                permissionOverwrites: [
                    {
                        id: message.guild.id,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                        deny: [PermissionsBitField.Flags.SendMessages],
                    },
                    {
                        id: message.author.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ManageChannels,
                        ],
                    },
                ],
            });

            if (isPriorityRaid) {
                priorityChannels.add(raidChannel.id);
            }

            const embed = new EmbedBuilder()
                .setTitle(`Raid: ${formattedRaidName}`)
                .setDescription(
                    `**Lider/Leader:** <@${message.author.id}>\n\n` +
                    `**Kiedy?/When?:** ${raidDay} ${raidTime}\n\n` +
                    `**Channel:** 5\n\n` +
                    `**Wymagania/Requirements:** C80 with huge damage, C90\n\n` +
                    `<:emoji1:1115315303283441814> <:emoji2:1115315272350453820> <:emoji3:1165642749110919178>\n\n` +
                    `---\n` // Dodana linia oddzielająca
                )
                .setColor(0xff0000);

            // Ustawienie pozycji na podstawie typu raidu
            if (akt === "arma") {
                for (let i = 1; i <= positions - 2; i++) {
                    embed.addFields({
                        name: `${i}.`,
                        value: "\u200B",
                        inline: false,
                    });
                }
                embed.addFields(
                    {
                        name: `${positions - 1}. (WK)`,
                        value: "\u200B",
                        inline: false,
                    },
                    {
                        name: `${positions}. (CRUSS)`,
                        value: "\u200B",
                        inline: false,
                    },
                    {
                        name: `Rezerwowi/Reserves:`,
                        value: "\u200B",
                        inline: false,
                    }
                );
            } else if (akt === "pollu") {
                for (let i = 1; i <= positions - 3; i++) {
                    embed.addFields({
                        name: `${i}.`,
                        value: "\u200B",
                        inline: false,
                    });
                }
                embed.addFields(
                    {
                        name: `${positions - 2}. (WK)`,
                        value: "\u200B",
                        inline: false,
                    },
                    {
                        name: `${positions - 1}. (CRUSS)`,
                        value: "\u200B",
                        inline: false,
                    },
                    {
                        name: `${positions}. (SERKER)`,
                        value: "\u200B",
                        inline: false,
                    },
                    {
                        name: `Rezerwowi/Reserves:`,
                        value: "\u200B",
                        inline: false,
                    }
                );
            } else {
                for (let i = 1; i <= positions; i++) {
                    embed.addFields({
                        name: `${i}.`,
                        value: "\u200B",
                        inline: false,
                    });
                }
                embed.addFields(
                    {
                        name: `Rezerwowi/Reserves:`,
                        value: "\u200B",
                        inline: false,
                    }
                );
            }

            const emojis =
                message.guild.id === priorityServerId
                    ? priorityEmojis
                    : defaultEmojis;

            const actionRows = [];
            for (let i = 0; i < 8; i++) {
                const row = new ActionRowBuilder();
                for (let j = 0; j < 5; j++) {
                    const index = i * 5 + j;
                    if (index >= emojis.length) break; // Sprawdzenie zakresu

                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`join${index + 1}`)
                            .setLabel(" ")
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji(emojis[index]),
                    );
                }
                if (row.components.length > 0) {
                    actionRows.push(row);
                }
            }

            // Przycisk "Wypisz"
            const outRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("out")
                    .setLabel("Wypisz")
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji("❌"),
            );

            const embedMessage = await raidChannel.send({ embeds: [embed] });
            client.embedMessageId = embedMessage.id;
            saveRaidLists();

            for (const row of actionRows) {
                await raidChannel.send({ components: [row] });
            }
            await raidChannel.send({ components: [outRow] });

            await raidChannel.send({
                content: `Prio for up to 12h before raid.`,
            });

            client.embedMessageId = embedMessage.id;
        } else if (message.content.startsWith("!addmanager")) {
            const args = message.content.split(" ");
            const userId = args[1].replace(/[<@!>]/g, "");

            if (message.author.id === process.env.OWNER_ID) {
                addRaidManager(message.guild.id, userId);
                saveRaidManagers();
                message.reply(
                    `Użytkownik <@${userId}> został dodany jako menedżer raidu.`,
                );
            } else {
                message.reply(
                    "Nie masz uprawnień do dodawania menedżerów raidu.",
                );
            }
        } else if (message.content.startsWith("!removemanager")) {
            const args = message.content.split(" ");
            const userId = args[1].replace(/[<@!>]/g, "");

            if (message.author.id === process.env.OWNER_ID) {
                removeRaidManager(message.guild.id, userId);
                saveRaidManagers();
                message.reply(
                    `Użytkownik <@${userId}> został usunięty z menedżerów raidu.`,
                );
            } else {
                message.reply(
                    "Nie masz uprawnień do usuwania menedżerów raidu.",
                );
            }
        } else if (message.content.startsWith("!out")) {
            const args = message.content.split(" ");
            const userId = args[1].replace(/[<@!>]/g, "");

            if (isRaidManager(message.guild.id, message.author.id)) {
                const raidChannel = message.channel;
                const raidMessage = await raidChannel.messages.fetch(
                    client.embedMessageId,
                );
                const success = await removeUserFromList(raidMessage, userId);
                if (success) {
                    message.reply(
                        `Użytkownik <@${userId}> został usunięty z listy.`,
                    );
                    saveRaidLists(); // Save after removing a user from the list
                } else {
                    message.reply("Użytkownik nie jest zapisany na liście.");
                }
                await checkAndMoveReserves(raidMessage, raidChannel);
            } else {
                message.reply(
                    "Nie masz uprawnień do usuwania użytkowników z listy.",
                );
            }
        } else if (message.content.startsWith("!deleteprio")) {
            if (!isRaidManager(message.guild.id, message.author.id)) {
                return message.reply(
                    "Nie masz uprawnień do usuwania priorytetu.",
                );
            }

            priorityChannels.delete(message.channel.id);
            message.reply(
                "Priorytet został usunięty. Teraz każdy może się zapisać. <@&1096804534409494598>",
            );
        } else if (message.content.startsWith("!alt")) {
            const args = message.content.split(" ");
            const nick = args[1];
            const value = args[2];

            if (isRaidManager(message.guild.id, message.author.id)) {
                const raidChannel = message.channel;
                const raidMessage = await raidChannel.messages.fetch(
                    client.embedMessageId,
                );
                const embed = raidMessage.embeds[0];
                const fields = embed.fields;

                let emptyFieldIndex = -1;

                for (let i = 0; i < fields.length; i++) {
                    if (fields[i].value === "\u200B" && emptyFieldIndex === -1) {
                        emptyFieldIndex = i;
                    }
                }

                if (emptyFieldIndex !== -1) {
                    fields[emptyFieldIndex].value = `${nick} (${value})`;
                    await raidMessage.edit({ embeds: [embed] });
                    message.reply(
                        `Postać ${nick} (${value}) została dodana do listy.`,
                    );
                } else {
                    message.reply("Brak wolnych miejsc na liście.");
                }
                await checkAndMoveReserves(raidMessage, raidChannel);
            } else {
                message.reply(
                    "Nie masz uprawnień do ręcznego dodawania postaci.",
                );
            }
        }
    } catch (error) {
        console.error(error);
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    try {
        if (!interaction.isButton()) return;

        let message;
        try {
            message = await interaction.channel.messages.fetch(
                client.embedMessageId,
            );
        } catch (error) {
            console.error("Failed to fetch message:", error);
            return interaction.reply({
                content: "Wystąpił błąd podczas próby pobrania wiadomości.",
                ephemeral: true,
            });
        }

        const embed = message.embeds[0];
        const fields = embed.fields;
        const user = `<@${interaction.user.id}>`;

        const emojis =
            interaction.guild.id === priorityServerId
                ? priorityEmojis
                : defaultEmojis;

        const reservedEmojisPollu = ["archsp4", "warsp3", "warsp4"];
        const reservedEmojisArma = ["archsp4", "warsp3"];

        const reservedIndicesPollu = [fields.length - 4, fields.length - 3, fields.length - 2];
        const reservedIndicesArma = [fields.length - 3, fields.length - 2];

        if (interaction.customId.startsWith("join")) {
            if (
                priorityChannels.has(interaction.channelId) &&
                !interaction.member.roles.cache.some((role) =>
                    priorityRoles.includes(role.id),
                )
            ) {
                return interaction.reply({
                    content: "Nie masz priorytetu!",
                    ephemeral: true,
                });
            }

            const emojiIndex = parseInt(interaction.customId.replace("join", "")) - 1;
            const emoji = emojis[emojiIndex];
            const isReservedEmojiPollu = reservedEmojisPollu.includes(emoji.name);
            const isReservedEmojiArma = reservedEmojisArma.includes(emoji.name);

            let userFieldIndex = -1;
            for (let i = 0; i < fields.length; i++) {
                if (fields[i].value.includes(user)) {
                    userFieldIndex = i;
                    break;
                }
            }

            if (userFieldIndex !== -1) {
                fields[userFieldIndex].value += ` <:${emoji.name}:${emoji.id}>`;
                await message.edit({ embeds: [embed] });
                await interaction.deferUpdate();

                // Sprawdź, czy użytkownik na liście rezerwowej dodał zarezerwowaną emotkę
                await checkAndMoveReserves(message, interaction.channel, true);
            } else {
                let emptyFieldIndex = -1;
                for (let i = 0; i < fields.length; i++) {
                    if (fields[i].value === "\u200B" && !reservedIndicesPollu.includes(i) && !reservedIndicesArma.includes(i)) {
                        emptyFieldIndex = i;
                        break;
                    }
                }

                if (interaction.channel.name.includes("arma") && isReservedEmojiArma) {
                    const reservedIndex = reservedIndicesArma[reservedEmojisArma.indexOf(emoji.name)];
                    if (fields[reservedIndex].value === "\u200B") {
                        fields[reservedIndex].value = `${user} <:${emoji.name}:${emoji.id}>`;
                    } else {
                        const reserveField = fields.find(field => field.name === 'Rezerwowi/Reserves:');
                        reserveField.value += `\n${user} <:${emoji.name}:${emoji.id}>`;
                    }
                } else if (interaction.channel.name.includes("pollu") && isReservedEmojiPollu) {
                    const reservedIndex = reservedIndicesPollu[reservedEmojisPollu.indexOf(emoji.name)];
                    if (fields[reservedIndex].value === "\u200B") {
                        fields[reservedIndex].value = `${user} <:${emoji.name}:${emoji.id}>`;
                    } else {
                        const reserveField = fields.find(field => field.name === 'Rezerwowi/Reserves:');
                        reserveField.value += `\n${user} <:${emoji.name}:${emoji.id}>`;
                    }
                } else if (emptyFieldIndex !== -1) {
                    fields[emptyFieldIndex].value = `${user} <:${emoji.name}:${emoji.id}>`;
                    await interaction.channel.send({
                        content: `${user} został zapisany!`,
                    });
                } else {
                    // Dodanie do rezerwowych
                    const reserveField = fields.find(field => field.name === 'Rezerwowi/Reserves:');
                    reserveField.value += `\n${user} <:${emoji.name}:${emoji.id}>`;
                }

                await message.edit({ embeds: [embed] });
                await interaction.deferUpdate();
            }

        } else if (interaction.customId === "out") {
            const success = await removeUserFromList(message, interaction.user.id);
            if (success) {
                await interaction.channel.send({
                    content: `${user} wypisał się! Znajdź zastępstwo jeżeli wypisałeś się 6 godzin przed maratonem.`,
                });
            } else {
                await interaction.reply({
                    content: "Nie jesteś zapisany!",
                    ephemeral: true,
                });
            }
            await checkAndMoveReserves(message, interaction.channel);
        }
    } catch (error) {
        console.error(error);
        interaction.reply({
            content: "Wystąpił nieoczekiwany błąd.",
            ephemeral: true,
        });
    }
});

async function removeUserFromList(message, userId) {
    const embed = message.embeds[0];
    const fields = embed.fields;
    const user = `<@${userId}>`;

    let removed = false;
    let emptyFieldIndex = -1;

    for (let i = 0; i < fields.length; i++) {
        if (fields[i].value.includes(user)) {
            fields[i].value = "\u200B";
            removed = true;
            emptyFieldIndex = i;
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
function saveRaidLists() {
    const data = {
        priorityChannels: Array.from(priorityChannels),
        embedMessageId: client.embedMessageId,
    };
    fs.writeFileSync('raidLists.json', JSON.stringify(data), 'utf-8');
}
function loadRaidLists() {
    if (fs.existsSync('raidLists.json')) {
        const data = fs.readFileSync('raidLists.json', 'utf-8');
        const parsed = JSON.parse(data);
        priorityChannels = new Set(parsed.priorityChannels);
        client.embedMessageId = parsed.embedMessageId;
    }
}

async function checkAndMoveReserves(message, channel, checkReservedEmojis = false) {
    const embed = message.embeds[0];
    const fields = embed.fields;

    let emptyFieldIndex = -1;
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].value === "\u200B") {
            emptyFieldIndex = i;
            break;
        }
    }

    if (emptyFieldIndex !== -1) {
        let reservesStartIndex = fields.findIndex(field => field.name === 'Rezerwowi/Reserves:');
        if (reservesStartIndex !== -1) {
            const reserveField = fields[reservesStartIndex];
            const reserveLines = reserveField.value.split("\n").filter(line => line.trim() !== "\u200B");

            if (reserveLines.length > 0) {
                const reservedEmojisPollu = ["archsp4", "warsp3", "warsp4"];
                const reservedEmojisArma = ["archsp4", "warsp3"];
                const reservedIndicesPollu = [fields.length - 4, fields.length - 3, fields.length - 2];
                const reservedIndicesArma = [fields.length - 3, fields.length - 2];
                const reservedIndexToEmojiPollu = {
                    [fields.length - 4]: "archsp4",
                    [fields.length - 3]: "warsp3",
                    [fields.length - 2]: "warsp4"
                };
                const reservedIndexToEmojiArma = {
                    [fields.length - 3]: "archsp4",
                    [fields.length - 2]: "warsp3"
                };

                let nextReserveUser = null;

                if (channel.name.includes("arma") && reservedIndicesArma.includes(emptyFieldIndex)) {
                    const emojiName = reservedIndexToEmojiArma[emptyFieldIndex];
                    nextReserveUser = reserveLines.find(line => line.includes(emojiName));
                    if (nextReserveUser) {
                        reserveLines.splice(reserveLines.indexOf(nextReserveUser), 1);
                    }
                } else if (channel.name.includes("pollu") && reservedIndicesPollu.includes(emptyFieldIndex)) {
                    const emojiName = reservedIndexToEmojiPollu[emptyFieldIndex];
                    nextReserveUser = reserveLines.find(line => line.includes(emojiName));
                    if (nextReserveUser) {
                        reserveLines.splice(reserveLines.indexOf(nextReserveUser), 1);
                    }
                }

                if (!nextReserveUser && !reservedIndicesPollu.includes(emptyFieldIndex) && !reservedIndicesArma.includes(emptyFieldIndex)) {
                    nextReserveUser = reserveLines.shift();
                }

                if (nextReserveUser) {
                    fields[emptyFieldIndex].value = nextReserveUser;
                    reserveField.value = reserveLines.length > 0 ? reserveLines.join("\n") : "\u200B";

                    await message.edit({ embeds: [embed] });
                    await message.channel.send({
                        content: `${nextReserveUser.split(' ')[0]} trafiasz na główną listę!`,
                    });
                    saveRaidLists(); // Save after moving reserves
                }
            }
        }
    } else if (checkReservedEmojis) {
        const reservedEmojisPollu = ["archsp4", "warsp3", "warsp4"];
        const reservedEmojisArma = ["archsp4", "warsp3"];
        const reservedIndexToEmojiPollu = {
            [fields.length - 4]: "archsp4",
            [fields.length - 3]: "warsp3",
            [fields.length - 2]: "warsp4"
        };
        const reservedIndexToEmojiArma = {
            [fields.length - 3]: "archsp4",
            [fields.length - 2]: "warsp3"
        };

        for (let i = 0; i < fields.length; i++) {
            if (fields[i].value !== "\u200B" && fields[i].value.split(" ").length > 1) {
                const emojis = fields[i].value.split(" ").slice(1);
                for (let j = 0; j < emojis.length; j++) {
                    if (
                        (channel.name.includes("arma") && reservedEmojisArma.includes(emojis[j].split(":")[1])) ||
                        (channel.name.includes("pollu") && reservedEmojisPollu.includes(emojis[j].split(":")[1]))
                    ) {
                        let userFieldIndex = i;
                        const user = fields[userFieldIndex].value.split(" ")[0];
                        fields[userFieldIndex].value = fields[userFieldIndex].value.split(" ").slice(0, 1).join(" ");
                        await checkAndMoveReserves(message, channel);
                        return;
                    }
                }
            }
        }
    }
}

function isRaidManager(guildId, userId) {
    if (!raidManagers.has(guildId)) {
        return false;
    }
    return raidManagers.get(guildId).has(userId);
}

function addRaidManager(guildId, userId) {
    if (!raidManagers.has(guildId)) {
        raidManagers.set(guildId, new Set());
    }
    raidManagers.get(guildId).add(userId);
    saveRaidManagers(); // Zapisz zmiany
}

function removeRaidManager(guildId, userId) {
    if (raidManagers.has(guildId)) {
        raidManagers.get(guildId).delete(userId);
        saveRaidManagers(); // Zapisz zmiany
    }
}

function loadRaidManagers() {
    if (fs.existsSync("raidManagers.json")) {
        const data = fs.readFileSync("raidManagers.json", "utf-8");
        const parsed = JSON.parse(data);
        for (const guildId in parsed) {
            raidManagers.set(guildId, new Set(parsed[guildId]));
        }
    }
}

function saveRaidManagers() {
    const data = {};
    raidManagers.forEach((managers, guildId) => {
        data[guildId] = Array.from(managers);
    });
    fs.writeFileSync("raidManagers.json", JSON.stringify(data), "utf-8");
}

// Serwer Express do monitorowania pingu
app.get("/", (req, res) => {
    console.log("Ping received");
    res.send("Bot is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serwer Express działa na porcie ${PORT}`);
});

require('dotenv').config();

client.login(process.env.DISCORD_BOT_TOKEN)
  .then(() => console.log('Successfully logged in'))
  .catch(err => console.error('Failed to login:', err));
