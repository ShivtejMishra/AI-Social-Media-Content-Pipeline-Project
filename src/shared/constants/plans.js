const PLANS = {
  free: {
    name: 'Free',
    limits: {
      textGenerations: 50,
      imageGenerations: 10,
      exports: 5,
      workspaces: 3,
    },
  },
  pro: {
    name: 'Pro',
    limits: {
      textGenerations: 1000,
      imageGenerations: 100,
      exports: Infinity,
      workspaces: 20,
    },
  },
  agency: {
    name: 'Agency',
    limits: {
      textGenerations: 10000,
      imageGenerations: 1000,
      exports: Infinity,
      workspaces: Infinity,
    },
  },
};

const DEFAULT_PLAN = 'free';

module.exports = { PLANS, DEFAULT_PLAN };
