import { Timestamp } from "firebase/firestore";

export interface AssetDetails {
    amount: number;
    firstDepositDate: Date | null;
    displayTitle: string;
    index: number;
}

/**
 * Client interface representing a client in the Firestore database.
 *  
 * .cid - The document ID of the client (the Client ID)
 * 
 * .uid - The client's UID, or the empty string if they have not signed up
 */
export interface Client {
    cid: string;
    uid: string;
    firstName: string;
    lastName: string;
    companyName: string;
    address: string;
    dob: Date | null;
    phoneNumber: string;
    appEmail: string;
    initEmail: string;
    firstDepositDate: Date | null;
    beneficiaries: string[];
    connectedUsers: string[];
    totalAssets: number;
    ytd: number;
    totalYTD: number;
    _selected?: boolean;
    lastLoggedIn?: string | null | undefined;
    activities?: Activity[];
    graphPoints?: GraphPoint[];
    assets: {
        [fundKey: string]: {
            [assetType: string]: AssetDetails;
        };
    };
}

export interface Activity {
    id?: string;
    notes?: string | number | string[] | undefined
    // selected?: boolean;
    parentDocId?: string;
    amount: number;
    fund: string;
    recipient: string;
    time: Date;
    formattedTime?: string;
    type: string;
    isDividend?: boolean;
    sendNotif?: boolean;
    amortizationCreated?: boolean;
    isAmortization?: boolean
    principalPaid?: number | undefined
    profitPaid?: number | undefined
    parentName: string;
}

export interface ScheduledActivity {
    id: string;
    cid: string;
    activity: Activity;
    clientState: Client;
    status: string;
    scheduledTime: Date;
    usersCollectionID: string;
}

export interface Notification {
    activityId: string;
    recipient: string;
    title: string;
    body: string;
    message: string;
    isRead: boolean;
    type: string;
    time: Date | Timestamp;
}

export interface GraphPoint {
    time: Date | Timestamp | null;
    amount: number | null;
}

export interface StatementData {
    statementTitle: string;
    downloadURL: string;
    clientId: string;
    // Add other necessary fields here
}