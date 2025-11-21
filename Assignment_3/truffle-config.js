module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (Ganache default)
      port: 7545,            // Ganache default port
      network_id: "5777",       // Match any network id
    }
  },
  compilers: {
    solc: {
      version: "0.8.19",    // <-- This is the crucial update
      settings: {
        optimizer: {
          enabled: false,
          runs: 200
        }
      }
    }
  }
};