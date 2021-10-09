const axios = require('axios');

const headers = {
  'Content-Type': 'application/json',
  'X-Atlassian-Token': 'no-check',
};

export default class Jira {
  constructor(domain, username, password) {
    this.baseUrl = `https://${domain}.atlassian.net/rest/api/3/`;
    this.config = { auth: { username, password }, headers };
  }

  async hasJiraTicket(issueKey) {
    const response = await this.axios.get(
      `${this.baseUrl}issue/${issueKey}`,
      this.config,
    );
    if (response.status === 200) return true;
    return false;
  }

  async editTicket(issueKey, releaseName) {
    const body = {
      update: {
        fixVersions: [
          {
            add: {
              name: releaseName,
            },
          },
        ],
      },
    };

    const data = JSON.stringify(body);
    const response = await axios.put(
      `${this.baseUrl}issue/${issueKey}`,
      data,
      this.config,
    );

    if (response.status !== 204) {
      throw new Error('Failed to update fix version on ticket');
    }
    // eslint-disable-next-line no-console
    console.log(`Set fix version: ${releaseName} for ${issueKey}`);
  }

  async createRelease(name, description, projectId) {
    const body = {
      name,
      description,
      projectId,
    };

    const data = JSON.stringify(body);
    const response = await axios.post(
      `${this.baseUrl}version`,
      data,
      this.config,
    );

    if (response.status !== 201) {
      throw new Error('Failed to create release on Jira');
    }
    // eslint-disable-next-line no-console
    console.log(`Created version :${name}`);
  }
}
