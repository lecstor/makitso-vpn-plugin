const tunnelblick = require("./tunnelblick");
const viscosity = require("./viscosity");

const schema = {
  vpn: {
    password: {
      store: "secure",
      ask: {
        prompt: `Enter your {variant} VPN password `,
        maskInput: true,
        storedValueIs: "response"
      }
    }
  }
};

const commands = { tunnelblick, viscosity };

/**
 * get the plugin configuration
 * @returns {Object} config - plugin config
 */
function plugin({ client = "tunnelblick" }) {
  return { schema, commands: commands[client].commands };
}

module.exports.plugin = plugin;
