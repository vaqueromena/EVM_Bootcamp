import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    getContractAddress(): {
        result: string;
    };
    getTokenName(): Promise<{
        result: string;
    }>;
    getTotalSupply(): Promise<{
        result: string;
    }>;
    getTokenBalance(address: string): Promise<{
        result: string;
    }>;
    getTransactionReceipt(hash: string): Promise<{
        result: void;
    }>;
}
