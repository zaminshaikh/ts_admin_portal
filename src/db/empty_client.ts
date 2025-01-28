
import { Client } from './interfaces';

export const emptyClient: Client = {
    firstName: '',
    lastName: '',
    companyName: '',
    address: '',
    dob: null,
    phoneNumber: '',
    firstDepositDate: null,
    beneficiaries: [],
    connectedUsers: [],
    cid: '',
    uid: '',
    appEmail: '',
    initEmail: '',
    totalAssets: 0,
    ytd: 0,
    totalYTD: 0,
    assets: {
        agq: {
            personal: {
                amount: 0,
                firstDepositDate: null,
                displayTitle: 'Personal',
                index: 0,
            },
        },
        ak1: {
            personal: {
                amount: 0,
                firstDepositDate: null,
                displayTitle: 'Personal',
                index: 0,
            },
        },
    },
};