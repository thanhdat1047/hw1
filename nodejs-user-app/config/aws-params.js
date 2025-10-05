const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const ssmClient = new SSMClient({
  region: process.env.AWS_REGION || 'us-southeast-1'
});

const secretsClient = new SecretsManagerClient({
  region: process.env.AWS_REGION || 'us-southeast-1'
});

// Function to get parameter from SSM Parameter Store
const getParameter = async (paramName, withDecryption = true) => {
  try {
    const command = new GetParameterCommand({
      Name: paramName,
      WithDecryption: withDecryption
    });

    const response = await ssmClient.send(command);
    return response.Parameter.Value;
  } catch (error) {
    console.error(`Error fetching parameter ${paramName}:`, error);
    throw error;
  }
};

// Function to get secret from AWS Secrets Manager
const getSecret = async (secretName) => {
  let response;
  try {
    response = await secretsClient.send(
      new GetSecretValueCommand({ 
        SecretId: secretName,
        VersionStage: 'AWSCURRENT'
      })
    );

    return response.SecretString;
  } catch (error) {
    console.error(`Error fetching secret ${secretName}:`, error);
    throw error;
  }
};

// get all SSM parameters
const getDbConfig = async () => {
  try {
    console.log('Reading DB config directly from .env');

    return {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306
    };
  } catch (error) {
    console.error('Error building DB config:', error);
    throw error;
  }
};

module.exports = { 
  getDbConfig,
  getSecret,
  getParameter
};