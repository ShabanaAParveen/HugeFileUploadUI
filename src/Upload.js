import React, { useState } from "react";
import { ProgressBar, Form, Container } from "react-bootstrap"; // Removed Jumbotron
import axios from "axios";

const chunkSize = 1 * 1024 * 1024; // 1MB

function Upload() {
    const [showProgress, setShowProgress] = useState(false);
    const [progress, setProgress] = useState(0);
    const [fileState, setFileState] = useState({});

    const progressInstance = (
        <ProgressBar className="my-3" animated now={progress} label={`${progress.toFixed(3)}%`} />
    );

    const initiateFileUpload = (file_obj) => {
        const fileId = `${file_obj.size}-${file_obj.lastModified}-${file_obj.name}`;
    
        const newFileState = {
            fileSize: file_obj.size,
            fileId,
            totalChunks: Math.ceil(file_obj.size / chunkSize),
            totalChunksUploaded: 0,
            startChunk: 0,
            fileToUpload: file_obj,
        };
    
        setFileState(newFileState);
        fileUpload(newFileState);
    };

    const getFileContext = (e) => {
        setShowProgress(true);
        setProgress(0);
        const file_obj = e.target.files[0];
        if (file_obj) initiateFileUpload(file_obj);
    };

    const fileUpload = ({ fileToUpload, fileId, startChunk, totalChunksUploaded, totalChunks }) => {
        if (totalChunksUploaded >= totalChunks) {
            completeUpload(fileId); // Pass fileId directly
            return;
        }
    
        const endChunk = Math.min(startChunk + chunkSize, fileToUpload.size);
        const chunk = fileToUpload.slice(startChunk, endChunk);
        const serverUrl = "http://localhost:7000";
    
        axios.post(`${serverUrl}/upload/files`, chunk, {
            headers: {
                "Content-Type": "application/octet-stream",
                "x-file-name": fileId,
                "content-range": `${startChunk}-${endChunk - 1}/${fileToUpload.size}`,
                "file-size": fileToUpload.size,
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = ((startChunk + progressEvent.loaded) / fileToUpload.size) * 100;
                setProgress(percentCompleted);
            }
        }).then(() => {
            const uploadedBytes = endChunk;
            setProgress((uploadedBytes / fileToUpload.size) * 100);
    
            fileUpload({
                fileToUpload,
                fileId,
                startChunk: uploadedBytes,
                totalChunksUploaded: totalChunksUploaded + 1,
                totalChunks
            });
        }).catch((err) => {
            console.error("Chunk upload failed", err);
            setTimeout(() => {
                fileUpload({ fileToUpload, fileId, startChunk, totalChunksUploaded, totalChunks });
            }, 1000);
        });
    };

    const completeUpload = (id) => {
        const serverUrl = "http://localhost:7000";
        const fileIdToUse = id || fileState.fileId;
    
        axios.post(`${serverUrl}/upload/complete`, null, {
            headers: { "x-file-name": fileIdToUse }
        })
        .then((response) => {
            console.log("Upload complete:", response);
            alert("Upload completed successfully!");
        })
        .catch((error) => {
            console.error("Error completing the upload", error);
            alert("Error completing the upload");
        });
    };

    return (
        /* Replaced Jumbotron with a Bootstrap 5 styled Div */
        <Container className="p-5 mb-4 bg-light rounded-3 mt-5">
            <div className="container-fluid py-3">
                <h1 className="display-5 fw-bold">Big File Upload</h1>
                <Form>
                    <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label>Choose file</Form.Label>
                        {/* Replaced Form.File with Form.Control type="file" */}
                        <Form.Control type="file" onChange={getFileContext} />
                    </Form.Group>
                    
                    {showProgress && progressInstance}
                    
                    {showProgress && (
                        <button type="button" onClick={() => completeUpload()} className="btn btn-success mt-2">
                            Complete Upload
                        </button>
                    )}
                </Form>
            </div>
        </Container>
    );
}

export default Upload;
