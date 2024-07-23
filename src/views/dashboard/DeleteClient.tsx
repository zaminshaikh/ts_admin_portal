import { CButton, CFormInput, CInputGroup, CInputGroupText, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from "@coreui/react-pro";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { DatabaseService, User } from "src/db/database";

interface ShowModalProps {
        showModal: boolean;
        setShowModal: (show: boolean) => void;
        user?: User;
}

export const DeleteClient: React.FC<ShowModalProps> = ({showModal, setShowModal, user}) => {
    const service = new DatabaseService();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [doNamesMatch, setDoNamesMatch] = useState(false);

    useEffect(() => {
        setDoNamesMatch(firstName === user?.firstName && lastName === user?.lastName);
    }, [firstName, lastName, user]);
    
    const DeleteClient = async () => {
        await service.deleteUser(user?.cid)
        setShowModal(false);
        window.location.reload();
    }

    return (
        <CModal         
            scrollable
            alignment="center"
            visible={showModal} 
            backdrop="static" 
            size="xl" 
            onClose={() => setShowModal(false)}>
            <CModalHeader>
                <CModalTitle>
                    <FontAwesomeIcon className="pr-5" icon={faExclamationTriangle} color="red" />  WARNING
                </CModalTitle>
            </CModalHeader>
            <CModalBody className="px-5">
                You are about to delete the client {user?.firstName} {user?.lastName}. THIS ACTION IS IRREVERSIBLE. To delete this client, type their first and last name below:
                <div className="py-3">
                    <CInputGroup>
                        <CInputGroupText>Client's First Name</CInputGroupText>
                        <CFormInput onChange={(e) => {
                            setFirstName(e.target.value);
                        }}/>
                        <CInputGroupText>Client's Last Name</CInputGroupText>
                        <CFormInput onChange={(e) => {
                            setLastName(e.target.value);
                        }}/>
                    </CInputGroup>
                </div>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={() => setShowModal(false)}>Cancel</CButton>
                <CButton color="danger" variant="outline" disabled={!doNamesMatch} 
                    onClick={() => DeleteClient()}>Delete</CButton>
            </CModalFooter>
        </CModal>
    )
}