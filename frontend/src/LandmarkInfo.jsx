//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { FormControl, Input, InputLabel, TextField } from "@material-ui/core";

function LandmarkInfo({ currentLandmark, value, index, setEditLandmark }) {

    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(-1);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editLongitude, setEditLongitude] = useState("");
    const [editLatitude, setEditLatitude] = useState("");

    const handleNameChange = (event) => {
        setEditName(event.target.value);
    }

    const handleDescriptionChange = (event) => {
        setEditDescription(event.target.value);
    }

    const handleLatitudeChange = (event) => {
        if(event.target.value === ""){
            var editLandmark = [{
                coordinates: [0, 0],
                isVisible: false
            }];
            setEditLandmark(editLandmark);
        }

        if(Math.abs(event.target.value) <= 90){
            // console.log("value within 90")
            setEditLatitude(event.target.value);
            var editLandmark = [{
                coordinates: [editLongitude, parseFloat(event.target.value)],
                isVisible: true
            }];
            if(editLongitude !== "" && event.target.value !== ""){
                // console.log("modify edit landmark");
                setEditLandmark(editLandmark);
            }
        }
    }

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

    const handleDeleteLandmark = () => {
        // console.log(currentLandmark[0].id);
        alert(`not yet implemented: \nid:${currentLandmark[0].landmark_uid}`);
    };

    const handleEditLandmarkMode = () => {
        // alert("edit not yet implemented");
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

    const handleCancelEdit = () => {
        var editLandmark = [{
            coordinates: [0, 0],
            isVisible: false
        }];
        setEditLandmark(editLandmark);
        setIsEdit(false);
    };

    const handleEditLandmark = () => {
        alert(`not yet implemented, these are the parameters: \n id: ${editId}\nname: ${editName}\nlongitude:${editLongitude}\nlatitude:${editLatitude}\ndescription:${editDescription}`);
    };
    /**
     * Gets the landmark information.
     */
    const getLandmarkInfo = () => {
        // console.log("landmark info updating", currentLandmark);
        const landmark = currentLandmark[0];
        if (landmark.isVisible) {
            var description = landmark.description;
            var descriptionArray = description.split("\n");

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
                            Finish Edit
                        </Button>
                        
                        <Button variant="contained" color="secondary" onClick={handleCancelEdit}>
                            Cancel Edit
                        </Button>
                    </form>
                );
            }
            else{
                return (
                    <div>
                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={<EditIcon/>}
                            onClick={handleEditLandmarkMode}>
                            Edit
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            endIcon={<DeleteIcon/>}
                            onClick={handleDeleteLandmark}>
                            Delete
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

    //Use effect hook.
    // useEffect(() => {
    //     drawGlobe(oldCoordinates, scale, true);
    // }, [scale, landmarks])

    return (
        <div hidden={value !== index}>
            
            <Typography variant="h5">
                Landmark Information
            </Typography>
            <br/>
            {getLandmarkInfo()}
        </div>
    );
}

export default LandmarkInfo;