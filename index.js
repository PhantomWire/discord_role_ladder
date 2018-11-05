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
  const pastData = readStoredData();
  console.log(pastData);
  roleMap = await buildRoleMap();
  const members = await getMembers();
  const output = processMembers(members);
  writeOutput(output);
}

function processMembers(memberList) {
  let outputMap = {};
  for(let member of memberList) {
    outputMap[member.user.username] = {
      roles: processRoles(member.roles),
      memberSince: member.joined_at,
      lastSeen: runtime
    }
  }
  return outputMap;
}

function processRoles(roles) {
  let roleArr = [];
  for(const role of roles) {
    roleArr.push(roleMap[role])
  }
  return roleArr;
}

main();

module.exports = {
  readStoredData : readStoredData()
};
