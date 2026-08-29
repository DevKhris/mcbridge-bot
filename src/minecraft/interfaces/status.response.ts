export interface StatusResponse {
    online: boolean;
    host: string;
    port: number;
    eulaBlock?: boolean;
    site?: string;
    protocolVersion?: number;
    srvRecord?: string;
    retrievedAt?: Date;
    expiresAt?: Date;
}