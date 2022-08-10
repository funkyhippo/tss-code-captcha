const utils = require("./utils");
const codeCaptcha = require("./codeCaptcha");
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

const VERIFY_CUSTOM_ID = "verify";
const OPEN_MODAL_CUSTOM_ID = "enter";
const MODAL_CUSTOM_ID = "modal";
const MODAL_TEXT_CUSTOM_ID = "modal_text";

const TOKEN = process.env.TOKEN;
const CHANNEL = process.env.CHANNEL;
const ROLE = process.env.ROLE;

function main() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
  });

  client.on("ready", async () => {
    console.log("Client ready.");
    const gateChannel = await client.channels.fetch(CHANNEL);
    let error = false;
    let lastMessage;
    try {
        lastMessage = await gateChannel.messages.fetch(
          gateChannel.lastMessageId
        );
    } catch (e) {
        error = true;
    }

    if (error || !gateChannel.lastMessageId || lastMessage?.user?.id !== client.id) {
      console.log("Initializing gate message.");
      gateChannel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("Verification Required")
            .setDescription(
              "The underlying channel now requires verification."
            ),
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(VERIFY_CUSTOM_ID)
              .setLabel("Verify")
              .setStyle(ButtonStyle.Primary)
          ),
        ],
      });
    }
  });

  // The flow should be to click on the modal -> generate captcha link -> ask for input
  client.on("interactionCreate", async (interaction) => {
    if (interaction.customId === VERIFY_CUSTOM_ID) {
      console.log("Verification button clicked by", interaction.user.username);
      await interaction.deferReply({ ephemeral: true });
      const userHash = utils.createHash(interaction.user.id);
      const captchaUrl = await codeCaptcha.createCodeCaptcha(
        utils.getAccessCodeUrl(userHash)
      );
      await interaction.followUp({
        ephemerael: true,
        embeds: [
          new EmbedBuilder()
            .setTitle("Code Captcha Required")
            .setDescription(
              `Please complete this [captcha](${captchaUrl}) here to retrieve your access code.` +
                "\n(Remember that you should **NEVER** scan QR codes to verify yourself on Discord)"
            ),
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(OPEN_MODAL_CUSTOM_ID)
              .setLabel("Enter Code")
              .setStyle(ButtonStyle.Primary)
          ),
        ],
      });
    }
  });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.customId === OPEN_MODAL_CUSTOM_ID) {
      console.log("Verification opened by", interaction.user.username);
      await interaction.showModal(
        new ModalBuilder()
          .setCustomId(MODAL_CUSTOM_ID)
          .setTitle("Access Code Input")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId(MODAL_TEXT_CUSTOM_ID)
                .setLabel("Access Code")
                .setStyle(TextInputStyle.Short)
            )
          )
      );
    }
  });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.customId === MODAL_CUSTOM_ID) {
      console.log("Modal interaction by", interaction.user.username);
      const userHash = utils.createHash(interaction.user.id);
      const submittedValue =
        interaction.fields.getTextInputValue(MODAL_TEXT_CUSTOM_ID);
      if (userHash === submittedValue) {
        await interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setColor(0x00ff00)
              .setTitle("Success")
              .setDescription(
                `Successfully verified, you've been given the <@&${ROLE}> role.`
              ),
          ],
        });
        await interaction.member.roles.add(ROLE);
      } else {
        await interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setColor(0xff0000)
              .setTitle("Failed")
              .setDescription("Failed to verify."),
          ],
        });
      }
    }
  });

  client.login(TOKEN);
}

main();
