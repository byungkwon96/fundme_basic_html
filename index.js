import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw
//check whether metamask exists
async function connect() {
    if (typeof window.ethereum != undefined) {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
        } catch (e) {
            console.error(e)
        }
        connectButton.innerHTML = "Connected!"
        console.log("connnected!!")
    } else {
        console.log("Need to install Metamask")
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount") || "0.1"
    console.log(`Funding with ${ethAmount}`)
    if (typeof window.ethereum != undefined) {
        // provider / connection to the blockchain
        // signer / wallet with some gas
        // contract that we are interacting with
        // ABI & Address
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner() //return wallet that are connected
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
        } catch (e) {
            console.log(e)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ... ${transactionResponse.hash}`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
        })
    })
}

async function getBalance() {
    if (typeof window.ethereum != undefined) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function withdraw() {
    if (typeof window.ethereum != undefined) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (e) {
            console.log(e)
        }
    }
}
