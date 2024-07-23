import { CCol, CContainer, CFormCheck, CFormInput, CInputGroup, CInputGroupText, CModal, CModalBody, CModalHeader, CModalTitle, CMultiSelect, CRow } from "@coreui/react-pro"
import { User } from "src/db/database";
import config from '../../config.json'
import { formatCurrency } from '../../db/database';


interface ShowModalProps {
        showModal: boolean;
        setShowModal: (show: boolean) => void;
        currentUser?: User;
        users?: User[];
}

export const DisplayDetails: React.FC<ShowModalProps> = ({showModal, setShowModal, users, currentUser: currentUser}) => {
    const userOptions = users!.map(user => ({value: user.cid, label: user.firstName + ' ' + user.lastName, selected: (currentUser?.connectedUsers?.includes(user.cid))}))
    return (
        <CModal         scrollable
            alignment="center"
            visible={showModal} 
            backdrop="static" 
            size="xl" 
            onClose={() => setShowModal(false)}>
            <CModalHeader>
                <CModalTitle>{currentUser?.firstName + ' ' + currentUser?.lastName}</CModalTitle>
            </CModalHeader>
            <CModalBody className="px-5">
            <CInputGroup className="mb-3 py-3">
                <CInputGroupText>Client's First Name</CInputGroupText>
                <CFormInput id="first-name" value={currentUser?.firstName} disabled/>
                <CInputGroupText>Client's Last Name</CInputGroupText>
                <CFormInput id="last-name" value={currentUser?.lastName} disabled/>
            </CInputGroup>

            <CInputGroup className="mb-3  py-3">
                <CInputGroupText>
                    <CFormCheck type="checkbox" id="useCompanyName" defaultChecked={currentUser?.companyName ? true : false }/>
                </CInputGroupText>
                <CInputGroupText>Company Name</CInputGroupText>
                <CFormInput id="company-name" value={currentUser?.companyName} disabled/>
            </CInputGroup>

            <CInputGroup className="mb-3  py-3">
                <CInputGroupText>Address</CInputGroupText>
                <CFormInput id="address" value={currentUser?.address} disabled/>
            </CInputGroup>

            <CInputGroup className="mb-3  py-3">
                <CInputGroupText>DOB</CInputGroupText>
                <CFormInput id="dob" value={currentUser?.dob?.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} disabled/>
            </CInputGroup>

            <CInputGroup className="mb-3  py-3">
                <CInputGroupText>Phone Number</CInputGroupText>
                <CFormInput id="phone-number" value={currentUser?.phoneNumber} disabled/>
            </CInputGroup>

            <CInputGroup className="mb-3  py-3">
                <CInputGroupText>App Email</CInputGroupText>
                <CFormInput type="email" id="appEmail" value={currentUser?.appEmail} disabled/>
                <CInputGroupText>Initial Email</CInputGroupText>
                <CFormInput type="email" id="initialEmail" value={currentUser?.initEmail} disabled/>
            </CInputGroup>

            <CInputGroup className="mb-3  py-3">
                <CInputGroupText>First Deposit Date</CInputGroupText>
                <CFormInput id="first-deposit-date" value={currentUser?.firstDepositDate?.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}disabled/>
            </CInputGroup>

            <CInputGroup className="mb-3  py-3">
                <CInputGroupText>Beneficiary's First Name</CInputGroupText>
                <CFormInput id="beneficiaryFirstName" value={currentUser?.beneficiaryFirstName} disabled/>
                <CInputGroupText>Beneficiary's Last Name</CInputGroupText>
                <CFormInput id="beneficiaryLastName" value={currentUser?.beneficiaryLastName} disabled/>
            </CInputGroup>

            <CMultiSelect 
                id="connected-users"
                className="mb-3  py-3" 
                options={userOptions} 
                placeholder="Select Connected Users" 
                selectAll={false}
                disabled
            /> 

            {/* TODO: Add connected users */}
            
            <CContainer className=" py-3">
                <CRow>
                <CCol>
                    <h5>AGQ Fund Assets</h5>
                    <AssetFormComponent title="Personal" id="agq-personal" fund="agq" user={currentUser}/>
                    <AssetFormComponent title="Company" id="agq-company" fund="agq" user={currentUser}/>
                    <AssetFormComponent title="IRA" id="agq-ira" fund="agq" user={currentUser}/>
                    <AssetFormComponent title="Roth IRA" id="agq-roth-ira" fund="agq" user={currentUser}/>
                    <AssetFormComponent title="SEP IRA" id="agq-sep-ira" fund="agq" user={currentUser}/>
                    <AssetFormComponent title="NuView Cash IRA" id="agq-nuview-cash-ira" fund="agq" user={currentUser}/>
                    <AssetFormComponent title="NuView Cash Roth IRA" id="agq-nuview-cash-roth-ira" fund="agq" user={currentUser}/>
                </CCol>
                <CCol>
                    <h5>AK1 Fund Assets</h5>
                    <AssetFormComponent title="Personal" id="ak1-personal" fund="ak1" user={currentUser}/>
                    <AssetFormComponent title="Company" id="ak1-company" fund="ak1" user={currentUser} />
                    <AssetFormComponent title="IRA" id="ak1-ira" fund="ak1" user={currentUser} />
                    <AssetFormComponent title="Roth IRA" id="ak1-roth-ira" fund="ak1" user={currentUser}/>
                    <AssetFormComponent title="SEP IRA" id="ak1-sep-ira" fund="ak1" user={currentUser}/>
                    <AssetFormComponent title="NuView Cash IRA" id="ak1-nuview-cash-ira" fund="ak1" user={currentUser}/>
                    <AssetFormComponent title="NuView Cash Roth IRA" id="ak1-nuview-cash-roth-ira" fund="ak1" user={currentUser}/>
                </CCol>
                </CRow>
            </CContainer>
            </CModalBody>
        </CModal>
    )
}

const AssetFormComponent: React.FC<{title: string, id: string, fund: string, user?: User}> = ({title, id, fund, user}) => {
    return (
        <CInputGroup className="mb-3 py-3">
            <CInputGroupText style={{ width: "200px" }} id="personal">{title}</CInputGroupText>
            <CFormInput id={id} disabled value={formatCurrency(user?.[config.ASSETS_SUBCOLLECTION]?.[fund]?.[getAssetType(id)])}/>
        </CInputGroup>
    )      
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