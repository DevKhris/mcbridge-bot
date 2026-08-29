import { StatusResponse } from "./status.response";

export interface JavaStatusResponse extends StatusResponse {
  version?: {
    name_raw: string;
    name_clean: string;
    name_html: string;
    protocol: number;
  } | null;
  players?: {
    online: number;
    max: number;
    list: {
      uuid: string;
      name_raw: string;
      name_clean: string;
      name_html: string;
    }[];
  };
  motd?: {
    raw: string;
    clean: string;
    html: string;
  };
  icon?: string | null;
  mods?: {
    name: string;
    version: string;
  }[];
  plugins?: {
    name: string;
    version: string;
  }[];
  software?: string;
}