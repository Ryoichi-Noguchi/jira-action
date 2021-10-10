const core = require('@actions/core');
const Jira = require('./jira');

const findIssueKeys = async (jira, searchStr) => {
  const issueIdRegEx = /([a-zA-Z0-9]+-[0-9]+)/g;
  const match = searchStr.match(issueIdRegEx);
  const foundKeys = [];
  if (!match) {
    // eslint-disable-next-line no-console
    console.log(`No issue keys on ${searchStr}`);
    return foundKeys;
  }
  await Promise.all(match.map(async (s) => {
    const hasTicket = await jira.hasJiraTicket(s);
    if (hasTicket) foundKeys.push(s);
  }));
  return foundKeys;
};

const setFixVersion = async (jira, keys, releaseName) => {
  await Promise.all(keys.map(async (key) => {
    await jira.editTicket(key, releaseName);
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
    await jira.createRelease(releaseName, description, projectId);
    const keys = await findIssueKeys(jira, issueKeyText);
    if (keys.length > 0) {
      await setFixVersion(jira, keys, releaseName);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
};

main();
