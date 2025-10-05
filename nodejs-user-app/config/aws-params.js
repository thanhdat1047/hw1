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
    const [dbHost, dbUser, dbName, dbPort] = await Promise.all([
      getParameter(process.env.DB_HOST),
      getParameter(process.env.DB_USER),
      getParameter(process.env.DB_NAME),
      getParameter(process.env.DB_PORT)
    ]);

    const secret = await getSecret(process.env.DB_PASSWORD);
    const password = typeof secret === 'object' ? secret.password : secret;

    console.log('Get all parameters from SSM Parameter Store');

    return {
      host: dbHost,
      user: dbUser,
      password: password,
      database: dbName,
      port: dbPort ? parseInt(dbPort, 10) : 3306
    };
  } catch (error) {
    console.error('Error fetching all parameters:', error);
    throw error;
  }
}

module.exports = { 
  getDbConfig,
  getSecret,
  getParameter
};