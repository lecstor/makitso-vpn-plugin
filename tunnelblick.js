const shell = require("shelljs");
const keytar = require("keytar");

// https://tunnelblick.net/cAppleScriptSupport.html
// https://groups.google.com/forum/#!topic/tunnelblick-discuss/1MDrN6__mdA
// osascript -e "tell application \"/Applications/Tunnelblick.app\"" -e "connect \"prod\"" -e "end tell"
// https://darthnull.org/building/2014/05/30/google-auth-tunnelblick/

async function execute(command) {
  const quotedCommand = command.replace(/"/g, '\\"');
  const com = `osascript -l JavaScript -e "Application(\\"Tunnelblick\\").${
    quotedCommand
  }"`;
  return new Promise(resolve => {
    shell.exec(com, { silent: true }, (code, stdout, stderr) => {
      resolve({ code, stdout, stderr });
    });
  });
}

/**
 * Update password in the keychain for Tunnelblick and tell Tunnelblick to connect the VPN
 *
 * @param {Object} context - an instance of Makitso Context
 * @param {String} connectionName - the connection name as is in Tunnelblick
 * @param {String} token - 2fa token from your device
 * @returns {void}
 */
async function connectVpn({ context, input }) {
  const { connectionName, token } = input.args;
  const password = await context.get(`vpn.password.${connectionName}`);
  await keytar.setPassword(
    `Tunnelblick-Auth-${connectionName}`,
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
 * Tell Tunnelblick to disconnect the VPN
 *
 * @param {Object} context - an instance of Makitso Context
 * @param {String} connectionName - the connection name as is in Tunnelblick
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
  return execute("configurations.name()").then(({ code, stdout, stderr }) => {
    if (code) {
      throw new Error(stderr);
    }
    let confs = stdout.replace(/\n$/, "").split(/,\s*/);
    return confs;
  });
}

async function getConnectionStates() {
  return execute("configurations.state()").then(({ code, stdout, stderr }) => {
    if (code) {
      throw new Error(stderr);
    }
    let confs = stdout.replace(/\n$/, "").split(/,\s*/);
    return confs;
  });
}

const commands = {
  vpn: {
    description: "Control your Tunnelblick VPN connections",
    commands: {
      connect: {
        arguments: [
          "connectionName - the connection to disconnect",
          "token - your 2fa token"
        ],
        description: "Connect to VPN with Tunnelblick",
        action: connectVpn,
        suggest: ({ context, input }) => {
          return getConnectionNames();
        }
      },
      disconnect: {
        arguments: ["connectionName - the connection to disconnect"],
        description: "Disconnect from VPN with Tunnelblick",
        action: disconnectVpn,
        suggest: ({ context, input }) => {
          return getConnectionNames();
        }
      },
      status: {
        description: "Show configured Tunnelblick VPN connections",
        action: ({ context }) =>
          getConnectionNames().then(names => {
            return getConnectionStates().then(states => {
              names.forEach((name, idx) => {
                let state = "connecting";
                if (states[idx] === "EXITING") {
                  state = "disconnect(ed|ing)";
                } else if (states[idx] === "CONNECTED") {
                  state = "connected";
                }
                console.log(`${name} - ${state}`);
              });
            });
          })
      }
    }
  }
};

module.exports = { commands };
