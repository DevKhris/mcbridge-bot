import { BedrockVersions } from "../enums/bedrock.versions.enum";
import { StatusResponse } from "./status.response";

export interface BedrockStatusResponse extends StatusResponse {
  version?: {
    name: string;
    protocol: number;
  };
  players?: {
    online: number;
    max: number;
  };
  motd?: {
    raw: string;
    clean: string;
    html: string;
  };
  gamemode?: string;
  server_id?: string;
  edition?: BedrockVersions;
}