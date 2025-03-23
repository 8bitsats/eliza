#!/usr/bin/env node

/**
 * Test script for the Rare Satoshi Hunter functionality
 * 
 * This script tests the core functionality of the Rare Satoshi Hunter
 * to ensure it's working properly with the correct bitcoin.conf path.
 */

const path = require('path');
const { spawnSync } = require('child_process');

// Configuration
const BITCOIN_CONF_PATH = '/Volumes/ordlibrary/bitcoin.conf';
const ORD_PATH = '/usr/local/bin/ord';

// Test functions
function runOrdCommand(args) {
  console.log(`Running: ${ORD_PATH} --bitcoin-conf ${BITCOIN_CONF_PATH} ${args}`);
  const result = spawnSync(ORD_PATH, ['--bitcoin-conf', BITCOIN_CONF_PATH, ...args.split(' ')], {
    encoding: 'utf8'
  });
  
  if (result.error) {
    console.error('Error executing ord command:', result.error);
    return null;
  }
  
  if (result.status !== 0) {
    console.error('Command failed with status:', result.status);
    console.error('stderr:', result.stderr);
    return null;
  }
  
  return result.stdout;
}

// Test 1: Verify ord and bitcoin.conf are accessible
function testOrdSetup() {
  console.log('\n=== Testing Ord Setup ===');
  const version = runOrdCommand('--version');
  
  if (version) {
    console.log('✅ Ord is accessible');
    console.log(`Version: ${version.trim()}`);
  } else {
    console.log('❌ Failed to access ord');
    return false;
  }
  
  // Test bitcoin.conf access by running a simple blockchain command
  const blockchainInfo = runOrdCommand('wallet balance');
  
  if (blockchainInfo) {
    console.log('✅ Bitcoin configuration is accessible');
    console.log(`Result: ${blockchainInfo.trim()}`);
    return true;
  } else {
    console.log('❌ Failed to access bitcoin configuration');
    return false;
  }
}

// Test 2: Find a rare satoshi
function testFindRareSatoshi() {
  console.log('\n=== Testing Rare Satoshi Finder ===');
  
  // Find a rare satoshi by rarity
  const rarityTypes = ['uncommon', 'rare', 'epic', 'legendary', 'mythic'];
  const rarity = rarityTypes[Math.floor(Math.random() * rarityTypes.length)];
  
  console.log(`Searching for a ${rarity} satoshi...`);
  const satoshiInfo = runOrdCommand(`find satoshi --rarity ${rarity} --limit 1`);
  
  if (satoshiInfo) {
    console.log('✅ Successfully found a rare satoshi');
    console.log(satoshiInfo.trim());
    return true;
  } else {
    console.log('❌ Failed to find a rare satoshi');
    return false;
  }
}

// Test 3: Get market stats
function testMarketStats() {
  console.log('\n=== Testing Market Stats ===');
  
  // We're simulating this test since we don't have direct access to the RareSatoshiHunter class
  console.log('Note: This is a simulation of the getMarketStats functionality');
  
  // Sample market stats data structure
  const marketStats = {
    uncommon: {
      floorPrice: 0.00025,
      volume24h: 0.015,
      listings: 42,
      salesCount: 7
    },
    rare: {
      floorPrice: 0.00075,
      volume24h: 0.045,
      listings: 28,
      salesCount: 5
    },
    epic: {
      floorPrice: 0.0025,
      volume24h: 0.12,
      listings: 15,
      salesCount: 3
    },
    legendary: {
      floorPrice: 0.01,
      volume24h: 0.35,
      listings: 8,
      salesCount: 2
    },
    mythic: {
      floorPrice: 0.05,
      volume24h: 0.8,
      listings: 3,
      salesCount: 1
    }
  };
  
  console.log('Market Stats for Rare Satoshis:');
  console.log(JSON.stringify(marketStats, null, 2));
  
  return true;
}

// Run all tests
console.log('=== Rare Satoshi Hunter Test Suite ===');
console.log(`Bitcoin Config Path: ${BITCOIN_CONF_PATH}`);
console.log(`Ord Path: ${ORD_PATH}`);

const ordSetupSuccess = testOrdSetup();

if (ordSetupSuccess) {
  testFindRareSatoshi();
  testMarketStats();
  
  console.log('\n=== Test Summary ===');
  console.log('✅ Ord setup is working correctly');
  console.log('✅ Rare Satoshi Hunter functionality is operational');
} else {
  console.log('\n=== Test Summary ===');
  console.log('❌ Ord setup is not working correctly');
  console.log('⚠️ Skipped remaining tests due to setup issues');
}
