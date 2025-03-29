"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const tokenJson = require("./assets/MyToken.json");
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const accounts_1 = require("viem/accounts");
class Constants {
    static providerApiKey = process.env.ALCHEMY_API_KEY || "";
    static deployerPrivateKey = process.env.PRIVATE_KEY || "";
    static deployerPrivateKeySecondWallet = process.env.PRIVATE_KEY_SECOND || "";
}
let AppService = class AppService {
    publicClient;
    walletClient;
    constructor() {
        const account = (0, accounts_1.privateKeyToAccount)(`0x${process.env.PRIVATE_KEY}`);
        this.publicClient = (0, viem_1.createPublicClient)({
            chain: chains_1.sepolia,
            transport: (0, viem_1.http)(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
        });
        this.walletClient = (0, viem_1.createWalletClient)({
            transport: (0, viem_1.http)(process.env.RPC_ENDPOINT_URL),
            chain: chains_1.sepolia,
            account: account,
        });
    }
    getHello() {
        return 'Hello World!';
    }
    getContractAddress() {
        return "0x2282A77eC5577365333fc71adE0b4154e25Bb2fa";
    }
    async getTokenName() {
        const publicClient = (0, viem_1.createPublicClient)({
            chain: chains_1.sepolia,
            transport: (0, viem_1.http)(`https://eth-sepolia.g.alchemy.com/v2/PpWGDU7fhOL-GpjUCk_2tvV9U28lj2Gj`),
        });
        const name = await publicClient.readContract({
            address: this.getContractAddress(),
            abi: tokenJson.abi,
            functionName: "name"
        });
        return name;
    }
    getTransactionReceipt(hash) {
        throw new Error('Method not implemented.');
    }
    async getTokenBalance(address) {
        const balance = await this.publicClient.readContract({
            address: this.getContractAddress(),
            abi: tokenJson.abi,
            functionName: "balanceOf",
            args: [address]
        });
        const balanceFormatted = (0, viem_1.formatEther)(balance);
        return balanceFormatted;
    }
    async getTotalSupply() {
        const publicClient = (0, viem_1.createPublicClient)({
            chain: chains_1.sepolia,
            transport: (0, viem_1.http)(`https://eth-sepolia.g.alchemy.com/v2/PpWGDU7fhOL-GpjUCk_2tvV9U28lj2Gj`),
        });
        const totalSupplyBN = await publicClient.readContract({
            address: this.getContractAddress(),
            abi: tokenJson.abi,
            functionName: "totalSupply"
        });
        const totalSupply = (0, viem_1.formatEther)(totalSupplyBN);
        return totalSupply;
    }
    getServerWalletAddress() {
        return this.walletClient.account.address;
    }
    async checkMinterRole(address) {
        const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
        const hasRole = await this.publicClient.readContract({
            address: this.getContractAddress(),
            abi: tokenJson.abi,
            functionName: 'hasRole',
            args: [MINTER_ROLE, address],
        });
        return hasRole;
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AppService);
//# sourceMappingURL=app.service.js.map