import { CModalBody, CInputGroup, CInputGroupText, CFormInput, CFormCheck, CMultiSelect, CContainer, CRow, CCol, CButton, CLoadingButton, CTable, CTableHead, CTableHeaderCell, CTableRow, CTableBody, CTableDataCell } from '@coreui/react-pro';
import { Activity, DatabaseService, GraphPoint, Client, formatCurrency } from '../../db/database.ts'
import { Option, OptionsGroup } from '@coreui/react-pro/dist/esm/components/multi-select/types';
import Papa from 'papaparse';
import { EditAssetsSection } from "../../components/EditAssetsSection";
import { isValid, parse, set } from 'date-fns';
import CIcon from '@coreui/icons-react';
import * as icon from '@coreui/icons';
import { useState } from 'react';
import { formatDate, toTitleCase } from 'src/utils/utilities.ts';


interface ClientInputProps {
    clientState: Client,
    setClientState: (clientState: Client) => void,
    useCompanyName: boolean,
    setUseCompanyName: (useCompanyName: boolean) => void,
    clientOptions: (Option | OptionsGroup)[],
    viewOnly: boolean,
}

// Handles the file input from the client
const handleActivitiesFileChange = (event: React.ChangeEvent<HTMLInputElement>, clientState: Client, setClientState: (state: Client) => void) => {

    const getActivityType = (type: string | undefined) => {
        if (!type) return "none";
        switch (type) {
            case "withdrawal":
                return "profit";
            case "deposit":
                return "deposit";
            default:
                return "other";
        }
    }

    const file = event.target.files?.[0];
    if (!file) return;

    // List of exceptions to preserve original casing
    const exceptions = ["LLC", "Inc", "Ltd"];

    // Parse the CSV file
    Papa.parse(file, {
        header: true,
        complete: (results) => {
            // Initialize an array to store the activities
            let activities: Activity[] = [];

            results.data.forEach((row: any) => {
                // Skip if row is empty
                if (Object.values(row).every(x => (x === null || x === ''))) return;

                
    
                // Remove the fund type after the dash and convert the name to title case
                let [recipientName, fundInfo] = row["Security Name"].split('-').map((s: string) => s.trim());
                let name = toTitleCase(recipientName.trimEnd(), exceptions);
    
                // Check if name does not match client's full name or company name
                const clientFullName = clientState.firstName.trimEnd() + ' ' + clientState.lastName.trimEnd();
    
                if (name.toLowerCase() !== clientFullName.toLowerCase() && name.toLowerCase() !== clientState.companyName.toLowerCase()) return;
                else if (name.toLowerCase() === clientState.companyName.toLowerCase()) { name = clientState.companyName }
    
                // Determine the fund type
                let fund = fundInfo.split(' ')[0];
    
                // Parse the date string correctly
                const dateString = row["Date"] ?? row["date"];
                if (!dateString) {
                    console.warn("Date field is missing or undefined in row:", row);
                    return;
                }
    
                // Parse the date string correctly
                const parsedDate = parseDateWithTwoDigitYear(dateString);
                if (parsedDate === null) return;
    
                // Create an activity from each row of the CSV
                const activity: Activity = {
                    fund: fund,
                    amount: Math.abs(parseFloat(row["Amount (Unscaled)"])),
                    recipient: name,
                    time: parsedDate,
                    formattedTime: formatDate(parsedDate),
                    type: getActivityType(row["Type"]),
                };
    
                // Add the activity to the activities array
                activities.push(activity);
            });

            console.log(activities);

            const newClientState = {
                ...clientState,
                activities: [
                    ...(clientState.activities || []),
                    ...activities
                ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
            };

            setClientState(newClientState)
        },
    });
};

const parseDateWithTwoDigitYear = (dateString: string) => {
    const dateFormats = ['yyyy-MM-dd', 'MM/dd/yyyy', 'MM/dd/yy', 'MM-dd-yy', 'MM-dd-yyyy'];
    let parsedDate = null;

    for (const format of dateFormats) {
        parsedDate = parse(dateString, format, new Date());
        if (isValid(parsedDate)) {
            // Handle two-digit year
            const year = parsedDate.getFullYear();
            if (year < 100) {
                parsedDate.setFullYear(year + 2000);
            }
            break;
        }
    }

    return parsedDate;
};

const handleGraphPointsFileChange = (event: React.ChangeEvent<HTMLInputElement>, clientState: Client, setClientState: (state: Client) => void) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Parse the CSV file
    Papa.parse(file, {
        header: true,
        complete: (results) => {
            // Initialize an array to store the activities
            let graphPoints: GraphPoint[] = [];
    
            results.data.forEach((row: any) => {
                // Skip if row is empty
                if (Object.values(row).every(x => (x === null || x === ''))) return;
    
                // Get the date string from the row
                const amountString = row["Amount"] ?? row["amount"];
                const dateString = row["Date"] ?? row["date"];
                if (!dateString) {
                    console.warn("Date field is missing or undefined in row:", row);
                    return;
                }
    
                console.log(`Raw date string: ${dateString}`);
    
                // Parse the date string correctly
                const parsedDate = parseDateWithTwoDigitYear(dateString);

                // Remove commas and dollar signs from the amount string and parse it as a float
                const cleanedAmountString = amountString.replace(/[$,]/g, '');
                const amount = parseFloat(cleanedAmountString);
    
                if (!isValid(parsedDate)) {
                    console.warn("Invalid date format in row:", row);
                    return;
                }
    
                console.log(`Parsed date: ${parsedDate}`);
    
                // Create an activity from each row of the CSV
                const point: GraphPoint = {
                    time: parsedDate,
                    amount: amount,
                };
    
                // Add the activity to the activities array
                graphPoints.push(point);
            });
    
            console.log(graphPoints);
    
            // Update the client state with the new activities
            const newClientState = {
                ...clientState,
                graphPoints,
            };
            setClientState(newClientState);
        }
    });
}

/**
 * Component representing the body of the client input modal.
 * 
 * @component
 * @param {ClientInputProps} props - The properties passed to the component.
 * @param {ClientState} props.clientState - The current state of the client.
 * @param {React.Dispatch<React.SetStateAction<ClientState>>} props.setClientState - Function to update the client state.
 * @param {boolean} props.useCompanyName - Flag indicating whether to use the company name.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setUseCompanyName - Function to update the useCompanyName flag.
 * @param {Array<Option>} props.clientOptions - Options for connected clients.
 * @param {boolean} props.viewOnly - Flag indicating whether the form is in view-only mode.
 * 
 * @returns {JSX.Element} The rendered component.
 */
export const ClientInputModalBody: React.FC<ClientInputProps> = ({
    clientState, 
    setClientState,
    useCompanyName,
    setUseCompanyName,
    clientOptions,
    viewOnly,
}) => {
    const db = new DatabaseService();
    const [ytdLoading, setYTDLoading] = useState(false);
    const [totalYTDLoading, setTotalYTDLoading] = useState(false);

    const handleRemoveActivity = (index: number) => {
        const updatedClient = clientState.activities?.filter((_, i) => i !== index);
        const newState = {
            ...clientState,
            activities: updatedClient
        }
        setClientState(newState);
    };

    return (
        <CModalBody className="px-5">
            <CInputGroup className="mb-3 py-3">
                <CInputGroupText>Client's First Name</CInputGroupText>
                <CFormInput
                    id="first-name"
                    value={clientState.firstName}
                    disabled={viewOnly}
                    onChange={(e) => {
                        const newClientState = {
                            ...clientState,
                            firstName: e.target.value,
                        };
                        setClientState(newClientState);
                    }}
                />
                <CInputGroupText>Client's Last Name</CInputGroupText>
                <CFormInput
                    id="last-name"
                    value={clientState.lastName}
                    disabled={viewOnly}
                    onChange={(e) => {
                        const newClientState = {
                            ...clientState,
                            lastName: e.target.value,
                        };
                        setClientState(newClientState);
                    }}
                />
            </CInputGroup>

                    <CInputGroup className="mb-3  py-3">
                        <CInputGroupText>
                            <CFormCheck type="checkbox" id="useCompanyName" checked={useCompanyName} onChange={(e) => setUseCompanyName(e.target.checked)} disabled={viewOnly}/>
                        </CInputGroupText>
                        <CInputGroupText>Company Name</CInputGroupText>
                        <CFormInput id="company-name" value={clientState.companyName} 
                        onChange={
                            (e) => {
                                const newClientState = {
                                    ...clientState,
                                    companyName: e.target.value
                                }
                                setClientState(newClientState)
                            }
                        } 
                        disabled={viewOnly ? viewOnly : !useCompanyName}/>
                    </CInputGroup>

                    <CInputGroup className="mb-3  py-3">
                        <CInputGroupText>Address</CInputGroupText>
                        <CFormInput id="address" value={clientState.address} disabled={viewOnly}
                            onChange={(e) => {
                                const newClientState = {
                                    ...clientState,
                                    address: e.target.value,
                                };
                                setClientState(newClientState)
                        }}/>
                    </CInputGroup>

                    <CInputGroup className="mb-3  py-3">
                        <CInputGroupText>DOB</CInputGroupText>
                        <CFormInput type="date" id="dob"  value = {clientState.dob?.toISOString().split('T')[0] ?? ''} disabled={viewOnly}
                            onChange={(e) => {
                                const newClientState = {
                                    ...clientState,
                                    dob: parse(e.target.value, 'yyyy-MM-dd', new Date()),
                                };
                                setClientState(newClientState)
                        }}/>
                    </CInputGroup>

                    <CInputGroup className="mb-3  py-3">
                        <CInputGroupText>Phone Number</CInputGroupText>
                        <CFormInput id="phone-number" value={clientState.phoneNumber} disabled={viewOnly}
                            onChange={(e) => {
                                const newClientState = {
                                    ...clientState,
                                    phoneNumber: e.target.value,
                                };
                                setClientState(newClientState)
                        }}/>
                    </CInputGroup>

                    <CInputGroup className="mb-3  py-3">
                        <CInputGroupText>Email</CInputGroupText>
                        <CFormInput type="email" id="email" value={clientState.initEmail} disabled={viewOnly}
                            onChange={(e) => {
                                const newClientState = {
                                    ...clientState,
                                    initEmail: e.target.value,
                                };
                                setClientState(newClientState)
                        }}/>
                    </CInputGroup>

                    <CInputGroup className="mb-3  py-3">
                        <CInputGroupText>First Deposit Date</CInputGroupText>
                        <CFormInput type="date" id="first-deposit-date" value={clientState.firstDepositDate?.toISOString().split('T')[0] ?? ''} disabled={viewOnly}
                            onChange={(e) => {
                                const newClientState = {
                                    ...clientState,
                                    firstDepositDate: parse(e.target.value, 'yyyy-MM-dd', new Date()),
                                };
                                setClientState(newClientState)
                        }}/>
                    </CInputGroup>

                    <CInputGroup className="mb-3  py-3">
                        <CInputGroupText>Beneficiary</CInputGroupText>
                        <CFormInput
                            id="beneficiary"
                            value={clientState.beneficiaries[0]} // Assuming you want to edit the first beneficiary
                            disabled={viewOnly}
                            onChange={(e) => {
                                const newBeneficiaries = [...clientState.beneficiaries];
                                newBeneficiaries[0] = e.target.value; // Update the first beneficiary
                                const newClientState = {
                                    ...clientState,
                                    beneficiaries: newBeneficiaries,
                                };
                                setClientState(newClientState);
                                console.log(clientState);
                            }}
                        />
                    </CInputGroup>

                    <CMultiSelect 
                        id="connected-clients"
                        className="mb-3  py-3" 
                        options={clientOptions} 
                        placeholder="Select Connected Clients" 
                        selectAll={false}
                        disabled={viewOnly}
                        onChange={
                            (selectedValues) => {
                                const newClientState = {
                                    ...clientState,
                                    connectedUsers: selectedValues.map(selected => selected.value as string)
                                }
                                setClientState(newClientState)
                            }
                        }
                    /> 
                
                    <CInputGroup className='py-3'>
                        <CInputGroupText>YTD</CInputGroupText>
                        <CFormInput type="number" id="ytd" value={clientState.ytd} disabled={viewOnly}
                            onChange={(e) => {
                                const newClientState = {
                                    ...clientState,
                                    ytd: parseFloat(e.target.value),
                                };
                                setClientState(newClientState)
                        }}/>
                        <CLoadingButton 
                            color="primary" 
                            variant="outline" 
                            disabled={clientState.cid == '' || clientState.cid == null || viewOnly} 
                            loading={ytdLoading}
                            onClick={async () => {    
                                setYTDLoading(true);
                                try {const ytd = await db.getYTD(clientState.cid); 
                                const newClientState = {
                                        ...clientState,
                                        ytd: ytd,
                                };
                                setClientState(newClientState);
                                } catch (error) {
                                    console.error(error);
                                } finally {
                                    setYTDLoading(false);
                                }
                            }}
                        >Update YTD</CLoadingButton>
                    </CInputGroup>
                    <CInputGroup className='py-3'>
                        <CInputGroupText>Total YTD</CInputGroupText>
                        <CFormInput type="number" id="ytd" value={clientState.totalYTD ?? clientState.ytd} disabled={clientState.connectedUsers.length == 0 || viewOnly}
                            onChange={(e) => {
                                const newClientState = {
                                    ...clientState,
                                    ytd: parseFloat(e.target.value),
                                };
                                setClientState(newClientState)
                        }}/>
                        <CLoadingButton 
                            color="primary" 
                            variant="outline" 
                            disabled={clientState.connectedUsers.length == 0 || clientState.cid == '' || clientState.cid == null || viewOnly} 
                            loading={totalYTDLoading}
                            onClick={async () => {    
                                setTotalYTDLoading(true);
                                try {const ytd = await db.getTotalYTD(clientState.cid); 
                                const newClientState = {
                                        ...clientState,
                                        totalYTD: ytd,
                                };
                                setClientState(newClientState);
                                console.log(ytd);
                                console.log(clientState);
                                } catch (error) {
                                    console.error(error);
                                } finally {
                                    setTotalYTDLoading(false);
                                }
                            }}
                        >Update Total YTD</CLoadingButton>
                    </CInputGroup>

                    <EditAssetsSection clientState={clientState} setClientState={setClientState} useCompanyName={useCompanyName} viewOnly={viewOnly}/>

                    <div className="mb-3 ">
                        <h5>Upload Previous Activities</h5>
                        <div  className="mb-3 py-3">
                            <CFormInput type="file" id="formFile" onChange={(event) => handleActivitiesFileChange(event, clientState, setClientState)} disabled={viewOnly}/>
                        </div>
                    </div>
                    
                    {/* Imported Activities Table */}
                    {(clientState.activities && clientState.activities.length > 0) && <CTable striped hover >
                        <CTableHead >
                            <CTableRow>
                                <CTableHeaderCell>Index</CTableHeaderCell>
                                <CTableHeaderCell>Type</CTableHeaderCell>
                                <CTableHeaderCell>Time</CTableHeaderCell>
                                <CTableHeaderCell>Amount</CTableHeaderCell>
                                <CTableHeaderCell>Actions</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {clientState.activities?.map((activity, index) => (
                                <CTableRow key={index}>
                                    <CTableDataCell>{index + 1}</CTableDataCell>
                                    <CTableDataCell>{toTitleCase(activity.type)}</CTableDataCell>
                                    <CTableDataCell>{activity.formattedTime}</CTableDataCell>
                                    <CTableDataCell>{formatCurrency(activity.amount)}</CTableDataCell>
                                    <CTableDataCell>
                                        <CButton className="me-5" color="warning"  variant='outline' onClick={() => {}}>Edit Activity</CButton>
                                        <CButton color="danger"  variant='outline' onClick={() => handleRemoveActivity(index)}>Remove</CButton>
                                    </CTableDataCell>
                                </CTableRow>
                            ))}
                        </CTableBody>
                    </CTable>}

                    <div className="mb-3 ">
                        <h5>Upload Graph Points</h5>
                        <div  className="mb-3 py-3">
                            <CFormInput type="file" id="formFile" onChange={(event) => handleGraphPointsFileChange(event, clientState, setClientState)} disabled={viewOnly}/>
                        </div>
                    </div>
                </CModalBody>
    )
} 

export const ValidateClient = (clientState: Client, useCompanyName: boolean, setInvalidInputFields: (fields: string[]) => void) => {
    let validClient = true;
    let fields: string[] = [];

    const fieldValidations: { displayName: string, condition: boolean }[] = [
        { displayName: 'First Name', condition: clientState.firstName === '' },
        { displayName: 'Last Name', condition: clientState.lastName === '' },
        { displayName: 'Company Name', condition: useCompanyName && clientState.companyName === '' },
        { displayName: 'Address', condition: clientState.address === '' },
        { displayName: 'DOB', condition: !clientState.dob || isNaN(clientState.dob.getTime()) },
        { displayName: 'Phone Number', condition: clientState.phoneNumber === '' },
        { displayName: 'Email', condition: clientState.initEmail === '' },
        { displayName: 'First Deposit Date', condition: !clientState.firstDepositDate || isNaN(clientState.firstDepositDate.getTime()) },
        { displayName: 'Beneficiary', condition: clientState.beneficiaries[0] === '' },
    ];

    fieldValidations.forEach(({ displayName, condition }) => {
        if (condition) {
            fields.push(displayName);
            validClient = false;
        }
    });
    
    setInvalidInputFields(fields);

    return validClient;
}