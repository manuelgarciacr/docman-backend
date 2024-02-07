module.exports = {
  apps : [{
    name: 'rest',
    script: './nodejs/REST/index.js',
    watch: true,
    env_production: {
        NODE_ENV: 'production'
    }
  }, {
    name: 'nodeServer',
    script: './nodejs/nodeServer/bin/www',
    watch: true,
    exp_backoff_restart_delay: 4000,
    env_production: {
        NODE_ENV: 'production'
    }
  }, {
    name: 'docmanV1',
    script: './nodejs/docman/V1/bin/www.js',
    watch: true,
    exp_backoff_restart_delay: 4000,
    env_production: {
        NODE_ENV: 'production',
        PORT: '3400',
        MONGO_URL: 'mongodb+srv://manuelgarciacr:nQ2zwoRSJFfdaeze@cluster0.1otxm4k.mongodb.net/docman?retryWrites=true&w=majority'
    }
  }],

  deploy : {
    production : {
      NODE_ENV : 'production',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
