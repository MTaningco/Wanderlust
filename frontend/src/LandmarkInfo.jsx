//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { CircularProgress, FormControl, Input, InputLabel, TextField } from "@material-ui/core";

function LandmarkInfo({ currentLandmark, value, index, setEditLandmark, updateLandmarks, invalidateAuth, deleteLandmark }) {
    //States
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(-1);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editLongitude, setEditLongitude] = useState("");
    const [editLatitude, setEditLatitude] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    /**
     * Handles the name change of the edited landmark.
     * @param {*} event - the event for the name change
     */
    const handleNameChange = (event) => {
        setEditName(event.target.value);
    }

    /**
     * Handles the description change of the edited landmark.
     * @param {*} event - the event for the desription change
     */
    const handleDescriptionChange = (event) => {
        setEditDescription(event.target.value);
    }

    /**
     * Handles the latitude change of the edited landmark.
     * @param {*} event - the event for the latitude change
     */
    const handleLatitudeChange = (event) => {
        if(event.target.value === ""){
            var editLandmark = [{
                coordinates: [0, 0],
                isVisible: false
            }];
            setEditLandmark(editLandmark);
        }

        if(Math.abs(event.target.value) <= 90){
            setEditLatitude(event.target.value);
            var editLandmark = [{
                coordinates: [editLongitude, parseFloat(event.target.value)],
                isVisible: true
            }];
            if(editLongitude !== "" && event.target.value !== ""){
                setEditLandmark(editLandmark);
            }
        }
    }

    /**
     * Handles the longitude change of the edited landmark.
     * @param {*} event - the event for the longitude change
     */
    const handleLongitudeChange = (event) => {
        if(event.target.value === ""){
            var editLandmark = [{
                coordinates: [0, 0],
                isVisible: false
            }];
            setEditLandmark(editLandmark);
        }

        if(Math.abs(event.target.value) <= 180){
            setEditLongitude(event.target.value);
            var editLandmark = [{
                coordinates: [parseFloat(event.target.value), editLatitude],
                isVisible: true
            }];
            if(editLatitude !== "" && event.target.value !== ""){
                setEditLandmark(editLandmark);
            }
        }
    }

    /**
     * Handles deleting the landmark.
     */
    const handleDeleteLandmark = () => {
        let isConfirmed = window.confirm(`Are you sure you want to delete this landmark?\n\n${currentLandmark[0].name}\nlongitude:${currentLandmark[0].coordinates[0]}\nlatitude:${currentLandmark[0].coordinates[1]}\n\n${currentLandmark[0].description}`);
        if(isConfirmed){
            setIsProcessing(true);
            const body = {
                landmark_uid: currentLandmark[0].landmark_uid
            };
            fetch(`/landmarks`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  'authorization' : `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(body)
            })
            .then(res => res.json())
            .then(res => {
                setIsProcessing(false);
                // deleteLandmark(currentLandmark[0].landmark_uid);
                setIsEdit(false);
                setTimeout(() => {
                    deleteLandmark(currentLandmark[0].landmark_uid);
                }, 500);
            })
            .catch(err => invalidateAuth());
        }
    };

    /**
     * Handles switching to the mode of editing a landmark.
     */
    const handleEditLandmarkMode = () => {
        setIsEdit(true);
        setEditId(currentLandmark[0].landmark_uid);
        setEditName(currentLandmark[0].name);
        setEditDescription(currentLandmark[0].description);
        setEditLongitude(currentLandmark[0].coordinates[0]);
        setEditLatitude(currentLandmark[0].coordinates[1]);
        var editLandmark = [{
            coordinates: [currentLandmark[0].coordinates[0], currentLandmark[0].coordinates[1]],
            isVisible: true
        }];
        setEditLandmark(editLandmark);
    };

    /**
     * Handles canceling out of the edit mode.
     */
    const handleCancelEdit = () => {
        var editLandmark = [{
            coordinates: [0, 0],
            isVisible: false
        }];
        setEditLandmark(editLandmark);
        setIsEdit(false);
    };

    /**
     * Handles editing the landmark.
     */
    const handleEditLandmark = () => {
        if(editId !== -1 && editName !== "" && editLongitude !== "" && editLatitude !== ""){
            setIsProcessing(true);
            const body = {
                landmark_uid: editId,
                name: editName,
                description: editDescription,
                coordinates: [editLongitude, editLatitude]
            };

            fetch(`/landmarks`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  'authorization' : `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(body)
            })
            .then(res => res.json())
            .then(res => {
                setIsEdit(false);
                setIsProcessing(false);
                setTimeout(() => {
                    updateLandmarks({
                        landmark_uid: editId,
                        name: editName,
                        description: editDescription,
                        coordinates: [editLongitude, editLatitude]
                    })
                }, 500);
            })
            .catch(err => invalidateAuth());
        }
        else{
            alert('A field is missing! Cannot update landmark.')
        }
    };

    /**
     * Gets the landmark information.
     */
    const getLandmarkInfoContent = () => {
        const landmark = currentLandmark[0];
        if (landmark.isVisible) {
            if(isEdit){
                return (
                    <form>
                        <FormControl fullWidth>
                        <InputLabel htmlFor="landmarkLatitude">Latitude</InputLabel>
                        <Input 
                            type="number" 
                            id="landmarkLatitude" 
                            placeholder="Enter value between -90 to 90" 
                            name="Latitude"
                            value={editLatitude}
                            onChange={handleLatitudeChange}/>
                        </FormControl>
                        <br/>
                        <FormControl fullWidth>
                        <InputLabel htmlFor="landmarkLongitude">Longitude</InputLabel>
                        <Input 
                            type="number" 
                            id="landmarkLongitude" 
                            placeholder="Enter value between -180 to 180" 
                            name="Longitude"
                            value={editLongitude}
                            onChange={handleLongitudeChange}/>
                        </FormControl>
                        <br/>
                        <TextField 
                            id="standard-basic" 
                            label="Landmark Name" 
                            placeholder="ie. Vancouver, BC, Canada" 
                            value={editName}
                            onChange={handleNameChange}
                            fullWidth/>
                        <br/>
                        <TextField
                            id="standard-multiline-static"
                            label="Description"
                            placeholder="Enter a description about the landmark" 
                            multiline
                            rows={4}
                            value={editDescription}
                            onChange={handleDescriptionChange}
                            fullWidth/>
                        <br/>
                        <br/>
                        <Button variant="contained" color="primary" onClick={handleEditLandmark}>
                            {isProcessing && <CircularProgress size={24} color='secondary' disableShrink />}
                            {!isProcessing && 'Finish Edit'}
                        </Button>
                        
                        <Button variant="contained" color="secondary" onClick={handleCancelEdit}>
                            {isProcessing && <CircularProgress size={24} color='primary' disableShrink />}
                            {!isProcessing && 'Cancel Edit'}
                        </Button>
                    </form>
                );
            }
            else{
                var description = landmark.description;
                var descriptionArray = description.split("\n");
                return (
                    <div>
                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={!isProcessing ? <EditIcon/> : ''}
                            onClick={handleEditLandmarkMode}>
                            {isProcessing && <CircularProgress size={24} color='secondary' disableShrink />}
                            {!isProcessing && 'Edit'}
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            endIcon={!isProcessing ? <DeleteIcon/> : ''}
                            onClick={handleDeleteLandmark}>
                            {isProcessing && <CircularProgress size={24} color='primary' disableShrink />}
                            {!isProcessing && 'Delete'}
                        </Button>
                        <Typography variant="h4">
                            {landmark.name}
                        </Typography>
                        <Typography variant="h6" paragraph>
                            Latitude: {landmark.coordinates[1]}, Longitude: {landmark.coordinates[0]}
                        </Typography>
                        {
                            descriptionArray.map(element => {
                                return (
                                    <Typography variant="h6" paragraph>
                                        {element}
                                    </Typography>
                                );
                            })
                        }
                    </div>
                );
            }
        }
        else {
            return (
                <div>
                    <Typography variant="h4">
                        Click on a Landmark
                    </Typography>
                </div>
            );
        }
    };

    return (
        <div hidden={value !== index} style={{margin: "20px"}}>
            
            <Typography variant="h5">
                Landmark Information
            </Typography>
            <br/>
            {getLandmarkInfoContent()}
        </div>
    );
}

export default LandmarkInfo;