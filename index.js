const fetch = require('node-fetch');
const metadata = require('./package');
const { readStoredData, writeOutput } = require('./storeUtils');
const { CLIENT_TOKEN, GUILD_ID } = require('./credentials');
const base_url = `https://discordapp.com/api/guilds/${GUILD_ID}`;

console.log("Phantom Wire - User Role Monitor");

const runtime = new Date();
console.log(`Script runtime is ${runtime}`);

let roleMap;

const customHeaders = {
    'Authorization': 'Bot ' + CLIENT_TOKEN,
    'Content-Type': 'application/json',
    'User-agent': `${metadata.name} (${metadata.url || ''}, ${metadata.version})`
};

const restTemplate = { method: 'GET', headers: customHeaders  };

async function getMembers() {
 return fetch(`${base_url}/members?limit=1000`, restTemplate)
    .then(res => res.json());
}

async function getRoles() {
  return fetch(`${base_url}/roles`, restTemplate)
    .then(res => res.json());
}

async function buildRoleMap() {
   const roles = await getRoles();

  let roleMap = {};
  for(let role of roles) {
    roleMap[role.id] = role.name
  }
  return roleMap;
}

async function main() {
  roleMap = await buildRoleMap();
  const members = await getMembers();
  const output = processMembers(members);
  writeOutput(output);
}

function processMembers(memberList) {
  const pastData = readStoredData();
  let outputMap = Object.assign({}, pastData);
  for(let member of memberList) {
    const existingRoles = ((outputMap[member.user.username] || []).roles || []) || [];
    outputMap[member.user.username] = {
      roles: processRoles({ newRoles: member.roles, existingRoles : existingRoles }),
      memberSince: member.joined_at,
      lastSeen: runtime
    }
  }
  return outputMap;
}

function processRoles(options) {
  const { newRoles = [], existingRoles = []} = options;
  let roleStringArr = [];
  for(const role of newRoles) {
    roleStringArr.push(roleMap[role])
  }

  let outputArr = [];
  for(const roleStr of roleStringArr) {
    const roleSeenAlready = existingRoles.find(el => el.name === roleStr);
    if(roleSeenAlready) {
      const outputObj = Object.assign({}, roleSeenAlready, { lastSeen : runtime });
      outputObj.seenCount++;
      outputArr.push(outputObj);
    } else {
      outputArr.push({
        name: roleStr,
        firstSeen : runtime,
        lastSeen: runtime,
        seenCount: 1
      });
    }
  }
  return outputArr;
}

main();
