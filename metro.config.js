const {getDefaultConfig} = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const {assetExts, sourceExts} = config.resolver;

// SVG transformer: treat .svg as source (React components) not binary assets
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer/expo');
config.resolver.assetExts = assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...sourceExts, 'svg'];

// Block legacy folder from bundling
config.resolver.blockList = [
  /.*[/\\]legacy[/\\].*/,
];

module.exports = config;
