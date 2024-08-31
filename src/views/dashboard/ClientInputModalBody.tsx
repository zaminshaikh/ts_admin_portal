import { CModalBody, CInputGroup, CInputGroupText, CFormInput, CFormCheck, CMultiSelect, CContainer, CRow, CCol } from '@coreui/react-pro';
import { Activity, GraphPoint, User } from '../../db/database.ts'
import { Option, OptionsGroup } from '@coreui/react-pro/dist/esm/components/multi-select/types';
import Papa from 'papaparse';
import { isValid, parse } from 'date-fns';


interface ClientInputProps {
    clientState: User,
    setClientState: (clientState: User) => void,
    useCompanyName: boolean,
    setUseCompanyName: (useCompanyName: boolean) => void,
    userOptions: (Option | OptionsGroup)[],
    viewOnly: boolean,
}

// Handles the file input from the user
const handleActivitiesFileChange = (event: React.ChangeEvent<HTMLInputElement>, clientState: User, setClientState: (state: User) => void) => {

    const getActivityType = (type: string | undefined) => {
        if (!type) return "none";
        switch (type) {
            case "withdrawal":
                return "income"
            case "deposit":
                return "deposit"
            default:
                return "other"
        }
    }

    const file = event.target.files?.[0];
    if (!file) return;

    // List of exceptions to preserve original casing
    const exceptions = ["LLC", "Inc", "Ltd"];

    // Function to convert a string to title case while preserving exceptions
    const toTitleCase = (str: string, exceptions: string[]) => {
        return str.split(' ').map(word => {
            return exceptions.includes(word.toUpperCase()) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    };


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
                let name = toTitleCase(recipientName, exceptions);
    
                // Check if name does not match client's full name or company name
                const clientFullName = clientState.firstName + ' ' + clientState.lastName;
    
                if (name.toLowerCase() !== clientFullName.toLowerCase() && name.toLowerCase() !== clientState.companyName.toLowerCase()) return;
    
                // Determine the fund type
                let fund = fundInfo.split(' ')[0];
    
                // Parse the date string correctly
                const dateString = row["Date"] ?? row["date"];
                if (!dateString) {
                    console.warn("Date field is missing or undefined in row:", row);
                    return;
                }
    
                console.log(`Raw date string: ${dateString}`);
    
                // Parse the date string correctly
                const parsedDate = parseDateWithTwoDigitYear(dateString);
    
                // Create an activity from each row of the CSV
                const activity: Activity = {
                    fund: fund,
                    amount: Math.abs(parseFloat(row["Amount (Unscaled)"])),
                    recipient: name,
                    time: parsedDate,
                    type: getActivityType(row["Type"]),
                };
    
                // Add the activity to the activities array
                activities.push(activity);
            });

            console.log(activities);

            // Update the client state with the new activities
            const newClientState = {
                ...clientState,
                activities: [...(clientState.activities || []), ...activities],
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

const handleGraphPointsFileChange = (event: React.ChangeEvent<HTMLInputElement>, clientState: User, setClientState: (state: User) => void) => {
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
                const amount = row["Amount"] ?? row["amount"];
                const dateString = row["Date"] ?? row["date"];
                if (!dateString) {
                    console.warn("Date field is missing or undefined in row:", row);
                    return;
                }
    
                console.log(`Raw date string: ${dateString}`);
    
                // Parse the date string correctly
                const parsedDate = parseDateWithTwoDigitYear(dateString);
    
                if (!isValid(parsedDate)) {
                    console.warn("Invalid date format in row:", row);
                    return;
                }
    
                console.log(`Parsed date: ${parsedDate}`);
    
                // Create an activity from each row of the CSV
                const point: GraphPoint = {
                    time: parsedDate,
                    amount: parseFloat(amount),
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


export const ClientInputModalBody: React.FC<ClientInputProps> = ({
    clientState, 
    setClientState,
    useCompanyName,
    setUseCompanyName,
    userOptions,
    viewOnly,
}) => {
    return (
        <CModalBody className="px-5">
                    <CInputGroup className="mb-3 py-3">
                        <CInputGroupText>Client's First Name</CInputGroupText>
                        <CFormInput id="first-name" value={clientState.firstName} disabled={viewOnly}
                            onChange={(e) =>{
                                const newClientState = {
                                    ...clientState,
                                    firstName: e.target.value,
                                };
                                setClientState(newClientState)
                        }}/>
                        <CInputGroupText>Client's Last Name</CInputGroupText>
                        <CFormInput id="last-name" value={clientState.lastName} disabled={viewOnly}
                            onChange={
                                (e) => {
                                    const newClientState = {
                                        ...clientState,
                                        lastName: e.target.value
                                    }
                                    setClientState(newClientState)
                                }
                            }
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
                        id="connected-users"
                        className="mb-3  py-3" 
                        options={userOptions} 
                        placeholder="Select Connected Users" 
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

                    <EditAssetsSection clientState={clientState} setClientState={setClientState} useCompanyName={useCompanyName} viewOnly={viewOnly}/>
                

                    <div className="mb-3  py-3">
                        <h5>Upload Previous Activities</h5>
                        <div  className="mb-3 py-3">
                            <CFormInput type="file" id="formFile" onChange={(event) => handleActivitiesFileChange(event, clientState, setClientState)} disabled={viewOnly}/>
                        </div>
                    </div>

                    <div className="mb-3 ">
                        <h5>Upload Graph Points</h5>
                        <div  className="mb-3 py-3">
                            <CFormInput type="file" id="formFile" onChange={(event) => handleGraphPointsFileChange(event, clientState, setClientState)} disabled={viewOnly}/>
                        </div>
                    </div>
                </CModalBody>
    )
} 

export const ValidateClient = (clientState: User, useCompanyName: boolean, setInvalidInputFields: (fields: string[]) => void) => {
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



const getAssetType = (id: string) => {
    switch (id) {
        case "agq-personal":
        case "ak1-personal":
            return "personal";
        case "agq-company":
        case "ak1-company":
            return "company";
        case "agq-ira":
        case "ak1-ira":
            return "trad";
        case "agq-roth-ira":
        case "ak1-roth-ira":
            return "roth";
        case "agq-sep-ira":
        case "ak1-sep-ira":
            return "sep";
        case "agq-nuview-cash-ira":
        case "ak1-nuview-cash-ira":
            return "nuviewTrad";
        case "agq-nuview-cash-roth-ira":
        case "ak1-nuview-cash-roth-ira":
            return "nuviewRoth";
        default:
            return "";
    }
}

export const EditAssetsSection: React.FC<{clientState: User, setClientState: (clientState: User) => void, useCompanyName: boolean, activeFund?: string, viewOnly?: boolean}> = ({clientState, setClientState, useCompanyName, activeFund, viewOnly = null}) => {
    return (    
    <CContainer className="py-3">
        <CRow>
        <CCol>
            <h5>AGQ Fund Assets</h5>
            <AssetFormComponent title="Personal" id="agq-personal" fund="agq" clientState={clientState} setClientState={setClientState} disabled={viewOnly ?? (activeFund !== 'AGQ' && activeFund !== undefined)} />
            <AssetFormComponent title="Company" id="agq-company" fund="agq" disabled={viewOnly ?? (!(useCompanyName || activeFund == 'AGQ'))} clientState={clientState} setClientState={setClientState} />
            <AssetFormComponent title="IRA" id="agq-ira" fund="agq" clientState={clientState} setClientState={setClientState} disabled={viewOnly ?? (activeFund !== 'AGQ' && activeFund !== undefined)} />
            <AssetFormComponent title="Roth IRA" id="agq-roth-ira" fund="agq" clientState={clientState} setClientState={setClientState} disabled={viewOnly ?? (activeFund !== 'AGQ' && activeFund !== undefined)} />
            <AssetFormComponent title="SEP IRA" id="agq-sep-ira" fund="agq" clientState={clientState} setClientState={setClientState} disabled={viewOnly ?? (activeFund !== 'AGQ' && activeFund !== undefined)} />
            <AssetFormComponent title="NuView Cash IRA" id="agq-nuview-cash-ira" fund="agq" clientState={clientState} setClientState={setClientState} disabled={viewOnly ?? (activeFund !== 'AGQ' && activeFund !== undefined)} />
            <AssetFormComponent title="NuView Cash Roth IRA" id="agq-nuview-cash-roth-ira" fund="agq" clientState={clientState} setClientState={setClientState} disabled={viewOnly ?? (activeFund !== 'AGQ' && activeFund !== undefined)} />
        </CCol>
        <CCol>
            <h5>AK1 Fund Assets</h5>
            <AssetFormComponent title="Personal" id="ak1-personal" fund="ak1" clientState={clientState} setClientState={setClientState} disabled={viewOnly ?? (activeFund !== 'AK1' && activeFund !== undefined)} />
            <AssetFormComponent title="Company" id="ak1-company" fund="ak1" disabled={viewOnly ?? (!(useCompanyName || activeFund == 'AK1'))} clientState={clientState} setClientState={setClientState} />
            <AssetFormComponent title="IRA" id="ak1-ira" fund="ak1" clientState={clientState} setClientState={setClientState} disabled={viewOnly ?? (activeFund !== 'AK1' && activeFund !== undefined)} />
            <AssetFormComponent title="Roth IRA" id="ak1-roth-ira" fund="ak1" clientState={clientState} setClientState={setClientState} disabled={viewOnly ?? (activeFund !== 'AK1' && activeFund !== undefined)} />
            <AssetFormComponent title="SEP IRA" id="ak1-sep-ira" fund="ak1" clientState={clientState} setClientState={setClientState} disabled={viewOnly ?? (activeFund !== 'AK1' && activeFund !== undefined)} />
            <AssetFormComponent title="NuView Cash IRA" id="ak1-nuview-cash-ira" fund="ak1" clientState={clientState} setClientState={setClientState} disabled={viewOnly ?? (activeFund !== 'AK1' && activeFund !== undefined)} />
            <AssetFormComponent title="NuView Cash Roth IRA" id="ak1-nuview-cash-roth-ira" fund="ak1" clientState={clientState} setClientState={setClientState} disabled={viewOnly ?? (activeFund !== 'AK1' && activeFund !== undefined)} />
        </CCol>
        </CRow>
    </CContainer>)
}



export const AssetFormComponent: React.FC<{title: string, id: string, disabled?: boolean, fund: string, clientState: User, setClientState: (clientState: User) => void}> = ({title, id, disabled, fund, clientState: clientState, setClientState}) => {
    return (
        <CInputGroup className="mb-3 py-3">
            <CInputGroupText style={{ width: "200px" }}>{title}</CInputGroupText>
            <CInputGroupText>$</CInputGroupText>
            <CFormInput id={id} disabled={disabled} type="number" step="1000" value={clientState["assets"][fund][getAssetType(id)]} 
            onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d{0,2}$/.test(value)) {
                    // Update the client state with the new asset value
                    const newState = {
                        ...clientState,
                        assets: {
                            ...clientState.assets,
                            [fund]: {
                                ...clientState.assets[fund],
                                [getAssetType(id)]: parseFloat(value)
                            }
                        }
                    };
                    // Update the client state
                    setClientState(newState);
                }
            }}
            onBlur={(e) => {
                const value = e.target.value;
                if (value === '' || isNaN(parseFloat(value))) {
                    // Reset the asset value to 0
                    const newState = {
                        ...clientState,
                        assets: {
                            ...clientState.assets,
                            [fund]: {
                                ...clientState.assets[fund],
                                [getAssetType(id)]: 0
                            }
                        }
                    };
                    setClientState(newState);
                } 
            }}/>
        </CInputGroup>
    )      
}