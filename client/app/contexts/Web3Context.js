"use client";

// src/contexts/Web3Context.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import myPharma from '../../src/contracts/Pharma.json';

const Web3Context = createContext();

// Ganache network details
const GANACHE_CHAIN_ID_DECIMAL = 1337;
// Convert the decimal Chain ID to hex string with 0x prefix
const GANACHE_CHAIN_ID = '0x' + GANACHE_CHAIN_ID_DECIMAL.toString(16);

// Smart contract address - will be updated after deployment to Ganache
const CONTRACT_ADDRESS = '0x040B92577d65B3cB5e584fa6B69e90D86a3803b9'; // Ganache deployed address

// Ganache RPC URL
const GANACHE_RPC_URL = 'http://127.0.0.1:7545';

// Local storage key for connection state
const WALLET_CONNECTED_KEY = 'pharmachain_wallet_connected';

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [PharmaContract, setPharmaContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Function to check if we're on the correct network
  const checkNetwork = async () => {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log("Current Chain ID:", chainId);
      console.log("Expected Chain ID:", GANACHE_CHAIN_ID);
      setIsCorrectNetwork(chainId === GANACHE_CHAIN_ID);
      return chainId === GANACHE_CHAIN_ID;
    }
    return false;
  };

  // Function to initialize contract
  const initContract = async (signer) => {
    try {
      console.log("Initializing contract with address:", CONTRACT_ADDRESS);
      console.log("ABI available:", !!myPharma.abi);
      
      // Create the contract instance with the signer
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        myPharma.abi,
        signer
      );
      
      console.log("Contract initialized:", !!contractInstance);
      console.log("createOrganization method available:", !!contractInstance.createOrganization);
      
      setPharmaContract(contractInstance);
      return contractInstance;
    } catch (error) {
      console.error("Contract initialization error:", error);
      return null;
    }
  };

  // Function to silently check and restore connection (no user prompts)
  const checkAndRestoreConnection = async () => {
    try {
      if (window && window.ethereum) {
        const shouldAutoConnect = localStorage.getItem(WALLET_CONNECTED_KEY) === 'true';
        
        if (shouldAutoConnect) {
          console.log("Auto-connecting based on previous session...");
          
          // First check if accounts are already available (already connected)
          try {
            const accounts = await window.ethereum.request({ 
              method: 'eth_accounts'  // eth_accounts doesn't trigger a user prompt unlike eth_requestAccounts
            });
            
            if (accounts && accounts.length > 0) {
              console.log("Found existing connection:", accounts);
              
              // Check if on correct network
              await checkNetwork();
              
              // Setup provider and signer
              const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
              setProvider(ethersProvider);
              
              const signer = ethersProvider.getSigner();
              setAccounts(accounts[0]);
              setIsConnected(true);
              
              // Initialize contract with signer
              await initContract(signer);
              return true;
            } else {
              console.log("No existing connection found despite localStorage flag");
              localStorage.removeItem(WALLET_CONNECTED_KEY);
              return false;
            }
          } catch (error) {
            console.error("Error checking existing accounts:", error);
            localStorage.removeItem(WALLET_CONNECTED_KEY);
            return false;
          }
        }
      }
      return false;
    } catch (error) {
      console.error("Error in auto-connect:", error);
      return false;
    } finally {
      setIsInitializing(false);
    }
  };

  // Function to connect wallet (with user interaction)
  const connectWallet = async () => {
    try {
      if (window && window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log("Connected accounts:", accounts);
        
        // Check network and switch if necessary
        const onCorrectNetwork = await checkNetwork();
        if (!onCorrectNetwork) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: GANACHE_CHAIN_ID }],
            });
          } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: GANACHE_CHAIN_ID,
                      chainName: 'Ganache Local',
                      rpcUrls: [GANACHE_RPC_URL],
                      nativeCurrency: {
                        name: 'ETH',
                        symbol: 'ETH',
                        decimals: 18
                      }
                    }
                  ]
                });
              } catch (addError) {
                console.error("Error adding Ganache network:", addError);
                alert('Please add the Ganache network to your MetaMask manually:\n\nNetwork Name: Ganache Local\nRPC URL: ' + GANACHE_RPC_URL + '\nChain ID: ' + GANACHE_CHAIN_ID_DECIMAL + '\nCurrency Symbol: ETH');
              }
            } else {
              throw switchError;
            }
          }
        }
        
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(ethersProvider);

        const signer = ethersProvider.getSigner();
        setAccounts(accounts[0]);
        setIsConnected(true);

        // Store connection state
        localStorage.setItem(WALLET_CONNECTED_KEY, 'true');

        // Initialize the contract
        await initContract(signer);
        
        return true;
      } else {
        alert('Please install MetaMask!');
        return false;
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert('Error connecting to MetaMask: ' + error.message);
      return false;
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccounts([]);
    setIsConnected(false);
    setPharmaContract(null);
    localStorage.removeItem(WALLET_CONNECTED_KEY);
  };

  // Initialize on first load
  useEffect(() => {
    checkAndRestoreConnection();
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (window.ethereum) {
      // Listen for account changes
      const handleAccountsChanged = async (newAccounts) => {
        console.log("Accounts changed:", newAccounts);
        if (newAccounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet();
        } else {
          setAccounts(newAccounts[0]);
          setIsConnected(true);
          localStorage.setItem(WALLET_CONNECTED_KEY, 'true');
          
          // Re-initialize contract with new account
          if (provider) {
            const signer = provider.getSigner();
            await initContract(signer);
          }
        }
      };

      // Listen for chain changes
      const handleChainChanged = async () => {
        await checkNetwork();
        // Don't reload - just handle the change
        if (isConnected && provider) {
          const signer = provider.getSigner();
          await initContract(signer);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup listeners when component unmounts
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [provider, isConnected]);

  return (
    <Web3Context.Provider value={{ 
      provider, 
      accounts, 
      PharmaContract, 
      isConnected, 
      isCorrectNetwork,
      isInitializing,
      connectWallet,
      disconnectWallet
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);