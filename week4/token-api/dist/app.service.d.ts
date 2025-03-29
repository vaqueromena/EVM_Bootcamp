export declare class AppService {
    publicClient: any;
    walletClient: any;
    constructor();
    getHello(): string;
    getContractAddress(): string;
    getTokenName(): Promise<string>;
    getTransactionReceipt(hash: string): void;
    getTokenBalance(address: string): Promise<string>;
    getTotalSupply(): Promise<string>;
    getServerWalletAddress(): string;
    checkMinterRole(address: string): Promise<boolean>;
}
