//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import Typography from '@material-ui/core/Typography';

function LandmarkInfo({ currentLandmark, value, index }) {
    /**
     * Gets the landmark information.
     */
    const getLandmarkInfo = () => {
        console.log("landmark info updating", currentLandmark);
        const landmark = currentLandmark[0];
        if (landmark.isVisible) {
            var description = landmark.description;
            var descriptionArray = description.split("\n");
            return (
                <div>
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
        else {
            return (
                <div>
                    <Typography variant="h4">
                        Hover Over a Landmark
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