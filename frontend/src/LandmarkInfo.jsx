//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import Typography from '@material-ui/core/Typography';

function LandmarkInfo({ currentLandmark, value, index }) {
    /**
     * Gets the landmark information.
     */
    const getLandmarkInfo = () => {
        if (currentLandmark) {
            var description = currentLandmark.description;
            var descriptionArray = description.split("\n");
            return (
                <div>
                    <Typography variant="h4">
                        {currentLandmark.name}
                    </Typography>
                    <Typography variant="h6" paragraph>
                        Latitude: {currentLandmark.coordinates[1]}, Longitude: {currentLandmark.coordinates[0]}
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
                        No Landmark Selected
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
            <br/>
            {getLandmarkInfo()}
        </div>
    );
}

export default LandmarkInfo;