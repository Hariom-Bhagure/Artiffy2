import React, { useState, useRef } from 'react';
import "./UploadNewFile.css";
import { Row, Col, Image, Form, Button, Container, ProgressBar, Modal } from 'react-bootstrap';
import Logo from '../../assets/Logo/Upload_logo.png';
import { X } from 'lucide-react';
import axios from 'axios';
import uploadpng from "../../assets/Logo/upload.png";
import cancelpng from "../../assets/Logo/cancel.png";

const UploadNewFile = ({ closeModal, onFileUpload }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const xhrRef = useRef(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        setUploadProgress(0);
    };
   
    

    const handleFileUpload = () => {
        if (!selectedFile) return;

        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        uploadFormData.append('upload_preset', 'fileupload');
        uploadFormData.append('title', formData.title);
        uploadFormData.append('description', formData.description);

        setLoading(true);
        setShowProgressModal(true);
        setIsPaused(false);

        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentCompleted = Math.round((event.loaded * 100) / event.total);
                setUploadProgress(percentCompleted);
            }
        };

        xhr.open('POST', 'https://api.cloudinary.com/v1_1/damlm4dnd/image/upload', true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        xhr.onload = () => {
            setLoading(false);
            setShowProgressModal(false);
               
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                onFileUpload(response, formData.title, formData.description); // Pass file info to parent component
                setSelectedFile(null);
                setFormData({ title: '', description: '' }); // Clear form data after upload
                setShowSuccessModal(true);
            } else {
                console.error('Error uploading file:', xhr.responseText);
                setShowErrorModal(true);
            }
            
        };

        xhr.onerror = () => {
            console.error('Upload failed.');
            setLoading(false);
            setShowProgressModal(false);
            setShowErrorModal(true);
        };

        xhr.send(uploadFormData);
    };

    const handlePauseUpload = () => {
        if (isPaused) {
            handleFileUpload();
        } else {
            if (xhrRef.current) {
                xhrRef.current.abort();
            }
        }
        setIsPaused(!isPaused);
    };

    const handleCancelUpload = () => {
        if (xhrRef.current) {
            xhrRef.current.abort();
        }
        setLoading(false);
        setShowProgressModal(false);
    };

    const handleCloseSuccessModal = () => setShowSuccessModal(false);
    const handleCloseErrorModal = () => setShowErrorModal(false);

    return (
        <>
            <div className='page-wrapper1'></div>
            <Container className='Main-sec'>
                <button className='btn-x1' onClick={closeModal}><X /></button>
                <Row>
                    <Col lg={4}></Col>
                    <Col lg={4}>
                        <h1 className='heading1'>Upload New File</h1>
                    </Col>
                    <Col lg={4}></Col>
                </Row>
                <Row className='logo-form'>
                    <Col lg={1}></Col>
                    <Col lg={4} className='imgholder'>
                        <Image className='Uploadimg' src={Logo} width={92} height={90} onClick={() => document.getElementById('file-input').click()} />
                        <input
                            type="file"
                            id="file-input"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <h5 className='heading5'>Select your file from device</h5>
                    </Col>
                    <Col lg={1}></Col>
                    <Col lg={2}>
                        <Row>
                            <Form.Group controlId="formTitle" className='Form-title'>
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    className='inputone'
                                    type="text"
                                    name="title"
                                    placeholder='Add a Title'
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Form.Group controlId="formDescription">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    className='inputTwo'
                                    type="text"
                                    name="description"
                                    placeholder='Add a description'
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Row>
                    </Col>
                    <Col lg={2}></Col>
                </Row>
                <Row>
                    <Col lg={6}></Col>
                    <Col lg={3} className='mt-2'>
                        <Button className='uploadbtn1' onClick={handleFileUpload}>Upload</Button>
                    </Col>
                    <Col lg={3}></Col>
                </Row>
            </Container>

            <Modal show={showProgressModal} onHide={handleCancelUpload} centered>
                <div className='progressbox'>
                    <Modal.Header closeButton>
                        <Modal.Title>Uploading File</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className='progressBar'>
                        {loading && (
                            <>
                                <div className="text-center mb-3 ">{uploadProgress}%</div>
                                <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} className='' />
                                <div className="d-flex justify-content-between mt-3 ">
                                    <Button variant="light" onClick={handleCancelUpload}>
                                        Cancel
                                    </Button>
                                    <Button variant="light" onClick={handlePauseUpload}>
                                        {isPaused ? 'Resume' : 'Pause'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Modal.Body>
                </div>
            </Modal>
            <Modal show={showSuccessModal} onHide={handleCloseSuccessModal} centered>
                <div className='uploadmodal'>
                    <Modal.Header closeButton />
                    <Modal.Body>
                        <Image src={uploadpng} width={100} height={100} />
                        <h4 className='Uploadheading'>Upload Successful</h4>
                        <p className='uploadingpara'>Your file was successfully uploaded!</p>
                    </Modal.Body>
                    <Modal.Footer className='modalfootor'>
                        <Button variant="primary okbtn" onClick={handleCloseSuccessModal}>
                            OK
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>

            <Modal show={showErrorModal} onHide={handleCloseErrorModal} centered>
                <div className='uploadmodal'>
                    <Modal.Header closeButton />
                    <Modal.Body>
                        <Image src={cancelpng} width={100} height={100} />
                        <h4 className='Uploadheading'>Upload Unsuccessful</h4>
                        <p className='uploadingpara'>There was a problem uploading your file</p>
                    </Modal.Body>
                    <Modal.Footer className='modalfootor'>
                        <Button variant="primary" className='okbtn' onClick={handleCloseErrorModal}>
                            Try Again
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>
        </>
    );
};

export default UploadNewFile;