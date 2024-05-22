import { CButton, CCol, CContainer, CFormCheck, CFormInput, CInputGroup, CInputGroupText, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CMultiSelect, CRow } from "@coreui/react-pro"
import { useState } from "react";
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { IMaskMixin } from 'react-imask'
import React from "react";
import { DatabaseService, User, emptyUser } from '../../db/database.ts'
import { ClientInputModalBody } from "./ClientInputModalBody.tsx";

// const CFormInputWithMask = React.forwardRef<HTMLInputElement, any>((props, ref) => (
//     <CFormInput
//         {...props}
//         ref={ref} // bind internal input
//     />
// ))

// const MaskedInput = IMaskMixin(CFormInputWithMask);

// State variable, determines if modal is shown based on UsersTable.tsx state
interface ShowModalProps {
        showModal: boolean;
        setShowModal: (show: boolean) => void;
        users?: User[];
}

// Initialize the client state
const initialClientState: User = emptyUser

interface InputValidationStatus {
    firstName: boolean;
    lastName: boolean;
    companyName: boolean;
    address: boolean;
    dob: boolean;
    phoneNumber: boolean;
    initEmail: boolean;
    firstDepositDate: boolean;
    beneficiaryFirstName: boolean;
    beneficiaryLastName: boolean;
}

const initialInputValidationStatus: InputValidationStatus = {
    firstName: true,
    lastName: true,
    companyName: true,
    address: true,
    dob: true,
    phoneNumber: true,
    initEmail: true,
    firstDepositDate: true,
    beneficiaryFirstName: true,
    beneficiaryLastName: true,
}

// TODO: Perform validation on address and email
// Initial modal to create new client
const CreateClient: React.FC<ShowModalProps> = ({showModal, setShowModal, users}) => {
    const db = new DatabaseService();
    const [clientState, setClientState] = useState<User>(initialClientState);
    const [inputValidationStatus, setInputValidationStatus] = useState<InputValidationStatus>(initialInputValidationStatus);

    
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [useCompanyName, setUseCompanyName] = useState(false);
    const userOptions = users!.map(user => ({value: user.cid, label: user.firstName + ' ' + user.lastName}))
    const [invalidInputFields, setInvalidInputFields] = useState<string[]>([]);

    const Create = async () => {
        if (!ValidateClient()) {
            setShowErrorModal(true);
            
        } else {
            await db.createUser(clientState);
            setShowModal(false);
            window.location.reload();
        }
    }

    type ValidationStatusKey = 'firstName' | 'lastName' | 'companyName' | 'address' | 'dob' | 'phoneNumber' | 'initEmail' | 'firstDepositDate' | 'beneficiaryFirstName' | 'beneficiaryLastName';

    const ValidateClient = () => {
        let validClient = true;
        let fields: string[] = [];
        let newInputValidationStatus = { ...inputValidationStatus };

        const fieldValidations: { name: ValidationStatusKey, displayName: string, condition: boolean }[] = [
            { name: 'firstName', displayName: 'First Name', condition: clientState.firstName === '' },
            { name: 'lastName', displayName: 'Last Name', condition: clientState.lastName === '' },
            { name: 'companyName', displayName: 'Company Name', condition: useCompanyName && clientState.companyName === '' },
            { name: 'address', displayName: 'Address', condition: clientState.address === '' },
            { name: 'dob', displayName: 'DOB', condition: !clientState.dob || isNaN(clientState.dob.getTime()) },
            { name: 'phoneNumber', displayName: 'Phone Number', condition: clientState.phoneNumber === '' },
            { name: 'initEmail', displayName: 'Email', condition: clientState.email === '' },
            { name: 'firstDepositDate', displayName: 'First Deposit Date', condition: !clientState.firstDepositDate || isNaN(clientState.firstDepositDate.getTime()) },
            { name: 'beneficiaryFirstName', displayName: 'Beneficiary\'s First Name', condition: clientState.beneficiaryFirstName === '' },
            { name: 'beneficiaryLastName', displayName: 'Beneficiary\'s Last Name', condition: clientState.beneficiaryLastName === '' },
        ];

        fieldValidations.forEach(({ name, displayName, condition }) => {
            if (condition) {
                fields.push(displayName);
                newInputValidationStatus[name] = false;
                validClient = false;
            }
        });

        setInputValidationStatus(newInputValidationStatus);
        setInvalidInputFields(fields);

        return validClient;
    }

    const ErrorModal = () => {
        return (
            <CModal
                scrollable
                alignment="center"
                visible={showErrorModal} 
                backdrop="static" 
                onClose={() => setShowErrorModal(false)}
            >
                <CModalHeader>
                    <CModalTitle>
                        <FontAwesomeIcon className="pr-5" icon={faExclamationTriangle} color="red" />  Error
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <h5>The following fields have not been filled:</h5>
                    <ul>
                        {invalidInputFields.map((message, index) => (
                            <li key={index}>{message}</li>
                        ))}
                    </ul>
                </CModalBody>
                <CModalFooter>
                    <CButton color="primary" onClick={() => setShowErrorModal(false)}>OK</CButton>
                </CModalFooter>
            </CModal>
        )
    }

    return (
        
        <div>
            <ErrorModal/>
            <CModal 
                scrollable
                alignment="center"
                visible={showModal} 
                backdrop="static" 
                size="xl" 
                onClose={() => setShowModal(false)}>
                <CModalHeader>
                    <CModalTitle>Create a New Client</CModalTitle>
                </CModalHeader>
                <ClientInputModalBody 
                    clientState={clientState} 
                    setClientState={setClientState} 
                    inputValidationStatus={inputValidationStatus}
                    setInputValidationStatus={setInputValidationStatus} 
                    useCompanyName={useCompanyName} 
                    setUseCompanyName={setUseCompanyName} 
                    userOptions={userOptions}/>
                <CModalFooter>
                    <CButton color="danger" variant="outline" onClick={() => setShowModal(false)}>Discard</CButton>
                    <CButton color="primary" onClick={() => Create()}>Create +</CButton>
                </CModalFooter>
            </CModal>
        </div>
    )
}





export default CreateClient;
