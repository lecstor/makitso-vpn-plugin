const shell = require("shelljs");
const keytar = require("keytar");

// https://www.sparklabs.com/support/kb/article/controlling-viscosity-with-applescript-mac/

// osascript -e "tell application \"Viscosity\"" -e "set connectionName to name of the first connection" -e "display dialog connectionName" =e "end tell"

// osascript  -l JavaScript -e 'Application("Viscosity").connections.name()'
// app.includeStandardAdditions = true
// app.activate()

async function execute(command) {
  const quotedCommand = command.replace(/"/g, '\\"');
  return new Promise(resolve => {
    shell.exec(
      `osascript -l JavaScript -e "Application(\\"Viscosity\\").${
        quotedCommand
      }"`,
      { silent: true },
      (code, stdout, stderr) => {
        resolve({ code, stdout, stderr });
      }
    );
  });
}

async function nameToNumber(name) {
  const names = await getConnectionNames();
  const index = names.indexOf(name);
  return index + 1;
}

/**
 * Update password in the keychain for Viscosity and tell Viscosity to connect the VPN
 *
 * @param {Object} context - an instance of Makitso Context
 * @param {String} connectionName - the connection name as is in Viscosity
 * @param {String} token - 2fa token from your device
 * @returns {void}
 */
async function connectVpn({ context, input }) {
  const { connectionName, token } = input.args;
  const password = await context.get(`vpn.password.${connectionName}`);
  const connectionNumber = await nameToNumber(connectionName);
  await keytar.setPassword(
    `Viscosity/${connectionNumber}/ovpn`,
    "password",
    `${password}${token}`
  );
  return execute(`connect("${connectionName}")`).then(
    ({ code, stdout, stderr }) => {
      if (code) {
        console.log(stderr);
      } else {
        console.log(`Connecting VPN to ${connectionName}`);
      }
    }
  );
}

/**
 * Tell Viscosity to disconnect the VPN
 *
 * @param {Object} context - an instance of Makitso Context
 * @param {String} connectionName - the connection name as is in Viscosity
 * @returns {void}
 */
async function disconnectVpn({ context, input }) {
  const { connectionName } = input.args;
  return execute(`disconnect("${connectionName}")`).then(
    ({ code, stdout, stderr }) => {
      if (code) {
        console.log(stderr);
      } else {
        console.log(`Disconnecting VPN from ${connectionName}`);
      }
    }
  );
}

async function getConnectionNames() {
  return execute("connections.name()").then(({ code, stdout, stderr }) => {
    if (code) {
      throw new Error(stderr);
    }
    let confs = stdout.replace(/\n$/, "").split(/,\s*/);
    return confs;
  });
}

async function getConnectionStates() {
  return execute("connections.state()").then(({ code, stdout, stderr }) => {
    if (code) {
      throw new Error(stderr);
    }
    let confs = stdout.replace(/\n$/, "").split(/,\s*/);
    return confs;
  });
}

const commands = {
  vpn: {
    description: "Control your Viscosity VPN connections",
    commands: {
      connect: {
        arguments: [
          "connectionName - the connection to disconnect",
          "token - your 2fa token"
        ],
        description: "Connect to VPN with Viscosity",
        action: connectVpn,
        suggest: ({ context, input }) => {
          return getConnectionNames();
        }
      },
      disconnect: {
        arguments: ["connectionName - the connection to disconnect"],
        description: "Disconnect from VPN with Viscosity",
        action: disconnectVpn,
        suggest: ({ context, input }) => {
          return getConnectionNames();
        }
      },
      status: {
        description: "Show configured Viscosity VPN connections",
        action: ({ context }) =>
          getConnectionNames().then(names => {
            return getConnectionStates().then(states => {
              names.forEach((name, idx) => {
                console.log(`${name} - ${states[idx]}`);
              });
            });
          })
      }
    }
  }
};

module.exports = { commands };
