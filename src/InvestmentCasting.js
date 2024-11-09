import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

// Contract ABI and address
const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_temperature",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_humidity",
				"type": "string"
			}
		],
		"name": "pushData",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_admin",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "data",
		"outputs": [
			{
				"internalType": "string",
				"name": "temperature",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "humidity",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getEntries",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const CONTRACT_ADDRESS = "0x3B7410b19BF8a16E380c6269E88405687916B811"; // Replace with your deployed contract address

const InvestmentCasting = () => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [totalEntries, setTotalEntries] = useState(0);
    const [latestEntry, setLatestEntry] = useState({ temperature: "", humidity: "" });
    const [indexEntry, setIndexEntry] = useState(null); // Initially null
    const [index, setIndex] = useState("");

    useEffect(() => {
        const connectContract = async () => {
            if (typeof window.ethereum !== "undefined") {
                const newProvider = new ethers.BrowserProvider(window.ethereum);
                await newProvider.send("eth_requestAccounts", []);
    
                const signer = await newProvider.getSigner();
                const newContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
                setProvider(newProvider);
                setSigner(signer);
                setContract(newContract);
    
                // Load initial data
                loadInitialData(newContract);
            } else {
                alert("Please install MetaMask to interact with the contract!");
            }
        };
        connectContract();
    }, []);

    const loadInitialData = async (contract) => {
        try {
            const entries = await contract.getEntries();
            setTotalEntries(entries.toString());
            if (entries > 0) {
                const latest = await contract.data(entries - ethers.toBigInt(1));
                setLatestEntry({ temperature: latest.temperature, humidity: latest.humidity });
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    };

    const fetchEntryByIndex = async () => {
        setIndexEntry(null); // Clear previous entry data before fetching
        if (index < 0 || index > totalEntries) {
            alert(`Invalid index! Please enter a number from 0 to ${totalEntries}`);
            return;
        }
        try {
            const entry = await contract.data(index - 1);
            setIndexEntry({ temperature: entry.temperature, humidity: entry.humidity });
        } catch (error) {
            console.error("Error fetching entry by index:", error);
        }
    };

    return (
        <div className="container">
            <h1>Blockchain Based Investment Casting Data</h1>

            {/* Display Latest Data Entry */}
            <div className="section">
                <h2>Latest Data</h2>
                <p>Temperature: {latestEntry.temperature}</p>
                <p>Humidity: {latestEntry.humidity}</p>
            </div>

            {/* Display Total Number of Entries */}
            <div className="section">
                <h2>Total Entries</h2>
                <p>{totalEntries}</p>
            </div>

            {/* Fetch Specific Entry by Index */}
            <div className="section">
                <div className="card-body text-center">
                    <h2 className="card-title">Get Data by Index</h2>
                    <div className="form-group my-3">
                        <input
                            type="number"
                            value={index}
                            onChange={(e) => setIndex(e.target.value)}
                            placeholder="Enter index"
                            className="form-control w-50 mx-auto"
                            style={{ textAlign: "center" }}
                        />
                    </div>
                    <button onClick={fetchEntryByIndex} className="btn btn-primary">
                        Fetch Entry
                    </button>

                    {/* Conditionally render temperature and humidity if indexEntry exists */}
                    {indexEntry && (
                        <div className="mt-3">
                            <p>Temperature: <span className="text-muted">{indexEntry.temperature}</span></p>
                            <p>Humidity: <span className="text-muted">{indexEntry.humidity}</span></p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvestmentCasting;
