const core = require('@actions/core');
const Jira = require('./jira');

const findIssueKeys = async (jira, searchStr) => {
  const issueIdRegEx = /([a-zA-Z0-9]+-[0-9]+)/g;
  const match = searchStr.match(issueIdRegEx);
  const foundKeys = [];
  await Promise.all(match.map(async (s) => {
    const hasTicket = await jira.hasJiraTicket(s);
    if (hasTicket) foundKeys.push(s);
  }));
  return foundKeys;
};

const setFixVersion = async (jira, keys) => {
  if (!keys) return;

  await Promise.all(keys.map(async (key) => {
    await jira.editTicket(key);
  }));
};

const main = async () => {
  try {
    const username = core.getInput('username');
    const password = core.getInput('password');
    const domain = core.getInput('domain');
    const projectId = core.getInput('projectId');
    const releaseName = core.getInput('releaseName');
    const description = core.getInput('description');
    const issueKeyText = core.getInput('issueKeyText');
    const jira = new Jira(domain, username, password);
    // await jira.createRelease(releaseName, description, projectId);
    const keys = await findIssueKeys(jira, issueKeyText);
    await setFixVersion(jira, keys);
  } catch (error) {
    core.setFailed(error.message);
  }
};

main();
