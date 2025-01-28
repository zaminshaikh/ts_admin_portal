import { roundToNearestHour } from "./database";
import { Activity } from "./interfaces";

export const emptyActivity: Activity = {
    amount: 0,
    fund: 'AGQ',
    recipient: '',
    time: roundToNearestHour(new Date()),
    type: 'profit',
    isDividend: false,
    sendNotif: true,
    isAmortization: false,
    notes: undefined,
    parentName: '',
};
