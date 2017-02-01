/* eslint key-spacing:0 spaced-comment:0 */
import path from 'path';
import _debug from 'debug';
import {argv} from 'yargs';
import ip from 'ip';
const localip = ip.address();
const debug = _debug('app:config');
debug('Creating default configuration.');
// ========================================================
// Default Configuration
// ========================================================
let serverHost = process.env.PAVICS_FRONTEND_IP || localip;
let serverPort = process.env.PORT || 3000;
let serverURL = 'http://' + serverHost + ':' + serverPort;
const config = {
  env: process.env.NODE_ENV || 'development',
  // ----------------------------------
  // Server Configuration
  // ----------------------------------
  server_host: serverHost, // use string 'localhost' to prevent exposure on local network
  server_port: serverPort,
  // ----------------------------------
  // PAVICS Configs
  // ----------------------------------
  //pavics_birdhouse_path: 'http://132.217.140.45:8080/ncWMS2/wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0',
  pavics_birdhouse_path: 'http://outarde.crim.ca:8080/ncWMS2/wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0',
  pavics_esg_search_path: process.env.PAVICS_ESG_SEARCH_PATH || 'http://pcmdi.llnl.gov/esg-search/search',
  pavics_solr_path: process.env.PAVICS_SOLR_PATH || 'http://outarde.crim.ca:8091',
  pavics_pywps_path: 'http://outarde.crim.ca:8086/pywps?service=WPS&request=execute&version=1.0.0&identifier=pavicsearch&DataInputs=',
  pavics_wpsconsumer_search_path: serverURL + '/wps/pavicsearch',
  pavics_phoenix_path: process.env.PAVICS_PHOENIX_PATH || 'https://outarde.crim.ca:8443',
  pavics_geoserver_path: process.env.PAVICS_GEOSERVER_PATH || 'http://outarde.crim.ca:8087/geoserver',
  // ----------------------------------
  // Project Structure
  // ----------------------------------
  path_base: path.resolve(__dirname, '..'),
  dir_client: 'src',
  dir_dist: 'dist',
  dir_server: 'server',
  dir_test: 'tests',
  // ----------------------------------
  // Compiler Configuration
  // ----------------------------------
  compiler_css_modules: true,
  compiler_devtool: 'source-map',
  compiler_hash_type: 'hash',
  compiler_fail_on_warning: false,
  compiler_quiet: false,
  compiler_public_path: '/',
  compiler_stats: {
    chunks: false,
    chunkModules: false,
    colors: true
  },
  compiler_vendor: [
    'history',
    'react',
    'react-redux',
    'react-router',
    'react-router-redux',
    'redux'
  ],
  // ----------------------------------
  // Test Configuration
  // ----------------------------------
  coverage_reporters: [
    {type: 'text-summary'},
    {type: 'lcov', dir: 'coverage'}
  ]
};
/************************************************
 -------------------------------------------------

 All Internal Configuration Below
 Edit at Your Own Risk

 -------------------------------------------------
 ************************************************/

// ------------------------------------
// Environment
// ------------------------------------
// N.B.: globals added here must _also_ be added to .eslintrc
config.globals = {
  'process.env': {
    'NODE_ENV': JSON.stringify(config.env)
  },
  'NODE_ENV': config.env,
  '__DEV__': config.env === 'development',
  '__PROD__': config.env === 'production',
  '__TEST__': config.env === 'test',
  '__DEBUG__': config.env === 'development' && !argv.no_debug,
  '__COVERAGE__': !argv.watch && config.env === 'test',
  '__BASENAME__': JSON.stringify(process.env.BASENAME || ''),
  '__PAVICS_PHOENIX_PATH__': JSON.stringify(config.pavics_phoenix_path),
  '__PAVICS_GEOSERVER_PATH__': JSON.stringify(config.pavics_geoserver_path)
};
// ------------------------------------
// Validate Vendor Dependencies
// ------------------------------------
const pkg = require('../package.json');
config.compiler_vendor = config.compiler_vendor
  .filter((dep) => {
    if (pkg.dependencies[dep]) {
      return true;
    }
    debug(
      `Package "${dep}" was not found as an npm dependency in package.json; ` +
      `it won't be included in the webpack vendor bundle.
       Consider removing it from vendor_dependencies in ~/config/index.js`
    );
  });
// ------------------------------------
// Utilities
// ------------------------------------
const resolve = path.resolve;
const base = (...args) =>
  Reflect.apply(resolve, null, [config.path_base, ...args]);
config.utils_paths = {
  base: base,
  client: base.bind(null, config.dir_client),
  dist: base.bind(null, config.dir_dist)
};
// ========================================================
// Environment Configuration
// ========================================================
debug(`Looking for environment overrides for NODE_ENV "${config.env}".`);
const environments = require('./environments').default;
const overrides = environments[config.env];
if (overrides) {
  debug('Found overrides, applying to default configuration.');
  Object.assign(config, overrides(config));
} else {
  debug('No environment overrides found, defaults will be used.');
}
export default config;
