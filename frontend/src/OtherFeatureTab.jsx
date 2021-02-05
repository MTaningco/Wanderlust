//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import NewLandmarkTab from './NewLandmarkTab';
import NewPathTab from './NewPathTab';
import EditLandmarksTab from './EditLandmarksTab';

function OtherFeatureTab({value, index, drawerValue, invalidateAuth, setLandmarks, setTempLandmark, setPaths, newPathHandler, setEditLandmark, updateLandmarks, deleteLandmark, landmarks, toInformationTab}) {
  return (
    <div hidden={value !== index}>
      <NewLandmarkTab setLandmarks={setLandmarks} 
        value={drawerValue} 
        index={0} 
        setTempLandmark={setTempLandmark} 
        invalidateAuth={invalidateAuth}/>
      <EditLandmarksTab 
        value={drawerValue} 
        index={1} 
        invalidateAuth={invalidateAuth} 
        setEditLandmark={setEditLandmark} 
        updateLandmarks={updateLandmarks} deleteLandmark={deleteLandmark}
        landmarks={landmarks}
        toInformationTab={toInformationTab}/>
      <NewPathTab setPaths={setPaths} 
        value={drawerValue} 
        index={2} 
        setTempPath={newPathHandler} 
        invalidateAuth={invalidateAuth}/>
    </div>
  );
}
 
export default OtherFeatureTab;